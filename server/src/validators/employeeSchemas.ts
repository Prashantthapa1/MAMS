import { z } from 'zod';
import { isoDateSchema, moneySchema, requiredTextSchema } from './commonSchemas.js';

export const employeeStatusSchema = z.enum(['Active', 'Inactive']);

export const createEmployeeSchema = z.object({
  fullName: requiredTextSchema.max(120),
  email: z.string().trim().email().toLowerCase(),
  phone: requiredTextSchema.max(40),
  position: requiredTextSchema.max(120),
  joinDate: isoDateSchema,
  monthlySalary: moneySchema,
  status: employeeStatusSchema.default('Active'),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
