import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ClerkExpressRequireAuth, RequireAuthProp, StrictAuthProp } from '@clerk/clerk-sdk-node';
import { prisma } from '../lib/prisma';

// Clerk adds an `auth` object to every request after verification.
// We extend the Express Request type globally so TypeScript knows about it.
declare global {
  namespace Express {
    interface Request extends StrictAuthProp {}
  }
}

/**
 * Step 1 — Verify the JWT.
 *
 * Clerk's built-in middleware checks the Authorization header for a valid
 * Bearer token. If the token is missing or expired, it short-circuits
 * the request with a 401 before our code even runs.
 */
export const requireAuth = ClerkExpressRequireAuth() as unknown as RequestHandler;

/**
 * Step 2 — Sync the Clerk user to our own database and attach their role.
 *
 * On first login the user won't exist in MySQL yet, so we upsert.
 * The very first user to ever hit the app is auto-promoted to admin
 * so there's always someone who can upload data and manage the system.
 * After that, new users default to 'viewer'.
 */
export const attachRole = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const clerkId = req.auth.userId;
    if (!clerkId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Allow explicit admin assignment via env var, or fall back to
    // "first user gets admin" logic for fresh deployments.
    const adminClerkId = process.env.ADMIN_CLERK_ID;
    const isAdmin = adminClerkId
      ? clerkId === adminClerkId
      : (await prisma.user.count()) === 0;

    const user = await prisma.user.upsert({
      where: { clerkId },
      update: {},
      create: { clerkId, role: isAdmin ? 'admin' : 'viewer' },
    });

    // Stash the role on the request so downstream middleware can read it.
    (req as any).userRole = user.role;

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Step 3 (optional) — Gate a route to admins only.
 *
 * Attach this after `attachRole` on any route that should be
 * restricted to admin users (e.g. the CSV upload endpoint).
 */
export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const role = (req as any).userRole;
  if (role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden: Admin access required' });
  }
  next();
};
