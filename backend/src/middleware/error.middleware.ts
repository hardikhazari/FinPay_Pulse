import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('[Error]:', err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.errors
    });
  }

  // Handle Prisma errors here if needed
  
  console.error('[ErrorMiddleware]:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
};
