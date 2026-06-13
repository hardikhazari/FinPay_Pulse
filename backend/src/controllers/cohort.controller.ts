import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { z } from 'zod';

const querySchema = z.object({
  limit: z.string().optional().transform(v => v ? parseInt(v) : 1000),
  offset: z.string().optional().transform(v => v ? parseInt(v) : 0),
});

/**
 * Retrieves Cohort Retention Matrix data.
 * 
 * @route GET /api/cohort
 */
export const getCohorts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit, offset } = querySchema.parse(req.query);

    // Aggregate in SQL directly instead of fetching raw rows
    const grouped = await prisma.cohort.groupBy({
      by: ['cohortMonth', 'activeMonth'],
      _count: {
        customerId: true
      },
      orderBy: [
        { cohortMonth: 'asc' },
        { activeMonth: 'asc' }
      ]
    });

    // Determine cohortSize (total) from month 0 retention
    const totals: Record<string, number> = {};
    grouped.forEach(g => {
      if (g.cohortMonth === g.activeMonth) {
        totals[g.cohortMonth] = g._count.customerId;
      }
    });

    const data = grouped.map(g => ({
      cohortMonth: g.cohortMonth,
      activeMonth: g.activeMonth,
      retained: g._count.customerId,
      total: totals[g.cohortMonth] || 0
    }));

    res.json({ data });
  } catch (error) {
    next(error);
  }
};
