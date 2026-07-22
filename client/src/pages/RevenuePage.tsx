import type { Revenue } from '../api/types';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

export function RevenuePage() {
  const { data, isLoading, error, remove } = useApiResource<Revenue[]>('/revenue');

  return (
    <>
      <PageHeader title="Revenue" description="Record daily business revenue." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No revenue records found.">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data?.map((revenue) => (
                  <tr key={revenue.id}>
                    <td className="px-4 py-3 text-zinc-700">{formatDate(revenue.date)}</td>
                    <td className="px-4 py-3 font-medium text-zinc-950">{revenue.description}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatCurrency(revenue.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmDeleteButton
                        label={revenue.description}
                        onConfirm={() => remove(revenue.id)}
                      />
                    </td>
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
