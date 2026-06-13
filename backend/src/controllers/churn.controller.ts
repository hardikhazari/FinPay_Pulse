import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform(v => v ? parseInt(v) : 100),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
  riskTier: z.enum(['Low', 'Medium', 'High']).optional(),
});

/**
 * Retrieves Churn scores.
 * 
 * @route GET /api/churn
 * @query {limit, offset, riskTier}
 */
export const getChurnScores = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset, riskTier } = querySchema.parse(req.query);

    const where = riskTier ? { riskTier } : {};

    const scores = await prisma.churnScore.findMany({
      where,
      take: limit,
      skip: offset,
      orderBy: { churnProbability: 'desc' }
    });

    const total = await prisma.churnScore.count({ where });

    // Aggregate distribution
    const grouped = await prisma.churnScore.groupBy({
      by: ['riskTier'],
      _count: {
        customerId: true
      }
    });
    
    const distribution = { Low: 0, Medium: 0, High: 0 };
    grouped.forEach(g => {
      if (g.riskTier === 'Low') distribution.Low = g._count.customerId;
      if (g.riskTier === 'Medium') distribution.Medium = g._count.customerId;
      if (g.riskTier === 'High') distribution.High = g._count.customerId;
    });

    res.json({ data: scores, distribution, meta: { total, limit, offset, riskTier } });
  } catch (error) {
    next(error);
  }
};
