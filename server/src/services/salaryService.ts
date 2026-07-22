import { pool } from '../db/pool.js';
import { findMany, findOne } from '../db/query.js';
import { ApiError } from '../utils/apiError.js';
import type { CreateSalaryInput, MarkSalaryPaidInput } from '../validators/financeSchemas.js';

type SalaryRow = {
  id: string;
  employee_id: string;
  employee_name: string;
  monthly_salary: string;
  payment_month: string;
  payment_status: 'Paid' | 'Pending';
  payment_date: string | null;
};

export type SalaryRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  monthlySalary: number;
  paymentMonth: string;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate: string | null;
};

function mapSalary(row: SalaryRow): SalaryRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    monthlySalary: Number(row.monthly_salary),
    paymentMonth: row.payment_month,
    paymentStatus: row.payment_status,
    paymentDate: row.payment_date,
  };
}

async function getSalaryRow(id: string) {
  return findOne<SalaryRow>(
    `
      SELECT
        salaries.id,
        salaries.employee_id,
        employees.full_name AS employee_name,
        salaries.monthly_salary::text AS monthly_salary,
        salaries.payment_month::text AS payment_month,
        salaries.payment_status,
        salaries.payment_date::text AS payment_date
      FROM salaries
      INNER JOIN employees ON employees.id = salaries.employee_id
      WHERE salaries.id = $1
    `,
    [id],
  );
}

export async function listSalaryRecords() {
  const rows = await findMany<SalaryRow>(
    `
      SELECT
        salaries.id,
        salaries.employee_id,
        employees.full_name AS employee_name,
        salaries.monthly_salary::text AS monthly_salary,
        salaries.payment_month::text AS payment_month,
        salaries.payment_status,
        salaries.payment_date::text AS payment_date
      FROM salaries
      INNER JOIN employees ON employees.id = salaries.employee_id
      ORDER BY salaries.payment_month DESC, employees.full_name ASC
    `,
  );

  return rows.map(mapSalary);
}

export async function createSalaryRecord(input: CreateSalaryInput) {
  const employee = await findOne<{ id: string; monthly_salary: string }>(
    'SELECT id, monthly_salary::text AS monthly_salary FROM employees WHERE id = $1',
    [input.employeeId],
  );

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  const result = await pool.query<SalaryRow>(
    `
      INSERT INTO salaries (
        employee_id,
        monthly_salary,
        payment_month,
        payment_status,
        payment_date
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        salaries.id,
        salaries.employee_id,
        (SELECT full_name FROM employees WHERE employees.id = salaries.employee_id) AS employee_name,
        salaries.monthly_salary::text AS monthly_salary,
        salaries.payment_month::text AS payment_month,
        salaries.payment_status,
        salaries.payment_date::text AS payment_date
    `,
    [
      input.employeeId,
      input.monthlySalary,
      input.paymentMonth,
      input.paymentStatus,
      input.paymentDate ?? null,
    ],
  );

  return mapSalary(result.rows[0]);
}

export async function markSalaryPaid(id: string, input: MarkSalaryPaidInput) {
  const current = await getSalaryRow(id);

  if (!current) {
    throw new ApiError(404, 'Salary record not found');
  }

  const result = await pool.query<SalaryRow>(
    `
      UPDATE salaries
      SET
        payment_status = 'Paid',
        payment_date = $2,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        salaries.id,
        salaries.employee_id,
        (SELECT full_name FROM employees WHERE employees.id = salaries.employee_id) AS employee_name,
        salaries.monthly_salary::text AS monthly_salary,
        salaries.payment_month::text AS payment_month,
        salaries.payment_status,
        salaries.payment_date::text AS payment_date
    `,
    [id, input.paymentDate],
  );

  return mapSalary(result.rows[0]);
}
