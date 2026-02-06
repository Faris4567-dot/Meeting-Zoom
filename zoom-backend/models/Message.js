// zoom-backend/models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  meeting: { type: String, required: true }, // store meetingId string
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: false },
  senderName: { type: String },
  type: { type: String, default: "text" }, // text, file, voice
  content: { type: String },
  fileUrl: { type: String },
  voiceUrl: { type: String },
  reactions: [
    {
      emoji: String,
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
  ],
  readBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

// Export safely to avoid overwrite error in dev
export default mongoose.models.Message || mongoose.model("Message", messageSchema);
