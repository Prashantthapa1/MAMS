import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof ZodError) {
    response.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: error.flatten(),
    });
    return;
  }

  const statusCode = typeof error.statusCode === 'number' ? error.statusCode : 500;

  response.status(statusCode).json({
    success: false,
    message: error.message ?? 'Internal server error',
  });
};
