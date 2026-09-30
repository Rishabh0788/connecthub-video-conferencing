import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export type JwtPayload = { sub: string; name: string; email: string };
export function signToken(payload: JwtPayload) {
  return jwt.sign(payload, config.jwtSecret, { expiresIn: '7d' });
}
export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, config.jwtSecret) as JwtPayload;
}
