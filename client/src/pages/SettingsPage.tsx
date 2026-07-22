import type { Settings } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';

export function SettingsPage() {
  const { data, isLoading, error } = useApiResource<Settings>('/settings');

  return (
    <>
      <PageHeader title="Settings" description="Manage company name, address, and currency." />
      <DataState isLoading={isLoading} error={error} isEmpty={!data} emptyMessage="No settings found.">
        <section className="max-w-2xl rounded-lg border border-zinc-200 bg-white p-5">
          <dl className="divide-y divide-zinc-100 text-sm">
            <div className="grid gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-zinc-500">Company Name</dt>
              <dd className="text-zinc-950 sm:col-span-2">{data?.companyName}</dd>
            </div>
            <div className="grid gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-zinc-500">Company Address</dt>
              <dd className="text-zinc-950 sm:col-span-2">{data?.companyAddress}</dd>
            </div>
            <div className="grid gap-1 py-3 sm:grid-cols-3">
              <dt className="font-medium text-zinc-500">Currency</dt>
              <dd className="text-zinc-950 sm:col-span-2">{data?.currency}</dd>
            </div>
          </dl>
        </section>
      </DataState>
    </>
  );
}
