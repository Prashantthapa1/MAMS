import bcrypt from 'bcryptjs';
import { pool } from './pool.js';

const employees = [
  ['Aarav Sharma', 'aarav@example.com', '+977-9800000001', 'Manager', '2025-01-10', 85000],
  ['Maya Gurung', 'maya@example.com', '+977-9800000002', 'Accountant', '2025-03-18', 62000],
  ['Nisha Thapa', 'nisha@example.com', '+977-9800000003', 'Frontend Developer', '2025-05-01', 58000],
  ['Rohan Rai', 'rohan@example.com', '+977-9800000004', 'Backend Developer', '2025-08-22', 65000],
  ['Sita Karki', 'sita@example.com', '+977-9800000005', 'UI/UX Designer', '2026-01-05', 56000],
  ['Binod Adhikari', 'binod@example.com', '+977-9800000006', 'Operations Lead', '2025-04-14', 73000],
] as const;

const demoAccounts: Array<{
  email: string;
  password: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  employeeEmail?: string;
}> = [
  { email: 'admin@example.com', password: 'admin123', role: 'ADMIN' as const },
  { email: 'owner@example.com', password: 'owner123', role: 'ADMIN' as const },
  { email: 'manager@example.com', password: 'manager123', role: 'MANAGER' as const, employeeEmail: 'aarav@example.com' },
  { email: 'staff@example.com', password: 'staff123', role: 'STAFF' as const, employeeEmail: 'maya@example.com' },
  { email: 'staff2@example.com', password: 'staff123', role: 'STAFF' as const, employeeEmail: 'nisha@example.com' },
] as const;

async function main() {
  const accountHashes = new Map(
    await Promise.all(demoAccounts.map(async (account) => [account.email, await bcrypt.hash(account.password, 12)] as const)),
  );
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const employeeIds = new Map<string, string>();
    for (const [fullName, email, phone, position, joinDate, monthlySalary] of employees) {
      const result = await client.query<{ id: string }>(`INSERT INTO employees (full_name, email, phone, position, join_date, monthly_salary, status) VALUES ($1, $2, $3, $4, $5, $6, 'Active') ON CONFLICT (email) DO UPDATE SET full_name = EXCLUDED.full_name, phone = EXCLUDED.phone, position = EXCLUDED.position, monthly_salary = EXCLUDED.monthly_salary, updated_at = NOW() RETURNING id`, [fullName, email, phone, position, joinDate, monthlySalary]);
      employeeIds.set(email, result.rows[0].id);
    }
    for (const account of demoAccounts) {
      const employeeId = account.employeeEmail ? employeeIds.get(account.employeeEmail) ?? null : null;
      await client.query(
        `INSERT INTO users (email, password_hash, role, employee_id)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (email) DO UPDATE
         SET password_hash = EXCLUDED.password_hash,
             role = EXCLUDED.role,
             employee_id = EXCLUDED.employee_id,
             updated_at = NOW()`,
        [account.email, accountHashes.get(account.email), account.role, employeeId],
      );
    }
    await client.query(`INSERT INTO revenue (revenue_date, description, amount) VALUES (CURRENT_DATE, 'Daily sales', 39800), (CURRENT_DATE - 1, 'Daily sales', 44500) ON CONFLICT DO NOTHING`);
    await client.query(`INSERT INTO expenses (expense_date, category, description, amount) VALUES (CURRENT_DATE, 'Other', 'Office supplies', 5600), (CURRENT_DATE - 1, 'Rent', 'Monthly rent portion', 12000) ON CONFLICT DO NOTHING`);
    await client.query(`INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, working_hours, status) VALUES ($1, CURRENT_DATE, '09:00', '17:30', 8.5, 'Present'), ($2, CURRENT_DATE, NULL, NULL, 0, 'Absent') ON CONFLICT (employee_id, work_date) DO NOTHING`, [employeeIds.get('aarav@example.com'), employeeIds.get('maya@example.com')]);
    await client.query(`INSERT INTO salaries (employee_id, monthly_salary, payment_month, payment_status, payment_date) VALUES ($1, 85000, DATE_TRUNC('month', CURRENT_DATE), 'Paid', CURRENT_DATE) ON CONFLICT (employee_id, payment_month) DO NOTHING`, [employeeIds.get('aarav@example.com')]);
    await client.query(`INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) VALUES ($1, 'Casual', CURRENT_DATE + 2, CURRENT_DATE + 2, 'Family work', 'Pending') ON CONFLICT DO NOTHING`, [employeeIds.get('sita@example.com')]);
    await client.query('COMMIT');
    console.log('Seed data created.');
    console.log('Admin logins: admin@example.com / admin123, owner@example.com / owner123');
    console.log('Manager login: manager@example.com / manager123');
    console.log('Staff logins: staff@example.com / staff123, staff2@example.com / staff123');
  } catch (error) { await client.query('ROLLBACK'); throw error; } finally { client.release(); await pool.end(); }
}
main().catch((error: unknown) => { console.error(error); process.exit(1); });
