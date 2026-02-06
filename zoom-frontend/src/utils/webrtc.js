import React, { useEffect, useRef, useState } from "react";
import useSocket from "../hooks/useSocket";
import { useParams } from "react-router-dom";

export default function MeetingRoom() {
  const { id } = useParams();
  const socketRef = useSocket();
  const localVideo = useRef();
  const localStream = useRef();
  const pcs = useRef({});
  const [remotes, setRemotes] = useState({});

  useEffect(() => {
    async function start() {
      localStream.current = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localVideo.current.srcObject = localStream.current;

      const socket = socketRef.current;

      socket.on("connect", () => {
        socket.emit("join-room", { meetingId: id, user: { id: socket.id } });
      });

      socket.on("user-joined", async ({ socketId }) => {
        const pc = createPeer(socket, socketId);
        pcs.current[socketId] = pc;

        localStream.current.getTracks().forEach((track) =>
          pc.addTrack(track, localStream.current)
        );

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("signal", {
          to: socketId,
          data: { type: "offer", sdp: offer },
        });
      });

      socket.on("signal", async ({ from, data }) => {
        let pc = pcs.current[from];

        if (data.type === "offer") {
          pc = createPeer(socket, from);
          pcs.current[from] = pc;

          localStream.current.getTracks().forEach((t) =>
            pc.addTrack(t, localStream.current)
          );

          await pc.setRemoteDescription(data.sdp);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          socket.emit("signal", {
            to: from,
            data: { type: "answer", sdp: answer },
          });
        }

        if (data.type === "answer") {
          await pc.setRemoteDescription(data.sdp);
        }

        if (data.type === "ice") {
          pc.addIceCandidate(data.candidate);
        }
      });

      socket.on("user-left", ({ socketId }) => {
        if (pcs.current[socketId]) pcs.current[socketId].close();
        delete pcs.current[socketId];

        setRemotes((prev) => {
          const cp = { ...prev };
          delete cp[socketId];
          return cp;
        });
      });
    }

    start();

    return () => {
      Object.values(pcs.current).forEach((pc) => pc.close());
      socketRef.current.disconnect();
      localStream.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function createPeer(socket, socketId) {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        socket.emit("signal", {
          to: socketId,
          data: { type: "ice", candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      setRemotes((p) => ({
        ...p,
        [socketId]: e.streams[0],
      }));
    };

    return pc;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Local video */}
      <div className="col-span-2 bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold">Your Video</h2>
        <video
          ref={localVideo}
          autoPlay
          muted
          playsInline
          className="w-full h-64 bg-black rounded"
        />

        <h2 className="text-lg font-semibold mt-4">Participants</h2>
        <div className="grid grid-cols-2 gap-2">
          {Object.keys(remotes).map((key) => (
            <video
              key={key}
              autoPlay
              playsInline
              ref={(el) => el && (el.srcObject = remotes[key])}
              className="w-full h-48 bg-black rounded"
            />
          ))}
        </div>
      </div>

      {/* Chat placeholder */}
      <div className="bg-white p-4 rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Chat</h2>
        Coming soon…
      </div>
    </div>
  );
}
