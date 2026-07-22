import type { Request, Response } from 'express';
import { getProfitData } from '../services/profitService.js';

export const profitController = { get: async (_request: Request, response: Response) => response.json({ success: true, data: await getProfitData() }) };
