import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
  employeeId: z.string().uuid().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
