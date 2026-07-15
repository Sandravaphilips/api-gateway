require("dotenv").config();
require("./config/database");

const express = require("express");
const authRouter = require("./auth.router");
const { connectToRabbitMQ } = require("./config/broker");

const app = express();
const port = process.env.PORT || 3001;

app.use(express.json());

app.use("", authRouter);

connectToRabbitMQ()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error: any) => {
    console.error("Failed to connect to RabbitMQ:", error);
  });
