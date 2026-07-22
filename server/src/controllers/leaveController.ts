import type { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { createLeaveRequestSchema, idParamSchema, updateLeaveStatusSchema } from '../validators/index.js';
import { createLeaveRequest, deleteLeaveRequest, listLeaveRequests, updateLeaveStatus } from '../services/leaveService.js';

function getParamId(request: Request) {
  const value = request.params.id;
  return Array.isArray(value) ? value[0] : value;
}

function sendData(response: Response, data: unknown) {
  response.json({ success: true, data });
}

export const leaveController = {
  list: async (request: Request, response: Response) => {
    const records = await listLeaveRequests(request.user!);
    sendData(response, records);
  },
  create: async (request: Request, response: Response) => {
    const input = createLeaveRequestSchema.parse(request.body);

    if (request.user?.role === 'STAFF') {
      if (!request.user.employeeId) {
        throw new ApiError(400, 'Staff user is not linked to an employee record');
      }

      if (input.employeeId !== request.user.employeeId) {
        throw new ApiError(403, 'Staff can only submit leave for their own account');
      }
    }

    const record = await createLeaveRequest(input, request.user!);
    response.status(201).json({ success: true, data: record, message: 'Leave request submitted' });
  },
  updateStatus: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const input = updateLeaveStatusSchema.parse(request.body);
    const record = await updateLeaveStatus(parsed.id, input);
    sendData(response, record);
  },
  remove: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const deleted = await deleteLeaveRequest(parsed.id);

    if (!deleted) {
      throw new ApiError(404, 'Leave request not found');
    }

    sendData(response, { deleted: true });
  },
};
