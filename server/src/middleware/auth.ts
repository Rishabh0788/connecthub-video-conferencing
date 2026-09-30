import type { NextFunction, Request, Response } from 'express';
import { verifyToken } from '../utils/auth.js';

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.connecthub_token;
  if (!token) return res.status(401).json({ message: 'Authentication required' });
  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, name: payload.name, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired session' });
  }
}
