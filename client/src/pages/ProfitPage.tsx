import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  LinearScale,
  Tooltip,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { ProfitData } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency } from '../utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export function ProfitPage() {
  const { data, isLoading, error } = useApiResource<ProfitData>('/profit');

  return (
    <>
      <PageHeader title="Profit" description="Profit is calculated from revenue minus expenses." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data} emptyMessage="No profit data available.">
        <div className="grid gap-4 sm:grid-cols-2">
          <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Today's Profit</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {data ? formatCurrency(data.todayProfit) : '-'}
            </p>
          </section>
          <section className="rounded-lg border border-blue-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Monthly Profit</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {data ? formatCurrency(data.monthlyProfit) : '-'}
            </p>
          </section>
        </div>
        <section className="mt-6 min-h-80 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-950">Monthly Profit</h2>
          <div className="mt-4 h-64">
            {data && (
              <Bar
                data={{
                  labels: data.monthly.map((item) => item.date.slice(5)),
                  datasets: [
                    {
                      label: 'Profit',
                      data: data.monthly.map((item) => item.profit),
                      backgroundColor: '#2563eb',
                    },
                  ],
                }}
                options={{ maintainAspectRatio: false, responsive: true }}
              />
            )}
          </div>
        </section>
      </DataState>
    </>
  );
}
