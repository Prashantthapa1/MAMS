import type { Request, Response } from 'express';
import { countEmployees } from '../services/employeeService.js';
import { countApprovedLeavesToday } from '../services/leaveService.js';
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
  dashboard: async (_request: Request, response: Response) => {
    const dashboard = mockDataService.getDashboard();
    const [totalEmployees, onLeaveToday] = await Promise.all([countEmployees(), countApprovedLeavesToday()]);

    sendData(response, {
      ...dashboard,
      summary: {
        ...dashboard.summary,
        totalEmployees,
        onLeaveToday,
      },
    });
  },
  attendance: (_request: Request, response: Response) => sendData(response, mockDataService.getAttendance()),
  leave: (_request: Request, response: Response) => sendData(response, mockDataService.getLeaveRequests()),
  salaries: (_request: Request, response: Response) => sendData(response, mockDataService.getSalaries()),
  revenue: (_request: Request, response: Response) => sendData(response, mockDataService.getRevenue()),
  profit: (_request: Request, response: Response) => sendData(response, mockDataService.getProfit()),
  reports: (_request: Request, response: Response) => sendData(response, mockDataService.getReports()),
  settings: (_request: Request, response: Response) => sendData(response, mockDataService.getSettings()),
  deleteRevenue: (request: Request, response: Response) =>
    sendDeleted(response, mockDataService.deleteRevenue(getParamId(request))),
};
