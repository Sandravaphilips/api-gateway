const { getChannel } = require("../config/broker");

const publishAuditEvent = (event: Record<string, unknown>) => {
  try {
    const channel = getChannel();
    channel.sendToQueue("audit_logs", Buffer.from(JSON.stringify(event)), {
      persistent: true,
    });
  } catch (error: any) {
    console.warn("Audit publish skipped:", error?.message || error);
  }
};

module.exports = publishAuditEvent;
