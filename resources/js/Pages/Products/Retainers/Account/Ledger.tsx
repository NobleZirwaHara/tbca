import { Link } from '@inertiajs/react';
import { ArrowDown, ArrowRight, ArrowUp, CalendarDays, Clock, Download, Eye, FileEdit, FileText, Info, TrendingUp, Users } from 'lucide-react';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import type { RetContext, RetPeriod, RetUsage } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { MiniSelect, Pagination, StatTile, applyFilters, fmtDate, fmtDateTime, hrs } from '@/Components/Products/Retainers/ui';

interface Props extends RetContext {
    entries: RetUsage[];
    pagination: { page: number; per: number; total: number };
    filters: { adviser: string; category: string; status: string; sort: string };
    options: { advisers: string[]; categories: string[]; periods: { id: number; label: string }[] };
    selected_period: RetPeriod | null;
    totals: { entries: number; advisers: number; to_date: number; to_date_pct: number };
}

const EFFECT: Record<string, string> = { INCLUDED: 'Monthly Allowance', OVERAGE_APPROVED: 'Approved Overage', NO_CHARGE: 'No Charge', CREDIT: 'Credited' };

export default function Ledger(props: Props) {
    const { retainer: r, meter: m, entries, filters, options, selected_period: sp, totals, pagination } = props;
    const base = `/retainers/account/${r.code}`;
    const path = `${base}/ledger`;
    const params = { period: sp?.id ?? '', ...filters };
    const set = (k: string, v: string) => applyFilters(path, { ...params, [k]: v, page: 1 });

    return (
        <AccountShell ctx={props} title="Itemised Usage Ledger" description="Evidence of every allowance item used under your Retainer.">
            <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <StatTile icon={Clock} tone="info" label="Total Used This Month" value={hrs(m.confirmed)} unit="Hours" caption={`${Math.round(m.utilisation)}% of total allowance`} />
                    <StatTile icon={CalendarDays} tone="good" label="Total Used To Date" value={hrs(totals.to_date)} unit="Hours" caption={`${totals.to_date_pct}% of total allowance`} />
                    <StatTile icon={FileText} tone="purple" label="Total Entries" value={totals.entries} caption="This period" />
                    <StatTile icon={Users} tone="gold" label="Advisers Used" value={totals.advisers} caption="This period" />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                    <Panel className="min-w-0">
                        <div className="flex flex-wrap items-end gap-3">
                            <MiniSelect label="Period" value={String(sp?.id ?? '')} onChange={(v) => set('period', v)} options={options.periods.map((p) => ({ value: String(p.id), label: p.label }))} />
                            <MiniSelect label="Service" value={filters.category} onChange={(v) => set('category', v)} options={[{ value: '', label: 'All Services' }, ...options.categories.map((c) => ({ value: c, label: c }))]} />
                            <MiniSelect label="Adviser" value={filters.adviser} onChange={(v) => set('adviser', v)} options={[{ value: '', label: 'All Advisers' }, ...options.advisers.map((c) => ({ value: c, label: c }))]} />
                            <MiniSelect label="Status" value={filters.status} onChange={(v) => set('status', v)} options={[{ value: '', label: 'All Status' }, ...['confirmed', 'pending', 'disputed', 'corrected', 'credited'].map((c) => ({ value: c, label: c[0].toUpperCase() + c.slice(1) }))]} />
                            <button type="button" onClick={() => window.print()} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-ink-900">
                                <Download className="size-4" aria-hidden="true" /> Export
                            </button>
                        </div>

                        <div className="mt-4 overflow-x-auto rounded-[6px] border border-parchment-400">
                            <table className="w-full min-w-[860px] text-left text-[0.8125rem]">
                                <thead className="bg-parchment-200 text-xs font-semibold text-ink-600">
                                    <tr>
                                        <th className="px-3 py-2">
                                            <button type="button" onClick={() => set('sort', filters.sort === 'asc' ? 'desc' : 'asc')} className="inline-flex items-center gap-1">
                                                Date &amp; Time {filters.sort === 'asc' ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />}
                                            </button>
                                        </th>
                                        {['Service / Activity', 'Adviser', 'Duration', 'Allowance Type', 'Balance After', 'Reference', 'Status', 'Actions'].map((h) => (
                                            <th key={h} className="px-3 py-2">
                                                {h}
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-parchment-300 bg-white">
                                    {entries.length === 0 && (
                                        <tr>
                                            <td colSpan={9} className="px-3 py-6 text-center text-ink-400">
                                                No entries match these filters.
                                            </td>
                                        </tr>
                                    )}
                                    {entries.map((u) => (
                                        <tr key={u.id}>
                                            <td className="px-3 py-2 whitespace-nowrap">{fmtDateTime(u.occurred_at)}</td>
                                            <td className="px-3 py-2">
                                                {u.activity}
                                                <span className="block text-[0.6875rem] text-ink-400">Evidence {u.evidence_class}</span>
                                            </td>
                                            <td className="px-3 py-2">{u.adviser}</td>
                                            <td className="px-3 py-2 whitespace-nowrap">
                                                {hrs(u.units, 2)} hrs
                                                {u.original_units !== null && <span className="block text-[0.6875rem] text-ink-400 line-through">{hrs(u.original_units, 2)} hrs</span>}
                                            </td>
                                            <td className="px-3 py-2">{EFFECT[u.billing_effect] ?? u.billing_effect}</td>
                                            <td className="px-3 py-2 font-semibold whitespace-nowrap text-verified-700">{u.balance_after !== null && u.balance_after !== undefined ? `${hrs(u.balance_after, 2)} hrs` : '—'}</td>
                                            <td className="px-3 py-2 font-mono text-xs">{u.reference}</td>
                                            <td className="px-3 py-2">
                                                <StatusPill status={u.status === 'confirmed' ? 'posted' : u.status} tone={u.status === 'confirmed' ? 'good' : undefined} />
                                            </td>
                                            <td className="px-3 py-2">
                                                <Link href={`${base}/ledger/${u.id}/dispute`} aria-label={`Query ${u.reference}`} className="inline-flex items-center gap-1 text-xs text-ink-500 hover:text-gold-700">
                                                    <Eye className="size-4" /> Query
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <Pagination page={pagination.page} per={pagination.per} total={pagination.total} path={path} params={params} />
                        <Notice tone="info" className="mt-4">
                            This ledger is your record of Retainer allowance usage. It forms part of your commercial agreement. Pending and disputed lines never reduce your confirmed balance.
                        </Notice>
                    </Panel>

                    <div className="space-y-4">
                        <Panel title="Allowance Summary">
                            <LabelValues
                                rows={[
                                    { label: 'Total Allowance / Month', value: `${hrs(m.denominator)} Hours` },
                                    { label: 'Used This Month', value: `${hrs(m.confirmed)} Hours (${Math.round(m.utilisation)}%)` },
                                    { label: 'Remaining This Month', value: `${hrs(m.remaining)} Hours (${Math.round(100 - m.utilisation)}%)` },
                                    { label: 'Period Start', value: fmtDate(sp?.starts_on) },
                                    { label: 'Period End', value: fmtDate(sp?.ends_on) },
                                    { label: 'Next Reset', value: fmtDate(m.period?.next_reset) },
                                    { label: 'Minimum Term', value: `${r.min_term_months} Months` },
                                    { label: 'Carry Forward (if unused)', value: r.carry_label.replace(' (if unused)', '') },
                                ]}
                            />
                            <Link href={base} className="mt-2 inline-block text-xs font-semibold text-gold-700">
                                View allowance meter →
                            </Link>
                        </Panel>
                        <Panel title="Quick Actions">
                            <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                                {[
                                    [Users, 'View Usage by Adviser', `${path}?adviser=${encodeURIComponent(options.advisers[0] ?? '')}`],
                                    [FileText, 'View Usage by Service', `${path}?category=${encodeURIComponent(options.categories[0] ?? '')}`],
                                    [FileEdit, 'Request Scope Change', `${base}/scope-change`],
                                    [TrendingUp, 'Raise Overage Request', `${base}/overage`],
                                    [Download, 'Download Usage Report', `${base}/statement`],
                                ].map(([Icon, label, href]) => {
                                    const I = Icon as typeof Users;
                                    return (
                                        <li key={label as string}>
                                            <Link href={href as string} className="flex items-center gap-2.5 py-2 text-ink-700 hover:text-gold-700">
                                                <I className="size-4 text-ink-500" aria-hidden="true" />
                                                <span className="flex-1">{label as string}</span>
                                                <ArrowRight className="size-3.5 text-gold-600" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Panel>
                        <Panel title="Notes">
                            <p className="flex gap-2 text-xs text-ink-600">
                                <Info className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                All time is recorded in 15-minute increments. Usage is logged in real-time as advisory time is captured. TBCA-caused rework never consumes your allowance.
                            </p>
                            <p className="mt-2 text-xs text-ink-600">Need to query an entry? Click the eye icon or contact your Adviser.</p>
                        </Panel>
                    </div>
                </div>
            </div>
        </AccountShell>
    );
}

Ledger.layout = null;
