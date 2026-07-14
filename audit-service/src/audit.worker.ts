import type { ConsumeMessage } from 'amqplib';

const amqp = require('amqplib');
const createAuditLog = require('./audit.service');

async function auditWorker() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    const channel = await connection.createChannel();
    await channel.assertQueue('audit_logs', { durable: true });
    console.log('Audit worker connected to RabbitMQ successfully');

    channel.prefetch(1);
    console.log('Audit worker is waiting for messages in the audit_logs queue...');

    channel.consume('audit_logs', async (msg: ConsumeMessage | null) => {
      if (!msg) return;

      const auditEvent = JSON.parse(msg.content.toString());
      console.log('Received audit event:', auditEvent);
        await createAuditLog(auditEvent);

        channel.ack(msg);
        console.log(`Audit log created and message acknowledged for userId: ${auditEvent.userId}`);
      }
    );
  } catch (error) {
    console.error('Audit worker failed to connect to RabbitMQ:', error);
    process.exit(1);
  }
}

module.exports = auditWorker;