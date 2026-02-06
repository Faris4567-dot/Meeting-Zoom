// zoom-backend/models/Meeting.js
import mongoose from "mongoose";

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  joinedAt: { type: Date, default: Date.now },
  socketId: String,
});

const meetingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    meetingId: { type: String, required: true, unique: true },

    startTime: Date,
    endTime: Date,

    participants: [participantSchema],

    maxParticipants: { type: Number, default: 50 },
    isPrivate: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.Meeting ||
  mongoose.model("Meeting", meetingSchema);
