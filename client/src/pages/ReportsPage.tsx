import type { ReportSummary } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';

export function ReportsPage() {
  const { data, isLoading, error } = useApiResource<ReportSummary[]>('/reports');

  return (
    <>
      <PageHeader title="Reports" description="Generate attendance, revenue, expense, profit, and salary reports." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No reports available.">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.map((report) => (
            <section key={report.id} className="rounded-lg border border-zinc-200 bg-white p-4">
              <p className="font-medium text-zinc-950">{report.name}</p>
              <p className="mt-1 text-sm text-zinc-500">{report.records} records ready for export.</p>
              <button
                type="button"
                className="mt-4 rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 hover:bg-zinc-50"
              >
                Export CSV
              </button>
            </section>
          ))}
        </div>
      </DataState>
    </>
  );
}
