// zoom-backend/sockets/signaling.js
import jwt from "jsonwebtoken";
import Meeting from "../models/Meeting.js"; // if you don't use Meeting, safe to keep import
import Message from "../models/Message.js";

export default function setupSignaling(io) {
  console.log("🔌 Socket.IO signaling server initialized");

  // Map meetingId -> Set(socketId)
  const rooms = new Map();

  // AUTH middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    console.log("🔑 Incoming token:", token);
    if (!token) return next(new Error("Forbidden: No token provided"));

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.user = decoded;
      return next();
    } catch (err) {
      console.error("❌ Socket auth error:", err.message);
      return next(new Error("Forbidden: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id, "user:", socket.user?.id);

    // Join room
    socket.on("join-room", async ({ meetingId } = {}) => {
      console.log("📥 BACKEND RECEIVED JOIN-ROOM:", meetingId, "FROM:", socket.id);
      if (!meetingId) return;

      socket.join(meetingId);
      if (!rooms.has(meetingId)) rooms.set(meetingId, new Set());
      rooms.get(meetingId).add(socket.id);

      // Broadcast participants list
      const participants = Array.from(rooms.get(meetingId)).map((sid) => {
        const s = io.sockets.sockets.get(sid);
        return s ? { socketId: sid, user: s.user } : null;
      }).filter(Boolean);

      io.to(meetingId).emit("participants", participants);
      socket.to(meetingId).emit("user-joined", { socketId: socket.id, user: socket.user });
    });

    // Typing indicator
    socket.on("typing", ({ meetingId, isTyping } = {}) => {
      if (!meetingId) return;
      socket.to(meetingId).emit("typing", { socketId: socket.id, user: socket.user, isTyping });
    });

    // Signal relay (webrtc)
    socket.on("signal", ({ to, data } = {}) => {
      if (!to) return;
      io.to(to).emit("signal", { from: socket.id, data });
    });

    // Chat-message: robust handler - accepts both {meetingId, message} and legacy payloads
    socket.on("chat-message", async (payload) => {
      try {
        // payload might be { meetingId, message } or { meetingId, content } etc.
        let meetingId;
        let message;

        if (payload && typeof payload === "object" && payload.meetingId && payload.message) {
          meetingId = payload.meetingId;
          message = payload.message;
        } else if (payload && payload.meetingId && (payload.content || payload.type)) {
          // legacy
          meetingId = payload.meetingId;
          message = {
            content: payload.content,
            type: payload.type || "text",
            senderId: payload.senderId || socket.user?.id,
            senderName: payload.senderName || socket.user?.name || "User",
            timestamp: payload.timestamp || new Date().toISOString()
          };
        } else {
          // maybe called as socket.emit('chat-message', meetingId, msg)
          if (arguments.length === 2 && typeof arguments[0] === "string") {
            meetingId = arguments[0];
            message = arguments[1];
          }
        }

        if (!meetingId || !message) {
          console.warn("⚠️ chat-message received with invalid payload:", payload);
          return;
        }

        console.log("📥 SERVER RECEIVED chat-message:", { meetingId, message });

        // Save to DB (Message model expects meeting ID as string)
        const saved = await Message.create({
          meeting: meetingId,
          sender: message.senderId || socket.user?.id,
          senderName: message.senderName || socket.user?.name || "User",
          type: message.type || "text",
          content: message.content || message.text || "",
          fileUrl: message.fileUrl || null,
          voiceUrl: message.voiceUrl || null,
          createdAt: message.timestamp ? new Date(message.timestamp) : new Date()
        });

        // Populate or lean
        const out = await Message.findById(saved._id).lean();

        console.log("📤 SERVER EMITTING chat-message to room:", meetingId);
        io.to(meetingId).emit("chat-message", out);
      } catch (err) {
        console.error("❌ Error in chat-message handler:", err);
      }
    });

    // Reaction handling (toggle)
    socket.on("message-reaction", async ({ meetingId, messageId, emoji } = {}) => {
      try {
        if (!messageId) return;
        const userId = socket.user?.id;
        const msg = await Message.findById(messageId);
        if (!msg) return;
        const exists = msg.reactions.find(r => r.emoji === emoji && String(r.user) === String(userId));
        if (exists) {
          msg.reactions = msg.reactions.filter(r => !(r.emoji === emoji && String(r.user) === String(userId)));
        } else {
          msg.reactions.push({ emoji, user: userId });
        }
        await msg.save();
        io.to(meetingId).emit("message-reaction", { messageId, reactions: msg.reactions });
      } catch (err) {
        console.error("❌ Reaction error:", err);
      }
    });

    // Leave room
    socket.on("leave-room", ({ meetingId } = {}) => {
      if (!meetingId) return;
      socket.leave(meetingId);
      if (rooms.has(meetingId)) {
        rooms.get(meetingId).delete(socket.id);
        if (rooms.get(meetingId).size === 0) rooms.delete(meetingId);
      }
      io.to(meetingId).emit("participants",
        Array.from(rooms.get(meetingId) || []).map((sid) => {
          const s = io.sockets.sockets.get(sid);
          return s ? { socketId: sid, user: s.user } : null;
        }).filter(Boolean)
      );
      socket.to(meetingId).emit("user-left", { socketId: socket.id, userId: socket.user?.id });
    });

    // Disconnect cleanup
    socket.on("disconnect", () => {
      for (const [mId, set] of rooms.entries()) {
        if (set.has(socket.id)) {
          set.delete(socket.id);
          io.to(mId).emit("participants",
            Array.from(set).map((sid) => {
              const s = io.sockets.sockets.get(sid);
              return s ? { socketId: sid, user: s.user } : null;
            }).filter(Boolean)
          );
        }
        if (set.size === 0) rooms.delete(mId);
      }
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
}
