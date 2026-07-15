import mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId: { type: String, required: false },
  action: { type: String, required: true },
  status: { type: String, required: true },
  service: { type: String, required: true },
  path: { type: String, required: true },
  ipAddress: { type: String, required: false },
  userAgent: { type: String, required: false },
  timestamp: { type: Date, default: () => new Date().toISOString() },
  metadata: { type: mongoose.Schema.Types.Mixed, required: false },
});

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;