import { Link, router } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, CheckCircle2, Clock, FileSpreadsheet, FileText, Flag, Info, TrendingUp, Wallet, Timer } from 'lucide-react';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { RetContext, RetMeter, RetPeriod, RetUsage } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { C, MiniSelect, StackedBar, StatTile, fmtDate, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Statement {
    period: RetPeriod;
    meter: RetMeter;
    lines: RetUsage[];
    overage_units: number;
    overage_amount: number;
    vat: number;
    total_used: number;
    utilisation_total: number;
    delta: number | null;
    prev_label: string | null;
    next: { starts_on: string; ends_on: string };
}

interface Props extends RetContext {
    statement: Statement | null;
    periods: { id: number; label: string; status: string }[];
}

export default function StatementPage(props: Props) {
    const { retainer: r, statement: st, periods } = props;
    const base = `/retainers/account/${r.code}`;
    if (!st) {
        return (
            <AccountShell ctx={props} title="Period Statement">
                <Notice tone="info">No statements yet. Your first statement is produced after your first period closes.</Notice>
            </AccountShell>
        );
    }
    const m = st.meter;
    const closed = st.period.status === 'closed';
    const days = Math.round((new Date(st.period.ends_on).getTime() - new Date(st.period.starts_on).getTime()) / 86400000) + 1;

    return (
        <AccountShell ctx={props} title="Period Statement" description="A summary of your retainer activity, usage and balance for the selected period.">
            <div className="mb-4 flex flex-wrap items-end gap-3">
                <MiniSelect className="w-72" label="Statement period" value={String(st.period.id)} onChange={(v) => router.get(`${base}/statement`, { period: v }, { preserveScroll: true })} options={periods.map((p) => ({ value: String(p.id), label: `${p.label}${p.status === 'open' ? ' (open)' : ''}` }))} />
                {!closed && <p className="pb-2 text-xs text-attested-700">This period is still open — the statement is provisional until reconciliation.</p>}
            </div>
            <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    <StatTile icon={CalendarDays} tone="purple" label="Statement Period" value={<span className="text-sm">{fmtDate(st.period.starts_on)} – {fmtDate(st.period.ends_on)}</span>} caption={`${days} Days`} />
                    <StatTile icon={Clock} tone="info" label="Included Allowance" value={hrs(m.denominator)} unit="Hours" caption={m.carry > 0 ? `incl. ${hrs(m.carry)}h carried` : 'Hours / Month'} />
                    <StatTile icon={CheckCircle2} tone="good" label="Total Used" value={hrs(m.confirmed)} unit={`Hours (${Math.round(m.utilisation)}%)`} />
                    <StatTile icon={TrendingUp} tone="gold" label="Billed Overage" value={hrs(st.overage_units)} unit="Hours" />
                    <StatTile icon={Timer} tone="purple" label="Remaining Balance" value={hrs(m.remaining)} unit={`Hours (${Math.round(100 - m.utilisation)}%)`} caption={closed ? `${hrs(st.period.carry_out)}h carried forward` : undefined} />
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                    <div className="min-w-0 space-y-5">
                        <div className="grid gap-5 lg:grid-cols-[1fr_220px]">
                            <Panel title="Usage Summary">
                                <StackedBar parts={[{ value: m.confirmed, color: C.purple, label: `Used (${hrs(m.confirmed)}h)` }, { value: st.overage_units, color: C.amber, label: `Overage (${hrs(st.overage_units)}h)` }, { value: m.remaining, color: C.grey, label: `Remaining (${hrs(m.remaining)}h)` }]} />
                                {(m.pending > 0 || m.disputed > 0) && <p className="mt-2 text-xs text-ink-500">Pending {hrs(m.pending)}h · Disputed {hrs(m.disputed)}h (not deducted).</p>}
                            </Panel>
                            <Panel title="Utilisation Rate">
                                <p className="text-3xl font-bold text-ink-900">{st.utilisation_total}%</p>
                                <p className="text-xs text-ink-500">({hrs(st.total_used)} of {hrs(m.denominator)} hours)</p>
                                {st.delta !== null && <span className="mt-2 inline-block rounded-full bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">{st.delta >= 0 ? '↑' : '↓'} {Math.abs(st.delta)}% vs {st.prev_label}</span>}
                            </Panel>
                        </div>
                        <Panel title="Itemised Activity">
                            <SimpleTable
                                columns={['Date', 'Service / Activity', 'Description', 'By', 'Hours', 'Type', 'Rate (excl. VAT)', 'Amount (excl. VAT)']}
                                rows={[
                                    ...st.lines.map((u) => [
                                        fmtDate(u.occurred_at),
                                        u.activity,
                                        u.description ?? '—',
                                        u.adviser,
                                        hrs(u.units),
                                        <StatusPill key="t" status={u.billing_effect === 'OVERAGE_APPROVED' ? 'overage' : u.status === 'disputed' ? 'disputed' : u.status === 'credited' ? 'credited' : 'included'} tone={u.billing_effect === 'OVERAGE_APPROVED' ? 'warn' : u.status === 'disputed' ? 'bad' : 'good'} />,
                                        u.billing_effect === 'OVERAGE_APPROVED' ? `${zar(r.overage_rate_zar)} /h` : '—',
                                        u.billing_effect === 'OVERAGE_APPROVED' ? zar(u.units * r.overage_rate_zar) : '—',
                                    ]),
                                    [<strong key="t">Total</strong>, '', '', '', <strong key="h">{hrs(st.total_used)}</strong>, <strong key="o">{hrs(st.overage_units)} overage</strong>, '', <strong key="a">{zar(st.overage_amount)}</strong>],
                                ]}
                            />
                            <Notice tone="info" className="mt-3">Overage hours are billed only where you authorised them in advance, at your agreed overage rate. See Invoicing &amp; Payments for invoice details.</Notice>
                        </Panel>
                    </div>

                    <div className="space-y-4">
                        <Panel title="Download Statement">
                            <p className="-mt-2 mb-2 text-xs text-ink-500">Export your statement in the format you prefer.</p>
                            {[[FileText, 'Statement (PDF)', 'PDF'], [FileSpreadsheet, 'Statement (Excel)', 'XLSX'], [FileSpreadsheet, 'Activity Report (Excel)', 'XLSX']].map(([Icon, l, t]) => {
                                const I = Icon as typeof FileText;
                                return (
                                    <button key={l as string} type="button" onClick={() => window.print()} className="mb-2 flex w-full items-center gap-2 rounded-[6px] border border-parchment-400 p-2 text-left text-xs hover:border-referenced-500">
                                        <I className="size-4 text-ink-500" aria-hidden="true" />
                                        <span className="flex-1 font-semibold">{l as string}</span>
                                        <span className="text-ink-400">{t as string}</span>
                                    </button>
                                );
                            })}
                        </Panel>
                        <Panel title="Statement Summary">
                            <LabelValues
                                rows={[
                                    { label: 'Opening Allowance', value: `${hrs(m.opening)} h` },
                                    { label: 'Carry In', value: `${hrs(m.carry)} h` },
                                    { label: 'Credits', value: `${hrs(m.credits)} h` },
                                    { label: 'Used (Included)', value: `${hrs(m.confirmed)} h` },
                                    { label: 'Billed Overage', value: `${hrs(st.overage_units)} h` },
                                    { label: 'Total Used', value: `${hrs(st.total_used)} h` },
                                    { label: 'Remaining Balance', value: `${hrs(m.remaining)} h` },
                                    { label: 'Carried Forward', value: closed ? `${hrs(st.period.carry_out)} h` : 'At close' },
                                    { label: 'Overage Rate (excl. VAT)', value: `${zar(r.overage_rate_zar)} /h` },
                                    { label: 'Overage Amount (excl. VAT)', value: zar(st.overage_amount) },
                                    { label: 'VAT (15%)', value: zar(st.vat) },
                                    { label: 'Total (incl. VAT)', value: zar(st.overage_amount + st.vat), strong: true },
                                ]}
                            />
                        </Panel>
                        <Panel title="Next Statement">
                            <p className="flex items-center gap-2 text-xs text-ink-700"><Wallet className="size-4 text-referenced-500" aria-hidden="true" />{fmtDate(st.next.starts_on)} – {fmtDate(st.next.ends_on)}</p>
                        </Panel>
                    </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-parchment-400 pt-4">
                    <Link href={base} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900"><ArrowLeft className="size-4" aria-hidden="true" />Back to Overview</Link>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => openAskQuestion({ subject: `Statement issue — ${r.code} ${st.period.ends_on}`, section: 'retainers' })} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-referenced-500/50 px-4 text-sm font-semibold text-referenced-700"><Flag className="size-4" aria-hidden="true" />Report an Issue</button>
                        {st.period.statement_ack_at ? (
                            <span className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-verified-50 px-4 text-sm font-semibold text-verified-700"><CheckCircle2 className="size-4" aria-hidden="true" />Acknowledged {fmtDate(st.period.statement_ack_at)}</span>
                        ) : (
                            <button type="button" disabled={!closed} onClick={() => router.post(`${base}/statement`, { period: st.period.id }, { preserveScroll: true })} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-referenced-700 px-6 text-sm font-semibold text-white disabled:opacity-50"><CheckCircle2 className="size-4" aria-hidden="true" />Acknowledge Statement</button>
                        )}
                    </div>
                </div>
                <p className="flex items-center justify-end gap-1 text-[0.6875rem] text-ink-400"><Info className="size-3" aria-hidden="true" />By acknowledging, you confirm you have reviewed this statement.</p>
            </div>
        </AccountShell>
    );
}

StatementPage.layout = null;
