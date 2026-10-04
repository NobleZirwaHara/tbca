import { useState, type FormEvent } from 'react';
import { router, useForm } from '@inertiajs/react';
import { Check, Clock, Plus, Save, Scale, Star, Trash2, UserRound, Users, Gauge, Shield, Download } from 'lucide-react';
import { Panel, SimpleTable } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { CheckList, LabelValues } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import type { RetMeter, RetRetainer, RetUsage } from '@/Components/Products/Retainers/types';
import { AdminShell } from '@/Components/Products/Retainers/Shells';
import { StatTile, fmtDate, fmtDateTime, hrs } from '@/Components/Products/Retainers/ui';

interface Alloc {
    id?: number;
    adviser: string;
    role: string;
    allocation_pct: number;
    workload_pct: number;
    is_primary: boolean;
    available: boolean;
    note?: string | null;
}

interface Props {
    retainer: RetRetainer & { allocation_notes: string | null };
    options: { value: string; label: string }[];
    allocations: Alloc[];
    handovers: { from: string; to: string; date: string | null; reason: string }[];
    recent_usage: RetUsage[];
    meter: RetMeter;
}

const PATH = '/admin/products/retainers/allocation';

function loadTone(p: number) {
    return p > 90 ? 'bg-risk-500' : p >= 80 ? 'bg-attested-500' : 'bg-verified-500';
}

export default function Allocation({ retainer: r, options, allocations, handovers, recent_usage, meter }: Props) {
    const [rows, setRows] = useState<Alloc[]>(allocations);
    const [notes, setNotes] = useState(r.allocation_notes ?? '');
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);
    const usage = useForm({ retainer: r.code, activity: '', adviser: allocations[0]?.adviser ?? '', units: '1', category: 'Strategic Advisory', evidence_class: 'E2' });
    const uErr = usage.errors as Record<string, string>;

    const total = rows.reduce((s, x) => s + Number(x.allocation_pct || 0), 0);
    const allocated = (total / 100) * r.allowance_qty * (rows.filter((x) => x.available).reduce((s, x) => s + x.allocation_pct, 0) / Math.max(1, total));
    const avgLoad = rows.length ? Math.round(rows.reduce((s, x) => s + x.workload_pct, 0) / rows.length) : 0;
    const balanced = rows.every((x) => x.workload_pct <= 90);
    const rules = [
        { ok: rows.filter((x) => x.is_primary).length === 1, t: 'Minimum 1 primary owner required' },
        { ok: rows.filter((x) => x.available).length >= 2, t: 'At least 2 advisors must be available' },
        { ok: total === 100, t: 'Total allocation must equal 100%' },
        { ok: rows.every((x) => x.workload_pct <= 100), t: 'No advisor over 100% workload' },
    ];
    const update = (i: number, patch: Partial<Alloc>) => setRows(rows.map((x, j) => (j === i ? { ...x, ...patch } : patch.is_primary ? { ...x, is_primary: false } : x)));
    const save = () => {
        setSaving(true);
        router.post(PATH, { retainer: r.code, rows: rows.map((x) => ({ ...x })) as unknown as Record<string, string>[], notes } as never, { preserveScroll: true, onError: (e) => setErrors(e), onSuccess: () => setErrors({}), onFinish: () => setSaving(false) });
    };
    const rebalance = () => {
        const n = rows.length || 1;
        const base = Math.floor(100 / n);
        setRows(rows.map((x, i) => ({ ...x, allocation_pct: i === 0 ? 100 - base * (n - 1) : base })));
    };
    const logUsage = (e: FormEvent) => {
        e.preventDefault();
        usage.post(`${PATH}/usage`, { preserveScroll: true, onSuccess: () => usage.reset('activity') });
    };
    const owner = r.account_owner ?? {};
    const del = (owner.delegation ?? {}) as Record<string, string | boolean>;

    return (
        <AdminShell title="Allocation and Account Owner Console" description="Manage account ownership, advisor allocation, workload and availability for this retainer." selector={{ value: r.code, options, path: PATH }}>
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={UserRound} tone="purple" label="Account Owner" value={<span className="text-base">{owner.name ?? '—'}</span>} caption="Primary Owner" />
                <StatTile icon={Users} tone="good" label="Advisors Allocated" value={rows.length} caption={`of ${rows.filter((x) => x.available).length} available`} />
                <StatTile icon={Clock} tone="info" label="Allowance" value={hrs(r.allowance_qty)} unit="hours / month" />
                <StatTile icon={Gauge} tone="gold" label="Allocated Capacity" value={hrs(allocated)} unit={`hours (${r.allowance_qty ? Math.round((allocated / r.allowance_qty) * 100) : 0}%)`} />
                <StatTile icon={Shield} tone="good" label="Available Capacity" value={hrs(Math.max(0, r.allowance_qty - allocated))} unit="hours" />
                <StatTile icon={Scale} tone="purple" label="Workload Balance" value={<span className="text-base">{balanced ? 'Balanced' : 'Unbalanced'}</span>} caption="Across team" />
            </div>

            <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_340px]">
                <div className="min-w-0 space-y-5">
                    <Panel title="1. Account and Ownership">
                        <div className="grid gap-4 md:grid-cols-3">
                            <LabelValues rows={[{ label: 'Retainer', value: r.name }, { label: 'Retainer Code', value: r.code }, { label: 'Client', value: r.client_name }, { label: 'Start Date', value: fmtDate(r.start_date) }, { label: 'Period End', value: fmtDate(r.period?.ends_on) }]} />
                            <LabelValues rows={[{ label: 'Account Owner', value: owner.name ?? '—' }, { label: 'Role', value: owner.role ?? '—' }, { label: 'Email', value: owner.email ?? '—' }, { label: 'Phone', value: owner.phone ?? '—' }, { label: 'Since', value: fmtDate(owner.since) }]} />
                            <div className="rounded-[6px] border border-parchment-300 p-3">
                                <p className="text-xs font-semibold text-ink-800">Ownership Delegation</p>
                                <LabelValues rows={[
                                    { label: 'Delegation Scope', value: String(del.scope ?? 'Standard') },
                                    { label: 'Can Approve Overage', value: del.overage ? <Check className="ml-auto size-4 text-verified-500" aria-label="yes" /> : '—' },
                                    { label: 'Can Approve Scope Change', value: del.scope_change ? <Check className="ml-auto size-4 text-verified-500" aria-label="yes" /> : '—' },
                                    { label: 'Can Authorise Substitution', value: del.substitution ? <Check className="ml-auto size-4 text-verified-500" aria-label="yes" /> : '—' },
                                    { label: 'Delegated By', value: String(del.by ?? '—') },
                                ]} />
                            </div>
                        </div>
                    </Panel>

                    <Panel title="2. Advisor Allocation">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[760px] text-left text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs font-semibold text-ink-600">
                                    <tr>{['#', 'Advisor', 'Role on Retainer', 'Allocation %', 'Allocated Hours / Month', 'Current Workload', 'Available', 'Primary', ''].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300">
                                    {rows.map((x, i) => (
                                        <tr key={x.id ?? `n${i}`}>
                                            <td className="px-2 py-2">{i + 1}</td>
                                            <td className="px-2 py-2"><Input aria-label="Advisor" value={x.adviser} onChange={(e) => update(i, { adviser: e.target.value })} className="h-8" /></td>
                                            <td className="px-2 py-2"><Input aria-label="Role" value={x.role} onChange={(e) => update(i, { role: e.target.value })} className="h-8" /></td>
                                            <td className="px-2 py-2"><Input aria-label="Allocation percent" type="number" value={x.allocation_pct} onChange={(e) => update(i, { allocation_pct: Number(e.target.value) })} className="h-8 w-20" /></td>
                                            <td className="px-2 py-2">{hrs((x.allocation_pct / 100) * r.allowance_qty)} h</td>
                                            <td className="px-2 py-2"><span className={cn('rounded-full px-2 py-0.5 text-xs font-semibold text-white', loadTone(x.workload_pct))}>{x.workload_pct}%</span></td>
                                            <td className="px-2 py-2"><input type="checkbox" aria-label="Available" checked={x.available} onChange={(e) => update(i, { available: e.target.checked })} className="accent-referenced-700" /></td>
                                            <td className="px-2 py-2"><button type="button" aria-label="Make primary owner" onClick={() => update(i, { is_primary: true })}><Star className={cn('size-5', x.is_primary ? 'fill-referenced-700 text-referenced-700' : 'text-ink-300')} /></button></td>
                                            <td className="px-2 py-2"><button type="button" aria-label="Remove advisor" onClick={() => setRows(rows.filter((_, j) => j !== i))} className="text-ink-400 hover:text-risk-500"><Trash2 className="size-4" /></button></td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot><tr className="font-semibold"><td colSpan={3} className="px-2 py-2"><button type="button" onClick={() => setRows([...rows, { adviser: '', role: 'Support Advisor', allocation_pct: 0, workload_pct: 50, is_primary: false, available: true }])} className="inline-flex h-8 items-center gap-1 rounded bg-referenced-700 px-3 text-xs text-white"><Plus className="size-3.5" aria-hidden="true" />Add Advisor</button></td><td className={cn('px-2 py-2', total !== 100 && 'text-risk-700')}>Total {total}%</td><td className="px-2 py-2">{hrs((total / 100) * r.allowance_qty)} h</td><td colSpan={4} /></tr></tfoot>
                            </table>
                        </div>
                        {errors.allocations && <p role="alert" className="mt-2 text-xs text-risk-500">{errors.allocations}</p>}
                    </Panel>

                    <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
                        <Panel title="3. Workload and Availability Overview">
                            <ul className="space-y-3 text-xs">
                                {rows.map((x, i) => (
                                    <li key={i} className="grid grid-cols-[90px_1fr_40px_1fr] items-center gap-2">
                                        <span className="truncate">{x.adviser || 'New advisor'}</span>
                                        <span className="h-2 rounded-full bg-parchment-300"><span className={cn('block h-full rounded-full', loadTone(x.workload_pct))} style={{ width: `${Math.min(100, x.workload_pct)}%` }} /></span>
                                        <span className="font-semibold">{x.workload_pct}%</span>
                                        <span className="text-ink-500">{x.workload_pct > 90 ? 'At capacity' : x.workload_pct >= 80 ? 'High workload' : 'Good capacity'}</span>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                        <Panel title="4. Allocation Rules">
                            <ul className="space-y-2 text-xs">{rules.map((x) => <li key={x.t} className={cn('flex gap-2', x.ok ? 'text-ink-700' : 'font-semibold text-risk-700')}><Check className={cn('size-4', x.ok ? 'text-verified-500' : 'text-risk-500')} aria-hidden="true" />{x.t}</li>)}</ul>
                        </Panel>
                    </div>

                    <Panel title="Log Adviser Time (posts to the client-visible ledger)">
                        <form onSubmit={logUsage} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[2fr_1fr_100px_1fr_100px_auto]" noValidate>
                            <Field label="Activity" error={uErr.activity}>{(id) => <Input id={id} value={usage.data.activity} onChange={(e) => usage.setData('activity', e.target.value)} placeholder="e.g. Strategy session" />}</Field>
                            <Field label="Adviser">{(id) => <Select id={id} value={usage.data.adviser} onChange={(e) => usage.setData('adviser', e.target.value)} options={rows.map((x) => x.adviser).filter(Boolean)} />}</Field>
                            <Field label="Hours" error={uErr.units}>{(id) => <Input id={id} type="number" step={0.25} value={usage.data.units} onChange={(e) => usage.setData('units', e.target.value)} />}</Field>
                            <Field label="Category">{(id) => <Select id={id} value={usage.data.category} onChange={(e) => usage.setData('category', e.target.value)} options={['Strategic Advisory', 'Project Support', 'Research & Analysis', 'Meetings & Reviews', 'Other']} />}</Field>
                            <Field label="Evidence">{(id) => <Select id={id} value={usage.data.evidence_class} onChange={(e) => usage.setData('evidence_class', e.target.value)} options={['E1', 'E2', 'E3', 'E4']} />}</Field>
                            <button type="submit" disabled={usage.processing} className="h-10 self-end rounded bg-referenced-700 px-4 text-sm font-semibold text-white disabled:opacity-60">Post</button>
                        </form>
                        <p className="mt-2 text-xs text-ink-500">Remaining {hrs(meter.remaining)}h · State {meter.state}. Beyond the allowance, posting is WORK LOCKED unless the client has given prior overage authority.</p>
                        <SimpleTable className="mt-3" columns={['When', 'Activity', 'Adviser', 'Hours', 'Effect']} rows={recent_usage.map((u) => [fmtDateTime(u.occurred_at), u.activity, u.adviser, hrs(u.units, 2), u.billing_effect])} />
                    </Panel>
                </div>

                <div className="space-y-4">
                    <Panel title="5. Ownership Handover History">
                        <SimpleTable columns={['From', 'To', 'Date', 'Reason']} rows={handovers.map((h) => [h.from, h.to, fmtDate(h.date), h.reason])} />
                    </Panel>
                    <Panel title="6. Team Summary">
                        <LabelValues rows={[{ label: 'Total Advisors on Retainer', value: rows.length }, { label: 'Available', value: rows.filter((x) => x.available).length }, { label: 'Limited Availability', value: rows.filter((x) => !x.available || x.workload_pct > 90).length }, { label: 'Primary Owner', value: rows.find((x) => x.is_primary)?.adviser ?? '—' }, { label: 'Avg. Workload', value: `${avgLoad}%` }]} />
                    </Panel>
                    <Panel title="7. Allocation Notes">
                        <label htmlFor="alloc-notes" className="sr-only">Allocation notes</label>
                        <Textarea id="alloc-notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={5} />
                    </Panel>
                    <CheckList items={['Every change is audit-tracked', 'Primary owner change records a handover event']} />
                </div>
            </div>

            <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-parchment-400 pt-4">
                <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-parchment-500 px-4 text-sm"><Download className="size-4" aria-hidden="true" />Export Allocation Report</button>
                <button type="button" onClick={rebalance} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Scale className="size-4" aria-hidden="true" />Rebalance Workload</button>
                <button type="button" disabled={saving} onClick={save} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-referenced-700 px-6 text-sm font-semibold text-white disabled:opacity-60"><Save className="size-4" aria-hidden="true" />Confirm Allocation</button>
            </div>
        </AdminShell>
    );
}

Allocation.layout = null;
