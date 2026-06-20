import { Router } from 'express';
import { listSqlScripts, executeSqlScript } from '../controllers/sql.controller';
import { requireAuth } from '../middleware/auth.middleware';

const router = Router();

// Secure these endpoints
router.use(requireAuth);

router.get('/scripts', listSqlScripts);
router.get('/execute/:filename', executeSqlScript);

export default router;
