import express from 'express';
import multer from 'multer';
import { authenticate } from '../middlewares/auth.middleware.js';
import { uploadFile } from '../controllers/upload.controller.js';

// local storage (dev). For prod use S3/Cloudinary via services/storage.service.js
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

const router = express.Router();

router.post('/', authenticate, upload.single('file'), uploadFile);

export default router;
