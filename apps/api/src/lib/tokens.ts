import jwt, { type SignOptions } from 'jsonwebtoken';
import type { Role } from '@baymax/shared';
import { env } from '../config/env';

export interface TokenPayload {
  sub: string;
  role: Role;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'],
  });
}

export function verifyToken(token: string): TokenPayload {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded === 'string' || !decoded.sub || !decoded.role)
    throw new Error('Malformed token');
  return { sub: decoded.sub, role: decoded.role as Role };
}
