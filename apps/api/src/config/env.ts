import { randomBytes } from 'node:crypto';
import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  MONGODB_URI: z.string().min(1).default('mongodb://127.0.0.1:27017/baymax'),
  JWT_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  CORS_ORIGIN: z.string().default('*'),
  APP_URL: z.string().default('http://localhost:8081'),
  STRIPE_SECRET_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4o-mini'),
  LOG_LEVEL: z.string().optional(),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  console.error('Invalid environment configuration:', z.treeifyError(parsed.error));
  process.exit(1);
}

const raw = parsed.data;

if (raw.NODE_ENV === 'production' && (!raw.JWT_SECRET || raw.JWT_SECRET.length < 32)) {
  console.error('JWT_SECRET must be set to at least 32 characters in production.');
  process.exit(1);
}

export const env = {
  ...raw,
  // An ephemeral secret keeps development friction-free; tokens reset on restart.
  JWT_SECRET: raw.JWT_SECRET || randomBytes(32).toString('hex'),
  STRIPE_SECRET_KEY: raw.STRIPE_SECRET_KEY || undefined,
  OPENAI_API_KEY: raw.OPENAI_API_KEY || undefined,
  isProduction: raw.NODE_ENV === 'production',
  isTest: raw.NODE_ENV === 'test',
};
