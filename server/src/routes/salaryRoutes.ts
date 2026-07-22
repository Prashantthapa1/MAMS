import { Router } from 'express';
import { salaryController } from '../controllers/salaryController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody, validateParams } from '../validators/validationMiddleware.js';
import { createSalarySchema, idParamSchema, markSalaryPaidSchema } from '../validators/index.js';

export const salaryRoutes = Router();

salaryRoutes.use(requireAuth);
salaryRoutes.use(requireRole('ADMIN', 'MANAGER'));

salaryRoutes.get('/', salaryController.list);
salaryRoutes.post('/', validateBody(createSalarySchema), salaryController.create);
salaryRoutes.patch('/:id/paid', validateParams(idParamSchema), validateBody(markSalaryPaidSchema), salaryController.markPaid);
