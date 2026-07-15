import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./jwt.middleware";

const { getChannel } = require("../config/broker");

const auditMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  if (!req.user) return next();

  const auditEvent = {
    userId: req.user.id,
    action: req.method,
    status: "AUTHORIZED",
    service: req.params.serviceName,
    path: req.originalUrl,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
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
