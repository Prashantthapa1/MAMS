import { Router } from 'express';
import { acceptInvite, changeUserRole, invite, listUsers, login, me } from '../controllers/authController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { validateBody } from '../validators/validationMiddleware.js';
import { loginSchema } from '../validators/index.js';

export const authRoutes = Router();

authRoutes.post('/login', validateBody(loginSchema), login);
authRoutes.get('/me', requireAuth, me);
authRoutes.post('/invitations/accept', acceptInvite);
authRoutes.post('/invitations', requireAuth, requireRole('ADMIN'), invite);
authRoutes.get('/users', requireAuth, requireRole('ADMIN'), listUsers);
authRoutes.patch('/users/:id/role', requireAuth, requireRole('ADMIN'), changeUserRole);
