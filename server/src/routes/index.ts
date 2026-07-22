import { Router } from 'express';
import { attendanceRoutes } from './attendanceRoutes.js';
import { appDataRoutes } from './appDataRoutes.js';
import { authRoutes } from './authRoutes.js';
import { employeeRoutes } from './employeeRoutes.js';
import { expenseRoutes } from './expenseRoutes.js';
import { healthRoutes } from './healthRoutes.js';
import { leaveRoutes } from './leaveRoutes.js';
import { revenueRoutes } from './revenueRoutes.js';
import { profitRoutes } from './profitRoutes.js';
import { reportRoutes } from './reportRoutes.js';
import { salaryRoutes } from './salaryRoutes.js';
import { settingsRoutes } from './settingsRoutes.js';

export const apiRoutes = Router();

apiRoutes.use('/health', healthRoutes);
apiRoutes.use('/auth', authRoutes);
apiRoutes.use('/employees', employeeRoutes);
apiRoutes.use('/attendance', attendanceRoutes);
apiRoutes.use('/leave', leaveRoutes);
apiRoutes.use('/revenue', revenueRoutes);
apiRoutes.use('/expenses', expenseRoutes);
apiRoutes.use('/profit', profitRoutes);
apiRoutes.use('/reports', reportRoutes);
apiRoutes.use('/salaries', salaryRoutes);
apiRoutes.use('/settings', settingsRoutes);
apiRoutes.use('/', appDataRoutes);
