import { z } from 'zod';
import { requiredTextSchema } from './commonSchemas.js';

export const updateSettingsSchema = z.object({
  companyName: requiredTextSchema.max(160),
  companyAddress: requiredTextSchema.max(500),
  currency: z.string().trim().min(3).max(8),
});

export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
