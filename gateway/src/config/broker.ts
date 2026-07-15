import type { Channel } from "amqplib";

const amqp = require("amqplib");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://localhost";
let channel: Channel;

const connectToRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    channel = await connection.createChannel();

    await channel.assertQueue("audit_logs", { durable: true });
    console.log("Connected to RabbitMQ successfully");
  } catch (error) {
    console.error("Failed to connect to RabbitMQ:", error);
    throw error;
  }
};

const getChannel = () => {
  if (!channel) {
    throw new Error(
      "RabbitMQ channel is not initialized. Connect to RabbitMQ first.",
    );
  }
  return channel;
};

module.exports = { connectToRabbitMQ, getChannel };
