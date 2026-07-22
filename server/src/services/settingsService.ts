import { pool } from '../db/pool.js';
import { findOne } from '../db/query.js';
import type { UpdateSettingsInput } from '../validators/settingsSchemas.js';

type SettingsRow = { company_name: string; company_address: string; currency: string };
export type CompanySettings = { companyName: string; companyAddress: string; currency: string };
const defaults: CompanySettings = { companyName: 'Small Business', companyAddress: 'Kathmandu, Nepal', currency: 'NPR' };
function mapSettings(row: SettingsRow): CompanySettings { return { companyName: row.company_name, companyAddress: row.company_address, currency: row.currency }; }
async function ensureSettings() { await pool.query(`INSERT INTO settings (id, company_name, company_address, currency) VALUES (1, $1, $2, $3) ON CONFLICT (id) DO NOTHING`, [defaults.companyName, defaults.companyAddress, defaults.currency]); }
export async function getSettings() { await ensureSettings(); const row = await findOne<SettingsRow>('SELECT company_name, company_address, currency FROM settings WHERE id = 1'); return row ? mapSettings(row) : defaults; }
export async function updateSettings(input: UpdateSettingsInput) { await ensureSettings(); const result = await pool.query<SettingsRow>(`UPDATE settings SET company_name = $1, company_address = $2, currency = $3, updated_at = NOW() WHERE id = 1 RETURNING company_name, company_address, currency`, [input.companyName, input.companyAddress, input.currency.toUpperCase()]); return mapSettings(result.rows[0]); }
