import { findMany, findOne } from '../db/query.js';

export const reportTypes = ['attendance', 'revenue', 'expense', 'profit', 'salary'] as const;
export type ReportType = (typeof reportTypes)[number];
type DateRange = { from?: string; to?: string };

const names: Record<ReportType, string> = { attendance: 'Attendance Report', revenue: 'Revenue Report', expense: 'Expense Report', profit: 'Profit Report', salary: 'Salary Report' };

function dates(range: DateRange, column: string) {
  const values: string[] = [];
  const clauses: string[] = [];
  if (range.from) { values.push(range.from); clauses.push(`${column} >= $${values.length}`); }
  if (range.to) { values.push(range.to); clauses.push(`${column} <= $${values.length}`); }
  return { clause: clauses.length ? `WHERE ${clauses.join(' AND ')}` : '', values };
}

export async function listReportSummaries() {
  const [attendance, revenue, expense, salary, profit] = await Promise.all([
    findOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM attendance'),
    findOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM revenue'),
    findOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM expenses'),
    findOne<{ count: string }>('SELECT COUNT(*)::text AS count FROM salaries'),
    findOne<{ count: string }>("SELECT COUNT(*)::text AS count FROM (SELECT revenue_date AS date FROM revenue UNION SELECT expense_date FROM expenses) AS profit_dates"),
  ]);
  const counts = { attendance, revenue, expense, salary, profit };
  return reportTypes.map((id) => ({ id, name: names[id], records: Number(counts[id]?.count ?? 0) }));
}

export async function getReportRows(type: ReportType, range: DateRange): Promise<Array<Record<string, string | number | null>>> {
  if (type === 'attendance') {
    const filter = dates(range, 'a.work_date');
    return findMany(`SELECT a.work_date::text AS date, e.full_name AS employee, a.check_in_time::text AS "checkIn", a.check_out_time::text AS "checkOut", a.working_hours::text AS "workingHours", a.status FROM attendance a JOIN employees e ON e.id = a.employee_id ${filter.clause} ORDER BY a.work_date DESC, e.full_name`, filter.values);
  }
  if (type === 'revenue') {
    const filter = dates(range, 'revenue_date');
    return findMany(`SELECT revenue_date::text AS date, description, amount::text AS amount FROM revenue ${filter.clause} ORDER BY revenue_date DESC`, filter.values);
  }
  if (type === 'expense') {
    const filter = dates(range, 'expense_date');
    return findMany(`SELECT expense_date::text AS date, category, description, amount::text AS amount FROM expenses ${filter.clause} ORDER BY expense_date DESC`, filter.values);
  }
  if (type === 'salary') {
    const filter = dates(range, 's.payment_month');
    return findMany(`SELECT s.payment_month::text AS "paymentMonth", e.full_name AS employee, s.monthly_salary::text AS "monthlySalary", s.payment_status AS status, s.payment_date::text AS "paymentDate" FROM salaries s JOIN employees e ON e.id = s.employee_id ${filter.clause} ORDER BY s.payment_month DESC, e.full_name`, filter.values);
  }
  const filter = dates(range, 'date');
  return findMany(`WITH dates AS (SELECT revenue_date AS date FROM revenue UNION SELECT expense_date AS date FROM expenses), daily AS (SELECT date, COALESCE((SELECT SUM(amount) FROM revenue WHERE revenue_date = date), 0)::text AS revenue, COALESCE((SELECT SUM(amount) FROM expenses WHERE expense_date = date), 0)::text AS expenses FROM dates) SELECT date::text AS date, revenue, expenses, (revenue::numeric - expenses::numeric)::text AS profit FROM daily ${filter.clause} ORDER BY date DESC`, filter.values);
}
