import type { Request } from "express";

const getCookie = (req: Request, cookieName: string): string | undefined => {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return undefined;

  const cookies = cookieHeader.split("; ").map(cookie => cookie.trim().split("="));
  const cookie = cookies.find(([name]) => name === cookieName);
  
  return cookie && cookie[1] ? decodeURIComponent(cookie[1]) : undefined;
};

module.exports = getCookie;