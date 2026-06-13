import { Router } from 'express';
import { getForecasts } from '../controllers/forecast.controller';
import { requireAuth, attachRole } from '../middleware/auth.middleware';

const router = Router();

router.get('/', requireAuth, attachRole, getForecasts);

export default router;
