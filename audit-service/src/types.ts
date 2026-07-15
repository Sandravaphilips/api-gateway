export interface LogData {
  userId?: string;
  action: string;
  status: string;
  service: string;
  path: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}
