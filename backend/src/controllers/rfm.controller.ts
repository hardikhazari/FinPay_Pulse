import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform(v => v ? parseInt(v) : 100),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
});

/**
 * Retrieves RFM scores for customers.
 * 
 * @route GET /api/rfm
 * @query {limit, offset}
 * @returns {Array<RfmScore>}
 */
export const getRfmScores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = querySchema.parse(req.query);

    const scores = await prisma.rfmScore.findMany({
      take: limit,
      skip: offset,
      orderBy: { computedAt: 'desc' }
    });

    const total = await prisma.rfmScore.count();

    res.json({ data: scores, meta: { total, limit, offset } });
  } catch (error) {
    next(error);
  }
};
