import type { ConsumeMessage } from "amqplib";

const amqp = require("amqplib");
const createAuditLog = require("./audit.service");
const config = require("./config");

const handleAuditMessage = async (channel: any, msg: ConsumeMessage) => {
  try {
    const auditEvent = JSON.parse(msg.content.toString());
    await createAuditLog(auditEvent);

    channel.ack(msg);
    console.log(
      `Audit log created and message acknowledged for userId: ${auditEvent.userId}`,
    );
  } catch (error) {
    console.error("Failed to process audit message:", error);
    channel.nack(msg, false, false);
  }
};

async function auditWorker() {
  try {
    const connection = await amqp.connect(config.RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue("audit_logs", { durable: true });
    console.log("Audit worker connected to RabbitMQ successfully");

    channel.prefetch(10);
    console.log(
      "Audit worker is waiting for messages in the audit_logs queue...",
    );

    channel.consume("audit_logs", async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      await handleAuditMessage(channel, msg);
    });
  } catch (error) {
    console.error("Audit worker failed to connect to RabbitMQ:", error);
  }
}

module.exports = auditWorker;
