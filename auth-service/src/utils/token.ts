const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const config = require("../config");

const generateTokens = (userId: string) => {
  const accessToken = jwt.sign({ id: userId }, config.JWT_ACCESS_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ id: userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const verifyToken = (token: string, secret: string) => {
  try {
    return jwt.verify(token, secret);
  } catch (err) {
    return null;
  }
};

module.exports = {
  generateTokens,
  hashToken,
  verifyToken,
};
