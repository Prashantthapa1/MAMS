BEGIN;

WITH employee_seed(full_name, email, phone, position, join_date, monthly_salary) AS (
  VALUES
    ('Aarav Sharma', 'aarav@example.com', '+977-9800000001', 'Manager', DATE '2025-01-10', 85000::numeric),
    ('Maya Gurung', 'maya@example.com', '+977-9800000002', 'Accountant', DATE '2025-03-18', 62000::numeric),
    ('Nisha Thapa', 'nisha@example.com', '+977-9800000003', 'Frontend Developer', DATE '2025-05-01', 58000::numeric),
    ('Rohan Rai', 'rohan@example.com', '+977-9800000004', 'Backend Developer', DATE '2025-08-22', 65000::numeric),
    ('Sita Karki', 'sita@example.com', '+977-9800000005', 'UI/UX Designer', DATE '2026-01-05', 56000::numeric),
    ('Binod Adhikari', 'binod@example.com', '+977-9800000006', 'Operations Lead', DATE '2025-04-14', 73000::numeric)
)
INSERT INTO employees (full_name, email, phone, position, join_date, monthly_salary, status)
SELECT full_name, email, phone, position, join_date, monthly_salary, 'Active'
FROM employee_seed
ON CONFLICT (email) DO UPDATE
SET full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone,
    position = EXCLUDED.position,
    join_date = EXCLUDED.join_date,
    monthly_salary = EXCLUDED.monthly_salary,
    status = 'Active',
    updated_at = NOW();

WITH
account_seed(email, password, role, employee_email) AS (
  VALUES
    ('admin@example.com', 'admin123', 'ADMIN'::user_role, NULL::text),
    ('owner@example.com', 'owner123', 'ADMIN'::user_role, NULL::text),
    ('manager@example.com', 'manager123', 'MANAGER'::user_role, 'aarav@example.com'),
    ('staff@example.com', 'staff123', 'STAFF'::user_role, 'maya@example.com'),
    ('staff2@example.com', 'staff123', 'STAFF'::user_role, 'nisha@example.com')
)
INSERT INTO users (email, password_hash, role, employee_id)
SELECT
  account_seed.email,
  crypt(account_seed.password, gen_salt('bf')),
  account_seed.role,
  employee_row.id
FROM account_seed
LEFT JOIN employees employee_row
  ON employee_row.email = account_seed.employee_email
ON CONFLICT (email) DO UPDATE
SET password_hash = EXCLUDED.password_hash,
    role = EXCLUDED.role,
    employee_id = EXCLUDED.employee_id,
    updated_at = NOW();

INSERT INTO settings (id, company_name, company_address, currency)
VALUES (
  1,
  'MAMS Demo Company',
  'Kathmandu, Nepal',
  'NPR'
)
ON CONFLICT (id) DO UPDATE
SET company_name = EXCLUDED.company_name,
    company_address = EXCLUDED.company_address,
    currency = EXCLUDED.currency,
    updated_at = NOW();

INSERT INTO attendance (employee_id, work_date, check_in_time, check_out_time, working_hours, status)
SELECT
  employee_row.id,
  attendance_seed.work_date,
  attendance_seed.check_in_time,
  attendance_seed.check_out_time,
  attendance_seed.working_hours,
  attendance_seed.status
FROM (
  VALUES
    ('aarav@example.com', CURRENT_DATE, TIME '09:00', TIME '17:30', 8.50::numeric, 'Present'::attendance_status),
    ('maya@example.com', CURRENT_DATE, NULL, NULL, 0::numeric, 'Absent'::attendance_status)
) AS attendance_seed(employee_email, work_date, check_in_time, check_out_time, working_hours, status)
JOIN employees employee_row
  ON employee_row.email = attendance_seed.employee_email
ON CONFLICT (employee_id, work_date) DO UPDATE
SET check_in_time = EXCLUDED.check_in_time,
    check_out_time = EXCLUDED.check_out_time,
    working_hours = EXCLUDED.working_hours,
    status = EXCLUDED.status,
    updated_at = NOW();

INSERT INTO salaries (employee_id, monthly_salary, payment_month, payment_status, payment_date)
SELECT
  employee_row.id,
  salary_seed.monthly_salary,
  salary_seed.payment_month,
  salary_seed.payment_status,
  salary_seed.payment_date
FROM (
  VALUES
    ('aarav@example.com', 85000::numeric, DATE_TRUNC('month', CURRENT_DATE)::date, 'Paid'::payment_status, CURRENT_DATE),
    ('maya@example.com', 62000::numeric, DATE_TRUNC('month', CURRENT_DATE)::date, 'Pending'::payment_status, NULL::date)
) AS salary_seed(employee_email, monthly_salary, payment_month, payment_status, payment_date)
JOIN employees employee_row
  ON employee_row.email = salary_seed.employee_email
ON CONFLICT (employee_id, payment_month) DO UPDATE
SET monthly_salary = EXCLUDED.monthly_salary,
    payment_status = EXCLUDED.payment_status,
    payment_date = EXCLUDED.payment_date,
    updated_at = NOW();

INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status)
SELECT
  employee_row.id,
  leave_seed.leave_type,
  leave_seed.start_date,
  leave_seed.end_date,
  leave_seed.reason,
  leave_seed.status
FROM (
  VALUES
    ('sita@example.com', 'Casual'::leave_type, CURRENT_DATE + 2, CURRENT_DATE + 2, 'Family work', 'Pending'::leave_status),
    ('nisha@example.com', 'Annual'::leave_type, CURRENT_DATE + 10, CURRENT_DATE + 12, 'Travel', 'Approved'::leave_status)
) AS leave_seed(employee_email, leave_type, start_date, end_date, reason, status)
JOIN employees employee_row
  ON employee_row.email = leave_seed.employee_email
WHERE NOT EXISTS (
  SELECT 1
  FROM leave_requests existing
  WHERE existing.employee_id = employee_row.id
    AND existing.leave_type = leave_seed.leave_type
    AND existing.start_date = leave_seed.start_date
    AND existing.end_date = leave_seed.end_date
);

INSERT INTO revenue (revenue_date, description, amount)
SELECT revenue_seed.revenue_date, revenue_seed.description, revenue_seed.amount
FROM (
  VALUES
    (CURRENT_DATE, 'Daily sales', 39800::numeric),
    (CURRENT_DATE - 1, 'Daily sales', 44500::numeric)
) AS revenue_seed(revenue_date, description, amount)
WHERE NOT EXISTS (
  SELECT 1
  FROM revenue existing
  WHERE existing.revenue_date = revenue_seed.revenue_date
    AND existing.description = revenue_seed.description
    AND existing.amount = revenue_seed.amount
);

INSERT INTO expenses (expense_date, category, description, amount)
SELECT expense_seed.expense_date, expense_seed.category, expense_seed.description, expense_seed.amount
FROM (
  VALUES
    (CURRENT_DATE, 'Other'::expense_category, 'Office supplies', 5600::numeric),
    (CURRENT_DATE - 1, 'Rent'::expense_category, 'Monthly rent portion', 12000::numeric)
) AS expense_seed(expense_date, category, description, amount)
WHERE NOT EXISTS (
  SELECT 1
  FROM expenses existing
  WHERE existing.expense_date = expense_seed.expense_date
    AND existing.category = expense_seed.category
    AND existing.description = expense_seed.description
    AND existing.amount = expense_seed.amount
);

COMMIT;
