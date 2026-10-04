import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CirclePlus } from 'lucide-react';
import AdminShell, { Btn, Kpi, QueryTabs, SideCard, act } from '@/Components/Products/Digital/AdminShell';
import { FlowSteps, QueueFilters } from '@/Components/Products/Digital/Console';
import { CHART, DataTable, Donut, DpStatus, Pager, useQueryNav } from '@/Components/Products/Digital/Ui';
import type { DpPagination } from '@/Components/Products/Digital/types';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';

interface Incident {
    id: number;
    reference: string;
    product: string;
    version: string;
    summary: string;
    detail: string | null;
    severity: 'S1' | 'S2' | 'S3';
    type: string;
    detectedBy: string;
    detectedOn: string;
    status: string;
    containment: string;
    step: number;
    holders: number;
    downloads: number;
    assigned: string | null;
    containmentStarted: string | null;
    replacement: string | null;
}

interface Props {
    rows: Incident[];
    pagination: DpPagination;
    selected: Incident | null;
    kpis: { total: number; severity?: Record<string, number>; products: number; versions: number; holders: number; downloads: number; containment: number };
    tabs: { key: string; label: string; count: number }[];
    containment: { key: string; label: string; count: number }[];
    filters: Record<string, string> & { tab: string };
    products: { value: string; label: string }[];
}

const FLOW = [
    { title: 'Detect & Classify', body: 'Issue identified and severity set.' },
    { title: 'Contain', body: 'Stop sales and downloads.' },
    { title: 'Assess Impact', body: 'Identify versions, claims, holders.' },
    { title: 'Issue Correction', body: 'Create corrected version.' },
    { title: 'Notify Holders', body: 'Communicate and provide evidence.' },
    { title: 'Close & Monitor', body: 'Verify and close incident.' },
];
const NEXT: Record<number, { action: string; label: string }> = {
    1: { action: 'contain', label: 'Contain' },
    2: { action: 'assess', label: 'Assess Impact' },
    3: { action: 'correct', label: 'Issue Correction' },
    4: { action: 'notify', label: 'Notify Holders' },
    5: { action: 'close', label: 'Close Incident' },
};
const TYPES = ['Content Error', 'Calculation Error', 'Legal / Disclaimer', 'Typographical', 'Source Issue'];
const SEVERITY = { S1: 'Critical', S2: 'Major', S3: 'Minor' };

export default function Corrections({ rows, pagination, selected, kpis, tabs, containment, filters, products }: Props) {
    const base = '/admin/products/digital/corrections';
    const nav = useQueryNav(base, filters);
    const [reporting, setReporting] = useState(false);
    const [replacement, setReplacement] = useState('');
    const form = useForm({ product: products[0]?.value ?? '', summary: '', severity: 'S2', type: TYPES[0], detected_by: 'QA Review' });
    const sev = rows.reduce<Record<string, number>>((acc, r) => ({ ...acc, [r.severity]: (acc[r.severity] ?? 0) + 1 }), {});
    const severityCounts = kpis.severity ?? sev;

    const advance = (i: Incident) => {
        const step = NEXT[i.step];
        if (!step) return;
        if (step.action === 'correct') {
            act(`${base}/${i.id}/advance`, { action: 'correct', replacement });
            return;
        }
        act(`${base}/${i.id}/advance`, { action: step.action }, step.action === 'contain' && i.severity === 'S1' ? 'S1 containment withdraws the affected version (WITHDRAWN_UNSAFE) and stops sales and downloads. Continue?' : undefined);
    };

    return (
        <AdminShell
            title="Correction and Withdrawal Workbench"
            description="Identify, contain and remedy product defects. Protect holders and the public record."
            actions={
                <Btn tone="gold" onClick={() => setReporting(true)}>
                    <CirclePlus className="size-4" aria-hidden="true" /> Report New Issue
                </Btn>
            }
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <Kpi label="Total Incidents" value={kpis.total} caption="Open and closed" />
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3.5">
                    <p className="text-[0.6875rem] font-bold tracking-wide text-ink-600 uppercase">By Severity</p>
                    <ul className="mt-1 space-y-0.5 text-xs">
                        {(['S1', 'S2', 'S3'] as const).map((s) => (
                            <li key={s} className="flex justify-between">
                                <span>{s} {SEVERITY[s]}</span>
                                <span className="font-bold">{severityCounts[s] ?? 0}</span>
                            </li>
                        ))}
                    </ul>
                </div>
                <Kpi label="Affected Products" value={kpis.products} caption="Unique products" />
                <Kpi label="Holders Affected" value={kpis.holders.toLocaleString()} caption="Entitlements (open)" />
                <Kpi label="Known Downloaders" value={kpis.downloads.toLocaleString()} caption="Downloads (open)" />
                <Kpi label="In Containment (S1)" value={kpis.containment} tone="bad" caption="Immediate action" />
            </div>

            <QueueFilters
                base={base}
                filters={filters}
                placeholder="Search incidents, products, versions, claims..."
                selects={[
                    { key: 'severity', label: 'All Severities', options: Object.entries(SEVERITY).map(([k, v]) => ({ value: k, label: `${k} ${v}` })) },
                    { key: 'type', label: 'All Incident Types', options: TYPES.map((t) => ({ value: t, label: t })) },
                ]}
            />

            <div className="grid gap-4 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <QueryTabs value={filters.tab} onChange={(tab) => nav({ tab })} tabs={tabs} />
                        <div className="mt-3">
                            <DataTable
                                columns={['Incident ID', 'Product & Version', 'Issue Summary', 'Severity', 'Type', 'Detected By', 'Detected On', 'Status', 'Holders Affected', 'Downloads', 'Actions']}
                                rows={rows.map((i) => [
                                    <span className="font-mono text-[0.6875rem] font-semibold">{i.reference}</span>,
                                    <span>
                                        <span className="font-semibold text-ink-900">{i.product}</span>
                                        <span className="block text-ink-500">{i.version}</span>
                                    </span>,
                                    i.summary,
                                    <DpStatus status={`${i.severity} ${SEVERITY[i.severity]}`} className={i.severity === 'S1' ? 'border-risk-500/40 bg-risk-50 text-risk-700' : ''} />,
                                    i.type,
                                    i.detectedBy,
                                    i.detectedOn,
                                    <DpStatus status={i.status} />,
                                    i.holders.toLocaleString(),
                                    i.downloads.toLocaleString(),
                                    <Btn onClick={() => router.get(base, { ...filters, incident: i.reference }, { preserveScroll: true })}>View</Btn>,
                                ])}
                            />
                        </div>
                        <Pager pagination={pagination} />
                    </section>

                    {selected && (
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <h2 className="text-xs font-bold tracking-wide uppercase">
                                    Selected Incident Snapshot · {selected.reference} <DpStatus status={selected.status} className="ml-1" />
                                </h2>
                                {NEXT[selected.step] && selected.status !== 'resolved' && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        {NEXT[selected.step].action === 'correct' && (
                                            <label className="flex items-center gap-1 text-xs">
                                                <span>Replacement version</span>
                                                <input value={replacement} onChange={(e) => setReplacement(e.target.value)} placeholder="2.0.2" className="h-8 w-20 rounded border border-parchment-500 px-2 text-xs" />
                                            </label>
                                        )}
                                        <Btn tone="gold" onClick={() => advance(selected)}>
                                            Step {selected.step + 1}: {NEXT[selected.step].label}
                                        </Btn>
                                    </div>
                                )}
                            </div>
                            <dl className="mt-3 grid gap-2 text-xs sm:grid-cols-3">
                                {[
                                    ['Issue Summary', selected.detail ?? selected.summary],
                                    ['Product', selected.product],
                                    ['Version', selected.version],
                                    ['Detected On', selected.detectedOn],
                                    ['Detection Source', selected.detectedBy],
                                    ['Assigned To', selected.assigned ?? '—'],
                                    ['Containment Started', selected.containmentStarted ?? '—'],
                                    ['Affected Holders', selected.holders.toLocaleString()],
                                    ['Known Downloads', selected.downloads.toLocaleString()],
                                    ['Replacement Version', selected.replacement ?? '—'],
                                ].map(([k, v]) => (
                                    <div key={k}>
                                        <dt className="text-ink-500">{k}</dt>
                                        <dd className="font-medium text-ink-900">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                            <h3 className="mt-4 mb-2 text-xs font-bold tracking-wide uppercase">Containment and Remedy Flow ({selected.severity})</h3>
                            <FlowSteps steps={FLOW} active={selected.step} />
                        </section>
                    )}
                </div>

                <div className="space-y-4">
                    <SideCard title="Severity Classification">
                        <ul className="space-y-1.5 text-xs">
                            <li><span className="font-bold text-risk-700">S1 Critical</span> — Immediate containment required</li>
                            <li><span className="font-bold text-attested-700">S2 Major</span> — Prompt correction and notification</li>
                            <li><span className="font-bold text-controlled-700">S3 Minor</span> — Routine correction</li>
                        </ul>
                    </SideCard>
                    <SideCard title="Containment Status">
                        <Donut centre={containment.reduce((s, c) => s + c.count, 0)} caption="Incidents" size={110} segments={containment.map((c, i) => ({ label: c.label, value: c.count, color: [CHART[5], CHART[3], CHART[2], CHART[0]][i] }))} />
                    </SideCard>
                    <p className="rounded-[8px] border border-parchment-400 bg-white p-3 text-xs text-ink-600">
                        Corrected versions are created as new controlled versions and pass full creation QA. Silent overwrite of a released version is prohibited.
                    </p>
                </div>
            </div>

            <Modal
                open={reporting}
                onClose={() => setReporting(false)}
                title="Report New Issue"
                footer={
                    <Btn tone="gold" disabled={form.processing} onClick={() => form.post(base, { onSuccess: () => { setReporting(false); form.reset(); } })}>
                        Open Incident
                    </Btn>
                }
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Product" error={form.errors.product} required className="sm:col-span-2">
                        {(id) => <Select id={id} value={form.data.product} onChange={(e) => form.setData('product', e.target.value)} options={products} />}
                    </Field>
                    <Field label="Issue summary" error={form.errors.summary} required className="sm:col-span-2">
                        {(id) => <Input id={id} value={form.data.summary} onChange={(e) => form.setData('summary', e.target.value)} />}
                    </Field>
                    <Field label="Severity" error={form.errors.severity} required>
                        {(id) => <Select id={id} value={form.data.severity} onChange={(e) => form.setData('severity', e.target.value)} options={Object.entries(SEVERITY).map(([k, v]) => ({ value: k, label: `${k} ${v}` }))} />}
                    </Field>
                    <Field label="Type" error={form.errors.type} required>
                        {(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={TYPES} />}
                    </Field>
                    <Field label="Detected by" error={form.errors.detected_by} required>
                        {(id) => <Select id={id} value={form.data.detected_by} onChange={(e) => form.setData('detected_by', e.target.value)} options={['QA Review', 'Customer Report', 'Legal Review', 'QA Automation']} />}
                    </Field>
                </div>
            </Modal>
        </AdminShell>
    );
}

Corrections.layout = null;
