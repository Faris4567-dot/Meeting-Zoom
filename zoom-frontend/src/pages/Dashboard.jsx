import React, { useEffect, useState } from "react";
import { getMeetings, createMeeting } from "../services/meetings.service";
import MeetingCard from "../components/MeetingCard";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [meetings, setMeetings] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    getMeetings().then((res) => setMeetings(res.data));
  }, []);

  async function newMeeting() {
    try {
      const res = await createMeeting({ title: "New Meeting" });
      nav(`/meeting/${res.data.meetingId}`);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  }

  return (
    <div>
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-semibold">Meetings</h1>
        <button
          onClick={newMeeting}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          Create Meeting
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {meetings.map((m) => (
          <MeetingCard key={m._id} meeting={m} />
        ))}
      </div>
    </div>
  );
}
