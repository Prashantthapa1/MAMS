import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Expense } from '../api/types';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

const categories = ['Rent', 'Electricity', 'Internet', 'Salary', 'Maintenance', 'Other'] as const;
type FormState = { date: string; category: (typeof categories)[number]; description: string; amount: string };
const emptyForm: FormState = { date: '', category: 'Other', description: '', amount: '' };

export function ExpensesPage() {
  const { data, isLoading, error, reload } = useApiResource<Expense[]>('/expenses');
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = Boolean(selectedExpense);
  const totalExpenses = useMemo(() => data?.reduce((total, item) => total + item.amount, 0) ?? 0, [data]);

  useEffect(() => {
    setForm(selectedExpense
      ? { date: selectedExpense.date, category: selectedExpense.category as FormState['category'], description: selectedExpense.description, amount: selectedExpense.amount.toString() }
      : emptyForm);
  }, [selectedExpense]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null); setFormError(null); setIsSubmitting(true);
    try {
      if (selectedExpense) {
        await api.put(`/expenses/${selectedExpense.id}`, form);
        setMessage('Expense record updated.');
      } else {
        await api.post('/expenses', form);
        setMessage('Expense record created.');
      }
      setSelectedExpense(null);
      await reload();
    } catch (submitError) {
      console.error(submitError);
      setFormError('Unable to save expense. Check every field and try again.');
    } finally { setIsSubmitting(false); }
  }

  async function handleDelete(id: string) {
    await api.delete(`/expenses/${id}`);
    if (selectedExpense?.id === id) setSelectedExpense(null);
    setMessage('Expense record deleted.');
    await reload();
  }

  return <>
    <PageHeader title="Expenses" description="Record, categorize, and manage business expenses." />
    {message && <section className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">{message}</section>}
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="rounded-lg border border-zinc-200 bg-white p-5">
        <div className="flex items-start justify-between gap-3"><div><h2 className="text-base font-semibold text-zinc-950">{isEditing ? 'Edit expense' : 'Add expense'}</h2><p className="mt-1 text-sm text-zinc-500">{isEditing ? 'Update the selected expense entry.' : 'Create a new expense entry.'}</p></div>{isEditing && <button type="button" className="text-sm font-medium text-zinc-600 hover:text-zinc-950" onClick={() => setSelectedExpense(null)}>Cancel</button>}</div>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="block"><span className="text-sm font-medium text-zinc-700">Date</span><input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
          <label className="block"><span className="text-sm font-medium text-zinc-700">Category</span><select className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as FormState['category'] })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="block"><span className="text-sm font-medium text-zinc-700">Description</span><input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <label className="block"><span className="text-sm font-medium text-zinc-700">Amount</span><input className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></label>
          {formError && <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>}
          <button className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving...' : isEditing ? 'Update expense' : 'Save expense'}</button>
        </form>
      </section>
      <section className="rounded-lg border border-zinc-200 bg-white"><div className="border-b border-zinc-200 px-5 py-4"><h2 className="text-base font-semibold text-zinc-950">Expense list</h2><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-lg bg-zinc-50 p-3"><p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total records</p><p className="mt-2 text-xl font-semibold text-zinc-950">{data?.length ?? 0}</p></div><div className="rounded-lg bg-rose-50 p-3"><p className="text-xs font-medium uppercase tracking-wide text-rose-600">Total expenses</p><p className="mt-2 text-xl font-semibold text-rose-800">{formatCurrency(totalExpenses)}</p></div></div></div>
        <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No expense records found."><div className="overflow-x-auto"><table className="min-w-full divide-y divide-zinc-200 text-sm"><thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500"><tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Description</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3 text-right">Actions</th></tr></thead><tbody className="divide-y divide-zinc-100">{data?.map((expense) => <tr key={expense.id}><td className="px-4 py-3 text-zinc-700">{formatDate(expense.date)}</td><td className="px-4 py-3 text-zinc-700">{expense.category}</td><td className="px-4 py-3 font-medium text-zinc-950">{expense.description}</td><td className="px-4 py-3 text-zinc-700">{formatCurrency(expense.amount)}</td><td className="px-4 py-3 text-right"><div className="flex justify-end gap-2"><button type="button" className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100" onClick={() => setSelectedExpense(expense)}>Edit</button><ConfirmDeleteButton label={expense.description} onConfirm={() => handleDelete(expense.id)} /></div></td></tr>)}</tbody></table></div></DataState>
      </section>
    </div>
  </>;
}
