import { ArrowLeft, BriefcaseBusiness, CalendarDays, Clock3, Landmark } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import type { EmployeeProfile } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatCurrency, formatDate } from '../utils/format';

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function EmployeeProfilePage() {
  const { id } = useParams();
  const { data, isLoading, error } = useApiResource<EmployeeProfile>(`/employees/${id}/profile`);

  return (
    <>
      <PageHeader
        title="Employee profile"
        description="Basic information, attendance history, leave history, and salary information."
      />

      <div className="mb-4">
        <Link
          to="/employees"
          className="inline-flex items-center gap-2 rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-100"
        >
          <ArrowLeft size={16} />
          Back to employees
        </Link>
      </div>

      <DataState
        isLoading={isLoading}
        error={error}
        isEmpty={!data}
        emptyMessage="No profile data available."
      >
        {data ? (
          <div className="space-y-6">
            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
                {data.employee.avatarUrl ? (
                  <img
                    src={data.employee.avatarUrl}
                    alt={data.employee.fullName}
                    className="h-24 w-24 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full bg-zinc-900 text-2xl font-semibold text-white">
                    {getInitials(data.employee.fullName)}
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-2xl font-semibold text-zinc-950">{data.employee.fullName}</h2>
                    <StatusBadge status={data.employee.status} />
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">
                    {data.employee.position} · {data.employee.email}
                  </p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-lg bg-zinc-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        <CalendarDays size={14} />
                        Join date
                      </div>
                      <p className="mt-2 text-sm font-medium text-zinc-950">
                        {formatDate(data.employee.joinDate)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        <Landmark size={14} />
                        Salary
                      </div>
                      <p className="mt-2 text-sm font-medium text-zinc-950">
                        {formatCurrency(data.employee.monthlySalary)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        <BriefcaseBusiness size={14} />
                        Phone
                      </div>
                      <p className="mt-2 text-sm font-medium text-zinc-950">{data.employee.phone}</p>
                    </div>
                    <div className="rounded-lg bg-zinc-50 p-3">
                      <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                        <Clock3 size={14} />
                        Employee ID
                      </div>
                      <p className="mt-2 truncate text-sm font-medium text-zinc-950">{data.employee.id}</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <h3 className="text-base font-semibold text-zinc-950">Attendance history</h3>
              {data.attendanceHistory.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3">Check in</th>
                        <th className="px-4 py-3">Check out</th>
                        <th className="px-4 py-3">Hours</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.attendanceHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3">{formatDate(entry.date)}</td>
                          <td className="px-4 py-3 text-zinc-700">{entry.checkInTime ?? '—'}</td>
                          <td className="px-4 py-3 text-zinc-700">{entry.checkOutTime ?? '—'}</td>
                          <td className="px-4 py-3 text-zinc-700">{entry.workingHours.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={entry.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">No attendance records found.</p>
              )}
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <h3 className="text-base font-semibold text-zinc-950">Leave history</h3>
              {data.leaveHistory.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Type</th>
                        <th className="px-4 py-3">Start</th>
                        <th className="px-4 py-3">End</th>
                        <th className="px-4 py-3">Reason</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.leaveHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3 text-zinc-700">{entry.leaveType}</td>
                          <td className="px-4 py-3 text-zinc-700">{formatDate(entry.startDate)}</td>
                          <td className="px-4 py-3 text-zinc-700">{formatDate(entry.endDate)}</td>
                          <td className="px-4 py-3 text-zinc-700">{entry.reason}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={entry.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">No leave records found.</p>
              )}
            </section>

            <section className="rounded-lg border border-zinc-200 bg-white p-5">
              <h3 className="text-base font-semibold text-zinc-950">Salary information</h3>
              {data.salaryHistory.length ? (
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-zinc-200 text-sm">
                    <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                      <tr>
                        <th className="px-4 py-3">Month</th>
                        <th className="px-4 py-3">Salary</th>
                        <th className="px-4 py-3">Payment date</th>
                        <th className="px-4 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.salaryHistory.map((entry) => (
                        <tr key={entry.id}>
                          <td className="px-4 py-3 text-zinc-700">{entry.paymentMonth}</td>
                          <td className="px-4 py-3 text-zinc-700">{formatCurrency(entry.monthlySalary)}</td>
                          <td className="px-4 py-3 text-zinc-700">{entry.paymentDate ? formatDate(entry.paymentDate) : '—'}</td>
                          <td className="px-4 py-3">
                            <StatusBadge status={entry.paymentStatus} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">No salary records found.</p>
              )}
            </section>
          </div>
        ) : null}
      </DataState>
    </>
  );
}
