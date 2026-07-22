import { pool } from '../db/pool.js';
import { findMany, findOne } from '../db/query.js';
import type { CreateEmployeeInput, UpdateEmployeeInput } from '../validators/employeeSchemas.js';
import { ApiError } from '../utils/apiError.js';
import { deleteEmployeeImage, uploadEmployeeImage } from '../config/cloudinary.js';

type EmployeeRow = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  position: string;
  join_date: string;
  monthly_salary: string;
  status: 'Active' | 'Inactive';
  photo_url: string | null;
  photo_public_id: string | null;
  created_at: string;
  updated_at: string;
};

type AttendanceRow = {
  id: string;
  work_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  working_hours: string;
  status: 'Present' | 'Absent';
};

type LeaveRow = {
  id: string;
  leave_type: 'Sick' | 'Casual' | 'Annual';
  start_date: string;
  end_date: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
};

type SalaryRow = {
  id: string;
  monthly_salary: string;
  payment_month: string;
  payment_status: 'Paid' | 'Pending';
  payment_date: string | null;
};

export type EmployeeRecord = {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  monthlySalary: number;
  status: 'Active' | 'Inactive';
  avatarUrl: string | null;
};

export type EmployeeProfile = {
  employee: EmployeeRecord;
  attendanceHistory: Array<{
    id: string;
    date: string;
    checkInTime: string | null;
    checkOutTime: string | null;
    workingHours: number;
    status: 'Present' | 'Absent';
  }>;
  leaveHistory: Array<{
    id: string;
    leaveType: 'Sick' | 'Casual' | 'Annual';
    startDate: string;
    endDate: string;
    reason: string;
    status: 'Pending' | 'Approved' | 'Rejected';
  }>;
  salaryHistory: Array<{
    id: string;
    monthlySalary: number;
    paymentMonth: string;
    paymentStatus: 'Paid' | 'Pending';
    paymentDate: string | null;
  }>;
};

type EmployeeFile = Express.Multer.File | undefined;

function mapEmployee(row: EmployeeRow): EmployeeRecord {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    position: row.position,
    joinDate: row.join_date,
    monthlySalary: Number(row.monthly_salary),
    status: row.status,
    avatarUrl: row.photo_url,
  };
}

function mapAttendance(row: AttendanceRow) {
  return {
    id: row.id,
    date: row.work_date,
    checkInTime: row.check_in_time,
    checkOutTime: row.check_out_time,
    workingHours: Number(row.working_hours),
    status: row.status,
  };
}

function mapLeave(row: LeaveRow) {
  return {
    id: row.id,
    leaveType: row.leave_type,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status,
  };
}

function mapSalary(row: SalaryRow) {
  return {
    id: row.id,
    monthlySalary: Number(row.monthly_salary),
    paymentMonth: row.payment_month,
    paymentStatus: row.payment_status,
    paymentDate: row.payment_date,
  };
}

async function uploadPhoto(file: EmployeeFile) {
  if (!file) {
    return null;
  }

  const uploaded = await uploadEmployeeImage(file);

  return {
    photoUrl: uploaded.secureUrl,
    photoPublicId: uploaded.publicId,
  };
}

async function getEmployeeRow(id: string) {
  return findOne<EmployeeRow>(
    `
      SELECT
        id,
        full_name,
        email,
        phone,
        position,
        join_date::text AS join_date,
        monthly_salary::text AS monthly_salary,
        status,
        photo_url,
        photo_public_id,
        created_at::text AS created_at,
        updated_at::text AS updated_at
      FROM employees
      WHERE id = $1
    `,
    [id],
  );
}

export async function countEmployees() {
  const result = await pool.query<{ count: string }>('SELECT COUNT(*)::text AS count FROM employees');
  return Number(result.rows[0]?.count ?? 0);
}

export async function listEmployees() {
  const rows = await findMany<EmployeeRow>(
    `
      SELECT
        id,
        full_name,
        email,
        phone,
        position,
        join_date::text AS join_date,
        monthly_salary::text AS monthly_salary,
        status,
        photo_url,
        photo_public_id,
        created_at::text AS created_at,
        updated_at::text AS updated_at
      FROM employees
      ORDER BY full_name ASC
    `,
  );

  return rows.map(mapEmployee);
}

export async function getEmployeeById(id: string) {
  const row = await getEmployeeRow(id);
  return row ? mapEmployee(row) : null;
}

export async function createEmployee(input: CreateEmployeeInput, file?: EmployeeFile) {
  const photo = await uploadPhoto(file);

  try {
    const result = await pool.query<EmployeeRow>(
      `
        INSERT INTO employees (
          full_name,
          email,
          phone,
          position,
          join_date,
          monthly_salary,
          status,
          photo_url,
          photo_public_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING
          id,
          full_name,
          email,
          phone,
          position,
          join_date::text AS join_date,
          monthly_salary::text AS monthly_salary,
          status,
          photo_url,
          photo_public_id,
          created_at::text AS created_at,
          updated_at::text AS updated_at
      `,
      [
        input.fullName,
        input.email,
        input.phone,
        input.position,
        input.joinDate,
        input.monthlySalary,
        input.status,
        photo?.photoUrl ?? null,
        photo?.photoPublicId ?? null,
      ],
    );

    return mapEmployee(result.rows[0]);
  } catch (error) {
    if (photo?.photoPublicId) {
      await deleteEmployeeImage(photo.photoPublicId).catch(() => undefined);
    }

    throw error;
  }
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput, file?: EmployeeFile) {
  const current = await getEmployeeRow(id);

  if (!current) {
    throw new ApiError(404, 'Employee not found');
  }

  const photo = await uploadPhoto(file);
  const nextValues = {
    fullName: input.fullName ?? current.full_name,
    email: input.email ?? current.email,
    phone: input.phone ?? current.phone,
    position: input.position ?? current.position,
    joinDate: input.joinDate ?? current.join_date,
    monthlySalary: input.monthlySalary ?? Number(current.monthly_salary),
    status: input.status ?? current.status,
    photoUrl: photo?.photoUrl ?? current.photo_url,
    photoPublicId: photo?.photoPublicId ?? current.photo_public_id,
  };

  try {
    const result = await pool.query<EmployeeRow>(
      `
        UPDATE employees
        SET
          full_name = $2,
          email = $3,
          phone = $4,
          position = $5,
          join_date = $6,
          monthly_salary = $7,
          status = $8,
          photo_url = $9,
          photo_public_id = $10,
          updated_at = NOW()
        WHERE id = $1
        RETURNING
          id,
          full_name,
          email,
          phone,
          position,
          join_date::text AS join_date,
          monthly_salary::text AS monthly_salary,
          status,
          photo_url,
          photo_public_id,
          created_at::text AS created_at,
          updated_at::text AS updated_at
      `,
      [
        id,
        nextValues.fullName,
        nextValues.email,
        nextValues.phone,
        nextValues.position,
        nextValues.joinDate,
        nextValues.monthlySalary,
        nextValues.status,
        nextValues.photoUrl,
        nextValues.photoPublicId,
      ],
    );

    if (photo?.photoPublicId && current.photo_public_id) {
      await deleteEmployeeImage(current.photo_public_id).catch(() => undefined);
    }

    return mapEmployee(result.rows[0]);
  } catch (error) {
    if (photo?.photoPublicId) {
      await deleteEmployeeImage(photo.photoPublicId).catch(() => undefined);
    }

    throw error;
  }
}

export async function deleteEmployee(id: string) {
  const employee = await getEmployeeRow(id);

  if (!employee) {
    return false;
  }

  await pool.query('DELETE FROM employees WHERE id = $1', [id]);

  if (employee.photo_public_id) {
    await deleteEmployeeImage(employee.photo_public_id).catch(() => undefined);
  }

  return true;
}

export async function getEmployeeProfile(id: string): Promise<EmployeeProfile | null> {
  const employee = await getEmployeeById(id);

  if (!employee) {
    return null;
  }

  const [attendanceRows, leaveRows, salaryRows] = await Promise.all([
    findMany<AttendanceRow>(
      `
        SELECT
          id,
          work_date::text AS work_date,
          check_in_time::text AS check_in_time,
          check_out_time::text AS check_out_time,
          working_hours::text AS working_hours,
          status
        FROM attendance
        WHERE employee_id = $1
        ORDER BY work_date DESC
      `,
      [id],
    ),
    findMany<LeaveRow>(
      `
        SELECT
          id,
          leave_type,
          start_date::text AS start_date,
          end_date::text AS end_date,
          reason,
          status
        FROM leave_requests
        WHERE employee_id = $1
        ORDER BY start_date DESC
      `,
      [id],
    ),
    findMany<SalaryRow>(
      `
        SELECT
          id,
          monthly_salary::text AS monthly_salary,
          payment_month::text AS payment_month,
          payment_status,
          payment_date::text AS payment_date
        FROM salaries
        WHERE employee_id = $1
        ORDER BY payment_month DESC
      `,
      [id],
    ),
  ]);

  return {
    employee,
    attendanceHistory: attendanceRows.map(mapAttendance),
    leaveHistory: leaveRows.map(mapLeave),
    salaryHistory: salaryRows.map(mapSalary),
  };
}
