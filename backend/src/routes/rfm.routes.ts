import { Router } from 'express';
import { getRfmScores } from '../controllers/rfm.controller';
import { requireAuth, attachRole } from '../middleware/auth.middleware';

const router = Router();

// Viewer and Admin can access
router.get('/', requireAuth, attachRole, getRfmScores);

export default router;
