import type { Request, Response } from "express";

const { registerUser, loginUser } = require("./auth.service");

async function register(req: Request, res: Response) {
  try {
    const userDetails = req.body;
    const newUser = await registerUser(userDetails);

    res.status(201).json({ message: "User registered successfully", user: newUser });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
}

async function login(req: Request, res: Response) {
  try {
    const { username, email, password } = req.body;
    const usernameOrEmail = username || email;
    const user = await loginUser(usernameOrEmail, password);
    
    res.status(200).json({ message: "User logged in successfully", ...user });
  } catch (error: any) {
    res.status(401).json({ message: error.message });
  }
}

module.exports = { register, login };