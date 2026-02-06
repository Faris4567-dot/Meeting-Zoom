// zoom-backend/routes/meetings.routes.js
import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import Meeting from "../models/Meeting.js";
import Message from "../models/Message.js";  // <--- RESTORED

const router = express.Router();

// GET all meetings for logged in user
router.get("/", authenticate, async (req, res) => {
  const list = await Meeting.find({ host: req.user._id }).lean();
  res.json(list);
});

// CREATE meeting
router.post("/", authenticate, async (req, res) => {
  const meetingId = crypto.randomUUID().slice(0, 8);
  
  const meeting = await Meeting.create({
    host: req.user._id,
    meetingId,
    title: "New Meeting",
    description: "",
  });

  res.status(201).json(meeting);
});

// GET single meeting
router.get("/:meetingId", authenticate, async (req, res) => {
  const m = await Meeting.findOne({ meetingId: req.params.meetingId }).lean();
  if (!m) return res.status(404).json({ message: "Meeting not found" });
  res.json(m);
});
router.get("/:meetingId/messages", authenticate, async (req, res) => {
  const msgs = await Message.find({ meeting: req.params.meetingId })
    .sort({ createdAt: 1 })
    .lean();

  res.json(msgs);
});

// ❌ REMOVE chat history route completely (you deleted Message.js)

export default router;
