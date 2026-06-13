import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';

/**
 * Validates request payload against a Zod schema.
 * Throws a ZodError which is caught by the errorMiddleware.
 */
export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      next(error); // Pass to centralized error handler
    }
  };
};
