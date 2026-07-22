import { z } from 'zod';
import { isoDateSchema } from './commonSchemas.js';

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'Use HH:mm format');

export const attendanceStatusSchema = z.enum(['Present', 'Absent']);

export const upsertAttendanceSchema = z.object({
  employeeId: z.string().uuid(),
  date: isoDateSchema,
  checkInTime: timeSchema.nullable().optional(),
  checkOutTime: timeSchema.nullable().optional(),
  status: attendanceStatusSchema.default('Present'),
});

export const attendanceFilterSchema = z.object({
  range: z.enum(['today', 'week', 'month']).default('today'),
});

export type UpsertAttendanceInput = z.infer<typeof upsertAttendanceSchema>;
export type AttendanceFilterInput = z.infer<typeof attendanceFilterSchema>;
