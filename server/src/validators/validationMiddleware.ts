import type { NextFunction, Request, Response } from 'express';
import type { ZodSchema } from 'zod';

export function validateBody(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction) => {
    request.body = schema.parse(request.body);
    next();
  };
}

export function validateParams(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction) => {
    request.params = schema.parse(request.params);
    next();
  };
}

export function validateQuery(schema: ZodSchema) {
  return (request: Request, _response: Response, next: NextFunction) => {
    request.query = schema.parse(request.query);
    next();
  };
}
