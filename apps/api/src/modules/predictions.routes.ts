import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { predictConditions, predictSchema } from '@baymax/shared';
import { env } from '../config/env';
import { validate } from '../lib/validate';
import { summarizeDiagnosis } from '../services/ai';

const limiter = rateLimit({
  windowMs: 60_000,
  limit: env.isTest ? 10_000 : 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
});

export const predictionsRouter = Router();

predictionsRouter.post('/predictions', limiter, async (req, res) => {
  const { symptoms } = validate(predictSchema, req.body);
  const result = predictConditions(symptoms);
  result.aiSummary = await summarizeDiagnosis(result);
  res.json(result);
});
