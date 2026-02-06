// src/pages/MeetingRoom.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import ChatPanel from "../components/ChatPanel";
import { getToken } from "../lib/storage";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

export default function MeetingRoom() {
  const { id: meetingId } = useParams();
  const navigate = useNavigate();

  const localVideoRef = useRef(null);
  const socketRef = useRef(null);
  const pcsRef = useRef({});
  const localStreamRef = useRef(null);
  const socketInitialized = useRef(false);

  const [peers, setPeers] = useState({});
  const [socketReady, setSocketReady] = useState(false);

  const token = getToken();

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  useEffect(() => {
    if (!token) return;
    if (socketInitialized.current) return;
    socketInitialized.current = true;

    async function init() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        localStreamRef.current = stream;
        if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
        return;
      }

      const socket = io(SOCKET_URL, {
        auth: { token },
        transports: ["websocket"],
      });
      socketRef.current = socket;

      socket.on("connect", () => {
        console.log("CONNECTED:", socket.id);
        setSocketReady(true);
        socket.emit("join-room", { meetingId });
      });

      socket.on("user-joined", async ({ socketId }) => {
        const pc = createPeerConnection(socketId, socket);
        pcsRef.current[socketId] = pc;

        localStreamRef.current
          .getTracks()
          .forEach((t) => pc.addTrack(t, localStreamRef.current));

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("signal", {
          to: socketId,
          data: { type: "offer", sdp: offer },
        });
      });

      socket.on("signal", async ({ from, data }) => {
        let pc = pcsRef.current[from];

        if (data.type === "offer") {
          if (!pc) {
            pc = createPeerConnection(from, socket);
            pcsRef.current[from] = pc;

            localStreamRef.current
              .getTracks()
              .forEach((t) => pc.addTrack(t, localStreamRef.current));
          }

          await pc.setRemoteDescription(data.sdp);

          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("signal", {
            to: from,
            data: { type: "answer", sdp: answer },
          });
        }

        if (data.type === "answer") {
          await pc?.setRemoteDescription(data.sdp);
        }

        if (data.type === "ice") {
          try {
            await pc?.addIceCandidate(data.candidate);
          } catch (e) {}
        }
      });

      socket.on("user-left", ({ socketId }) => {
        if (pcsRef.current[socketId]) {
          pcsRef.current[socketId].close();
          delete pcsRef.current[socketId];
        }

        setPeers((prev) => {
          const copy = { ...prev };
          delete copy[socketId];
          return copy;
        });
      });
    }

    init();

    return () => {
      try {
        socketRef.current?.disconnect();
      } catch {}

      Object.values(pcsRef.current).forEach((pc) => pc.close?.());
      pcsRef.current = {};

      localStreamRef.current?.getTracks?.().forEach((t) => t.stop?.());
      setSocketReady(false);
    };
  }, [meetingId, token, navigate]);

  function createPeerConnection(remoteId, socket) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("signal", {
          to: remoteId,
          data: { type: "ice", candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      setPeers((prev) => ({
        ...prev,
        [remoteId]: { stream: e.streams[0] },
      }));
    };

    return pc;
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-[calc(100vh-115px)]">

      {/* Video */}
      <div className="col-span-2 bg-white p-4 rounded shadow overflow-auto">
        <div className="grid grid-cols-2 gap-3">
          <video
            ref={localVideoRef}
            className="w-full h-64 bg-black rounded"
            autoPlay
            playsInline
            muted
          />

          {Object.entries(peers).map(([sid, p]) => (
            <video
              key={sid}
              className="w-full h-64 bg-black rounded"
              autoPlay
              playsInline
              ref={(el) => el && (el.srcObject = p.stream)}
            />
          ))}
        </div>
      </div>

      {/* Chat */}
      <div className="col-span-1">
        <ChatPanel
          socketRef={socketRef}
          meetingId={meetingId}
          socketReady={socketReady}
        />
      </div>
    </div>
  );
}
