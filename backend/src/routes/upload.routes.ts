import { Router } from 'express';
import multer from 'multer';
import { uploadTransactions } from '../controllers/upload.controller';
import { requireAuth, attachRole, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/' }); // Stores temporary files in /uploads

// Admin only route for CSV upload
router.post('/transactions', requireAuth, attachRole, requireAdmin, upload.single('file'), uploadTransactions);

export default router;
