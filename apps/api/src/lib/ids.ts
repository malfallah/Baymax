import { isValidObjectId } from 'mongoose';
import { notFound } from './errors';

/** Guards route params so malformed ids return 404 instead of a cast error. */
export function assertId(id: unknown, resource: string): string {
  if (typeof id !== 'string' || !isValidObjectId(id)) throw notFound(resource);
  return id;
}
