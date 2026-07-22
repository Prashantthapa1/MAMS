import type { Request, Response } from 'express';
import { createExpenseRecord, deleteExpenseRecord, listExpenseRecords, updateExpenseRecord } from '../services/expenseService.js';
import { ApiError } from '../utils/apiError.js';
import { createExpenseSchema, idParamSchema, updateExpenseSchema } from '../validators/index.js';

function getParamId(request: Request) {
  const value = request.params.id;
  return Array.isArray(value) ? value[0] : value;
}

export const expenseController = {
  list: async (_request: Request, response: Response) => {
    response.json({ success: true, data: await listExpenseRecords() });
  },
  create: async (request: Request, response: Response) => {
    const record = await createExpenseRecord(createExpenseSchema.parse(request.body));
    response.status(201).json({ success: true, data: record, message: 'Expense record created' });
  },
  update: async (request: Request, response: Response) => {
    const { id } = idParamSchema.parse({ id: getParamId(request) });
    const record = await updateExpenseRecord(id, updateExpenseSchema.parse(request.body));
    response.json({ success: true, data: record });
  },
  remove: async (request: Request, response: Response) => {
    const { id } = idParamSchema.parse({ id: getParamId(request) });
    if (!(await deleteExpenseRecord(id))) throw new ApiError(404, 'Expense record not found');
    response.json({ success: true, data: { deleted: true } });
  },
};
