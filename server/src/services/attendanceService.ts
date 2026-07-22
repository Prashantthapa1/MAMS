import { pool } from '../db/pool.js';
import { findMany, findOne } from '../db/query.js';
import type { AuthUser } from '../middleware/authMiddleware.js';
import { ApiError } from '../utils/apiError.js';
import type { UpsertAttendanceInput } from '../validators/attendanceSchemas.js';

type AttendanceRow = {
  id: string;
  employee_id: string;
  employee_name: string;
  work_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  working_hours: string;
  status: 'Present' | 'Absent';
};

export type AttendanceRecord = {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkInTime: string | null;
  checkOutTime: string | null;
  workingHours: number;
  status: 'Present' | 'Absent';
};

function mapAttendance(row: AttendanceRow): AttendanceRecord {
  return {
    id: row.id,
    employeeId: row.employee_id,
    employeeName: row.employee_name,
    date: row.work_date,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    workingHours: Number(row.working_hours),
    status: row.status,
  };
}

async function getAttendanceRow(id: string) {
  return findOne<AttendanceRow>(
    `
      SELECT
        attendance.id,
        attendance.employee_id,
        employees.full_name AS employee_name,
        attendance.work_date::text AS work_date,
        attendance.check_in_time::text AS check_in_time,
        attendance.check_out_time::text AS check_out_time,
        attendance.working_hours::text AS working_hours,
        attendance.status
      FROM attendance
      INNER JOIN employees ON employees.id = attendance.employee_id
      WHERE attendance.id = $1
    `,
    [id],
  );
}

async function getAttendanceForEmployeeAndDate(employeeId: string, date: string) {
  return findOne<AttendanceRow>(
    `
      SELECT
        attendance.id,
        attendance.employee_id,
        employees.full_name AS employee_name,
        attendance.work_date::text AS work_date,
        attendance.check_in_time::text AS check_in_time,
        attendance.check_out_time::text AS check_out_time,
        attendance.working_hours::text AS working_hours,
        attendance.status
      FROM attendance
      INNER JOIN employees ON employees.id = attendance.employee_id
      WHERE attendance.employee_id = $1 AND attendance.work_date = $2
    `,
    [employeeId, date],
  );
}

export async function listAttendance(range: 'today' | 'week' | 'month', user: AuthUser) {
  const rows = await findMany<AttendanceRow>(
    `
      SELECT
        attendance.id,
        attendance.employee_id,
        employees.full_name AS employee_name,
        attendance.work_date::text AS work_date,
        attendance.check_in_time::text AS check_in_time,
        attendance.check_out_time::text AS check_out_time,
        attendance.working_hours::text AS working_hours,
        attendance.status
      FROM attendance
      INNER JOIN employees ON employees.id = attendance.employee_id
      WHERE
        (
          $2 = 'ADMIN'
          OR attendance.employee_id = $3
        )
        AND (
          $1 = 'today' AND attendance.work_date = CURRENT_DATE
          OR $1 = 'week' AND attendance.work_date >= date_trunc('week', CURRENT_DATE)::date AND attendance.work_date < (date_trunc('week', CURRENT_DATE) + INTERVAL '1 week')::date
          OR $1 = 'month' AND attendance.work_date >= date_trunc('month', CURRENT_DATE)::date AND attendance.work_date < (date_trunc('month', CURRENT_DATE) + INTERVAL '1 month')::date
        )
      ORDER BY attendance.work_date DESC, employees.full_name ASC
    `,
    [range, user.role, user.employeeId ?? null],
  );

  return rows.map(mapAttendance);
}

export async function checkInAttendance(input: UpsertAttendanceInput) {
  const employee = await findOne<{ id: string; status: 'Active' | 'Inactive' }>(
    'SELECT id, status FROM employees WHERE id = $1',
    [input.employeeId],
  );

  if (!employee) {
    throw new ApiError(404, 'Employee not found');
  }

  const existing = await getAttendanceForEmployeeAndDate(input.employeeId, input.date);

  if (existing?.check_in_time) {
    throw new ApiError(400, 'Attendance already has a check-in time');
  }

  const result = await pool.query<AttendanceRow>(
    `
      INSERT INTO attendance (
        employee_id,
        work_date,
        check_in_time,
        check_out_time,
        working_hours,
        status
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (employee_id, work_date)
      DO UPDATE SET
        check_in_time = EXCLUDED.check_in_time,
        status = EXCLUDED.status,
        updated_at = NOW()
      RETURNING
        attendance.id,
        attendance.employee_id,
        (SELECT full_name FROM employees WHERE employees.id = attendance.employee_id) AS employee_name,
        attendance.work_date::text AS work_date,
        attendance.check_in_time::text AS check_in_time,
        attendance.check_out_time::text AS check_out_time,
        attendance.working_hours::text AS working_hours,
        attendance.status
    `,
    [input.employeeId, input.date, input.checkInTime ?? null, null, 0, 'Present'],
  );

  return mapAttendance(result.rows[0]);
}

export async function checkOutAttendance(input: UpsertAttendanceInput) {
  const current = await getAttendanceForEmployeeAndDate(input.employeeId, input.date);

  if (!current) {
    throw new ApiError(404, 'Attendance record not found');
  }

  if (!current.check_in_time) {
    throw new ApiError(400, 'Check-in is required before check-out');
  }

  if (!input.checkOutTime) {
    throw new ApiError(400, 'Check-out time is required');
  }

  const workingHours = calculateWorkingHours(current.check_in_time, input.checkOutTime);

  const result = await pool.query<AttendanceRow>(
    `
      UPDATE attendance
      SET
        check_out_time = $3,
        working_hours = $4,
        status = $5,
        updated_at = NOW()
      WHERE employee_id = $1 AND work_date = $2
      RETURNING
        attendance.id,
        attendance.employee_id,
        (SELECT full_name FROM employees WHERE employees.id = attendance.employee_id) AS employee_name,
        attendance.work_date::text AS work_date,
        attendance.check_in_time::text AS check_in_time,
        attendance.check_out_time::text AS check_out_time,
        attendance.working_hours::text AS working_hours,
        attendance.status
    `,
    [input.employeeId, input.date, input.checkOutTime, workingHours, 'Present'],
  );

  return mapAttendance(result.rows[0]);
}

export async function updateAttendance(id: string, input: UpsertAttendanceInput) {
  const current = await getAttendanceRow(id);

  if (!current) {
    throw new ApiError(404, 'Attendance record not found');
  }

  const duplicate = await findOne<{ id: string }>(
    'SELECT id FROM attendance WHERE employee_id = $1 AND work_date = $2 AND id <> $3',
    [input.employeeId, input.date, id],
  );

  if (duplicate) {
    throw new ApiError(400, 'Another attendance record already exists for this employee and date');
  }

  const isAbsent = input.status === 'Absent';
  const checkInTime = isAbsent ? null : input.checkInTime ?? current.check_in_time;
  const checkOutTime = isAbsent ? null : input.checkOutTime ?? current.check_out_time;
  const workingHours = isAbsent
    ? 0
    : checkInTime && checkOutTime
      ? calculateWorkingHours(checkInTime, checkOutTime)
      : Number(current.working_hours);

  const result = await pool.query<AttendanceRow>(
    `
      UPDATE attendance
      SET
        employee_id = $2,
        work_date = $3,
        check_in_time = $4,
        check_out_time = $5,
        working_hours = $6,
        status = $7,
        updated_at = NOW()
      WHERE id = $1
      RETURNING
        attendance.id,
        attendance.employee_id,
        (SELECT full_name FROM employees WHERE employees.id = attendance.employee_id) AS employee_name,
        attendance.work_date::text AS work_date,
        attendance.check_in_time::text AS check_in_time,
        attendance.check_out_time::text AS check_out_time,
        attendance.working_hours::text AS working_hours,
        attendance.status
    `,
    [id, input.employeeId, input.date, checkInTime ?? null, checkOutTime ?? null, workingHours, input.status],
  );

  return mapAttendance(result.rows[0]);
}

export async function deleteAttendance(id: string) {
  const result = await pool.query('DELETE FROM attendance WHERE id = $1', [id]);
  return (result.rowCount ?? 0) > 0;
}

function calculateWorkingHours(checkInTime: string, checkOutTime: string) {
  const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
  const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);
  const start = checkInHours * 60 + checkInMinutes;
  const end = checkOutHours * 60 + checkOutMinutes;

  return Math.max(0, Number(((end - start) / 60).toFixed(2)));
}
