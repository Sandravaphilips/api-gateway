import type { Request, Response } from 'express';

require('dotenv').config();

const express = require('express');
const app = express();
const router = express.Router();
const port = process.env.PORT || 3002;

app.use(express.json());

router.get('', (req: Request, res: Response) => {
  res.json({ message: 'This is a protected route' });
});

app.use(router);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});