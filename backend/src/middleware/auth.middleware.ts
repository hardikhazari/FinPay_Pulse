import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ClerkExpressRequireAuth, RequireAuthProp, StrictAuthProp } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma';

// Extend Express Request to include Clerk auth
declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

/**
 * Middleware to require valid Clerk authentication.
 * If successful, req.auth is populated.
 */
export const requireAuth = ClerkExpressRequireAuth() as unknown as RequestHandler;

/**
 * Middleware to attach the user's role from the database to the request.
 * Requires requireAuth to run first.
 */
export const attachRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { clerkId }
    });

    if (!user) {
      // Auto-create viewer if first time log in, or handle accordingly
      const newUser = await prisma.user.create({
        data: {
          clerkId,
          role: 'viewer'
        }
      });
      (req as any).userRole = newUser.role;
    } else {
      (req as any).userRole = user.role;
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to restrict access to admin users only.
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).userRole;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
