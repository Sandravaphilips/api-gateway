import type { LogData } from "./types";

const AuditLog = require("./models/AuditLog");

const createAuditLog = async (logData: LogData) => {
  try {
    const auditLog = new AuditLog(logData);
    await auditLog.save();
  } catch (error) {
    console.error("Error creating audit log:", error);
    throw error;
  }
};

module.exports = createAuditLog;
