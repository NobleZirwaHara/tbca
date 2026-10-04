import { Link } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Clock, Download, Eye, FileEdit, Gauge as GaugeIcon, Info, MessageCircle, Plus, Timer, ListChecks } from 'lucide-react';
import { Panel, SimpleTable } from '@/Components/ui/Kit';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { RetContext, RetUsage } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { Gauge, StatTile, fmtDate, fmtDateTime, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Props extends RetContext {
    recent: RetUsage[];
    last_reset: string | null;
    paid: boolean;
}

export default function Meter(props: Props) {
    const { retainer: r, meter: m, recent } = props;
    const base = `/retainers/account/${r.code}`;
    const pct = m.period ? m.utilisation : 0;

    return (
        <AccountShell ctx={props} title="Live Allowance Meter" description="Real-time view of your retained advisory capacity.">
            {!m.period ? (
                <Notice tone="info">The allowance meter opens when your first service period starts.</Notice>
            ) : (
                <div className="space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        <StatTile icon={Clock} tone="good" label="Total Allowance / Month" value={hrs(m.denominator)} unit="Hours" caption={m.carry > 0 ? `${hrs(m.opening)} base + ${hrs(m.carry)} carry` : 'Fixed monthly allowance'} />
                        <StatTile icon={GaugeIcon} tone="info" label="Used This Month" value={hrs(m.confirmed)} unit="Hours" caption={`${Math.round(pct)}% of total allowance`} />
                        <StatTile icon={Timer} tone="good" highlight label="Remaining This Month" value={hrs(m.remaining)} unit="Hours" caption={`${Math.round(100 - pct)}% remaining`} />
                        <StatTile icon={CalendarDays} tone="purple" label="Period Days Left" value={m.days_left} unit="Days" caption={`Ends ${fmtDate(m.period.ends_on)}`} />
                        <StatTile icon={CalendarDays} tone="gold" label="Next Reset Date" value={fmtDate(m.period.next_reset, { day: '2-digit', month: 'short' })} caption="Allowance refreshes" />
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                        <div className="min-w-0 space-y-5">
                            <Panel title="Allowance Progress">
                                <div className="grid items-center gap-6 md:grid-cols-[240px_1fr]">
                                    <Gauge pct={pct} label="Used" sub={`${hrs(m.confirmed)} of ${hrs(m.denominator)} Hours`} />
                                    <div className="space-y-3 text-[0.8125rem]">
                                        {[
                                            ['Used (confirmed)', m.confirmed, 'bg-verified-500'],
                                            ['Pending (not yet confirmed)', m.pending, 'bg-attested-500'],
                                            ['Disputed (isolated)', m.disputed, 'bg-risk-500'],
                                            ['Remaining', m.remaining, 'bg-parchment-500'],
                                        ].map(([l, v, c]) => (
                                            <div key={l as string} className="grid grid-cols-[1fr_2fr_auto] items-center gap-3">
                                                <span className="flex items-center gap-2 text-ink-700">
                                                    <span className={`size-2.5 rounded-full ${c as string}`} />
                                                    {l as string}
                                                </span>
                                                <span className="h-2 overflow-hidden rounded-full bg-parchment-300">
                                                    <span className={`block h-full ${c as string}`} style={{ width: `${m.denominator ? ((v as number) / m.denominator) * 100 : 0}%` }} />
                                                </span>
                                                <span className="font-semibold tabular-nums">
                                                    {hrs(v as number)} Hours ({m.denominator ? Math.round(((v as number) / m.denominator) * 100) : 0}%)
                                                </span>
                                            </div>
                                        ))}
                                        <div className="flex justify-between border-t border-parchment-300 pt-2 font-semibold">
                                            <span>Total Allowance</span>
                                            <span>{hrs(m.denominator)} Hours</span>
                                        </div>
                                        {m.overage > 0 && <p className="text-xs text-attested-700">Plus {hrs(m.overage)} pre-authorised overage hours this period.</p>}
                                        <Notice tone="info" title="How it works">
                                            Allowance is consumed in real time as advisory time is logged. Only confirmed, evidence-backed usage reduces your balance; pending or disputed usage is shown separately and never triggers overage. Unused allowance carries forward only up to the rollover cap in your agreement ({r.carry_label}).
                                        </Notice>
                                    </div>
                                </div>
                            </Panel>

                            <Panel title="Last 5 Usage Entries" action={<Link href={`${base}/ledger`} className="text-xs font-semibold text-gold-700">View full ledger →</Link>}>
                                <SimpleTable
                                    columns={['Date & Time', 'Service / Activity', 'Adviser', 'Duration', 'Balance After', 'Reference', '']}
                                    rows={recent.map((u) => [
                                        fmtDateTime(u.occurred_at),
                                        u.activity,
                                        <span key="a" className="font-semibold">{u.adviser}</span>,
                                        `${hrs(u.units, 2)} hrs`,
                                        <span key="b" className={(u.balance_after ?? 0) <= 6 ? 'font-semibold text-verified-700' : 'font-semibold text-attested-700'}>{hrs(u.balance_after ?? 0, 2)} hrs</span>,
                                        <span key="r" className="font-mono text-xs">{u.reference}</span>,
                                        <Link key="e" href={`${base}/ledger/${u.id}/dispute`} aria-label={`Query ${u.reference}`} className="text-ink-500 hover:text-gold-700">
                                            <Eye className="size-4" />
                                        </Link>,
                                    ])}
                                    empty="No usage logged this period yet."
                                />
                            </Panel>
                        </div>

                        <div className="space-y-4">
                            <Panel title="Allowance Details">
                                <LabelValues
                                    rows={[
                                        { label: 'Service Level', value: r.service_level },
                                        { label: 'Owner Model', value: r.owner_model },
                                        { label: 'Minimum Term', value: `${r.min_term_months} Months` },
                                        { label: 'Billing Cycle', value: 'Monthly in advance' },
                                        { label: 'Carry Forward', value: r.carry_label },
                                        { label: 'Overage Rate', value: `${zar(r.overage_rate_zar)} / hour` },
                                        { label: 'Last Reset', value: fmtDate(props.last_reset) },
                                        { label: 'Next Reset', value: fmtDate(m.period.next_reset) },
                                    ]}
                                />
                            </Panel>
                            <Panel title="Quick Actions">
                                <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                                    {[
                                        [ListChecks, 'View Usage Ledger', `${base}/ledger`],
                                        [FileEdit, 'Request Scope Change', `${base}/scope-change`],
                                        [Plus, 'Request Additional Capacity', `${base}/renew`],
                                        [Download, 'Download Usage Report', `${base}/statement`],
                                    ].map(([Icon, label, href]) => {
                                        const I = Icon as typeof ListChecks;
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
                                    <li>
                                        <button type="button" onClick={() => openAskQuestion({ subject: `Question about ${r.code}`, section: 'retainers' })} className="flex w-full items-center gap-2.5 py-2 text-left text-ink-700 hover:text-gold-700">
                                            <MessageCircle className="size-4 text-ink-500" aria-hidden="true" />
                                            <span className="flex-1">Ask a Question</span>
                                            <ArrowRight className="size-3.5 text-gold-600" aria-hidden="true" />
                                        </button>
                                    </li>
                                </ul>
                            </Panel>
                            <Panel title="Notes">
                                <p className="flex gap-2 text-xs text-ink-600">
                                    <Info className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                    If you expect to exceed your allowance, please request additional capacity early to avoid delays. No chargeable work beyond your allowance starts without your prior approval.
                                </p>
                                <p className="mt-2 text-xs text-ink-600">For urgent support, contact your Adviser or speak to our team.</p>
                            </Panel>
                        </div>
                    </div>
                </div>
            )}
        </AccountShell>
    );
}

Meter.layout = null;
