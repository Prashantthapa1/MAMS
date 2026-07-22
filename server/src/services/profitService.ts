import { findMany, findOne } from '../db/query.js';

type AmountRow = { amount: string | null };
type DailyProfitRow = { date: string; revenue: string; expenses: string };

async function totalFor(table: 'revenue' | 'expenses', condition: string) {
  const row = await findOne<AmountRow>(`SELECT COALESCE(SUM(amount), 0)::text AS amount FROM ${table} WHERE ${condition}`);
  return Number(row?.amount ?? 0);
}

export async function getProfitData() {
  const [todayRevenue, todayExpenses, monthlyRevenue, monthlyExpenses, monthly] = await Promise.all([
    totalFor('revenue', 'revenue_date = CURRENT_DATE'),
    totalFor('expenses', 'expense_date = CURRENT_DATE'),
    totalFor('revenue', "revenue_date >= date_trunc('month', CURRENT_DATE)::date AND revenue_date <= CURRENT_DATE"),
    totalFor('expenses', "expense_date >= date_trunc('month', CURRENT_DATE)::date AND expense_date <= CURRENT_DATE"),
    findMany<DailyProfitRow>(`
      WITH dates AS (
        SELECT revenue_date AS date FROM revenue WHERE revenue_date >= date_trunc('month', CURRENT_DATE)::date AND revenue_date <= CURRENT_DATE
        UNION
        SELECT expense_date AS date FROM expenses WHERE expense_date >= date_trunc('month', CURRENT_DATE)::date AND expense_date <= CURRENT_DATE
      )
      SELECT dates.date::text AS date,
        COALESCE((SELECT SUM(amount) FROM revenue WHERE revenue_date = dates.date), 0)::text AS revenue,
        COALESCE((SELECT SUM(amount) FROM expenses WHERE expense_date = dates.date), 0)::text AS expenses
      FROM dates ORDER BY dates.date
    `),
  ]);

  return {
    todayProfit: todayRevenue - todayExpenses,
    monthlyProfit: monthlyRevenue - monthlyExpenses,
    monthly: monthly.map((row) => ({ date: row.date, profit: Number(row.revenue) - Number(row.expenses) })),
  };
}
