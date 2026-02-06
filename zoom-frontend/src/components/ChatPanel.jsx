// src/components/ChatPanel.jsx
import React, { useEffect, useRef, useState } from "react";
import API from "../services/api";
import { jwtDecode } from "jwt-decode";
import Picker from "emoji-picker-react";

export default function ChatPanel({ socketRef, meetingId, socketReady }) {
  const [messages, setMessages] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const [text, setText] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [uploading, setUploading] = useState(false);

  const bottomRef = useRef(null);

  const token = localStorage.getItem("zoom_access_token");
  const currentUser = token ? jwtDecode(token) : { id: "guest", name: "You" };

  const scrollBottom = () => bottomRef.current?.scrollIntoView({ behavior: "smooth" });

  // Load old messages
  useEffect(() => {
    if (!meetingId) return;
    API.get(`/meetings/${meetingId}/messages`)
      .then((res) => setMessages(res.data))
      .catch(() => console.log("Failed loading chat"));
  }, [meetingId]);

  // SOCKET HANDLERS
  useEffect(() => {
    const s = socketRef.current;
    if (!s) return;

    s.on("chat-message", (msg) => {
      setMessages((prev) => [...prev, msg]);
      scrollBottom();
    });

    s.on("participants", (list) => setParticipants(list));

    s.on("typing", ({ socketId, user, isTyping }) => {
      setTypingUsers((prev) => ({ ...prev, [socketId]: isTyping ? user : null }));
    });

    s.on("message-reaction", ({ messageId, reactions }) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
      );
    });

    return () => {
      s.off("chat-message");
      s.off("participants");
      s.off("typing");
      s.off("message-reaction");
    };
  }, [socketRef, socketReady]);

  useEffect(scrollBottom, [messages]);

  // SEND MESSAGE
  const sendMessage = () => {
    if (!text.trim()) return;

    const msg = {
      type: "text",
      meetingId,
      senderId: currentUser.id,
      senderName: currentUser.name,
      content: text,
      timestamp: new Date().toISOString(),
    };

    socketRef.current.emit("chat-message", { meetingId, message: msg });
    setText("");
  };

  // DISCORD STYLE GROUPING
  const grouped = {};
  messages.forEach((m) => {
    const date = new Date(m.createdAt || m.timestamp).toDateString();
    if (!grouped[date]) grouped[date] = [];
    grouped[date].push(m);
  });

  const quickEmojis = ["👍", "❤️", "😂", "🎉", "😮", "😢"];

  return (
    <div className="w-full bg-[#2b2d31] text-white flex flex-col border-l border-[#1f2124] 
                    max-h-[calc(100vh-120px)] rounded-lg shadow-xl">

      {/* HEADER */}
      <div className="p-4 border-b border-[#1f2124]">
        <h2 className="text-lg font-bold">Chat</h2>
      </div>

      {/* PARTICIPANTS (Discord Avatars Row) */}
      <div className="flex overflow-x-auto gap-3 p-3 border-b border-[#1f2124]">
        {participants.map((p) => (
          <div key={p.socketId} className="flex flex-col items-center text-[11px]">
            <div className="w-9 h-9 rounded-full bg-[#5865f2] 
                            flex items-center justify-center font-bold">
              {p.user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <span className="mt-1 text-gray-400 max-w-[60px] truncate">
              {p.user?.name || "User"}
            </span>
          </div>
        ))}
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-6">

        {Object.keys(grouped).map((date) => (
          <div key={date}>
            <div className="text-center text-xs text-gray-400 my-4">{date}</div>

            {grouped[date].map((m, idx) => {
              const mine = m.senderId === currentUser.id;

              return (
                <div
                  key={m._id || idx}
                  className={`flex w-full ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[70%] p-3 rounded-xl shadow-md 
                    ${mine
                      ? "bg-[#5865f2] text-white ml-10"
                      : "bg-[#313338] text-gray-200 mr-10"
                    }
                    transition-all`}
                    style={{
                      marginTop: idx % 2 === 0 ? "4px" : "10px",
                    }}
                  >
                    {!mine && (
                      <p className="text-xs text-gray-400 mb-1">{m.senderName}</p>
                    )}

                    <p>{m.content}</p>

                    <div className="text-[10px] mt-2 text-gray-400">
                      {new Date(m.timestamp || m.createdAt).toLocaleTimeString()}
                    </div>

                    {/* Reactions */}
                    {(m.reactions || []).length > 0 && (
                      <div className="flex gap-1 mt-2">
                        {m.reactions.map((r, i) => (
                          <span
                            key={i}
                            className="px-1 py-[1px] bg-[#1f2124] text-xs rounded"
                          >
                            {r.emoji}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Quick React */}
                    <div className="flex gap-1 mt-1 opacity-70 hover:opacity-100">
                      {quickEmojis.map((e) => (
                        <button
                          key={e}
                          onClick={() =>
                            socketRef.current.emit("message-reaction", {
                              meetingId,
                              messageId: m._id,
                              emoji: e,
                            })
                          }
                          className="text-sm hover:bg-[#232428] px-1 rounded"
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {/* TYPING */}
      {Object.values(typingUsers).filter(Boolean).length > 0 && (
        <div className="text-xs text-gray-400 px-4 py-1">Someone is typing…</div>
      )}

      {/* INPUT BOX */}
      <div className="p-3 border-t border-[#1f2124] flex items-center gap-2 bg-[#2b2d31]">
        <button
          onClick={() => setShowEmoji(!showEmoji)}
          className="p-2 bg-[#1f2124] rounded"
        >
          😊
        </button>

        {showEmoji && (
          <div className="absolute bottom-24 right-5 z-40">
            <Picker onEmojiClick={(_, e) => setText(text + e.emoji)} />
          </div>
        )}

        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Message #meeting"
          className="flex-1 bg-[#1f2124] text-white px-3 py-2 rounded text-sm outline-none"
        />

        <label>
          <input type="file" className="hidden" onChange={() => {}} />
          <span className="cursor-pointer p-2 bg-[#1f2124] rounded">📎</span>
        </label>

        <button
          onClick={sendMessage}
          className="px-4 py-2 bg-[#5865f2] rounded text-white hover:bg-[#4752c4]"
        >
          Send
        </button>
      </div>
    </div>
  );
}
