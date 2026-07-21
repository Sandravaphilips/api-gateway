import type { Request } from "express";

export interface JwtUser {
  id: string;
}


export interface AuthRequest extends Request {
  user?: JwtUser;
}