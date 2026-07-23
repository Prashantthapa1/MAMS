import { Building2, Save } from 'lucide-react';
import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api/client';
import type { Settings } from '../api/types';
import { DataState } from '../components/DataState';
import { Notice } from '../components/Notice';
import { PageHeader } from '../components/PageHeader';
import { useApiResource } from '../hooks/useApiResource';

const emptySettings: Settings = { companyName: '', companyAddress: '', currency: 'NPR' };

export function SettingsPage() {
  const { data, isLoading, error, reload } = useApiResource<Settings>('/settings');
  const [form, setForm] = useState<Settings>(emptySettings);
  const [message, setMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => { if (data) setForm(data); }, [data]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setMessage(null); setFormError(null); setIsSaving(true);
    try { await api.put('/settings', form); await reload(); setMessage('Company settings saved.'); }
    catch (saveError) { console.error(saveError); setFormError('Unable to save settings. Check all fields and try again.'); }
    finally { setIsSaving(false); }
  }

  return <>
    <PageHeader title="Settings" description="Manage the company details used throughout your workspace." />
    {message && <Notice tone="success">{message}</Notice>}
    {formError && <Notice tone="error">{formError}</Notice>}
    <DataState isLoading={isLoading} error={error} isEmpty={!data} emptyMessage="No settings found.">
      <section className="surface-card max-w-2xl overflow-hidden">
        <div className="table-toolbar"><div className="flex items-center gap-3"><span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-700"><Building2 size={20} /></span><div><h2 className="text-base font-semibold text-slate-950">Company profile</h2><p className="mt-1 text-sm text-slate-500">These details appear in branding and financial formatting.</p></div></div></div>
        <form className="space-y-5 p-5" onSubmit={save}>
          <label className="form-label">Company name<input className="form-input" value={form.companyName} onChange={(event) => setForm({ ...form, companyName: event.target.value })} required maxLength={160} /></label>
          <label className="form-label">Company address<textarea className="form-input min-h-28" value={form.companyAddress} onChange={(event) => setForm({ ...form, companyAddress: event.target.value })} required maxLength={500} rows={3} /></label>
          <label className="form-label">Currency code<input className="form-input uppercase" value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value.toUpperCase() })} required minLength={3} maxLength={8} /></label>
          <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end"><button className="button-primary inline-flex items-center justify-center gap-2" disabled={isSaving}><Save size={17} />{isSaving ? 'Saving…' : 'Save settings'}</button></div>
        </form>
      </section>
    </DataState>
  </>;
}
