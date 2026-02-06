import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/db.js';
import logger from './config/logger.js';

import authRoutes from './routes/auth.routes.js';
import meetingsRoutes from './routes/meetings.routes.js';
import uploadRoutes from './routes/upload.routes.js';
import setupSignaling from './sockets/signaling.js';
import errorHandler from './middlewares/error.middleware.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || '*', methods: ['GET', 'POST'] }
});

// connect DB
await connectDB(process.env.MONGO_URI);

// middlewares
app.use(helmet());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(morgan('combined'));

// rate limiter
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 200 });
app.use(limiter);

// static uploads for dev
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get("/", (req, res) => {
  res.send("Zoom Backend Running 🚀");
});

// routes
app.use('/api/auth', authRoutes);
app.use('/api/meetings', meetingsRoutes);
app.use('/api/upload', uploadRoutes);

// sockets
setupSignaling(io);

// error handler (last)
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => logger.info(`Server listening on ${PORT}`));
