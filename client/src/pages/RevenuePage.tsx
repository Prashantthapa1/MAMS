import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Revenue } from '../api/types';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { Notice } from '../components/Notice';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

type RevenueFormState = {
  date: string;
  description: string;
  amount: string;
};

const emptyForm: RevenueFormState = {
  date: '',
  description: '',
  amount: '',
};

export function RevenuePage() {
  const { data, isLoading, error, reload } = useApiResource<Revenue[]>('/revenue');
  const [selectedRevenue, setSelectedRevenue] = useState<Revenue | null>(null);
  const [form, setForm] = useState<RevenueFormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedRevenue) {
      setForm(emptyForm);
      return;
    }

    setForm({
      date: selectedRevenue.date,
      description: selectedRevenue.description,
      amount: selectedRevenue.amount.toString(),
    });
  }, [selectedRevenue]);

  const revenueCount = useMemo(() => data?.length ?? 0, [data]);
  const totalRevenue = useMemo(() => data?.reduce((total, item) => total + item.amount, 0) ?? 0, [data]);
  const isEditing = Boolean(selectedRevenue);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFormError(null);
    setIsSubmitting(true);

    const payload = {
      date: form.date,
      description: form.description,
      amount: form.amount,
    };

    try {
      if (selectedRevenue) {
        await api.put(`/revenue/${selectedRevenue.id}`, payload);
        setMessage('Revenue record updated.');
      } else {
        await api.post('/revenue', payload);
        setMessage('Revenue record created.');
      }

      setSelectedRevenue(null);
      await reload();
    } catch (submitError) {
      setFormError('Unable to save revenue. Check the date, description, and amount.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/revenue/${id}`);
    if (selectedRevenue?.id === id) {
      setSelectedRevenue(null);
    }
    setMessage('Revenue record deleted.');
    await reload();
  }

  return (
    <>
      <PageHeader title="Revenue" description="Record, edit, and remove revenue entries." />

      {message ? <Notice tone="success">{message}</Notice> : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                {isEditing ? 'Edit revenue' : 'Add revenue'}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {isEditing ? 'Update the selected revenue entry.' : 'Create a new revenue entry.'}
              </p>
            </div>
            {isEditing ? (
              <button
                type="button"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
                onClick={() => setSelectedRevenue(null)}
              >
                Cancel
              </button>
            ) : null}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Date</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                type="date"
                value={form.date}
                onChange={(event) => setForm({ ...form, date: event.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Description</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Amount</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                type="number"
                min="0"
                step="0.01"
                value={form.amount}
                onChange={(event) => setForm({ ...form, amount: event.target.value })}
                required
              />
            </label>

            {formError ? (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
            ) : null}

            <button
              className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update revenue' : 'Save revenue'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-950">Revenue list</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total records</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">{revenueCount}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Total revenue</p>
                <p className="mt-2 text-xl font-semibold text-emerald-800">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={!data?.length}
            emptyMessage="No revenue records found."
          >
            <div className="data-table-wrap overflow-x-auto">
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
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                            onClick={() => setSelectedRevenue(revenue)}
                          >
                            Edit
                          </button>
                          <ConfirmDeleteButton
                            label={revenue.description}
                            onConfirm={() => handleDelete(revenue.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DataState>
        </section>
      </div>
    </>
  );
}
