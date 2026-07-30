import type { Request, Response } from "express";

const { registerUser, loginUser, refreshToken: refreshHandler, logoutUser } = require("./auth.service");
const config = require("./config");
const getCookie = require("./utils/cookie");
const publishAuditEvent = require("./utils/event");

async function register(req: Request, res: Response) {
  try {
    const userDetails = req.body;
    const newUser = await registerUser(userDetails);
    const auditEvent = {
      userId: newUser.id,
      action: "REGISTER_SUCCESS",
      status: "SUCCESS",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };

    publishAuditEvent(auditEvent);

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error: any) {
    publishAuditEvent({
      userId: null,
      action: "REGISTER_FAILED",
      status: "FAILED",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      meta: {
        error: error.message,
        email: req.body.email || null,
        username: req.body.username || null,
      },
    });

    res.status(400).json({ message: error.message });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    const usernameOrEmail = username || email;
    const userResponse = await loginUser(usernameOrEmail, password);

    res.cookie("refreshToken", userResponse.refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: "/v1/api/auth",
    });

    const auditEvent = {
      userId: userResponse.user.id,
      action: "LOGIN_SUCCESS",
      status: "SUCCESS",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };

    publishAuditEvent(auditEvent);

    delete userResponse.refreshToken; // Remove refreshToken from the response for security

    res.status(200).json({ message: "User logged in successfully", ...userResponse });
  } catch (error: any) {
    publishAuditEvent({
      userId: null,
      action: "LOGIN_FAILED",
      status: "FAILED",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      meta: {
        error: error.message,
        email: req.body.email || null,
        username: req.body.username || null,
      },
    });

    res.status(401).json({ message: error.message });
  }
}

const refresh = async (req: Request, res: Response) => {
  const oldRefreshToken = getCookie(req, "refreshToken");

  if (!oldRefreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {
    const { userId, accessToken, refreshToken } = await refreshHandler(oldRefreshToken);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: config.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days 
      path: "/v1/api/auth",
    });

    const auditEvent = {
      userId: userId,
      action: "REFRESH_SUCCESS",
      status: "SUCCESS",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };

    publishAuditEvent(auditEvent);

    res.status(200).json({ message: "Token refreshed successfully", accessToken });
  } catch (error: any) {
    publishAuditEvent({
      userId: null,
      action: "REFRESH_FAILED",
      status: "FAILED",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      meta: {
        error: error.message,
        cause: error.cause || null,
      },
    });

    if (error.cause === "TokenReuseDetected") {
      res.clearCookie("refreshToken", { path: "/v1/api/auth" });
      return res.status(403).json({ message: "Refresh token reuse detected. All sessions have been invalidated." });
    }

    res.status(401).json({ message: error.message });
  }
};

const logout = async (req: Request, res: Response) => {
  const oldRefreshToken = getCookie(req, "refreshToken");

  if (!oldRefreshToken) {
    return res.status(400).json({ message: "Refresh token is required" });
  }

  try {

    const { userId } = await logoutUser(oldRefreshToken);

    res.clearCookie("refreshToken", { path: "/v1/api/auth" });

    const auditEvent = {
      userId: userId,
      action: "LOGOUT_SUCCESS",
      status: "SUCCESS",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };

    publishAuditEvent(auditEvent);

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error: any) {
    publishAuditEvent({
      userId: null,
      action: "LOGOUT_FAILED",
      status: "FAILED",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
      meta: {
        error: error.message,
        cause: error.cause || null,
      },
    });

    res.status(401).json({ message: error.message });
  }
};

module.exports = { register, login, refresh, logout };
