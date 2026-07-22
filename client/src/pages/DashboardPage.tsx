import { PageHeader } from '../components/PageHeader';

const summaryCards = [
  ['Total Employees', '0'],
  ['Present Today', '0'],
  ['Absent Today', '0'],
  ['On Leave', '0'],
  ["Today's Revenue", '0'],
  ["Today's Expenses", '0'],
  ["Today's Profit", '0'],
] as const;

export function DashboardPage() {
  return (
    <>
      <PageHeader title="Dashboard" description="Summary cards, charts, and recent activity." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map(([label, value]) => (
          <section key={label} className="rounded-lg border border-zinc-200 bg-white p-4">
            <p className="text-sm text-zinc-500">{label}</p>
            <p className="mt-2 text-2xl font-semibold text-zinc-950">{value}</p>
          </section>
        ))}
      </div>
      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <section className="min-h-72 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-base font-semibold text-zinc-950">Revenue vs Expenses</h2>
          <p className="mt-2 text-sm text-zinc-500">Chart will be connected after API data is ready.</p>
        </section>
        <section className="min-h-72 rounded-lg border border-zinc-200 bg-white p-4">
          <h2 className="text-base font-semibold text-zinc-950">Monthly Attendance</h2>
          <p className="mt-2 text-sm text-zinc-500">Chart will be connected after API data is ready.</p>
        </section>
      </div>
    </>
  );
}
