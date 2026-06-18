import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import csvParser from 'csv-parser';
import { z } from 'zod';

const transactionSchema = z.object({
  transaction_id: z.string().min(1),
  customer_id: z.string().min(1),
  merchant_id: z.string().min(1),
  transaction_date: z.string().datetime().or(z.string()), 
  transaction_time: z.string().optional(),
  transaction_type: z.string().optional(),
  amount: z.string().transform(v => parseFloat(v)),
  currency: z.string().optional(),
  payment_method: z.string().optional(),
  status: z.string(),
  device_used: z.string().optional(),
  ip_city: z.string().optional()
});

const BATCH_SIZE = 500;

/**
 * Uploads a CSV of transactions, parses it, validates rows with Zod,
 * and bulk-inserts them into the database in chunks to prevent timeouts/OOMs.
 * 
 * @route POST /api/upload/transactions
 * @access Admin only
 */
export const uploadTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    let insertedCount = 0;
    const errors: any[] = [];
    let rowCount = 0;
    let currentBatch: any[] = [];

    // Helper to process a batch of 500
    const processBatch = async (batch: any[]) => {
      if (batch.length === 0) return;
      
      const uniqueCustomers = Array.from(new Set(batch.map(r => r.customer_id)));
      
      await prisma.$transaction(async (tx) => {
        // Bulk insert Customers
        await tx.customer.createMany({
          data: uniqueCustomers.map(cid => ({ id: cid })),
          skipDuplicates: true
        });

        // Bulk insert transactions
        await tx.transaction.createMany({
          data: batch.map(r => ({
            id: r.transaction_id,
            customerId: r.customer_id,
            amount: r.amount,
            transactionDate: new Date(r.transaction_date),
            productCategory: r.transaction_type,
            status: r.status
          })),
          skipDuplicates: true // In case same transaction_id appears again
        });
      });
      
      insertedCount += batch.length;
    };

    const stream = fs.createReadStream(req.file.path).pipe(csvParser());

    for await (const row of stream) {
      rowCount++;
      try {
        const parsed = transactionSchema.parse(row);
        currentBatch.push(parsed);

        if (currentBatch.length >= BATCH_SIZE) {
          await processBatch(currentBatch);
          currentBatch = [];
        }
      } catch (err: any) {
        // Collect Zod error but KEEP processing the rest of the file
        const issues = err.errors.map((e: any) => `${e.path.join('.')}: ${e.message}`).join(', ');
        errors.push({ row: rowCount, reason: issues });
      }
    }

    // Process any remaining rows
    if (currentBatch.length > 0) {
      await processBatch(currentBatch);
    }

    // Cleanup temp file
    fs.unlinkSync(req.file.path);

    res.status(200).json({
      message: 'Upload complete',
      inserted: insertedCount,
      skipped: errors.length,
      errors: errors.slice(0, 50) // Cap to avoid huge response payloads
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};
