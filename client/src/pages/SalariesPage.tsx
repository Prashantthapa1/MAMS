import type { Salary } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

export function SalariesPage() {
  const { data, isLoading, error } = useApiResource<Salary[]>('/salaries');

  return (
    <>
      <PageHeader title="Salaries" description="Manage monthly salary payment records." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No salary records found.">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Month</th>
                  <th className="px-4 py-3">Salary</th>
                  <th className="px-4 py-3">Payment Date</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data?.map((salary) => (
                  <tr key={salary.id}>
                    <td className="px-4 py-3 font-medium text-zinc-950">{salary.employeeName}</td>
                    <td className="px-4 py-3 text-zinc-700">{salary.paymentMonth}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatCurrency(salary.monthlySalary)}</td>
                    <td className="px-4 py-3 text-zinc-700">
                      {salary.paymentDate ? formatDate(salary.paymentDate) : '-'}
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={salary.paymentStatus} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </DataState>
    </>
  );
}
