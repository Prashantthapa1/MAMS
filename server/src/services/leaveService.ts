import { pool } from '../db/pool.js';
import { findMany, findOne } from '../db/query.js';
import type { AuthUser } from '../middleware/authMiddleware.js';
import { ApiError } from '../utils/apiError.js';
import type { CreateLeaveRequestInput, UpdateLeaveStatusInput } from '../validators/leaveSchemas.js';

type LeaveRow = {
  id: string;
  employee_id: string;
  employee_name: string;
  leave_type: 'Sick' | 'Casual' | 'Annual';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  created_at: string;
  updated_at: string;
};

export type LeaveRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  leaveType: 'Sick' | 'Casual' | 'Annual';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

function mapLeave(row: LeaveRow): LeaveRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    leaveType: row.leave_type,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status,
  };
}

async function getLeaveRow(id: string) {
  return findOne<LeaveRow>(
    `
      SELECT
        leave_requests.id,
        leave_requests.employee_id,
        employees.full_name AS employee_name,
        leave_requests.leave_type,
        leave_requests.start_date::text AS start_date,
        leave_requests.end_date::text AS end_date,
        leave_requests.reason,
        leave_requests.status,
        leave_requests.created_at::text AS created_at,
        leave_requests.updated_at::text AS updated_at
      FROM leave_requests
      INNER JOIN employees ON employees.id = leave_requests.employee_id
      WHERE leave_requests.id = $1
    `,
    [id],
  );
}

export async function listLeaveRequests(user: AuthUser) {
  const rows = await findMany<LeaveRow>(
    `
      SELECT
        leave_requests.id,
        leave_requests.employee_id,
        employees.full_name AS employee_name,
        leave_requests.leave_type,
        leave_requests.start_date::text AS start_date,
        leave_requests.end_date::text AS end_date,
        leave_requests.reason,
        leave_requests.status,
        leave_requests.created_at::text AS created_at,
        leave_requests.updated_at::text AS updated_at
      FROM leave_requests
      INNER JOIN employees ON employees.id = leave_requests.employee_id
      WHERE ($1 = 'ADMIN' OR leave_requests.employee_id = $2)
      ORDER BY leave_requests.created_at DESC
    `,
    [user.role, user.employeeId ?? null],
  );

  return rows.map(mapLeave);
}

export async function countApprovedLeavesToday() {
  const result = await pool.query<{ count: string }>(
    `
      SELECT COUNT(*)::text AS count
      FROM leave_requests
      WHERE status = 'Approved'
        AND start_date <= CURRENT_DATE
        AND end_date >= CURRENT_DATE
    `,
  );

  return Number(result.rows[0]?.count ?? 0);
}

export async function createLeaveRequest(input: CreateLeaveRequestInput, user: AuthUser) {
  const employeeId = user.role === 'STAFF' ? user.employeeId : input.employeeId;

  if (!employeeId) {
    throw new ApiError(400, 'Employee selection is required');
  }

  const employee = await findOne<{ id: string }>('SELECT id FROM employees WHERE id = $1', [employeeId]);

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  const result = await pool.query<LeaveRow>(
    `
      INSERT INTO leave_requests (
        employee_id,
        leave_type,
        start_date,
        end_date,
        reason,
        status
      )
      VALUES ($1, $2, $3, $4, $5, 'Pending')
      RETURNING
        leave_requests.id,
        leave_requests.employee_id,
        (SELECT full_name FROM employees WHERE employees.id = leave_requests.employee_id) AS employee_name,
        leave_requests.leave_type,
        leave_requests.start_date::text AS start_date,
        leave_requests.end_date::text AS end_date,
        leave_requests.reason,
        leave_requests.status,
        leave_requests.created_at::text AS created_at,
        leave_requests.updated_at::text AS updated_at
    `,
    [employeeId, input.leaveType, input.startDate, input.endDate, input.reason],
  );

  return mapLeave(result.rows[0]);
}

export async function updateLeaveStatus(id: string, input: UpdateLeaveStatusInput) {
  const current = await getLeaveRow(id);

  if (!current) {
    throw new ApiError(404, 'Leave request not found');
  }

  if (current.status !== 'Pending') {
    throw new ApiError(400, 'Only pending leave requests can be updated');
  }

  const result = await pool.query<LeaveRow>(
    `
      UPDATE leave_requests
      SET status = $2, updated_at = NOW()
      WHERE id = $1
      RETURNING
        leave_requests.id,
        leave_requests.employee_id,
        (SELECT full_name FROM employees WHERE employees.id = leave_requests.employee_id) AS employee_name,
        leave_requests.leave_type,
        leave_requests.start_date::text AS start_date,
        leave_requests.end_date::text AS end_date,
        leave_requests.reason,
        leave_requests.status,
        leave_requests.created_at::text AS created_at,
        leave_requests.updated_at::text AS updated_at
    `,
    [id, input.status],
  );

  return mapLeave(result.rows[0]);
}

export async function deleteLeaveRequest(id: string) {
  const result = await pool.query('DELETE FROM leave_requests WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}
