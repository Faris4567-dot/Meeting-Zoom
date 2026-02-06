import { useEffect, useRef } from "react";
import io from "socket.io-client";
import { getToken } from "../lib/storage";

export default function useSocket() {
  const socketRef = useRef(null);

  useEffect(() => {
    const token = getToken();

    if (!token) {
      console.error("❌ No token found — socket connection aborted.");
      alert("You must login again. Token missing.");
      return;
    }

    console.log("🔐 Using token for socket:", token);

    socketRef.current = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token },
      transports: ["websocket", "polling"],
    });

    // Debug socket errors
    socketRef.current.on("connect_error", (err) => {
      console.error("❌ SOCKET CONNECT ERROR:", err.message);
      alert("Forbidden: Socket authentication failed. Please login again.");
    });

    socketRef.current.on("disconnect", (reason) => {
      console.warn("⚠️ Socket disconnected:", reason);
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  return socketRef;
}
