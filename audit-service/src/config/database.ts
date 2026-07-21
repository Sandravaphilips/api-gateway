const mongoose = require("mongoose");
const config = require("../config");

mongoose
  .connect(config.DATABASE_URL)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err: any) => console.error("Error connecting to MongoDB:", err));

module.exports = mongoose;
