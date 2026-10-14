import OpenAI from 'openai';
import type { DiagnosisResult } from '@baymax/shared';
import { SYMPTOM_BY_ID } from '@baymax/shared';
import { env } from '../config/env';
import { logger } from '../lib/logger';

const client = env.OPENAI_API_KEY ? new OpenAI({ apiKey: env.OPENAI_API_KEY }) : undefined;

/**
 * Optionally enriches a knowledge-base result with a short, friendly explanation.
 * Returns undefined when no provider is configured or the call fails, so the
 * symptom checker always works without an external dependency.
 */
export async function summarizeDiagnosis(result: DiagnosisResult): Promise<string | undefined> {
  if (!client || result.candidates.length === 0) return undefined;
  const symptoms = result.symptoms.map((id) => SYMPTOM_BY_ID[id]?.label ?? id).join(', ');
  const candidates = result.candidates
    .slice(0, 3)
    .map((c) => `${c.disease} (${c.confidence}% match)`)
    .join('; ');
  try {
    const completion = await client.chat.completions.create({
      model: env.OPENAI_MODEL,
      max_tokens: 220,
      temperature: 0.3,
      messages: [
        {
          role: 'system',
          content:
            'You are a careful health information assistant. In under 90 words, explain in plain language what the reported symptoms may suggest, give practical self-care advice and say clearly when to see a doctor. Never claim a diagnosis. Do not use markdown.',
        },
        {
          role: 'user',
          content: `Symptoms: ${symptoms}. Possible matches from our knowledge base: ${candidates}.`,
        },
      ],
    });
    return completion.choices[0]?.message.content?.trim() || undefined;
  } catch (error) {
    logger.warn({ err: error }, 'AI summary unavailable');
    return undefined;
  }
}
