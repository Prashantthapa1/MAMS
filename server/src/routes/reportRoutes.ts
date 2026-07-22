import { Router } from 'express';
import { reportController } from '../controllers/reportController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
export const reportRoutes = Router();
reportRoutes.use(requireAuth, requireRole('ADMIN', 'MANAGER'));
reportRoutes.get('/', reportController.list);
reportRoutes.get('/:type/export', reportController.export);
