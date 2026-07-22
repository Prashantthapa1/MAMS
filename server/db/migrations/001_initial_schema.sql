CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF');
CREATE TYPE employee_status AS ENUM ('Active', 'Inactive');
CREATE TYPE attendance_status AS ENUM ('Present', 'Absent');
CREATE TYPE leave_type AS ENUM ('Sick', 'Casual', 'Annual');
CREATE TYPE leave_status AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE payment_status AS ENUM ('Paid', 'Pending');
CREATE TYPE expense_category AS ENUM ('Rent', 'Electricity', 'Internet', 'Salary', 'Maintenance', 'Other');

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'STAFF',
  employee_id UUID UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT NOT NULL,
  position TEXT NOT NULL,
  join_date DATE NOT NULL,
  monthly_salary NUMERIC(12, 2) NOT NULL CHECK (monthly_salary >= 0),
  status employee_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE users
  ADD CONSTRAINT users_employee_id_fkey
  FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE SET NULL;

CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  working_hours NUMERIC(5, 2) NOT NULL DEFAULT 0 CHECK (working_hours >= 0),
  status attendance_status NOT NULL DEFAULT 'Absent',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, work_date)
);

CREATE TABLE leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type leave_type NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status leave_status NOT NULL DEFAULT 'Pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (end_date >= start_date)
);

CREATE TABLE salaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  monthly_salary NUMERIC(12, 2) NOT NULL CHECK (monthly_salary >= 0),
  payment_month DATE NOT NULL,
  payment_status payment_status NOT NULL DEFAULT 'Pending',
  payment_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, payment_month)
);

CREATE TABLE revenue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  revenue_date DATE NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  expense_date DATE NOT NULL,
  category expense_category NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE settings (
  id SMALLINT PRIMARY KEY DEFAULT 1,
  company_name TEXT NOT NULL,
  company_address TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NPR',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (id = 1)
);

CREATE INDEX attendance_work_date_idx ON attendance(work_date);
CREATE INDEX attendance_employee_id_idx ON attendance(employee_id);
CREATE INDEX leave_requests_employee_id_idx ON leave_requests(employee_id);
CREATE INDEX salaries_employee_id_idx ON salaries(employee_id);
CREATE INDEX revenue_revenue_date_idx ON revenue(revenue_date);
CREATE INDEX expenses_expense_date_idx ON expenses(expense_date);
