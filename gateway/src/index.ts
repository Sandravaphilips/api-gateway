require('dotenv').config();

const express = require('express');
const proxyMiddleware = require('./middlewares/proxy.middleware');
const jwtMiddleware = require('./middlewares/jwt.middleware');

const app = express();
const port = process.env.PORT;

app.use('/v1/api/:serviceName', jwtMiddleware, proxyMiddleware);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
