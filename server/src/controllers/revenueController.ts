import type { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { createRevenueSchema, idParamSchema, updateRevenueSchema } from '../validators/index.js';
import { createRevenueRecord, deleteRevenueRecord, listRevenueRecords, updateRevenueRecord } from '../services/revenueService.js';

function getParamId(request: Request) {
  const value = request.params.id;
  return Array.isArray(value) ? value[0] : value;
}

function sendData(response: Response, data: unknown) {
  response.json({ success: true, data });
}

export const revenueController = {
  list: async (_request: Request, response: Response) => {
    const records = await listRevenueRecords();
    sendData(response, records);
  },
  create: async (request: Request, response: Response) => {
    const input = createRevenueSchema.parse(request.body);
    const record = await createRevenueRecord(input);
    response.status(201).json({ success: true, data: record, message: 'Revenue record created' });
  },
  update: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const input = updateRevenueSchema.parse(request.body);
    const record = await updateRevenueRecord(parsed.id, input);
    sendData(response, record);
  },
  remove: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const deleted = await deleteRevenueRecord(parsed.id);

    if (!deleted) {
      throw new ApiError(404, 'Revenue record not found');
    }

    sendData(response, { deleted: true });
  },
};
