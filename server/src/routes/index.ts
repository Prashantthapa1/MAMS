import { Router } from 'express';
import { appDataRoutes } from './appDataRoutes.js';
import { healthRoutes } from './healthRoutes.js';

export const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/', appDataRoutes);
