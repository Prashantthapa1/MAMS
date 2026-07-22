import { Router } from 'express';
import { attendanceController } from '../controllers/attendanceController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody, validateParams, validateQuery } from '../validators/validationMiddleware.js';
import { attendanceFilterSchema, idParamSchema, upsertAttendanceSchema } from '../validators/index.js';

export const attendanceRoutes = Router();

attendanceRoutes.use(requireAuth);

attendanceRoutes.get('/', requireRole('ADMIN', 'MANAGER', 'STAFF'), validateQuery(attendanceFilterSchema), attendanceController.list);
attendanceRoutes.post('/check-in', requireRole('ADMIN', 'MANAGER'), validateBody(upsertAttendanceSchema), attendanceController.checkIn);
attendanceRoutes.post('/check-out', requireRole('ADMIN', 'MANAGER'), validateBody(upsertAttendanceSchema), attendanceController.checkOut);
attendanceRoutes.put(
  '/:id',
  requireRole('ADMIN', 'MANAGER'),
  validateParams(idParamSchema),
  validateBody(upsertAttendanceSchema),
  attendanceController.update,
);
attendanceRoutes.delete('/:id', requireRole('ADMIN', 'MANAGER'), attendanceController.remove);
