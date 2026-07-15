import type types = require("./types");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("./models/User");

async function registerUser(userDetails: types.IUser) {
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

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "1h",
  });

  return {
    user: { username: user.username, email: user.email, id: user._id },
    token,
  };
}

module.exports = { registerUser, loginUser };
