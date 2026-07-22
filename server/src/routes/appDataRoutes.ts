import { Router } from 'express';
import { appDataController } from '../controllers/appDataController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export const appDataRoutes = Router();

appDataRoutes.use(requireAuth);

appDataRoutes.get('/dashboard', appDataController.dashboard);
