import cors from 'cors';
import express, { Router } from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { env } from './config/env';
import { logger } from './lib/logger';
import { errorHandler, notFoundHandler } from './middleware/error';
import { appointmentsRouter } from './modules/appointments.routes';
import { authRouter } from './modules/auth.routes';
import { communityRouter } from './modules/community.routes';
import { doctorsRouter } from './modules/doctors.routes';
import { predictionsRouter } from './modules/predictions.routes';
import { shopRouter } from './modules/shop.routes';
import { paymentsEnabled } from './services/payments';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    }),
  );
  app.use(express.json({ limit: '100kb' }));
  if (!env.isTest)
    app.use(pinoHttp({ logger, autoLogging: { ignore: (req) => req.url === '/health' } }));

  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      payments: paymentsEnabled() ? 'stripe' : 'demo',
      time: new Date().toISOString(),
    });
  });

  const api = Router();
  api.use(
    authRouter,
    doctorsRouter,
    appointmentsRouter,
    communityRouter,
    shopRouter,
    predictionsRouter,
  );
  app.use('/api/v1', api);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
