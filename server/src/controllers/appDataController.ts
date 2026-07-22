import type { Request, Response } from 'express';
import { mockDataService } from '../services/mockDataService.js';

function sendData(response: Response, data: unknown) {
  response.json({ success: true, data });
}

function sendDeleted(response: Response, deleted: boolean) {
  if (!deleted) {
    response.status(404).json({ success: false, message: 'Record not found' });
    return;
  }

  response.json({ success: true, data: { deleted: true } });
}

function getParamId(request: Request) {
  const value = request.params.id;
  return Array.isArray(value) ? value[0] : value;
}

export const appDataController = {
  dashboard: (_request: Request, response: Response) => sendData(response, mockDataService.getDashboard()),
  employees: (_request: Request, response: Response) => sendData(response, mockDataService.getEmployees()),
  attendance: (_request: Request, response: Response) => sendData(response, mockDataService.getAttendance()),
  leave: (_request: Request, response: Response) => sendData(response, mockDataService.getLeaveRequests()),
  salaries: (_request: Request, response: Response) => sendData(response, mockDataService.getSalaries()),
  revenue: (_request: Request, response: Response) => sendData(response, mockDataService.getRevenue()),
  expenses: (_request: Request, response: Response) => sendData(response, mockDataService.getExpenses()),
  profit: (_request: Request, response: Response) => sendData(response, mockDataService.getProfit()),
  reports: (_request: Request, response: Response) => sendData(response, mockDataService.getReports()),
  settings: (_request: Request, response: Response) => sendData(response, mockDataService.getSettings()),
  deleteEmployee: (request: Request, response: Response) =>
    sendDeleted(response, mockDataService.deleteEmployee(getParamId(request))),
  deleteRevenue: (request: Request, response: Response) =>
    sendDeleted(response, mockDataService.deleteRevenue(getParamId(request))),
  deleteExpense: (request: Request, response: Response) =>
    sendDeleted(response, mockDataService.deleteExpense(getParamId(request))),
};
