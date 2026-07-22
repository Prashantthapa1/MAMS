import { Router } from 'express';
import { leaveController } from '../controllers/leaveController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody, validateParams } from '../validators/validationMiddleware.js';
import { createLeaveRequestSchema, idParamSchema, updateLeaveStatusSchema } from '../validators/index.js';

export const leaveRoutes = Router();

leaveRoutes.use(requireAuth);

leaveRoutes.get('/', requireRole('ADMIN', 'MANAGER', 'STAFF'), leaveController.list);
leaveRoutes.post('/', requireRole('ADMIN', 'MANAGER', 'STAFF'), validateBody(createLeaveRequestSchema), leaveController.create);
leaveRoutes.patch(
  '/:id/status',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(idParamSchema),
  validateBody(updateLeaveStatusSchema),
  leaveController.updateStatus,
);
leaveRoutes.delete('/:id', requireRole('ADMIN', 'MANAGER'), validateParams(idParamSchema), leaveController.remove);
