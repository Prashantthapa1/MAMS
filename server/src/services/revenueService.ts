import { pool } from '../db/pool.js';
import { findMany, findOne } from '../db/query.js';
import { ApiError } from '../utils/apiError.js';
import type { CreateRevenueInput, UpdateRevenueInput } from '../validators/financeSchemas.js';

type RevenueRow = {
  id: string;
  revenue_date: string;
  description: string;
  amount: string;
};

export type RevenueRecord = {
  id: string;
  date: string;
  description: string;
  amount: number;
};

function mapRevenue(row: RevenueRow): RevenueRecord {
  return {
    id: row.id,
    date: row.revenue_date,
    description: row.description,
    amount: Number(row.amount),
  };
}

async function getRevenueRow(id: string) {
  return findOne<RevenueRow>(
    `
      SELECT
        id,
        revenue_date::text AS revenue_date,
        description,
        amount::text AS amount
      FROM revenue
      WHERE id = $1
    `,
    [id],
  );
}

export async function listRevenueRecords() {
  const rows = await findMany<RevenueRow>(
    `
      SELECT
        id,
        revenue_date::text AS revenue_date,
        description,
        amount::text AS amount
      FROM revenue
      ORDER BY revenue_date DESC, created_at DESC
    `,
  );

  return rows.map(mapRevenue);
}

export async function createRevenueRecord(input: CreateRevenueInput) {
  const result = await pool.query<RevenueRow>(
    `
      INSERT INTO revenue (revenue_date, description, amount)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        revenue_date::text AS revenue_date,
        description,
        amount::text AS amount
    `,
    [input.date, input.description, input.amount],
  );

  return mapRevenue(result.rows[0]);
}

export async function updateRevenueRecord(id: string, input: UpdateRevenueInput) {
  const current = await getRevenueRow(id);

  if (!current) {
    throw new ApiError(404, 'Revenue record not found');
  }

  const result = await pool.query<RevenueRow>(
    `
      UPDATE revenue
      SET
        revenue_date = COALESCE($2, revenue_date),
        description = COALESCE($3, description),
        amount = COALESCE($4, amount),
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        id,
        revenue_date::text AS revenue_date,
        description,
        amount::text AS amount
    `,
    [id, input.date ?? null, input.description ?? null, input.amount ?? null],
  );

  return mapRevenue(result.rows[0]);
}

export async function deleteRevenueRecord(id: string) {
  const result = await pool.query('DELETE FROM revenue WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
