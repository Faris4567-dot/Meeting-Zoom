import asyncHandler from '../middlewares/asyncHandler.js';
import path from 'path';

export const uploadFile = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // For production, upload to S3/Cloudinary and return URL
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});
