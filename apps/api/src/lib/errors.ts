export class AppError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const badRequest = (message: string, details?: unknown) =>
  new AppError(400, 'bad_request', message, details);
export const unauthorized = (message = 'Authentication required') =>
  new AppError(401, 'unauthorized', message);
export const forbidden = (message = 'You do not have permission to do that') =>
  new AppError(403, 'forbidden', message);
export const notFound = (resource = 'Resource') =>
  new AppError(404, 'not_found', `${resource} not found`);
export const conflict = (message: string) => new AppError(409, 'conflict', message);
