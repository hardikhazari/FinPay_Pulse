import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform(v => v ? parseInt(v) : 100),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
});

/**
 * Retrieves Customer Lifetime Value (CLV) predictions.
 * 
 * @route GET /api/clv
 * @query {limit, offset}
 * @returns {Array<Clv>}
 */
export const getClvPredictions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = querySchema.parse(req.query);

    const predictions = await prisma.clv.findMany({
      take: limit,
      skip: offset,
      orderBy: { predictedClv: 'desc' }
    });

    const total = await prisma.clv.count();

    res.json({ data: predictions, meta: { total, limit, offset } });
  } catch (error) {
    next(error);
  }
};
