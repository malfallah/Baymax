import pino from 'pino';
import { env } from '../config/env';

export const logger = pino({
  level: env.LOG_LEVEL ?? (env.isTest ? 'silent' : env.isProduction ? 'info' : 'debug'),
  redact: ['req.headers.authorization', 'password', '*.password'],
});
