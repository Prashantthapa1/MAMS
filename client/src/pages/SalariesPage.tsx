import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { ApiResponse, Employee, Salary } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { Notice } from '../components/Notice';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

type SalaryFormState = {
  employeeId: string;
  monthlySalary: string;
  paymentMonth: string;
  paymentDate: string;
};

const emptyForm: SalaryFormState = {
  employeeId: '',
  monthlySalary: '',
  paymentMonth: '',
  paymentDate: '',
};

export function SalariesPage() {
  const { data, isLoading, error, reload } = useApiResource<Salary[]>('/salaries');
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [form, setForm] = useState<SalaryFormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadEmployees() {
      try {
        const response = await api.get<ApiResponse<Employee[]>>('/employees');
        if (isMounted) {
          setEmployees(response.data.data);
        }
      } catch (loadError) {
        console.error(loadError);
        if (isMounted) {
          setEmployees([]);
        }
      }
    }

    void loadEmployees();

    return () => {
      isMounted = false;
    };
  }, []);

  const salaryCount = useMemo(() => data?.length ?? 0, [data]);
  const paidCount = useMemo(() => data?.filter((item) => item.paymentStatus === 'Paid').length ?? 0, [data]);
  const pendingCount = useMemo(() => data?.filter((item) => item.paymentStatus === 'Pending').length ?? 0, [data]);

  useEffect(() => {
    const selectedEmployee = employees?.find((employee) => employee.id === form.employeeId);

    if (selectedEmployee) {
      setForm((current) => ({
        ...current,
        monthlySalary: selectedEmployee.monthlySalary.toString(),
      }));
    }
  }, [employees, form.employeeId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFormError(null);
    setIsSubmitting(true);

    try {
      await api.post('/salaries', {
        employeeId: form.employeeId,
        monthlySalary: form.monthlySalary,
        paymentMonth: form.paymentMonth,
        paymentDate: form.paymentDate || null,
      });
      setMessage('Salary record created.');
      setForm(emptyForm);
      await reload();
    } catch (submitError) {
      setFormError('Unable to create salary record. Check the employee and payment month.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markPaid(id: string) {
    setMessage(null);
    setFormError(null);
    setIsSubmitting(true);

    try {
      await api.patch(`/salaries/${id}/paid`, {
        paymentDate: new Date().toISOString().slice(0, 10),
      });
      setMessage('Salary marked as paid.');
      await reload();
    } catch (updateError) {
      setFormError('Unable to mark salary as paid.');
      console.error(updateError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader title="Salaries" description="Manage monthly salary payment records." />

      {message ? <Notice tone="success">{message}</Notice> : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Add salary record</h2>
            <p className="mt-1 text-sm text-zinc-500">Create a salary entry for a selected employee.</p>
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Employee</span>
              <select
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                value={form.employeeId}
                onChange={(event) => setForm({ ...form, employeeId: event.target.value })}
                required
              >
                <option value="">Select employee</option>
                {employees?.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.fullName}
                  </option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Monthly salary</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                type="number"
                min="0"
                step="0.01"
                value={form.monthlySalary}
                onChange={(event) => setForm({ ...form, monthlySalary: event.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Payment month</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                type="date"
                value={form.paymentMonth}
                onChange={(event) => setForm({ ...form, paymentMonth: event.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Payment date</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                type="date"
                value={form.paymentDate}
                onChange={(event) => setForm({ ...form, paymentDate: event.target.value })}
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
              {isSubmitting ? 'Saving...' : 'Save salary record'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-950">Salary list</h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">{salaryCount}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Paid</p>
                <p className="mt-2 text-xl font-semibold text-emerald-800">{paidCount}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Pending</p>
                <p className="mt-2 text-xl font-semibold text-amber-800">{pendingCount}</p>
              </div>
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={!data?.length}
            emptyMessage="No salary records found."
          >
            <div className="data-table-wrap overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Month</th>
                    <th className="px-4 py-3">Salary</th>
                    <th className="px-4 py-3">Payment Date</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {data?.map((salary) => (
                    <tr key={salary.id}>
                      <td className="px-4 py-3 font-medium text-zinc-950">{salary.employeeName}</td>
                      <td className="px-4 py-3 text-zinc-700">{formatDate(salary.paymentMonth)}</td>
                      <td className="px-4 py-3 text-zinc-700">{formatCurrency(salary.monthlySalary)}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        {salary.paymentDate ? formatDate(salary.paymentDate) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={salary.paymentStatus} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
                          onClick={() => void markPaid(salary.id)}
                          disabled={isSubmitting || salary.paymentStatus === 'Paid'}
                        >
                          Mark paid
                        </button>
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
