import type { Request, Response, NextFunction } from "express";

const config = require("../config");
const { createProxyMiddleware } = require("http-proxy-middleware");

const proxyCache = new Map<string, ReturnType<typeof createProxyMiddleware>>();

const getProxy = (serviceName: string) => {
  if (!proxyCache.has(serviceName)) {
    const serviceUrl = config[`${serviceName.toUpperCase()}_SERVICE_URL`];
    proxyCache.set(
      serviceName,
      createProxyMiddleware({
        target: serviceUrl,
        changeOrigin: true,
        pathRewrite: { [`^/v1/api/${serviceName}`]: "" },
      }),
    );
  }
  return proxyCache.get(serviceName)!;
};

const proxyMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const serviceName = req.params.serviceName as string;

  const proxy = getProxy(serviceName);

  return proxy(req, res, next);
};

module.exports = proxyMiddleware;
