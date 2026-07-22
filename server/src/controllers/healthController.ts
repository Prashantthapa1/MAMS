import type { Request, Response } from 'express';

export function getHealth(_request: Request, response: Response) {
  response.json({
    success: true,
    data: {
      status: 'ok',
      service: 'employee-management-server',
    },
  });
}
