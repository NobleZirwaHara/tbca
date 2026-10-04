import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import AdminShell from '@/Components/About/AdminShell';

interface Props {
    components: { id: number; name: string; status: string; uptime_30d: number | null; response_ms: number | null }[];
    incidents: { id: number; kind: string; title: string; status: string; impact: string; component: string | null; starts_at: string | null; resolved_at: string | null }[];
    statuses: string[];
}

const dt = (iso: string | null) => (iso ? new Date(iso).toLocaleString('en-ZA', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');

export default function Status({ components, incidents, statuses }: Props) {
    const form = useForm({ kind: 'incident', title: '', body: '', component_id: '', impact: 'minor', starts_at: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/about/status/incidents', { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return (
        <AdminShell crumb="System Status" title="System Status Console" lead="Measured status, honestly reported." description="Update component status and publish incidents, maintenance windows and notices to the public System Status page.">
            <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
                <div className="space-y-5">
                    <Panel title="Components">
                        <ul className="divide-y divide-parchment-300">
                            {components.map((c) => (
                                <li key={c.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-[0.8125rem]">
                                    <span className="font-medium text-ink-900">{c.name}<span className="ml-2 text-xs text-ink-500">{c.uptime_30d !== null ? `${Number(c.uptime_30d).toFixed(2)}%` : ''} · {c.response_ms ?? '—'} ms</span></span>
                                    <select aria-label={`Status for ${c.name}`} value={c.status} onChange={(e) => router.post(`/admin/about/status/components/${c.id}`, { status: e.target.value }, { preserveScroll: true })} className="h-8 rounded border border-parchment-400 bg-white px-1 text-xs">
                                        {statuses.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                                    </select>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                    <Panel title="Incidents, maintenance & notices">
                        <ul className="divide-y divide-parchment-300">
                            {incidents.length === 0 && <li className="py-4 text-sm text-ink-400">Nothing published.</li>}
                            {incidents.map((i) => (
                                <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-[0.8125rem]">
                                    <span>
                                        <span className="font-medium text-ink-900">{i.title}</span>
                                        <span className="block text-xs text-ink-500">{i.kind} · {i.component ?? 'Platform'} · {dt(i.starts_at)} → {dt(i.resolved_at)}</span>
                                    </span>
                                    <span className="flex items-center gap-2">
                                        <StatusPill status={i.status} />
                                        {!['resolved', 'completed'].includes(i.status) && <Button size="sm" variant="outline" onClick={() => router.post(`/admin/about/status/incidents/${i.id}/resolve`, {}, { preserveScroll: true })}>Resolve</Button>}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                </div>
                <Panel title="Publish a status entry">
                    <form onSubmit={submit} className="space-y-3">
                        <Field label="Type" required>{(id) => <Select id={id} options={[{ value: 'incident', label: 'Incident' }, { value: 'maintenance', label: 'Scheduled maintenance' }, { value: 'notice', label: 'Notice' }]} value={form.data.kind} onChange={(e) => form.setData('kind', e.target.value)} />}</Field>
                        <Field label="Title" required error={form.errors.title}>{(id) => <Input id={id} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} />}</Field>
                        <Field label="Component">{(id) => <Select id={id} placeholder="Platform-wide" options={components.map((c) => ({ value: String(c.id), label: c.name }))} value={form.data.component_id} onChange={(e) => form.setData('component_id', e.target.value)} />}</Field>
                        <Field label="Impact" required>{(id) => <Select id={id} options={['none', 'minor', 'major']} value={form.data.impact} onChange={(e) => form.setData('impact', e.target.value)} />}</Field>
                        <Field label="Starts at" hint="Defaults to now.">{(id) => <Input id={id} type="datetime-local" value={form.data.starts_at} onChange={(e) => form.setData('starts_at', e.target.value)} />}</Field>
                        <Field label="Details">{(id) => <Textarea id={id} rows={3} value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} />}</Field>
                        <Button type="submit" disabled={form.processing}>Publish</Button>
                        <p className="text-xs text-ink-500">Publishing an incident against a component marks it degraded (or major outage) until resolved.</p>
                    </form>
                </Panel>
            </div>
        </AdminShell>
    );
}
Status.layout = null;
