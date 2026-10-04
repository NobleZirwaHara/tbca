import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Input, Select } from '@/Components/ui/Form';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Advisory/shells';
import { Stat } from '@/Components/Advisory/ui';
import type { MandateView } from '@/types/advisory';

interface Props {
    mandates: (MandateView & { created: string })[];
    filters: { status: string | null; q: string };
    statusCounts: Record<string, number>;
    funnel: { code: string; label: string; count: number }[];
    blocks: number;
}

export default function Mandates({ mandates, filters, statusCounts, funnel, blocks }: Props) {
    const [q, setQ] = useState(filters.q);
    const go = (patch: Record<string, string>) => router.get('/admin/advisory', { ...filters, ...patch }, { preserveState: true, preserveScroll: true });
    const max = Math.max(1, ...funnel.map((f) => f.count));
    return (
        <AdminShell title="Project Advisory Control Tower" description="A0–A17 funnel, G0–G10 gates, qualification and Stop-Now governance across all mandates.">
            <Head title="Project Advisory Control Tower" />
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-6">
                <Stat label="Total mandates" value={Object.values(statusCounts).reduce((a, b) => a + b, 0)} />
                <Stat label="Awaiting qualification" value={statusCounts.enquiry ?? 0} tone="warn" />
                <Stat label="Method card pending" value={statusCounts.method_card ?? 0} />
                <Stat label="Letters / deposit" value={statusCounts.letter ?? 0} />
                <Stat label="Active" value={statusCounts.active ?? 0} tone="good" />
                <Stat label="Stop-Now blocks" value={blocks} tone={blocks ? 'bad' : 'good'} />
            </div>
            <section className="mt-4 rounded-[8px] border border-parchment-400 bg-white p-4">
                <h2 className="text-sm font-semibold">A0–A17 Funnel</h2>
                <div className="mt-3 flex items-end gap-1 overflow-x-auto">{funnel.map((f) => <div key={f.code} className="flex min-w-[48px] flex-1 flex-col items-center text-[0.625rem]"><span className="font-semibold">{f.count}</span><span className="w-full rounded-t bg-gold-500" style={{ height: `${8 + (f.count / max) * 60}px` }} /><span className="mt-1 font-bold">{f.code}</span><span className="text-center text-ink-500">{f.label}</span></div>)}</div>
            </section>
            <section className="mt-4 rounded-[8px] border border-parchment-400 bg-white p-4">
                <div className="mb-3 flex flex-wrap gap-2">
                    <form onSubmit={(e: FormEvent) => { e.preventDefault(); go({ q }); }}><label htmlFor="mq" className="sr-only">Search</label><Input id="mq" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search reference, project, organisation" className="w-72" /></form>
                    <Select aria-label="Status" value={filters.status ?? ''} onChange={(e) => go({ status: e.target.value })} placeholder="All statuses" options={['enquiry', 'qualified', 'discovery', 'method_card', 'letter', 'active', 'paused', 'stopped', 'declined']} className="w-44" />
                </div>
                <SimpleTable
                    columns={['Reference', 'Project', 'Organisation', 'Stage', 'Gate', 'Status', 'Signals', 'Next action', '']}
                    rows={mandates.map((m) => [<span className="font-mono text-xs">{m.reference}</span>, m.project, m.organisation, m.stage, m.pending_gate ? `${m.pending_gate} pending` : m.gate, <StatusPill status={m.status} />,
                        <span className="text-[0.6875rem]">{Object.entries(m.signals).map(([k, v]) => `${k.split(' ')[0]}: ${v}`).join(' · ')}</span>, <span className="text-xs">{m.next.label}</span>,
                        <Link href={`/admin/advisory/mandates/${m.reference}`} className="text-xs font-semibold text-gold-700 underline">Manage</Link>])}
                />
            </section>
        </AdminShell>
    );
}

Mandates.layout = null;
