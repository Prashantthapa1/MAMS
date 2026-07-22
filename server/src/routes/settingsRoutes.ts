import { Router } from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { updateSettingsSchema } from '../validators/index.js';
import { validateBody } from '../validators/validationMiddleware.js';
export const settingsRoutes = Router();
settingsRoutes.use(requireAuth, requireRole('ADMIN'));
settingsRoutes.get('/', settingsController.get);
settingsRoutes.put('/', validateBody(updateSettingsSchema), settingsController.update);
