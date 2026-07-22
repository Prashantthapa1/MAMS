# Employee Management System Context

## Goal
Build a simple, clean, production-ready Employee Management System for a single small business. Do not add multi-tenancy or unnecessary enterprise features.

## Current Scope
For now, only set up the client and server foundations. Future work should follow `tasks.md`.

## Tech Stack
- Frontend: React, Vite, TypeScript
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL
- Database access: direct PostgreSQL client (`pg`) unless the user later asks for Prisma
- Authentication: JWT
- Password hashing: bcrypt
- Validation: Zod
- Styling: Tailwind CSS
- Charts: Chart.js
- Deployment: Railway for frontend, backend, and PostgreSQL
- Version control: GitHub
- CI/CD: GitHub Actions deploying to Railway from `main`

## Roles
- Admin: full access
- Staff: login, view own attendance, view leave history, submit leave requests
- Staff must not edit salaries, expenses, revenue, settings, or employee administration data

## Core Features
- Authentication with Admin and Staff roles
- Dashboard with summary cards, charts, and recent activities
- Employees CRUD and employee profile
- Attendance check-in/check-out, editing, filters, and working-hour calculation
- Leave request submission, approval, and rejection
- Salary records and paid/pending status
- Manual revenue records
- Manual expense records
- Automatic profit calculation
- Reports with CSV export
- Settings for company name, address, and currency

## Dashboard Requirements
Summary cards:
- Total Employees
- Employees Present Today
- Employees Absent Today
- Employees on Leave
- Today's Revenue
- Today's Expenses
- Today's Profit

Charts:
- Revenue vs Expenses for the last 7 days
- Monthly Attendance

Other:
- Recent Activities list

## Employee Fields
- Full Name
- Email
- Phone
- Position
- Join Date
- Monthly Salary
- Status: Active or Inactive

Employee profile sections:
- Basic Information
- Attendance History
- Leave History
- Salary Information

## Attendance Fields
- Employee
- Date
- Check In Time
- Check Out Time
- Working Hours, calculated automatically
- Status: Present or Absent

Filters:
- Today
- This Week
- This Month

## Leave Fields
- Employee
- Leave Type: Sick, Casual, Annual
- Start Date
- End Date
- Reason
- Status

## Salary Fields
- Employee
- Monthly Salary
- Payment Month
- Payment Status: Paid or Pending
- Payment Date

## Revenue Fields
- Date
- Description
- Amount

## Expense Fields
- Date
- Category: Rent, Electricity, Internet, Salary, Maintenance, Other
- Description
- Amount

## Profit Rules
- Profit = Total Revenue - Total Expenses
- Display today's profit and monthly profit
- Show a simple monthly profit chart
- Profit is calculated only, not manually edited

## Pages
- Login
- Dashboard
- Employees
- Attendance
- Leave
- Salaries
- Revenue
- Expenses
- Profit
- Reports
- Settings

## Navigation
Responsive sidebar items:
- Dashboard
- Employees
- Attendance
- Leave
- Salaries
- Revenue
- Expenses
- Profit
- Reports
- Settings

## Backend Architecture
Use a clean, simple structure:
- `controllers`
- `routes`
- `services`
- `middleware`
- `db`
- `utils`
- `config`

Backend requirements:
- RESTful API routes
- Zod validation
- bcrypt password hashing
- JWT authentication
- role-based authorization
- consistent JSON responses
- proper error handling
- environment variables: `PORT`, `DATABASE_URL`, `JWT_SECRET`

## Frontend Requirements
- React Router
- Axios API client
- Tailwind CSS
- reusable components
- loading states
- empty states
- error messages
- confirmation dialogs before delete
- responsive layout

## Database Tables
Planned tables:
- users
- employees
- attendance
- leave_requests
- salaries
- revenue
- expenses
- settings

## Seed Data
Default admin:
- Email: `admin@example.com`
- Password: `admin123`

Also seed:
- 5 employees
- sample attendance
- sample revenue
- sample expenses
- sample leave requests

## Deployment and CI/CD
- Frontend on Railway
- Backend on Railway
- PostgreSQL on Railway PostgreSQL
- GitHub Actions should install dependencies, build frontend, build backend, run database setup, run tests if available, and deploy on push to `main`
- Use GitHub secrets for Railway token, Railway project ID, database URL, and JWT secret
