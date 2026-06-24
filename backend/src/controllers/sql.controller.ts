import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import fs from 'fs';
import path from 'path';

// Define the root of the sql scripts directory relative to this controller
const SQL_DIR = path.join(__dirname, '../../sql');

/**
 * GET /api/sql/scripts
 * 
 * Lists all available .sql files in the sql/ directory.
 */
export const listSqlScripts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!fs.existsSync(SQL_DIR)) {
      return res.status(404).json({ error: 'SQL directory not found' });
    }

    const files = fs.readdirSync(SQL_DIR).filter(f => f.endsWith('.sql'));
    
    // Parse comments to get a title and description
    const scripts = files.map(filename => {
      const filePath = path.join(SQL_DIR, filename);
      const content = fs.readFileSync(filePath, 'utf-8');
      
      const lines = content.split('\n');
      const titleLine = lines.find(l => l.startsWith('-- FinPay Pulse -')) || '-- ' + filename;
      const descLine = lines.find(l => l.startsWith('--') && !l.includes('FinPay Pulse -') && !l.includes(filename));
      
      return {
        filename,
        title: titleLine.replace('-- ', '').replace('FinPay Pulse - ', '').trim(),
        description: descLine ? descLine.replace('-- ', '').trim() : 'Advanced SQL analysis query'
      };
    });

    res.json(scripts);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sql/execute/:filename
 * 
 * Executes the given SQL script using Prisma's raw query engine
 * and returns the results.
 */
export const executeSqlScript = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filename = String(req.params.filename);
    
    // Security check: ensure they aren't trying to traverse directories
    if (filename.includes('/') || filename.includes('..') || !filename.endsWith('.sql')) {
      return res.status(400).json({ error: 'Invalid script name' });
    }

    const filePath = path.join(SQL_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Script not found' });
    }

    // Read the query content
    const rawSql = fs.readFileSync(filePath, 'utf-8');
    
    // Prisma requires raw SQL strings to NOT end with semicolons if multiple statements are chained,
    // but a single query is fine. However, MySQL might complain about some formatting.
    // Let's strip comments and execute. Prisma $queryRawUnsafe handles the query directly.
    const cleanSql = rawSql.split('\n')
      .filter(line => !line.trim().startsWith('--'))
      .join('\n')
      .trim();

    // In a real production system we wouldn't let arbitrary SQL execute like this, 
    // but these scripts are read-only SELECTs from our own repo.
    const results = await prisma.$queryRawUnsafe(cleanSql);
    
    // Convert BigInts to strings (Prisma raw queries return COUNT() as BigInt which breaks JSON.stringify)
    const serializedResults = JSON.parse(JSON.stringify(results, (key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    ));

    res.json(serializedResults);
  } catch (error) {
    console.error(`Error executing ${req.params.filename}:`, error);
    next(error);
  }
};
