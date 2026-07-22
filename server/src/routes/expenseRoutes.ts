import { Router } from 'express';
import { expenseController } from '../controllers/expenseController.js';
import { requireAuth, requireRole } from '../middleware/authMiddleware.js';
import { createExpenseSchema, idParamSchema, updateExpenseSchema } from '../validators/index.js';
import { validateBody, validateParams } from '../validators/validationMiddleware.js';

export const expenseRoutes = Router();

expenseRoutes.use(requireAuth, requireRole('ADMIN', 'MANAGER'));
expenseRoutes.get('/', expenseController.list);
expenseRoutes.post('/', validateBody(createExpenseSchema), expenseController.create);
expenseRoutes.put('/:id', validateParams(idParamSchema), validateBody(updateExpenseSchema), expenseController.update);
expenseRoutes.delete('/:id', validateParams(idParamSchema), expenseController.remove);
