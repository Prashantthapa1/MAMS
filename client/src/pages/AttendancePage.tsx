import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { ApiResponse, Attendance, Employee } from '../api/types';
import { useAuth } from '../auth/AuthContext';
import { ConfirmDeleteButton } from '../components/ConfirmDeleteButton';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { Notice } from '../components/Notice';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatDate } from '../utils/format';

type AttendanceRange = 'today' | 'week' | 'month';

type AttendanceFormState = {
  employeeId: string;
  date: string;
  checkInTime: string;
  checkOutTime: string;
  status: 'Present' | 'Absent';
};

const emptyForm: AttendanceFormState = {
  employeeId: '',
  date: '',
  checkInTime: '',
  checkOutTime: '',
  status: 'Present',
};

const rangeLabels: Record<AttendanceRange, string> = {
  today: 'Today',
  week: 'This week',
  month: 'This month',
};

function getTodayValue() {
  return new Date().toISOString().slice(0, 10);
}

export function AttendancePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const [range, setRange] = useState<AttendanceRange>('today');
  const endpoint = useMemo(() => `/attendance?range=${range}`, [range]);
  const { data: attendance, isLoading, error, reload } = useApiResource<Attendance[]>(endpoint);
  const [selectedRecord, setSelectedRecord] = useState<Attendance | null>(null);
  const [employees, setEmployees] = useState<Employee[] | null>(null);
  const [form, setForm] = useState<AttendanceFormState>(emptyForm);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!selectedRecord) {
      setForm(emptyForm);
      return;
    }

    setForm({
      employeeId: selectedRecord.employeeId,
      date: selectedRecord.date,
      checkInTime: selectedRecord.checkInTime ?? '',
      checkOutTime: selectedRecord.checkOutTime ?? '',
      status: selectedRecord.status,
    });
  }, [selectedRecord]);

  useEffect(() => {
    if (!isAdmin) {
      setSelectedRecord(null);
      setForm(emptyForm);
      setMessage(null);
      setFormError(null);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      setEmployees(null);
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
  }, [isAdmin]);

  const attendanceCount = useMemo(() => attendance?.length ?? 0, [attendance]);
  const presentCount = useMemo(
    () => attendance?.filter((record) => record.status === 'Present').length ?? 0,
    [attendance],
  );
  const absentCount = useMemo(
    () => attendance?.filter((record) => record.status === 'Absent').length ?? 0,
    [attendance],
  );
  const isEditing = Boolean(selectedRecord);

  async function saveAttendance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedRecord) {
      setFormError('Select an attendance record to edit.');
      return;
    }

    setFormError(null);
    setMessage(null);
    setIsSubmitting(true);

    const payload = {
      employeeId: form.employeeId,
      date: form.date,
      checkInTime: form.checkInTime || null,
      checkOutTime: form.checkOutTime || null,
      status: form.status,
    };

    try {
      await api.put(`/attendance/${selectedRecord.id}`, payload);
      setMessage('Attendance updated.');
      setSelectedRecord(null);
      await reload();
    } catch (submitError) {
      setFormError('Unable to save attendance. Check the employee, date, and times.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markCheckIn() {
    setFormError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await api.post('/attendance/check-in', {
        employeeId: form.employeeId,
        date: form.date || getTodayValue(),
        checkInTime: form.checkInTime || null,
        checkOutTime: null,
        status: 'Present',
      });
      setMessage('Check-in marked.');
      await reload();
    } catch (submitError) {
      setFormError('Unable to mark check-in. Check the employee and time.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function markCheckOut() {
    setFormError(null);
    setMessage(null);
    setIsSubmitting(true);

    try {
      await api.post('/attendance/check-out', {
        employeeId: form.employeeId,
        date: form.date || getTodayValue(),
        checkInTime: null,
        checkOutTime: form.checkOutTime || null,
        status: 'Present',
      });
      setMessage('Check-out marked.');
      await reload();
    } catch (submitError) {
      setFormError('Unable to mark check-out. Make sure a check-in already exists.');
      console.error(submitError);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: string) {
    await api.delete(`/attendance/${id}`);
    if (selectedRecord?.id === id) {
      setSelectedRecord(null);
    }
    setMessage('Attendance record deleted.');
    await reload();
  }

  return (
    <>
      <PageHeader
        title="Attendance"
        description={isAdmin ? 'Track check in, check out, status, and working hours.' : 'View your attendance history.'}
      />

      {message ? <Notice tone="success">{message}</Notice> : null}

      <section className="mb-6 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-semibold text-zinc-950">Filters</h2>
            <p className="mt-1 text-sm text-zinc-500">Switch between today, this week, and this month.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(rangeLabels) as AttendanceRange[]).map((option) => (
              <button
                key={option}
                type="button"
                className={`rounded-md px-3 py-2 text-sm font-medium transition ${
                  range === option
                    ? 'bg-zinc-900 text-white'
                    : 'border border-zinc-200 text-zinc-700 hover:bg-zinc-100'
                }`}
                onClick={() => setRange(option)}
              >
                {rangeLabels[option]}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-zinc-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Total</p>
            <p className="mt-2 text-xl font-semibold text-zinc-950">{attendanceCount}</p>
          </div>
          <div className="rounded-lg bg-emerald-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Present</p>
            <p className="mt-2 text-xl font-semibold text-emerald-800">{presentCount}</p>
          </div>
          <div className="rounded-lg bg-red-50 p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-red-600">Absent</p>
            <p className="mt-2 text-xl font-semibold text-red-800">{absentCount}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {isAdmin ? (
          <section className="rounded-lg border border-zinc-200 bg-white p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-zinc-950">
                  {isEditing ? 'Edit attendance' : 'Attendance actions'}
                </h2>
                <p className="mt-1 text-sm text-zinc-500">
                  {isEditing
                    ? 'Update an existing attendance record.'
                    : 'Mark check-in, check-out, or create a record.'}
                </p>
              </div>
              {isEditing ? (
                <button
                  type="button"
                  className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
                  onClick={() => setSelectedRecord(null)}
                >
                  Cancel
                </button>
              ) : null}
            </div>

            <form className="mt-5 space-y-4" onSubmit={saveAttendance}>
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
                <span className="text-sm font-medium text-zinc-700">Date</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  type="date"
                  value={form.date}
                  onChange={(event) => setForm({ ...form, date: event.target.value })}
                  required
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">Check-in time</span>
                  <input
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    type="time"
                    value={form.checkInTime}
                    onChange={(event) => setForm({ ...form, checkInTime: event.target.value })}
                  />
                </label>

                <label className="block">
                  <span className="text-sm font-medium text-zinc-700">Check-out time</span>
                  <input
                    className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                    type="time"
                    value={form.checkOutTime}
                    onChange={(event) => setForm({ ...form, checkOutTime: event.target.value })}
                  />
                </label>
              </div>

              <label className="block">
                <span className="text-sm font-medium text-zinc-700">Status</span>
                <select
                  className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm outline-none focus:border-zinc-900"
                  value={form.status}
                  onChange={(event) => setForm({ ...form, status: event.target.value as AttendanceFormState['status'] })}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                </select>
              </label>

              <div className="grid gap-3 sm:grid-cols-3">
                <button
                  className="rounded-md bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-70"
                  type="submit"
                  disabled={isSubmitting || !isEditing}
                >
                  {isSubmitting && isEditing ? 'Saving...' : 'Update attendance'}
                </button>
                <button
                  className="rounded-md border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void markCheckIn()}
                >
                  Mark check in
                </button>
                <button
                  className="rounded-md border border-zinc-200 px-4 py-2.5 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-70"
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => void markCheckOut()}
                >
                  Mark check out
                </button>
              </div>

              {formError ? (
                <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{formError}</p>
              ) : null}
            </form>
          </section>
        ) : null}

        <section className="rounded-lg border border-zinc-200 bg-white">
          <div className="flex items-center justify-between border-b border-zinc-200 px-5 py-4">
            <div>
              <h2 className="text-base font-semibold text-zinc-950">
                {isAdmin ? 'Attendance list' : 'Your attendance'}
              </h2>
              <p className="text-sm text-zinc-500">
                {attendanceCount} record{attendanceCount === 1 ? '' : 's'} for {rangeLabels[range].toLowerCase()}
              </p>
            </div>
          </div>

          <DataState
            isLoading={isLoading}
            error={error}
            isEmpty={!attendance?.length}
            emptyMessage="No attendance records found."
          >
            <div className="data-table-wrap overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm">
                <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                  <tr>
                    <th className="px-4 py-3">Employee</th>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Check In</th>
                    <th className="px-4 py-3">Check Out</th>
                    <th className="px-4 py-3">Hours</th>
                    <th className="px-4 py-3">Status</th>
                    {isAdmin ? <th className="px-4 py-3 text-right">Actions</th> : null}
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {attendance?.map((record) => (
                    <tr key={record.id}>
                      <td className="px-4 py-3 font-medium text-zinc-950">{record.employeeName}</td>
                      <td className="px-4 py-3 text-zinc-700">{formatDate(record.date)}</td>
                      <td className="px-4 py-3 text-zinc-700">{record.checkInTime ?? '-'}</td>
                      <td className="px-4 py-3 text-zinc-700">{record.checkOutTime ?? '-'}</td>
                      <td className="px-4 py-3 text-zinc-700">{record.workingHours.toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={record.status} />
                      </td>
                      {isAdmin ? (
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              className="rounded-md border border-zinc-200 px-3 py-2 text-xs font-medium text-zinc-700 hover:bg-zinc-100"
                              onClick={() => setSelectedRecord(record)}
                            >
                              Edit
                            </button>
                            <ConfirmDeleteButton
                              label={`${record.employeeName} on ${record.date}`}
                              onConfirm={() => handleDelete(record.id)}
                            />
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
