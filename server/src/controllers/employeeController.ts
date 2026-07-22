import type { Request, Response } from 'express';
import { ApiError } from '../utils/apiError.js';
import { createEmployeeSchema, idParamSchema, updateEmployeeSchema } from '../validators/index.js';
import {
  createEmployee,
  deleteEmployee,
  getEmployeeById,
  getEmployeeProfile,
  listEmployees,
  updateEmployee,
} from '../services/employeeService.js';

function getParamId(request: Request) {
  const value = request.params.id;
  return Array.isArray(value) ? value[0] : value;
}

function sendData(response: Response, data: unknown) {
  response.json({ success: true, data });
}

export const employeeController = {
  list: async (_request: Request, response: Response) => {
    const employees = await listEmployees();
    sendData(response, employees);
  },
  getById: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const employee = await getEmployeeById(parsed.id);

    if (!employee) {
      throw new ApiError(404, 'Employee not found');
    }

    sendData(response, employee);
  },
  profile: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const profile = await getEmployeeProfile(parsed.id);

    if (!profile) {
      throw new ApiError(404, 'Employee not found');
    }

    sendData(response, profile);
  },
  create: async (request: Request, response: Response) => {
    const input = createEmployeeSchema.parse(request.body);
    const employee = await createEmployee(input, request.file);
    response.status(201).json({ success: true, data: employee, message: 'Employee created successfully' });
  },
  update: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const input = updateEmployeeSchema.parse(request.body);
    const employee = await updateEmployee(parsed.id, input, request.file);
    sendData(response, employee);
  },
  remove: async (request: Request, response: Response) => {
    const parsed = idParamSchema.parse({ id: getParamId(request) });
    const removed = await deleteEmployee(parsed.id);

    if (!removed) {
      throw new ApiError(404, 'Employee not found');
    }

    sendData(response, { deleted: true });
  },
};
