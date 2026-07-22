import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import type { DashboardData } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend);

export function DashboardPage() {
  const { data, isLoading, error } = useApiResource<DashboardData>('/dashboard');
  const summaryCards = data
    ? [
        ['Total Employees', data.summary.totalEmployees.toString()],
        ['Present Today', data.summary.presentToday.toString()],
        ['Absent Today', data.summary.absentToday.toString()],
        ['On Leave', data.summary.onLeaveToday.toString()],
        ["Today's Revenue", formatCurrency(data.summary.todayRevenue)],
        ["Today's Expenses", formatCurrency(data.summary.todayExpenses)],
        ["Today's Profit", formatCurrency(data.summary.todayProfit)],
      ]
    : [];

  return (
    <>
      <PageHeader title="Dashboard" description="Summary cards, charts, and recent activity." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data} emptyMessage="No dashboard data available.">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(([label, value]) => (
            <section key={label} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="text-sm text-zinc-500">{label}</p>
              <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
            </section>
          ))}
        </div>
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          <section className="min-h-80 rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-950">Revenue vs Expenses</h2>
            <div className="mt-4 h-64">
              {data && (
                <Line
                  data={{
                    labels: data.revenueVsExpenses.map((item) => item.date.slice(5)),
                    datasets: [
                      {
                        label: 'Revenue',
                        data: data.revenueVsExpenses.map((item) => item.revenue),
                        borderColor: '#0f766e',
                        backgroundColor: '#0f766e',
                      },
                      {
                        label: 'Expenses',
                        data: data.revenueVsExpenses.map((item) => item.expenses),
                        borderColor: '#dc2626',
                        backgroundColor: '#dc2626',
                      },
                    ],
                  }}
                  options={{ maintainAspectRatio: false, responsive: true }}
                />
              )}
            </div>
          </section>
          <section className="min-h-80 rounded-lg border border-zinc-200 bg-white p-4">
            <h2 className="text-base font-semibold text-zinc-950">Monthly Attendance</h2>
            <div className="mt-4 h-64">
              {data && (
                <Bar
                  data={{
                    labels: data.monthlyAttendance.map((item) => item.month),
                    datasets: [
                      {
                        label: 'Present',
                        data: data.monthlyAttendance.map((item) => item.present),
                        backgroundColor: '#2563eb',
                      },
                      {
                        label: 'Absent',
                        data: data.monthlyAttendance.map((item) => item.absent),
                        backgroundColor: '#f59e0b',
                      },
                    ],
                  }}
                  options={{ maintainAspectRatio: false, responsive: true }}
                />
              )}
            </div>
          </section>
        </div>
        <section className="mt-6 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-base font-semibold text-zinc-950">Recent Activities</h2>
          <ul className="mt-3 divide-y divide-zinc-100 text-sm text-zinc-700">
            {data?.recentActivities.map((activity) => (
              <li key={activity} className="py-2">
                {activity}
              </li>
            ))}
          </ul>
        </section>
      </DataState>
    </>
  );
}
