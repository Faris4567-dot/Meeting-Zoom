// zoom-backend/controllers/meetings.controller.js
import Meeting from "../models/Meeting.js";
import asyncHandler from "../middlewares/asyncHandler.js";
import { v4 as uuidv4 } from "uuid";

// CREATE MEETING
export const createMeeting = asyncHandler(async (req, res) => {
  const { title, description, startTime, endTime, maxParticipants, isPrivate } =
    req.body;

  const meetingId = uuidv4().slice(0, 8);

  const meeting = await Meeting.create({
    title,
    description,
    startTime,
    endTime,
    maxParticipants,
    isPrivate,

    host: req.user._id,
    meetingId,
  });

  res.status(201).json(meeting);
});

// GET ONE MEETING
export const getMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOne({
    meetingId: req.params.meetingId,
  }).populate("host", "name email");

  if (!meeting)
    return res.status(404).json({ message: "Meeting not found" });

  res.json(meeting);
});

// LIST USER MEETINGS
export const listMeetings = asyncHandler(async (req, res) => {
  const meetings = await Meeting.find({ host: req.user._id })
    .populate("host", "name email")
    .sort({ createdAt: -1 });

  res.json(meetings);
});
