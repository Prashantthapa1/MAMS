import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { ApiResponse, Employee, LeaveRequest } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatDate } from '../utils/format';

type LeaveFormState = {
  employeeId: string;
  leaveType: 'Sick' | 'Casual' | 'Annual';
  startDate: string;
  endDate: string;
  reason: string;
};

const emptyForm: LeaveFormState = {
  employeeId: '',
  leaveType: 'Sick',
  startDate: '',
  endDate: '',
  reason: '',
};

export function LeavePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const { data, isLoading, error, reload } = useApiResource<LeaveRequest[]>('/leave');
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [form, setForm] = useState<LeaveFormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user) {
      return;
    }

    if (!isAdmin) {
      setEmployees(null);
      setForm((current) => ({
        ...current,
        employeeId: user.employeeId ?? '',
      }));
      return;
    }

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
  }, [isAdmin, user]);

  useEffect(() => {
    if (!user || isAdmin) {
      return;
    }

    setForm((current) => ({
      ...current,
      employeeId: user.employeeId ?? '',
    }));
  }, [isAdmin, user]);

  const leaveCount = useMemo(() => data?.length ?? 0, [data]);
  const pendingCount = useMemo(() => data?.filter((item) => item.status === 'Pending').length ?? 0, [data]);
  const approvedCount = useMemo(() => data?.filter((item) => item.status === 'Approved').length ?? 0, [data]);

  async function submitLeave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setFormError(null);
    setIsSubmitting(true);

    try {
      await api.post('/leave', form);
      setMessage('Leave request submitted.');
      setForm(emptyForm);

      if (!isAdmin) {
        setForm((current) => ({ ...current, employeeId: user?.employeeId ?? '' }));
      }

      await reload();
    } catch (submitError) {
      setFormError('Unable to submit leave request. Check the dates and employee selection.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function updateStatus(id: string, status: 'Approved' | 'Rejected') {
    setMessage(null);
    setFormError(null);
    setIsSubmitting(true);

    try {
      await api.patch(`/leave/${id}/status`, { status });
      setMessage(`Leave request ${status.toLowerCase()}.`);
      await reload();
    } catch (updateError) {
      setFormError('Unable to update leave status.');
      console.error(updateError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <PageHeader
        title="Leave"
        description={isAdmin ? 'Review, approve, and reject leave requests.' : 'Submit and track your leave history.'}
      />

      {message ? (
        <section className="mb-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
          {message}
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <section className="rounded-lg border border-zinc-200 bg-white p-5">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Submit leave request</h2>
            <p className="mt-1 text-sm text-zinc-500">
              {isAdmin ? 'Create a leave request for any employee.' : 'Submit leave for your own account.'}
            </p>
          </div>

          <form className="mt-5 space-y-4" onSubmit={submitLeave}>
            {isAdmin ? (
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
            ) : (
              <div className="rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-600">
                Submitting as {user?.fullName}
              </div>
            )}

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Leave type</span>
              <select
                className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                value={form.leaveType}
                onChange={(event) => setForm({ ...form, leaveType: event.target.value as LeaveFormState['leaveType'] })}
              >
                <option value="Sick">Sick</option>
                <option value="Casual">Casual</option>
                <option value="Annual">Annual</option>
              </select>
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Start date</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  type="date"
                  value={form.startDate}
                  onChange={(event) => setForm({ ...form, startDate: event.target.value })}
                  required
                />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-zinc-700">End date</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  type="date"
                  value={form.endDate}
                  onChange={(event) => setForm({ ...form, endDate: event.target.value })}
                  required
                />
              </label>
            </div>

            <label className="block">
              <span className="text-sm font-medium text-zinc-700">Reason</span>
              <textarea
                className="mt-1 min-h-28 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                value={form.reason}
                onChange={(event) => setForm({ ...form, reason: event.target.value })}
                required
              />
            </label>

            {formError ? (
              <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
            ) : null}

            <button
              className="w-full rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
              type="submit"
              disabled={isSubmitting || (!isAdmin && !user?.employeeId)}
            >
              {isSubmitting ? 'Submitting...' : 'Submit leave request'}
            </button>
          </form>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="border-b border-zinc-200 px-5 py-4">
            <h2 className="text-base font-semibold text-zinc-950">
              {isAdmin ? 'Leave requests' : 'Leave history'}
            </h2>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-zinc-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total</p>
                <p className="mt-2 text-xl font-semibold text-zinc-950">{leaveCount}</p>
              </div>
              <div className="rounded-lg bg-amber-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Pending</p>
                <p className="mt-2 text-xl font-semibold text-amber-800">{pendingCount}</p>
              </div>
              <div className="rounded-lg bg-emerald-50 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Approved</p>
                <p className="mt-2 text-xl font-semibold text-emerald-800">{approvedCount}</p>
              </div>
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={!data?.length}
            emptyMessage="No leave requests found."
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Dates</th>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Status</th>
                    {isAdmin ? <th className="px-4 py-3 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {data?.map((request) => (
                    <tr key={request.id}>
                      <td className="px-4 py-3 font-medium text-zinc-950">{request.employeeName}</td>
                      <td className="px-4 py-3 text-zinc-700">{request.leaveType}</td>
                      <td className="px-4 py-3 text-zinc-700">
                        {formatDate(request.startDate)} - {formatDate(request.endDate)}
                      </td>
                      <td className="px-4 py-3 text-zinc-700">{request.reason}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={request.status} />
                      </td>
                      {isAdmin ? (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-md border border-emerald-200 px-3 py-2 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:cursor-not-allowed disabled:opacity-70"
                              onClick={() => void updateStatus(request.id, 'Approved')}
                              disabled={isSubmitting || request.status !== 'Pending'}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-red-200 px-3 py-2 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-70"
                              onClick={() => void updateStatus(request.id, 'Rejected')}
                              disabled={isSubmitting || request.status !== 'Pending'}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      ) : null}
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
