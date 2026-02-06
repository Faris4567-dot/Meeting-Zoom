import React from "react";
import { useNavigate } from "react-router-dom";

export default function MeetingCard({ meeting }) {
  const nav = useNavigate();

  return (
    <div className="bg-white p-4 rounded shadow">
      <h3 className="font-semibold">{meeting.title}</h3>
      <p className="text-sm text-gray-500 mb-3">
        Host: {meeting.host?.name || "Unknown"}
      </p>

      <button
        className="text-blue-600"
        onClick={() => nav(`/meeting/${meeting.meetingId}`)}
      >
        Join
      </button>
    </div>
  );
}
