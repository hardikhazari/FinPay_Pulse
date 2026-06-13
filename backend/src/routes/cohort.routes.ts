import { Router } from 'express';
import { getCohorts } from '../controllers/cohort.controller';
import { requireAuth, attachRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, attachRole, getCohorts);

export default router;
