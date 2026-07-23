import type { Request } from "express";

export interface JwtUser {
  id: string;
}

export interface AuthRequest extends Request {
  user?: JwtUser;
}

export interface UserRecord {
  count: number;
  resetTime: number;
}

export interface LoginRecord {
  attempts: number;
  blockedUntil: number;
  lockoutLevel: number;
}