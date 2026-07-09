import type { Request, Response, NextFunction } from 'express';
import type { JwtUser } from '../../../shared/types';

const jwt = require('jsonwebtoken');
const { publicRoutes } = require('../constants');

export interface AuthRequest extends Request {
  user?: JwtUser;
}

const jwtMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (publicRoutes.includes(req.originalUrl)) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err: any, user: JwtUser) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

module.exports = jwtMiddleware;
