import { Router } from 'express';
import { appDataController } from '../controllers/appDataController.js';

export const appDataRoutes = Router();

appDataRoutes.get('/dashboard', appDataController.dashboard);
appDataRoutes.get('/employees', appDataController.employees);
appDataRoutes.delete('/employees/:id', appDataController.deleteEmployee);
appDataRoutes.get('/attendance', appDataController.attendance);
appDataRoutes.get('/leave', appDataController.leave);
appDataRoutes.get('/salaries', appDataController.salaries);
appDataRoutes.get('/revenue', appDataController.revenue);
appDataRoutes.delete('/revenue/:id', appDataController.deleteRevenue);
appDataRoutes.get('/expenses', appDataController.expenses);
appDataRoutes.delete('/expenses/:id', appDataController.deleteExpense);
appDataRoutes.get('/profit', appDataController.profit);
appDataRoutes.get('/reports', appDataController.reports);
appDataRoutes.get('/settings', appDataController.settings);
