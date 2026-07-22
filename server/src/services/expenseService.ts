import { pool } from '../db/pool.js';
import { findMany, findOne } from '../db/query.js';
import { ApiError } from '../utils/apiError.js';
import type { CreateExpenseInput, UpdateExpenseInput } from '../validators/financeSchemas.js';

type ExpenseRow = {
  id: string;
  expense_date: string;
  category: CreateExpenseInput['category'];
  description: string;
  amount: string;
};

export type ExpenseRecord = {
  id: string;
  date: string;
  category: CreateExpenseInput['category'];
  description: string;
  amount: number;
};

function mapExpense(row: ExpenseRow): ExpenseRecord {
  return {
    id: row.id,
    date: row.expense_date,
    category: row.category,
    description: row.description,
    amount: Number(row.amount),
  };
}

async function getExpenseRow(id: string) {
  return findOne<ExpenseRow>(
    `SELECT id, expense_date::text AS expense_date, category, description, amount::text AS amount FROM expenses WHERE id = $1`,
    [id],
  );
}

export async function listExpenseRecords() {
  const rows = await findMany<ExpenseRow>(
    `SELECT id, expense_date::text AS expense_date, category, description, amount::text AS amount FROM expenses ORDER BY expense_date DESC, created_at DESC`,
  );
  return rows.map(mapExpense);
}

export async function createExpenseRecord(input: CreateExpenseInput) {
  const result = await pool.query<ExpenseRow>(
    `INSERT INTO expenses (expense_date, category, description, amount)
     VALUES ($1, $2, $3, $4)
     RETURNING id, expense_date::text AS expense_date, category, description, amount::text AS amount`,
    [input.date, input.category, input.description, input.amount],
  );
  return mapExpense(result.rows[0]);
}

export async function updateExpenseRecord(id: string, input: UpdateExpenseInput) {
  if (!(await getExpenseRow(id))) {
    throw new ApiError(404, 'Expense record not found');
  }

  const result = await pool.query<ExpenseRow>(
    `UPDATE expenses
     SET expense_date = COALESCE($2, expense_date), category = COALESCE($3, category),
         description = COALESCE($4, description), amount = COALESCE($5, amount), updated_at = NOW()
     WHERE id = $1
     RETURNING id, expense_date::text AS expense_date, category, description, amount::text AS amount`,
    [id, input.date ?? null, input.category ?? null, input.description ?? null, input.amount ?? null],
  );
  return mapExpense(result.rows[0]);
}

export async function deleteExpenseRecord(id: string) {
  const result = await pool.query('DELETE FROM expenses WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
