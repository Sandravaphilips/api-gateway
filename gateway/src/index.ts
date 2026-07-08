require('dotenv').config();

const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT;

const proxyOptions = {
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '',
  },
};

const authProxy = createProxyMiddleware(proxyOptions);

app.use('/api/auth', authProxy);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
