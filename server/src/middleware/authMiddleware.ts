import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export type AuthRole = 'ADMIN' | 'STAFF';

export type AuthUser = {
  id: string;
  role: AuthRole;
  employeeId?: string;
};

declare module 'express-serve-static-core' {
  interface Request {
    user?: AuthUser;
  }
}

export function requireAuth(request: Request, response: Response, next: NextFunction) {
  const authHeader = request.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    response.status(401).json({ success: false, message: 'Authentication required' });
    return;
  }

  try {
    request.user = jwt.verify(token, env.JWT_SECRET) as AuthUser;
    next();
  } catch {
    response.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: AuthRole[]) {
  return (request: Request, response: Response, next: NextFunction) => {
    if (!request.user || !roles.includes(request.user.role)) {
      response.status(403).json({ success: false, message: 'Forbidden' });
      return;
    }

    next();
  };
}
