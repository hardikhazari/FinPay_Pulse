import { Request, Response, NextFunction } from 'express';


/**
 * Validates request payload against a Zod schema.
 * Throws a ZodError which is caught by the errorMiddleware.
 */
export const validate = (schema: any) => {
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
