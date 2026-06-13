import { Router } from 'express';
import { getChurnScores } from '../controllers/churn.controller';
import { requireAuth, attachRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, attachRole, getChurnScores);

export default router;
