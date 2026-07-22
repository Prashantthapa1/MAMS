import { z } from 'zod';
import { isoDateSchema, requiredTextSchema } from './commonSchemas.js';

export const leaveTypeSchema = z.enum(['Sick', 'Casual', 'Annual']);
export const leaveStatusSchema = z.enum(['Pending', 'Approved', 'Rejected']);

export const createLeaveRequestSchema = z
  .object({
    employeeId: z.string().uuid(),
    leaveType: leaveTypeSchema,
    startDate: isoDateSchema,
    endDate: isoDateSchema,
    reason: requiredTextSchema.max(1000),
  })
  .refine((data) => data.endDate >= data.startDate, {
    message: 'End date must be on or after start date',
    path: ['endDate'],
  });

export const updateLeaveStatusSchema = z.object({
  status: z.enum(['Approved', 'Rejected']),
});

export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;
export type UpdateLeaveStatusInput = z.infer<typeof updateLeaveStatusSchema>;
