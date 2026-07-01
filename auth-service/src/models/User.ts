import types = require("../types");
import mongoose = require('mongoose');

const userSchema = new mongoose.Schema<types.IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const User = mongoose.model<types.IUser>('User', userSchema);

module.exports = User;