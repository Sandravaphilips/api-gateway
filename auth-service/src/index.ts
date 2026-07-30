require("dotenv").config();
require("./config/database");

const config = require("./config");
const express = require("express");
const authRouter = require("./auth.router");
const { connectToRabbitMQ } = require("./config/broker");

const app = express();

app.use(express.json());

app.use("", authRouter);

app.listen(config.AUTH_PORT, () => {
  console.log(`Server is running on port ${config.AUTH_PORT}`);
});

const connectBrokerWithRetry = async () => {
  try {
    await connectToRabbitMQ();
  } catch (error: any) {
    console.error(
      "Failed to connect to RabbitMQ. Retrying in 5 seconds:",
      error,
    );
    setTimeout(connectBrokerWithRetry, 5000);
  }
};

connectBrokerWithRetry();
