import { Router } from 'express';
import { employeeController } from '../controllers/employeeController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { uploadEmployeePhoto } from '../middleware/uploadMiddleware.js';

export const employeeRoutes = Router();

employeeRoutes.use(requireAuth);
employeeRoutes.use(requireRole('ADMIN', 'MANAGER'));

employeeRoutes.get('/', employeeController.list);
employeeRoutes.post('/', uploadEmployeePhoto.single('photo'), employeeController.create);
employeeRoutes.get('/:id/profile', employeeController.profile);
employeeRoutes.get('/:id', employeeController.getById);
employeeRoutes.put('/:id', uploadEmployeePhoto.single('photo'), employeeController.update);
employeeRoutes.delete('/:id', employeeController.remove);
