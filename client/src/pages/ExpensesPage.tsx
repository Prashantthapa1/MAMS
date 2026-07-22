import type { Expense } from '../api/types';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

export function ExpensesPage() {
  const { data, isLoading, error, remove } = useApiResource<Expense[]>('/expenses');

  return (
    <>
      <PageHeader title="Expenses" description="Record and categorize business expenses." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No expense records found.">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Description</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data?.map((expense) => (
                  <tr key={expense.id}>
                    <td className="px-4 py-3 text-zinc-700">{formatDate(expense.date)}</td>
                    <td className="px-4 py-3 text-zinc-700">{expense.category}</td>
                    <td className="px-4 py-3 font-medium text-zinc-950">{expense.description}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatCurrency(expense.amount)}</td>
                    <td className="px-4 py-3 text-right">
                      <ConfirmDeleteButton
                        label={expense.description}
                        onConfirm={() => remove(expense.id)}
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
