import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

/**
 * Centralised error handler — catches anything thrown or passed to next(err)
 * from route handlers and returns a clean JSON response.
 *
 * In development we include the raw error message for debugging.
 * In production we hide internals to avoid leaking stack traces.
 */
export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]:', err);

  // Zod validation errors get a 400 with field-level detail
  if (err.name === 'ZodError') {
    return res.status(400).json({
      error: 'Validation Error',
      details: (err as any).errors,
    });
  }

  // Everything else is a generic 500
  console.error('[ErrorMiddleware]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
};
