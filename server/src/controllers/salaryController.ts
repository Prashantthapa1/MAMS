import type { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { createSalarySchema, idParamSchema, markSalaryPaidSchema } from '../validators/index.js';
import { createSalaryRecord, listSalaryRecords, markSalaryPaid } from '../services/salaryService.js';

function getParamId(request: Request) {
  const value = request.params.id;
  return Array.isArray(value) ? value[0] : value;
}

function sendData(response: Response, data: unknown) {
  response.json({ success: true, data });
}

export const salaryController = {
  list: async (_request: Request, response: Response) => {
    const records = await listSalaryRecords();
    sendData(response, records);
  },
  create: async (request: Request, response: Response) => {
    const input = createSalarySchema.parse(request.body);
    const record = await createSalaryRecord(input);
    response.status(201).json({ success: true, data: record, message: 'Salary record created' });
  },
  markPaid: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const input = markSalaryPaidSchema.parse(request.body);
    const record = await markSalaryPaid(parsed.id, input);
    sendData(response, record);
  },
};
