require("dotenv").config();

const express = require("express");
const helmet = require("helmet");
const config = require("./config");
const { connectToRabbitMQ } = require("./config/broker");
const proxyMiddleware = require("./middlewares/proxy.middleware");
const auditMiddleware = require("./middlewares/audit.middleware");
const jwtMiddleware = require("./middlewares/jwt.middleware");
const { createRateLimiter, createAuthRateLimiter } = require("./middlewares/limiter.middleware");

const app = express();
const globalLimiter = createRateLimiter(100, 15);
const authLimiter = createAuthRateLimiter();

app.set("trust proxy", 1);

app.use(helmet());
app.use("/v1/api/auth/login", authLimiter);
app.use(
  "/v1/api/:serviceName",
  globalLimiter,
  jwtMiddleware,
  auditMiddleware,
  proxyMiddleware,
);

connectToRabbitMQ()
  .then(() => {
    app.listen(config.GATEWAY_PORT, () => {
      console.log(`Server is running on port ${config.GATEWAY_PORT}`);
    });
  })
  .catch((error: any) => {
    console.error("Failed to connect to RabbitMQ:", error);
  });
