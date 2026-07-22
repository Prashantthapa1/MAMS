import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(1),
});

export const createUserSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  password: z.string().min(8),
  role: z.enum(['ADMIN', 'MANAGER', 'STAFF']).default('STAFF'),
  employeeId: z.string().uuid().optional(),
});

export const accessRoleSchema = z.enum(['MANAGER', 'STAFF']);

export const inviteStaffSchema = z.object({
  email: z.string().trim().email().toLowerCase(),
  fullName: z.string().trim().min(1).max(120),
  phone: z.string().trim().min(1).max(40),
  position: z.string().trim().min(1).max(120),
  role: accessRoleSchema.default('STAFF'),
});

export const acceptInvitationSchema = z.object({
  token: z.string().min(32),
  password: z.string().min(8).max(128),
});

export const updateUserRoleSchema = z.object({ role: accessRoleSchema });

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
export type AcceptInvitationInput = z.infer<typeof acceptInvitationSchema>;
