import { z } from 'zod';

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

export const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format');

export const optionalTextSchema = z.string().trim().max(500).optional();

export const requiredTextSchema = z.string().trim().min(1).max(500);

export const moneySchema = z.coerce.number().finite().nonnegative();
