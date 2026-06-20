import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import csvParser from 'csv-parser';
import { z } from 'zod';
import { Readable } from 'stream';

/*
 * Zod schema for a single CSV row.
 * `amount` arrives as a string from the CSV parser, so we coerce it to float.
 * Fields like `currency` and `device_used` are optional because not every
 * dataset includes them.
 */
const transactionSchema = z.object({
  transaction_id:   z.string().min(1),
  customer_id:      z.string().min(1),
  merchant_id:      z.string().min(1),
  transaction_date: z.string().datetime().or(z.string()),
  transaction_time: z.string().optional(),
  transaction_type: z.string().optional(),
  amount:           z.string().transform(v => parseFloat(v)),
  currency:         z.string().optional(),
  payment_method:   z.string().optional(),
  status:           z.string(),
  device_used:      z.string().optional(),
  ip_city:          z.string().optional(),
});

// How many rows we accumulate before flushing to the database.
// 500 keeps each Prisma transaction fast without hammering the DB with
// one INSERT per row.
const BATCH_SIZE = 500;

/**
 * POST /api/upload/transactions
 *
 * Accepts a multipart CSV upload (via multer memoryStorage), validates
 * every row with Zod, and bulk-inserts valid rows in batches of 500.
 * Invalid rows are collected and returned in the response so the user
 * knows exactly which lines failed and why.
 */
export const uploadTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let insertedCount = 0;
    const errors: { row: number; reason: string }[] = [];
    let rowCount = 0;
    let currentBatch: z.infer<typeof transactionSchema>[] = [];

    // Flush the current batch to MySQL inside a single transaction.
    // Customers are upserted first so the foreign key on Transaction is satisfied.
    const processBatch = async (batch: z.infer<typeof transactionSchema>[]) => {
      if (batch.length === 0) return;

      const uniqueCustomers = Array.from(new Set(batch.map(r => r.customer_id)));

      await prisma.$transaction(async (tx: any) => {
        await tx.customer.createMany({
          data: uniqueCustomers.map(cid => ({ id: cid })),
          skipDuplicates: true,
        });

        await tx.transaction.createMany({
          data: batch.map(r => ({
            id:              r.transaction_id,
            customerId:      r.customer_id,
            amount:          r.amount,
            transactionDate: new Date(r.transaction_date),
            productCategory: r.transaction_type,
            status:          r.status,
          })),
          skipDuplicates: true,
        });
      });

      insertedCount += batch.length;
    };

    // Stream the CSV from memory (no temp files on disk)
    const stream = Readable.from(req.file.buffer).pipe(csvParser());

    for await (const row of stream) {
      rowCount++;
      try {
        const parsed = transactionSchema.parse(row);
        currentBatch.push(parsed);

        if (currentBatch.length >= BATCH_SIZE) {
          await processBatch(currentBatch);
          currentBatch = [];
        }
      } catch (err: unknown) {
        // Don't bail on one bad row — log it and keep going
        if (err instanceof z.ZodError) {
          const zodErr = err as any;
          const issues = zodErr.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
          errors.push({ row: rowCount, reason: issues });
        } else {
          errors.push({ row: rowCount, reason: String(err) });
        }
      }
    }

    // Flush any leftover rows that didn't fill a full batch
    if (currentBatch.length > 0) {
      await processBatch(currentBatch);
    }

    res.status(200).json({
      message:  'Upload complete',
      inserted: insertedCount,
      skipped:  errors.length,
      errors:   errors.slice(0, 50), // cap response size
    });
  } catch (error) {
    next(error);
  }
};
