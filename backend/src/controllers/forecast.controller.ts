import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform(v => v ? parseInt(v) : 12), // default 12 months
});

/**
 * Retrieves Revenue Forecasts.
 * 
 * @route GET /api/forecast
 */
export const getForecasts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit } = querySchema.parse(req.query);

    const forecasts = await prisma.forecast.findMany({
      take: limit,
      orderBy: { month: 'asc' }
    });

    res.json({ data: forecasts });
  } catch (error) {
    next(error);
  }
};
