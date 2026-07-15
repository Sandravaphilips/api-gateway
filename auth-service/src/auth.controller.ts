import type { Request, Response } from "express";

const { registerUser, loginUser } = require("./auth.service");
const { getChannel } = require("./config/broker");

async function register(req: Request, res: Response) {
  const channel = getChannel();

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

    channel.sendToQueue("audit_logs", Buffer.from(JSON.stringify(auditEvent)), {
      persistent: true,
    });

    res
      .status(201)
      .json({ message: "User registered successfully", user: newUser });
  } catch (error: any) {
    channel.sendToQueue(
      "audit_logs",
      Buffer.from(
        JSON.stringify({
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
        }),
      ),
      { persistent: true },
    );

    res.status(400).json({ message: error.message });
  }
}

async function login(req: Request, res: Response) {
  const channel = getChannel();

  try {
    const { username, email, password } = req.body;
    const usernameOrEmail = username || email;
    const user = await loginUser(usernameOrEmail, password);
    const auditEvent = {
      userId: user.id,
      action: "LOGIN_SUCCESS",
      status: "SUCCESS",
      service: req.params.serviceName || "auth",
      path: req.originalUrl,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    };

    channel.sendToQueue("audit_logs", Buffer.from(JSON.stringify(auditEvent)), {
      persistent: true,
    });

    res.status(200).json({ message: "User logged in successfully", ...user });
  } catch (error: any) {
    channel.sendToQueue(
      "audit_logs",
      Buffer.from(
        JSON.stringify({
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
        }),
      ),
      { persistent: true },
    );

    res.status(401).json({ message: error.message });
  }
}

module.exports = { register, login };
