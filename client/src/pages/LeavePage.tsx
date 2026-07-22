import type { LeaveRequest } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { useApiResource } from '../hooks/useApiResource';
import { formatDate } from '../utils/format';

export function LeavePage() {
  const { data, isLoading, error } = useApiResource<LeaveRequest[]>('/leave');

  return (
    <>
      <PageHeader title="Leave" description="Submit, approve, and reject leave requests." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No leave requests found.">
        <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200 text-sm">
              <thead className="bg-zinc-50 text-left text-xs font-semibold uppercase text-zinc-500">
                <tr>
                  <th className="px-4 py-3">Employee</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Dates</th>
                  <th className="px-4 py-3">Reason</th>
                  <th className="px-4 py-3">Status</th>
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
                    <td className="px-4 py-3"><StatusBadge status={request.status} /></td>
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
