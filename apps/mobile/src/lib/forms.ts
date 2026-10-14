import type { z } from 'zod';
import { ApiError } from './api/errors';

export type FieldErrors = Record<string, string>;

/** Validates values with a zod schema and returns a flat field → message map. */
export function validateForm<S extends z.ZodType>(
  schema: S,
  values: unknown,
): { data?: z.output<S>; errors: FieldErrors } {
  const result = schema.safeParse(values);
  if (result.success) return { data: result.data, errors: {} };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) errors[issue.path.join('.') || '_'] ??= issue.message;
  return { errors };
}

/** Extracts server-side field errors (422) so they can be shown inline. */
export const serverFieldErrors = (error: unknown): FieldErrors =>
  error instanceof ApiError ? error.fields : {};
