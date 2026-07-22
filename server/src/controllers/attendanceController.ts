import type { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { attendanceFilterSchema, idParamSchema, upsertAttendanceSchema } from '../validators/index.js';
import {
  checkInAttendance,
  checkOutAttendance,
  deleteAttendance,
  listAttendance,
  updateAttendance,
} from '../services/attendanceService.js';

function getParamId(request: Request) {
  const value = request.params.id;
  return Array.isArray(value) ? value[0] : value;
}

function sendData(response: Response, data: unknown) {
  response.json({ success: true, data });
}

export const attendanceController = {
  list: async (_request: Request, response: Response) => {
    const query = attendanceFilterSchema.parse(_request.query);
    const records = await listAttendance(query.range, _request.user!);
    sendData(response, records);
  },
  checkIn: async (request: Request, response: Response) => {
    const input = upsertAttendanceSchema.parse(request.body);

    if (input.status !== 'Present') {
      throw new ApiError(400, 'Check-in must be marked as Present');
    }

    const record = await checkInAttendance(input);
    response.status(201).json({ success: true, data: record, message: 'Check-in saved' });
  },
  checkOut: async (request: Request, response: Response) => {
    const input = upsertAttendanceSchema.parse(request.body);

    if (input.status !== 'Present') {
      throw new ApiError(400, 'Check-out must be marked as Present');
    }

    const record = await checkOutAttendance(input);
    sendData(response, record);
  },
  update: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const input = upsertAttendanceSchema.parse(request.body);
    const record = await updateAttendance(parsed.id, input);
    sendData(response, record);
  },
  remove: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const deleted = await deleteAttendance(parsed.id);

    if (!deleted) {
      throw new ApiError(404, 'Attendance record not found');
    }

    sendData(response, { deleted: true });
  },
};
