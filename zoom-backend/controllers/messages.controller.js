// zoom-backend/controllers/messages.controller.js
import Message from '../models/Message.js';
import asyncHandler from '../middlewares/asyncHandler.js';

// GET /api/meetings/:meetingId/messages
export const getMessages = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  // fetch last 200 messages sorted oldest -> newest
  const messages = await Message.find({ meeting: meetingId })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean();
  res.json(messages);
});

// POST /api/meetings/:meetingId/messages/:messageId/read
export const markRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user._id;
  await Message.findByIdAndUpdate(messageId, { $addToSet: { readBy: userId } });
  res.json({ ok: true });
});
