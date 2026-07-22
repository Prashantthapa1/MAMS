import type { Request, Response } from 'express';
import { z } from 'zod';
import { getReportRows, listReportSummaries, reportTypes, type ReportType } from '../services/reportService.js';
import { isoDateSchema } from '../validators/index.js';

const querySchema = z.object({ from: isoDateSchema.optional(), to: isoDateSchema.optional() }).refine((value) => !value.from || !value.to || value.from <= value.to, { message: 'From date must not be after to date' });

function csvValue(value: unknown) { return `"${String(value ?? '').replaceAll('"', '""')}"`; }

export const reportController = {
  list: async (_request: Request, response: Response) => response.json({ success: true, data: await listReportSummaries() }),
  export: async (request: Request, response: Response) => {
    const type = z.enum(reportTypes).parse(request.params.type) as ReportType;
    const range = querySchema.parse(request.query);
    const rows = await getReportRows(type, range);
    const headers = rows.length ? Object.keys(rows[0]) : [];
    const csv = [headers.join(','), ...rows.map((row) => headers.map((header) => csvValue(row[header])).join(','))].filter(Boolean).join('\n');
    response.setHeader('Content-Type', 'text/csv; charset=utf-8');
    response.setHeader('Content-Disposition', `attachment; filename="${type}-report.csv"`);
    response.send(csv);
  },
};
