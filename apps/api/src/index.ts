import { createApp } from './app';
import { env } from './config/env';
import { connectDatabase, disconnectDatabase } from './db';
import { logger } from './lib/logger';

async function main() {
  await connectDatabase(env.MONGODB_URI);
  const server = createApp().listen(env.PORT, () => {
    logger.info(`Baymax API listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down`);
    server.close(async () => {
      await disconnectDatabase();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main().catch((error) => {
  logger.fatal({ err: error }, 'Failed to start');
  process.exit(1);
});
