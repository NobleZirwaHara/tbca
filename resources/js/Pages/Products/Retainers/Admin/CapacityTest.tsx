import { useState, type FormEvent } from 'react';
import { router, useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Clock, Download, Minus, Play, Plus, RotateCcw, Save, Shield, Trash2, XCircle } from 'lucide-react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Input, Select } from '@/Components/ui/Form';
import { ActionButton, LabelValues, Notice } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import type { RetRetainer } from '@/Components/Products/Retainers/types';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { C, StackedBar, fmtDate, fmtDateTime, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Scn {
    id: number;
    name: string;
    type: string;
    allowance_qty: number;
    monthly_fee_zar: number;
    result: string;
    classification: string;
    detail: { forecast?: number; available?: number; utilisation?: number; label?: string; hint?: string; floor?: number; headroom?: number } | null;
    run_by?: string;
    starts_on: string;
    created_at?: string;
}

interface Props {
    retainer: RetRetainer;
    options: { value: string; label: string }[];
    baseline: { allowance: number; used: number; util: number; forecast_end: number; forecast_pct: number; grade: [string, string, string]; basis: number; forecast: number };
    demand: { category: string; hours: number }[];
    scenarios: Scn[];
    latest: Scn | null;
    services: { id: number; code: string; name: string; certification: string; price_zar: number; floor_zar: number; custom: boolean; test: { key: string; label: string; pass: boolean; detail: string; fail: string }[]; floor: { variance: number; pct: number; level: string; blocked: boolean }; state: string }[];
    next_start: string;
}

const RESULT_TONE: Record<string, 'good' | 'bad' | 'warn'> = { capacity_available: 'good', capacity_hold: 'bad', below_floor: 'warn' };

export default function CapacityTest({ retainer: r, options, baseline: b, demand, scenarios, latest, services, next_start }: Props) {
    const form = useForm({ retainer: r.code, name: '', type: 'Resize Allowance', allowance: String(Math.max(r.allowance_qty + 10, 5)), fee: String(Math.round(b.basis * (r.allowance_qty + 10))), starts_on: next_start });
    const [svcFilter, setSvcFilter] = useState('');
    const err = form.errors as Record<string, string>;
    const setAllowance = (v: number) => {
        const a = Math.max(1, v);
        form.setData((d) => ({ ...d, allowance: String(a), fee: String(Math.round(b.basis * a)) }));
    };
    const run = (e: FormEvent) => {
        e.preventDefault();
        form.post('/admin/products/retainers/capacity-test/scenario', { preserveScroll: true });
    };
    const d = latest?.detail ?? {};
    const totalDemand = demand.reduce((s, x) => s + x.hours, 0);
    const visible = services.filter((s) => !svcFilter || s.certification === svcFilter);

    return (
        <AdminShell title="Capacity Test Workbench" description="Simulate proposed changes to allowance, scope, team or period to test capacity and impact before approval — and certify Retainer products against C1–C5." selector={{ value: r.code, options, path: '/admin/products/retainers/capacity-test' }}>
            <form onSubmit={run} className="mb-5 grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 xl:grid-cols-[1fr_1fr_170px_1fr_1fr_auto]" noValidate>
                <label className="text-xs font-medium text-ink-600">Test Scenario Name (optional)<Input className="mt-1" placeholder="e.g. Increase allowance to 30h" value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></label>
                <label className="text-xs font-medium text-ink-600">Scenario Type<Select className="mt-1" value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={['Resize Allowance', 'Change Scope', 'Change Team', 'Change Period']} /></label>
                <div className="text-xs font-medium text-ink-600">
                    Proposed Allowance
                    <div className="mt-1 flex items-center gap-1">
                        <button type="button" aria-label="Decrease" onClick={() => setAllowance(Number(form.data.allowance) - 1)} className="flex size-10 items-center justify-center rounded border border-parchment-500"><Minus className="size-4" /></button>
                        <Input aria-label="Proposed allowance" type="number" value={form.data.allowance} onChange={(e) => setAllowance(Number(e.target.value))} className="text-center" />
                        <button type="button" aria-label="Increase" onClick={() => setAllowance(Number(form.data.allowance) + 1)} className="flex size-10 items-center justify-center rounded border border-parchment-500"><Plus className="size-4" /></button>
                    </div>
                    <span className="text-[0.6875rem] text-ink-400">hours / month</span>
                </div>
                <label className="text-xs font-medium text-ink-600">Proposed Monthly Fee (excl. VAT)<Input className="mt-1" type="number" value={form.data.fee} onChange={(e) => form.setData('fee', e.target.value)} /><span className="text-[0.6875rem] text-ink-400">Basis {zar(b.basis)} / hour</span></label>
                <label className="text-xs font-medium text-ink-600">Proposed Start Date<Input className="mt-1" type="date" value={form.data.starts_on} onChange={(e) => form.setData('starts_on', e.target.value)} /></label>
                <div className="flex flex-col gap-2 self-end">
                    <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center justify-center gap-2 rounded-[4px] bg-referenced-700 px-4 text-sm font-semibold text-white disabled:opacity-60"><Play className="size-4" aria-hidden="true" />Run Capacity Test</button>
                    <button type="button" onClick={() => form.reset()} className="inline-flex h-9 items-center justify-center gap-1 rounded-[4px] border border-parchment-500 text-xs"><RotateCcw className="size-3.5" aria-hidden="true" />Reset</button>
                </div>
                {Object.values(err).length > 0 && <p role="alert" className="text-xs text-risk-500 sm:col-span-2 xl:col-span-6">{Object.values(err).join(' ')}</p>}
            </form>

            <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <div className="min-w-0 space-y-5">
                    <Panel title="1. Capacity Test Results">
                        {!latest ? (
                            <p className="text-sm text-ink-400">Run a scenario to see the impact on capacity and demand.</p>
                        ) : (
                            <>
                                <div className={cn('grid items-center gap-4 rounded-[8px] border p-4 md:grid-cols-[1.4fr_1fr_1fr]', latest.result === 'capacity_available' ? 'border-verified-500/40 bg-verified-50' : latest.result === 'below_floor' ? 'border-attested-500/40 bg-attested-50' : 'border-risk-500/40 bg-risk-50')}>
                                    <div className="flex items-center gap-3">
                                        {latest.result === 'capacity_available' ? <CheckCircle2 className="size-8 text-verified-500" aria-hidden="true" /> : <XCircle className="size-8 text-risk-500" aria-hidden="true" />}
                                        <div>
                                            <p className="text-lg font-bold text-ink-900">{latest.result === 'capacity_available' ? 'Capacity Available' : latest.result === 'below_floor' ? 'Below Price Floor' : 'Capacity Hold'}</p>
                                            <p className="text-xs text-ink-600">{latest.result === 'capacity_available' ? 'The proposed scenario is within available capacity.' : latest.result === 'below_floor' ? `Proposed fee is below the approved floor of ${zar(d.floor ?? 0)}.` : `Exact-pool headroom (${hrs(d.headroom ?? 0)}h) cannot support ${hrs(latest.allowance_qty)}h.`}</p>
                                        </div>
                                    </div>
                                    <div className="text-xs"><p className="text-ink-500">Available Capacity</p><p className="text-lg font-bold">{hrs(d.available ?? 0)} hours / month</p><p className="text-ink-500">({latest.allowance_qty ? Math.round(((d.available ?? 0) / latest.allowance_qty) * 100) : 0}% headroom)</p></div>
                                    <div className="text-xs"><p className="text-ink-500">Utilisation (Scenario)</p><p className="text-lg font-bold">{Math.round(d.utilisation ?? 0)}%</p><p className="text-ink-500">{hrs(d.forecast ?? 0)} of {hrs(latest.allowance_qty)} hours</p></div>
                                </div>
                                <div className="mt-4 grid gap-5 md:grid-cols-[1fr_220px]">
                                    <div>
                                        <p className="mb-2 text-xs font-semibold text-ink-800">Capacity Breakdown (Scenario)</p>
                                        <StackedBar parts={[{ value: d.forecast ?? 0, color: C.blue, label: `Forecasted Usage (${hrs(d.forecast ?? 0)}h)` }, { value: 0, color: C.amber, label: 'Other Commitments (0.0h)' }, { value: Math.max(0, d.available ?? 0), color: C.grey, label: `Available Capacity (${hrs(d.available ?? 0)}h)` }]} />
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <Shield className="size-10 text-verified-500" aria-hidden="true" />
                                        <div><p className="text-xs text-ink-500">Capacity Classification</p><p className="text-2xl font-bold text-verified-700">{latest.classification}</p><p className="text-xs font-semibold">{d.label}</p><p className="text-[0.6875rem] text-ink-500">{d.hint}</p></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </Panel>

                    <div className="grid gap-5 lg:grid-cols-[1.4fr_1fr]">
                        <Panel title="3. Forecasted Demand (Scenario)">
                            <SimpleTable
                                columns={['Service / Activity Category', 'Forecasted Hours', '% of Allowance', 'Notes']}
                                rows={[
                                    ...demand.map((x) => [x.category, hrs(x.hours), `${Number(form.data.allowance) ? Math.round((x.hours / Number(form.data.allowance)) * 100) : 0}%`, 'Based on last 3 months average']),
                                    [<strong key="t">Total Forecasted Usage</strong>, <strong key="h">{hrs(totalDemand)}</strong>, <strong key="p">{Number(form.data.allowance) ? Math.round((totalDemand / Number(form.data.allowance)) * 100) : 0}%</strong>, ''],
                                ]}
                            />
                        </Panel>
                        <Panel title="4. Impact Indicators">
                            {latest ? (
                                <ul className="space-y-3 text-xs">
                                    {[
                                        [(d.forecast ?? 0) <= latest.allowance_qty, (d.forecast ?? 0) <= latest.allowance_qty ? 'No overage expected' : 'Overage likely', 'Usage within allowance'],
                                        [latest.monthly_fee_zar >= (d.floor ?? 0), latest.monthly_fee_zar >= (d.floor ?? 0) ? 'Fee sufficient' : 'Fee below floor', `Floor ${zar(d.floor ?? 0)}`],
                                        [latest.result !== 'capacity_hold', latest.result !== 'capacity_hold' ? 'Capacity available' : 'Capacity hold', `${hrs(d.headroom ?? 0)} hours pool headroom`],
                                        [false, 'Review in 60 days', 'Reassess usage trend'],
                                    ].map(([ok, t, s2], i) => (
                                        <li key={i} className="flex items-start gap-2">{ok ? <CheckCircle2 className="size-5 text-verified-500" aria-hidden="true" /> : <AlertCircle className="size-5 text-attested-500" aria-hidden="true" />}<span><span className="block font-semibold text-ink-900">{t as string}</span><span className="text-ink-500">{s2 as string}</span></span></li>
                                    ))}
                                </ul>
                            ) : <p className="text-xs text-ink-400">No scenario yet.</p>}
                        </Panel>
                    </div>

                    <Panel title="6. Recent Scenarios">
                        <SimpleTable
                            columns={['Scenario Name', 'Type', 'Allowance', 'Monthly Fee (excl. VAT)', 'Start Date', 'Result', 'Run By', 'Run On', 'Actions']}
                            rows={scenarios.map((s) => [s.name, s.type, `${hrs(s.allowance_qty)} h`, zar(s.monthly_fee_zar), fmtDate(s.starts_on), <StatusPill key="r" status={s.result} tone={RESULT_TONE[s.result]} />, s.run_by, fmtDateTime(s.created_at), <button key="d" type="button" aria-label="Delete scenario" onClick={() => router.delete(`/admin/products/retainers/capacity-test/scenario/${s.id}`, { preserveScroll: true })} className="text-ink-500 hover:text-risk-500"><Trash2 className="size-4" /></button>])}
                            empty="No scenarios saved yet."
                        />
                    </Panel>
                </div>

                <div className="space-y-4">
                    <Panel title="2. Scenario Summary">
                        {latest ? (
                            <LabelValues rows={[
                                { label: 'Current Allowance', value: `${hrs(r.allowance_qty)} hours / month` },
                                { label: 'Proposed Allowance', value: `${hrs(latest.allowance_qty)} hours / month` },
                                { label: 'Change', value: <span className="text-verified-700">{latest.allowance_qty - r.allowance_qty >= 0 ? '+' : ''}{hrs(latest.allowance_qty - r.allowance_qty)} hours ({Math.round(((latest.allowance_qty - r.allowance_qty) / r.allowance_qty) * 100)}%)</span> },
                                { label: 'Current Monthly Fee (excl. VAT)', value: zar(r.monthly_fee_zar) },
                                { label: 'Proposed Monthly Fee (excl. VAT)', value: zar(latest.monthly_fee_zar) },
                                { label: 'Change', value: <span className="text-verified-700">{latest.monthly_fee_zar - r.monthly_fee_zar >= 0 ? '+' : ''}{zar(latest.monthly_fee_zar - r.monthly_fee_zar)}</span> },
                                { label: 'Forecasted Usage', value: `${hrs(d.forecast ?? 0)} hours (${Math.round(d.utilisation ?? 0)}%)` },
                                { label: 'Estimated Overage', value: `${hrs(Math.max(0, (d.forecast ?? 0) - latest.allowance_qty))} hours` },
                                { label: 'Start', value: fmtDate(latest.starts_on) },
                            ]} />
                        ) : <p className="text-xs text-ink-400">Run a scenario.</p>}
                    </Panel>
                    <Panel title="5. Current Capacity Position (Baseline)">
                        <LabelValues rows={[
                            { label: 'Current Allowance', value: `${hrs(b.allowance)} hours / month` },
                            { label: 'Used to Date', value: `${hrs(b.used)} hours (${Math.round(b.util)}%)` },
                            { label: 'Forecast to Period End', value: `${hrs(b.forecast_end)} hours (${b.forecast_pct}%)` },
                            { label: 'Estimated Overage', value: `${hrs(Math.max(0, b.forecast_end - b.allowance))} hours` },
                            { label: 'Current Classification', value: <span className="rounded-full bg-attested-50 px-2 py-0.5 font-semibold text-attested-700">{b.grade[0]} {b.grade[1]}</span> },
                        ]} />
                    </Panel>
                    <Notice tone="info" title="About Capacity Testing">This workbench helps you model changes. Final approval is subject to team availability, governance checks and client agreement. Scenarios never change a live Retainer.</Notice>
                </div>
            </div>

            <Panel title="Product Certification — GATE-RE-01 (C1–C5 + floor)" className="mt-5" action={<Select aria-label="Filter certification" className="w-40" value={svcFilter} onChange={(e) => setSvcFilter(e.target.value)} options={[{ value: '', label: 'All products' }, { value: 'certified', label: 'Certified' }, { value: 'draft', label: 'Draft' }, { value: 'rejected', label: 'Rejected' }]} />}>
                <SimpleTable
                    columns={['Product', 'C1', 'C2', 'C3', 'C4', 'C5', 'Floor', 'Sale state', 'Status', 'Decision']}
                    rows={visible.map((s) => [
                        <span key="n"><span className="block font-semibold text-ink-900">{s.name}</span><span className="text-[0.6875rem] text-ink-400">{s.code} · {s.custom ? 'Custom' : zar(s.price_zar)}</span></span>,
                        ...s.test.map((t) => <span key={t.key} title={`${t.label}: ${t.detail}`}>{t.pass ? <CheckCircle2 className="size-4 text-verified-500" aria-label="pass" /> : <XCircle className="size-4 text-risk-500" aria-label={t.fail} />}</span>),
                        <StatusPill key="f" status={s.custom ? 'quote' : s.floor.level} tone={s.custom ? 'neutral' : s.floor.blocked ? 'bad' : 'good'} />,
                        <span key="st" className="text-[0.6875rem]">{s.state}</span>,
                        <StatusPill key="c" status={s.certification} />,
                        <span key="a" className="flex gap-1">
                            <ActionButton href={`/admin/products/retainers/capacity-test/services/${s.id}/certify`} data={{ decision: 'certify' }} tone="gold">Certify</ActionButton>
                            <ActionButton href={`/admin/products/retainers/capacity-test/services/${s.id}/certify`} data={{ decision: 'reject' }} tone="danger" confirm={`Reject ${s.name}? It will no longer accept proposals.`}>Reject</ActionButton>
                        </span>,
                    ])}
                />
            </Panel>

            <div className="mt-5 flex flex-wrap justify-end gap-2">
                <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Download className="size-4" aria-hidden="true" />Export Scenario Report (PDF)</button>
                <span className="inline-flex h-10 items-center gap-2 text-xs text-ink-500"><Save className="size-4" aria-hidden="true" />Scenarios are saved when run · <Clock className="size-3.5" aria-hidden="true" />Scenario is not yet active.</span>
            </div>
        </AdminShell>
    );
}

CapacityTest.layout = null;
