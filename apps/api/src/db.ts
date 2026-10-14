import mongoose from 'mongoose';
import { logger } from './lib/logger';

mongoose.set('strictQuery', true);

/** Normalises documents for the API: `_id` → `id`, hides internals. */
mongoose.plugin((schema) => {
  schema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: (_doc, ret: Record<string, unknown>) => {
      ret.id = String(ret._id);
      delete ret._id;
      delete ret.passwordHash;
      delete ret.resetToken;
      return ret;
    },
  });
});

export async function connectDatabase(uri: string): Promise<void> {
  await mongoose.connect(uri);
  logger.info({ host: mongoose.connection.host }, 'Connected to MongoDB');
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
