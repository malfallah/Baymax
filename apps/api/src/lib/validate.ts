import type { z } from 'zod';
import { AppError } from './errors';

/** Parses untrusted input with a zod schema, throwing a 422 with field errors on failure. */
export function validate<S extends z.ZodType>(schema: S, input: unknown): z.output<S> {
  const result = schema.safeParse(input);
  if (!result.success) {
    const fields: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const key = issue.path.join('.') || '_';
      fields[key] ??= issue.message;
    }
    const first = result.error.issues[0]?.message ?? 'Invalid request';
    throw new AppError(422, 'validation_error', first, { fields });
  }
  return result.data;
}
