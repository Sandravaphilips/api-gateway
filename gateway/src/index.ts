require("dotenv").config();
const express = require("express");
const config = require("./config");
const { connectToRabbitMQ } = require("./config/broker");
const proxyMiddleware = require("./middlewares/proxy.middleware");
const auditMiddleware = require("./middlewares/audit.middleware");
const jwtMiddleware = require("./middlewares/jwt.middleware");

const app = express();

app.use(
  "/v1/api/:serviceName",
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
