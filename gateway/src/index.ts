require("dotenv").config();

const express = require("express");
const { connectToRabbitMQ } = require("./config/broker");
const proxyMiddleware = require("./middlewares/proxy.middleware");
const auditMiddleware = require("./middlewares/audit.middleware");
const jwtMiddleware = require("./middlewares/jwt.middleware");

const app = express();
const port = process.env.PORT;

app.use(
  "/v1/api/:serviceName",
  jwtMiddleware,
  auditMiddleware,
  proxyMiddleware,
);

connectToRabbitMQ()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error: any) => {
    console.error("Failed to connect to RabbitMQ:", error);
  });
