import type { Request, Response } from 'express';
import { getSettings, updateSettings } from '../services/settingsService.js';
import { updateSettingsSchema } from '../validators/index.js';
export const settingsController = { get: async (_request: Request, response: Response) => response.json({ success: true, data: await getSettings() }), update: async (request: Request, response: Response) => response.json({ success: true, data: await updateSettings(updateSettingsSchema.parse(request.body)) }) };
