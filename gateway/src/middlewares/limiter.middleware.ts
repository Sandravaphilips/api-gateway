import type { Request, Response, NextFunction } from "express";
import type { LoginRecord, UserRecord } from "../types";

const store = new Map<string, UserRecord>();

setInterval(
  () => {
    const now = Date.now();
    for (const [ip, record] of store.entries()) {
      if (record.resetTime <= now) {
        store.delete(ip);
      }
    }
  },
  5 * 60 * 1000,
);

const createRateLimiter = (
  maxRequestsPerWindow: number,
  windowSizeInMinutes: number,
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
    const now = Date.now();

    let record = store.get(ip);

    if (!record || now > record.resetTime) {
      store.set(ip, {
        count: 1,
        resetTime: now + windowSizeInMinutes * 60 * 1000,
      });
      return next();
    }

    if (record.count >= maxRequestsPerWindow) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      res.setHeader("Retry-After", retryAfter.toString());
      return res
        .status(429)
        .json({ message: "Too many requests. Please try again later." });
    }

    record.count++;
    next();
  };
};

const loginAttemptsStore = new Map<string, LoginRecord>();

const createAuthRateLimiter = () => {
  return (req: Request, res: Response, next: NextFunction) => {
    const ip =
      (req.headers["x-forwarded-for"] as string) || req.ip || "unknown";
    const now = Date.now();
    const record = loginAttemptsStore.get(ip);

    if (record && now < record.blockedUntil) {
      const remainingSeconds = Math.ceil((record.blockedUntil - now) / 1000);
      const remainingMinutes = Math.ceil(remainingSeconds / 60);

      res.setHeader("Retry-After", remainingSeconds.toString());
      return res
        .status(429)
        .json({
          message: `Too many failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
        });
    }

    res.on("finish", () => {
      const isLoginPath = req.path.includes("/login");
      const isAuthFailure = res.statusCode === 401 || res.statusCode === 403;

      if (isLoginPath && isAuthFailure) {
        const currentRecord = record ?? {
          attempts: 0,
          blockedUntil: 0,
          lockoutLevel: 0,
        };

        currentRecord.attempts++;

        if (currentRecord.attempts >= 3) {
          const lockoutMinutes = currentRecord.lockoutLevel === 0 ? 15 : currentRecord.lockoutLevel * 30;
          
          currentRecord.blockedUntil = now + lockoutMinutes * 60 * 1000;
          currentRecord.attempts = 0;
          currentRecord.lockoutLevel++;
        }

        loginAttemptsStore.set(ip, currentRecord);
      } else if (res.statusCode < 300) {
        loginAttemptsStore.delete(ip);
      }
    });

    next();
  };
};

module.exports = { createRateLimiter, createAuthRateLimiter };
