import { z } from 'zod';
import { isoDateSchema, moneySchema, requiredTextSchema } from './commonSchemas.js';

export const paymentStatusSchema = z.enum(['Paid', 'Pending']);

export const createSalarySchema = z.object({
  employeeId: z.string().uuid(),
  monthlySalary: moneySchema,
  paymentMonth: isoDateSchema,
  paymentStatus: paymentStatusSchema.default('Pending'),
  paymentDate: isoDateSchema.nullable().optional(),
});

export const markSalaryPaidSchema = z.object({
  paymentDate: isoDateSchema,
});

export const createRevenueSchema = z.object({
  date: isoDateSchema,
  description: requiredTextSchema,
  amount: moneySchema,
});

export const updateRevenueSchema = createRevenueSchema.partial();

export const expenseCategorySchema = z.enum([
  'Rent',
  'Electricity',
  'Internet',
  'Salary',
  'Maintenance',
  'Other',
]);

export const createExpenseSchema = z.object({
  date: isoDateSchema,
  category: expenseCategorySchema,
  description: requiredTextSchema,
  amount: moneySchema,
});

export const updateExpenseSchema = createExpenseSchema.partial();

export type CreateSalaryInput = z.infer<typeof createSalarySchema>;
export type MarkSalaryPaidInput = z.infer<typeof markSalaryPaidSchema>;
export type CreateRevenueInput = z.infer<typeof createRevenueSchema>;
export type UpdateRevenueInput = z.infer<typeof updateRevenueSchema>;
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
