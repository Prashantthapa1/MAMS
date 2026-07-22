import { Router } from 'express';
import { revenueController } from '../controllers/revenueController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody, validateParams } from '../validators/validationMiddleware.js';
import { createRevenueSchema, idParamSchema, updateRevenueSchema } from '../validators/index.js';

export const revenueRoutes = Router();

revenueRoutes.use(requireAuth);
revenueRoutes.use(requireRole('ADMIN', 'MANAGER'));

revenueRoutes.get('/', revenueController.list);
revenueRoutes.post('/', validateBody(createRevenueSchema), revenueController.create);
revenueRoutes.put('/:id', validateParams(idParamSchema), validateBody(updateRevenueSchema), revenueController.update);
revenueRoutes.delete('/:id', validateParams(idParamSchema), revenueController.remove);
