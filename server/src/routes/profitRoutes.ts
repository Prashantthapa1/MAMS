import { Router } from 'express';
import { profitController } from '../controllers/profitController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
export const profitRoutes = Router();
profitRoutes.use(requireAuth, requireRole('ADMIN', 'MANAGER'));
profitRoutes.get('/', profitController.get);
