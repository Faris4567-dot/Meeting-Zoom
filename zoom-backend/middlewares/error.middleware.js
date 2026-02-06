import logger from '../config/logger.js';

export default function errorHandler(err, req, res, next) {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  logger.error(err.stack || err);
  res.status(status).json({ success: false, message });
}
