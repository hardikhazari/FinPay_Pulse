import request from 'supertest';
import express, { Express, Request, Response, NextFunction } from 'express';
import rfmRoutes from '../routes/rfm.routes';
import churnRoutes from '../routes/churn.routes';

const app: Express = express();
app.use(express.json());

// For testing purposes, we define a dummy requireAuth middleware that mocks Clerk's behavior.
// In actual routes, Clerk's requireAuth checks req.auth.userId.
import { describe, it, expect, vi } from 'vitest';

vi.mock('@clerk/clerk-sdk-node', () => ({
  ClerkExpressRequireAuth: () => (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer valid_token') {
      req.auth = { userId: 'test_user_id' };
      return next();
    }
    return res.status(401).json({ error: 'Unauthenticated' });
  }
}));

// Mount Routes
app.use('/api/rfm', rfmRoutes);
app.use('/api/churn', churnRoutes);

describe('API Integration Tests', () => {
  
  describe('Unauthenticated Access (401)', () => {
    it('should return 401 when accessing /api/rfm without token', async () => {
      const response = await request(app).get('/api/rfm');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthenticated');
    });

    it('should return 401 when accessing /api/churn without token', async () => {
      const response = await request(app).get('/api/churn');
      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('error', 'Unauthenticated');
    });
  });

  describe('Authenticated Access (200)', () => {
    it('should return 200 and correct data shape for /api/rfm', async () => {
      const response = await request(app)
        .get('/api/rfm?limit=1')
        .set('Authorization', 'Bearer valid_token');
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('customerId');
        expect(item).toHaveProperty('segment');
        expect(item).toHaveProperty('recencyScore');
      }
    });

    it('should return 200 and correct data shape for /api/churn', async () => {
      const response = await request(app)
        .get('/api/churn?limit=1')
        .set('Authorization', 'Bearer valid_token');
        
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      
      if (response.body.data.length > 0) {
        const item = response.body.data[0];
        expect(item).toHaveProperty('customerId');
        expect(item).toHaveProperty('riskTier');
        expect(item).toHaveProperty('churnProbability');
      }
    });
  });
});
