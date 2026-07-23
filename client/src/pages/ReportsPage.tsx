import { useState } from 'react';
import { api } from '../api/client';
import type { ReportSummary } from '../api/types';
import { DataState } from '../components/DataState';
import { PageHeader } from '../components/PageHeader';
import { Notice } from '../components/Notice';
import { useApiResource } from '../hooks/useApiResource';

export function ReportsPage() {
  const { data, isLoading, error } = useApiResource<ReportSummary[]>('/reports');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [exporting, setExporting] = useState<string | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);

  async function exportCsv(type: string) {
    setExporting(type); setExportError(null);
    try {
      const response = await api.get(`/reports/${type}/export`, { params: { ...(from && { from }), ...(to && { to }) }, responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url; link.download = `${type}-report.csv`; link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error); setExportError('Unable to export the report. Check the date range and try again.');
    } finally { setExporting(null); }
  }

  return <>
    <PageHeader title="Reports" description="Export attendance, revenue, expense, profit, and salary records as CSV." />
    <section className="mb-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-wrap items-end gap-4"><label className="block"><span className="text-sm font-medium text-slate-700">From date</span><input className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-sm" type="date" value={from} onChange={(event) => setFrom(event.target.value)} /></label><label className="block"><span className="text-sm font-medium text-slate-700">To date</span><input className="mt-1 block rounded-md border border-slate-300 px-3 py-2 text-sm" type="date" value={to} onChange={(event) => setTo(event.target.value)} /></label><button type="button" className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50" onClick={() => { setFrom(''); setTo(''); }}>Clear dates</button></div>{exportError && <div className="mt-4"><Notice tone="error">{exportError}</Notice></div>}</section>
    <DataState isLoading={isLoading} error={error} isEmpty={!data?.length} emptyMessage="No reports available."><div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{data?.map((report) => <section key={report.id} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"><p className="font-medium text-slate-950">{report.name}</p><p className="mt-1 text-sm text-slate-500">{report.records} records ready for export.</p><button type="button" disabled={exporting !== null} className="mt-4 rounded-md bg-blue-700 px-3 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60" onClick={() => exportCsv(report.id)}>{exporting === report.id ? 'Exporting...' : 'Export CSV'}</button></section>)}</div></DataState>
  </>;
}
