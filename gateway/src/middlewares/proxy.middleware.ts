import type { Request, Response, NextFunction } from "express";

const { createProxyMiddleware } = require("http-proxy-middleware");

const proxyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const serviceName = req.params.serviceName as string;
  const serviceUrl = process.env[`${serviceName.toUpperCase()}_SERVICE_URL`];
  
  if (!serviceUrl) {
    return res.status(503).json({ message: `Service ${serviceName} not configured` });
  }

  const proxy = createProxyMiddleware({
    target: serviceUrl,
    changeOrigin: true,
    pathRewrite: {
      [`^/v1/api/${serviceName}`]: "",
    },
  });

  return proxy(req, res, next);
};

module.exports = proxyMiddleware;
