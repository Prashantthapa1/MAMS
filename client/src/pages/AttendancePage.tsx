import type { Attendance } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatDate } from '../utils/format';

export function AttendancePage() {
  const { data, isLoading, error } = useApiResource<Attendance[]>('/attendance');

  return (
    <>
      <PageHeader title="Attendance" description="Track check in, check out, status, and working hours." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No attendance records found.">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Check In</th>
                  <th className="px-4 py-3">Check Out</th>
                  <th className="px-4 py-3">Hours</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {data?.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 font-medium text-zinc-950">{record.employeeName}</td>
                    <td className="px-4 py-3 text-zinc-700">{formatDate(record.date)}</td>
                    <td className="px-4 py-3 text-zinc-700">{record.checkInTime ?? '-'}</td>
                    <td className="px-4 py-3 text-zinc-700">{record.checkOutTime ?? '-'}</td>
                    <td className="px-4 py-3 text-zinc-700">{record.workingHours}</td>
                    <td className="px-4 py-3"><StatusBadge status={record.status} /></td>
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
