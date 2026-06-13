import { Router } from 'express';
import { getClvPredictions } from '../controllers/clv.controller';
import { requireAuth, attachRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, attachRole, getClvPredictions);

export default router;
