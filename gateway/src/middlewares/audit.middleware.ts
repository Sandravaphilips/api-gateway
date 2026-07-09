import type { Response, NextFunction } from 'express';
import type { AuthRequest} from './jwt.middleware';

const { getChannel } = require('../config/broker');

const auditMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) return next();

  const { method, originalUrl, body } = req;
  const timestamp = new Date().toISOString();

  const auditEvent = {
    userId: req.user.id,
    method,
    originalUrl,
    body,
    timestamp,
  };

  try {
    const channel = getChannel();
    channel.sendToQueue("audit_logs", Buffer.from(JSON.stringify(auditEvent)), {
      persistent: true,
    });
  } catch (error) {
    console.error("Failed to send audit log to RabbitMQ:", error);
  }

  next();
};

module.exports = auditMiddleware;
