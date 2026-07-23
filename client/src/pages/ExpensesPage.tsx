import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Expense } from '../api/types';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { Notice } from '../components/Notice';
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
    try {
      await api.delete(`/expenses/${id}`);
      if (selectedExpense?.id === id) setSelectedExpense(null);
      setMessage('Expense record deleted.');
      await reload();
    } catch (deleteError) {
      console.error(deleteError);
      setFormError('Unable to delete the expense record. Please try again.');
    }
  }

  return <>
    <div className="page-action-bar">
      <PageHeader title="Expenses" description="Record, categorize, and manage business expenses." />
      {isEditing && <button type="button" className="button-secondary" onClick={() => setSelectedExpense(null)}>Cancel edit</button>}
    </div>
    {message && <Notice tone="success">{message}</Notice>}
    {formError && <Notice tone="error">{formError}</Notice>}
    <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
      <section className="surface-card p-5">
        <h2 className="text-base font-semibold text-slate-950">{isEditing ? 'Edit expense' : 'Add expense'}</h2>
        <p className="mt-1 text-sm text-slate-500">{isEditing ? 'Update the selected expense entry.' : 'Create a new expense entry.'}</p>
        <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
          <label className="form-label">Date<input className="form-input" type="date" value={form.date} onChange={(event) => setForm({ ...form, date: event.target.value })} required /></label>
          <label className="form-label">Category<select className="form-input" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as FormState['category'] })}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
          <label className="form-label">Description<input className="form-input" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} required /></label>
          <label className="form-label">Amount<input className="form-input" type="number" min="0" step="0.01" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} required /></label>
          <button className="button-primary w-full" type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : isEditing ? 'Update expense' : 'Save expense'}</button>
        </form>
      </section>
      <section className="surface-card overflow-hidden">
        <div className="table-toolbar">
          <div><h2 className="text-base font-semibold text-slate-950">Expense records</h2><p className="mt-1 text-sm text-slate-500">Review and manage recorded costs.</p></div>
          <div className="grid grid-cols-2 gap-2"><div className="metric-chip"><span>Records</span><strong>{data?.length ?? 0}</strong></div><div className="metric-chip metric-chip-danger"><span>Total</span><strong>{formatCurrency(totalExpenses)}</strong></div></div>
        </div>
        <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No expense records found.">
          <div className="data-table-wrap">
            <table className="data-table"><thead><tr><th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th className="text-right">Actions</th></tr></thead><tbody>{data?.map((expense) => <tr key={expense.id}><td data-label="Date">{formatDate(expense.date)}</td><td data-label="Category">{expense.category}</td><td data-label="Description" className="font-medium text-slate-950">{expense.description}</td><td data-label="Amount">{formatCurrency(expense.amount)}</td><td data-label="Actions"><div className="flex justify-end gap-2"><button type="button" className="button-secondary button-compact" onClick={() => setSelectedExpense(expense)}>Edit</button><ConfirmDeleteButton label={expense.description} onConfirm={() => handleDelete(expense.id)} /></div></td></tr>)}</tbody></table>
          </div>
        </DataState>
      </section>
    </div>
  </>;
}
