import type { IUser } from "./types";
const { generateTokens, hashToken, verifyToken } = require("./utils/token");

const config = require("./config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

async function registerUser(userDetails: IUser) {
  const { username, email, password } = userDetails;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    throw new Error("Account already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const newUser = new User({ username, email, password: hashedPassword });
  await newUser.save();
  return { username: newUser.username, email: newUser.email, id: newUser._id };
}

async function loginUser(usernameOrEmail: string, password: string) {
  const user = await User.findOne({
    $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
  });
  if (!user) {
    throw new Error(
      "Invalid details. Please check your username/email and password.",
    );
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error(
      "Invalid details. Please check your username/email and password.",
    );
  }
  
  const { accessToken, refreshToken } = generateTokens(user._id);

  const hashedToken = hashToken(refreshToken);

  user.refreshTokens.push(hashedToken);
  await user.save();

  return {
    user: { username: user.username, email: user.email, id: user._id },
    accessToken,
    refreshToken,
  };
}

async function refreshToken(oldRefreshToken: string) {
  const decoded = verifyToken(oldRefreshToken, config.JWT_REFRESH_SECRET);
  const hashedOldRefreshToken = hashToken(oldRefreshToken);
  if (!decoded) {
    await User.updateOne(
      { refreshTokens: hashedOldRefreshToken },
      { $pull: { refreshTokens: hashedOldRefreshToken } },
    );
    throw new Error("Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error("User not found");
  }

  const tokenIndex = user.refreshTokens.indexOf(hashedOldRefreshToken);

  if (tokenIndex === -1) {
    user.refreshTokens = [];
    await user.save();
    throw new Error("Invalid refresh token", {
      cause: "TokenReuseDetected",
    });
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshTokens[tokenIndex] = hashToken(refreshToken);
  await user.save();

  return { userId: decoded.id, accessToken, refreshToken };
}

async function logoutUser(refreshToken: string) {
  const decoded = verifyToken(refreshToken, config.JWT_REFRESH_SECRET);
  if (!decoded) {
    throw new Error("Invalid refresh token");
  }

  const user = await User.findById(decoded.id);
  if (!user) {
    throw new Error("User not found");
  }

  const hashedRefreshToken = hashToken(refreshToken);
  const tokenIndex = user.refreshTokens.indexOf(hashedRefreshToken);
  if (tokenIndex !== -1) {
    user.refreshTokens.splice(tokenIndex, 1);
    await user.save();
  }

  return { userId: decoded.id };
}

module.exports = { registerUser, loginUser, refreshToken, logoutUser };
