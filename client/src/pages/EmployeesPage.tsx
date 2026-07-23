import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Employee } from '../api/types';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

type EmployeeFormState = {
  fullName: string;
  email: string;
  phone: string;
  position: string;
  joinDate: string;
  monthlySalary: string;
  status: 'Active' | 'Inactive';
};

const emptyForm: EmployeeFormState = {
  fullName: '',
  email: '',
  phone: '',
  position: '',
  joinDate: '',
  monthlySalary: '',
  status: 'Active',
};

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function EmployeesPage() {
  const { data, isLoading, error, remove, reload } = useApiResource<Employee[]>('/employees');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [form, setForm] = useState<EmployeeFormState>(emptyForm);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | Employee['status']>('All');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!selectedEmployee) {
      setForm(emptyForm);
      setPhotoFile(null);
      return;
    }

    setForm({
      fullName: selectedEmployee.fullName,
      email: selectedEmployee.email,
      phone: selectedEmployee.phone,
      position: selectedEmployee.position,
      joinDate: selectedEmployee.joinDate,
      monthlySalary: selectedEmployee.monthlySalary.toString(),
      status: selectedEmployee.status,
    });
    setPhotoFile(null);
  }, [selectedEmployee]);

  const isEditing = Boolean(selectedEmployee);
  const employeeCount = useMemo(() => data?.length ?? 0, [data]);
  const filteredEmployees = useMemo(() => (data ?? []).filter((employee) =>
    (statusFilter === 'All' || employee.status === statusFilter) &&
    `${employee.fullName} ${employee.email} ${employee.position}`.toLowerCase().includes(query.toLowerCase()),
  ), [data, query, statusFilter]);
  const pageSize = 8;
  const pageCount = Math.max(1, Math.ceil(filteredEmployees.length / pageSize));
  const visibleEmployees = filteredEmployees.slice((page - 1) * pageSize, page * pageSize);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setMessage(null);
    setIsSubmitting(true);

    const body = new FormData();
    body.append('fullName', form.fullName);
    body.append('email', form.email);
    body.append('phone', form.phone);
    body.append('position', form.position);
    body.append('joinDate', form.joinDate);
    body.append('monthlySalary', form.monthlySalary);
    body.append('status', form.status);

    if (photoFile) {
      body.append('photo', photoFile);
    }

    try {
      if (isEditing && selectedEmployee) {
        await api.put(`/employees/${selectedEmployee.id}`, body);
        setMessage('Employee updated.');
      } else {
        await api.post('/employees', body);
        setMessage('Employee created.');
      }

      setSelectedEmployee(null);
      await reload();
    } catch (submitError) {
      setFormError('Unable to save employee. Check the inputs and Cloudinary configuration.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await remove(id);
    if (selectedEmployee?.id === id) {
      setSelectedEmployee(null);
    }
    setMessage('Employee deleted.');
  }

  return (
    <>
      <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-end"><PageHeader title="Employees" description="Manage your organization's talent and department structure." /><div className="flex gap-2"><button type="button" className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700" onClick={() => { setQuery(''); setStatusFilter('All'); setPage(1); }}>Clear filters</button><button type="button" className="rounded-md bg-[#0053db] px-3 py-2 text-sm font-semibold text-white" onClick={() => setSelectedEmployee(null)}>Add employee</button></div></div>

      {message ? (
        <section className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                {isEditing ? 'Edit employee' : 'Add employee'}
              </h2>
              <p className="mt-1 text-sm text-zinc-500">
                {isEditing ? 'Update the employee record.' : 'Create a new employee record.'}
              </p>
            </div>
            {isEditing ? (
              <button
                type="button"
                className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
                onClick={() => setSelectedEmployee(null)}
              >
                Cancel
              </button>
            ) : null}
          </div>

          <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Full name</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
                required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Email</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Phone</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  required
                />
              </label>

              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Status</span>
                <select
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  value={form.status}
                  onChange={(event) =>
                    setForm({ ...form, status: event.target.value as EmployeeFormState['status'] })
                  }
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Position</span>
              <input
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                value={form.position}
                onChange={(event) => setForm({ ...form, position: event.target.value })}
                required
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Join date</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  type="date"
                  value={form.joinDate}
                  onChange={(event) => setForm({ ...form, joinDate: event.target.value })}
                  required
                />
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
            </div>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Photo</span>
              <input
                className="mt-1 block w-full text-sm text-zinc-600 file:mr-4 file:rounded-md file:border-0 file:bg-zinc-900 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-zinc-800"
                type="file"
                accept="image/*"
                onChange={(event) => setPhotoFile(event.target.files?.[0] ?? null)}
              />
              <span className="mt-1 block text-xs text-zinc-500">
                Stored in Cloudinary; URL is saved in PostgreSQL.
              </span>
            </label>

            {formError ? (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
            ) : null}

            <button
              className="inline-flex w-full items-center justify-center rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : isEditing ? 'Update employee' : 'Create employee'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Employee directory</h2>
              <p className="text-sm text-slate-500">{employeeCount} employees in your organization</p>
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row"><label className="relative flex-1"><span className="sr-only">Search employees</span><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18}/><input className="w-full rounded-md border border-slate-300 py-2 pl-10 pr-3 text-sm" placeholder="Search employees, positions..." value={query} onChange={(e) => { setQuery(e.target.value); setPage(1); }}/></label><label><span className="sr-only">Filter by employee status</span><select className="rounded-md border border-slate-300 px-3 py-2 text-sm" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value as typeof statusFilter); setPage(1); }}><option value="All">All statuses</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select></label></div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={!data?.length}
            emptyMessage="No employees found."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Phone</th>
                    <th className="px-4 py-3">Join Date</th>
                    <th className="px-4 py-3">Salary</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {visibleEmployees.map((employee) => (
                    <tr key={employee.id}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {employee.avatarUrl ? (
                            <img
                              src={employee.avatarUrl}
                              alt={employee.fullName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white">
                              {getInitials(employee.fullName)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-zinc-950">{employee.fullName}</p>
                            <p className="text-zinc-500">
                              {employee.position} · {employee.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{employee.phone}</td>
                      <td className="px-4 py-3 text-zinc-700">{formatDate(employee.joinDate)}</td>
                      <td className="px-4 py-3 text-zinc-700">{formatCurrency(employee.monthlySalary)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={employee.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/employees/${employee.id}`}
                            className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                          >
                            Profile
                          </Link>
                          <button
                            type="button"
                            className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                            onClick={() => setSelectedEmployee(employee)}
                          >
                            Edit
                          </button>
                          <ConfirmDeleteButton
                            label={employee.fullName}
                            onConfirm={() => handleDelete(employee.id)}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between border-t border-zinc-200 px-5 py-4 text-sm text-slate-600"><span>Showing {visibleEmployees.length} of {filteredEmployees.length} employees</span><div className="flex gap-2"><button className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-50" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span className="px-2 py-1.5">{page} / {pageCount}</span><button className="rounded border border-slate-300 px-3 py-1.5 disabled:opacity-50" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</button></div></div>
          </DataState>
        </section>
      </div>
    </>
  );
}
