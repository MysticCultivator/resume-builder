import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export class ApiError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string) {
    super(message);
    this.statusCode = statusCode;
  }
}

// Centralized error handler — every route's async errors should be forwarded here via next(err).
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({ error: err.message });
  }

  // zod schema.parse() throws ZodError on invalid input (e.g. register/login
  // body validation) — surface these as 400s with a readable message instead
  // of falling through to a generic 500.
  if (err instanceof ZodError) {
    const message = err.errors.map((e) => e.message).join('; ');
    return res.status(400).json({ error: message || 'Invalid request data' });
  }

  // eslint-disable-next-line no-console
  console.error(err);
  return res.status(500).json({ error: 'Internal server error' });
}
