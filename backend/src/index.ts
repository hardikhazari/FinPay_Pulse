import 'dotenv/config';
import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { errorMiddleware } from './middleware/error.middleware';

// Route modules — each handles a single analytics domain
import rfmRoutes      from './routes/rfm.routes';
import clvRoutes      from './routes/clv.routes';
import churnRoutes    from './routes/churn.routes';
import forecastRoutes from './routes/forecast.routes';
import cohortRoutes   from './routes/cohort.routes';
import uploadRoutes   from './routes/upload.routes';
import sqlRoutes      from './routes/sql.routes';

const app: Express = express();
const port = process.env.PORT || 3001;

// Only allow requests from the frontend origin (set via env on Railway)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({ origin: frontendUrl }));
app.use(express.json());

import { prisma } from './lib/prisma';

// Quick health check — hit this to verify the server + DB are alive
app.get('/health', async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected", details: String(err) });
  }
});

// Mount each analytics API under /api/<domain>
app.use('/api/rfm',      rfmRoutes);
app.use('/api/clv',      clvRoutes);
app.use('/api/churn',    churnRoutes);
app.use('/api/forecast', forecastRoutes);
app.use('/api/cohort',   cohortRoutes);
app.use('/api/upload',   uploadRoutes);
app.use('/api/sql',      sqlRoutes);

// Anything that throws or calls next(err) ends up here
app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
