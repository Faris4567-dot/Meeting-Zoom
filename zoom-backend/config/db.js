import mongoose from 'mongoose';
import logger from './logger.js';

export async function connectDB(uri) {
  try {
    await mongoose.connect(uri, { autoIndex: true });
    logger.info('✅ MongoDB connected');
  } catch (err) {
    logger.error('MongoDB connection error: ' + err.message);
    process.exit(1);
  }
}
