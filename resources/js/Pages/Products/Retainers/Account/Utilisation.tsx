import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ArrowRight, CalendarDays, CalendarClock, CircleCheck, Clock, Download, FileText, Gauge, Info, Lightbulb, Pause, TrendingDown, TrendingUp, XCircle } from 'lucide-react';
import { Panel, SimpleTable, Modal } from '@/Components/ui/Kit';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { RetContext } from '@/Components/Products/Retainers/types';
import { AccountShell } from '@/Components/Products/Retainers/Shells';
import { LineChart, StatTile, C, fmtDate, fmtDateTime, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Month {
    label: string;
    allowance: number;
    used: number;
    pct: number;
    remaining: number;
    open: boolean;
    days_left: number;
}

interface Props extends RetContext {
    months: Month[];
    average: number;
    average_pct: number;
    forecast_pct: number;
    review_due: boolean;
    alert: { level: string; utilisation: number; notice_sent_at: string | null } | null;
    decisions: { choice: string; created_at: string; effective_date: string | null; requested_allowance: number | null }[];
    per_use_comparator: null;
}

const OPTIONS = [
    { key: 'continue', icon: CircleCheck, title: 'Continue', body: 'Keep your current allowance and terms.' },
    { key: 'right_size', icon: TrendingDown, title: 'Right-size', body: 'Change your allowance from the next period.' },
    { key: 'pause', icon: Pause, title: 'Pause', body: 'Pause at period end where your agreement permits.' },
    { key: 'cancel', icon: XCircle, title: 'Cancel', body: 'End the Retainer at the end of this period.' },
];

function note(m: Month): string {
    if (m.open) return `${m.days_left} days remaining`;
    if (m.pct >= 95) return 'Allowance fully used';
    if (m.pct >= 75) return 'High usage';
    if (m.pct >= 60) return 'Steady state';
    return 'Low usage';
}

export default function Utilisation(props: Props) {
    const { retainer: r, meter: m, months, decisions } = props;
    const base = `/retainers/account/${r.code}`;
    const [choice, setChoice] = useState<string | null>(null);
    const [allowance, setAllowance] = useState(String(Math.max(5, Math.round(props.average / 5) * 5) || r.allowance_qty));
    const [processing, setProcessing] = useState(false);
    const confirm = () => {
        if (!choice) return;
        setProcessing(true);
        router.post(`${base}/utilisation`, { choice, allowance: choice === 'right_size' ? allowance : null }, { preserveScroll: true, onFinish: () => { setProcessing(false); setChoice(null); } });
    };
    const insights = [
        { icon: TrendingUp, tone: 'text-verified-500', t: m.utilisation >= 60 && m.utilisation <= 80 ? 'Your utilisation is within the optimal range.' : m.utilisation > 80 ? 'Your utilisation is above the optimal range.' : 'Your utilisation is below the optimal range.', b: 'Consistent usage between 60% - 80% is ideal.' },
        { icon: Info, tone: 'text-controlled-500', t: `You have ${hrs(m.remaining)} hours remaining this month.`, b: `Use before ${fmtDate(m.period?.next_reset)} to avoid waste (carry is capped at ${r.rollover_cap_pct}%).` },
        { icon: CalendarClock, tone: 'text-referenced-500', t: `Forecast indicates about ${props.forecast_pct}% utilisation ahead.`, b: 'Consider planning peak periods early.' },
        { icon: Lightbulb, tone: 'text-gold-600', t: 'Review scope if needs exceed 80% consistently.', b: 'We can right-size your allowance.' },
    ];

    return (
        <AccountShell
            ctx={props}
            title="Utilisation Review"
            description="Review your utilisation patterns, remaining allowance and the choices available to you."
            actions={
                <button type="button" onClick={() => openAskQuestion({ subject: `Schedule review call — ${r.code}`, section: 'retainers' })} className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-gold-500 px-3 text-sm font-semibold text-ink-900">
                    <CalendarDays className="size-4" aria-hidden="true" /> Schedule Review Call
                </button>
            }
        >
            <div className="space-y-5">
                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
                    <StatTile icon={Clock} tone="good" label="Total Allowance / Month" value={hrs(m.denominator)} unit="Hours" caption="Fixed monthly allowance" />
                    <StatTile icon={Gauge} tone="info" label="Average Used / Month (Last 6 Months)" value={hrs(props.average)} unit="Hours" caption={`${props.average_pct}% of allowance`} />
                    <StatTile icon={FileText} tone="purple" label="Used This Month" value={hrs(m.confirmed)} unit="Hours" caption={`${Math.round(m.utilisation)}% of allowance`} />
                    <StatTile icon={Clock} tone="good" label="Remaining This Month" value={hrs(m.remaining)} unit="Hours" caption={`${Math.round(100 - m.utilisation)}% remaining`} />
                    <StatTile icon={TrendingUp} tone="gold" label="Forecast Utilisation (Next 3 Months)" value={`${props.forecast_pct}%`} caption="Based on current trend" />
                    <StatTile icon={CalendarDays} tone="purple" label="Period Ends" value={m.days_left} unit="Days" caption={fmtDate(m.period?.ends_on)} />
                </div>

                {props.review_due && (
                    <Notice tone="purple" title="Your Retainer usage is ready for review">
                        Your recent confirmed use has met the approved review condition for this Retainer. You may Continue, Right-size, Pause where your agreement permits it, or Cancel. These choices are presented with equal status. You do not need to speak to Sales before using an available direct option.
                    </Notice>
                )}

                <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                    <Panel title="Utilisation Trend (Last 6 Months)" className="min-w-0">
                        <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
                            <div>
                                <LineChart points={months.map((x) => ({ label: x.label.replace(' (MTD)', ''), value: Math.round(x.pct) }))} suffix="%" color={C.green} />
                                <p className="mt-1 text-center text-[0.6875rem] text-ink-500">— % of Monthly Allowance Used</p>
                            </div>
                            <ul className="space-y-3 rounded-[6px] bg-parchment-100 p-3">
                                <li className="text-xs font-semibold text-ink-900">Insights</li>
                                {insights.map(({ icon: Icon, tone, t, b }) => (
                                    <li key={t} className="flex gap-2 text-xs">
                                        <Icon className={cn('mt-0.5 size-4 shrink-0', tone)} aria-hidden="true" />
                                        <span>
                                            <span className="block font-semibold text-ink-900">{t}</span>
                                            <span className="text-ink-500">{b}</span>
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <Notice tone="info" className="mt-3">Allowance does not carry forward beyond the rollover cap in your agreement ({r.carry_label}).</Notice>
                    </Panel>
                    <Panel title="Utilisation Summary">
                        <LabelValues
                            rows={[
                                { label: 'Retainer', value: r.name },
                                { label: 'Owner Model', value: r.owner_model },
                                { label: 'Service Level', value: r.service_level },
                                { label: 'Minimum Term', value: `${r.min_term_months} Months` },
                                { label: 'Billing Cycle', value: 'Monthly in advance' },
                                { label: 'Carry Forward', value: r.carry_label },
                                { label: 'Overage Rate', value: `${zar(r.overage_rate_zar)} / hour` },
                                { label: 'Total Used (This Month)', value: `${hrs(m.confirmed)} Hours (${Math.round(m.utilisation)}%)` },
                                { label: 'Total Remaining (This Month)', value: `${hrs(m.remaining)} Hours` },
                                { label: 'Average Used / Month', value: `${hrs(props.average)} Hours (${props.average_pct}%)` },
                            ]}
                        />
                        <Link href={base} className="mt-2 inline-block text-xs font-semibold text-gold-700">
                            View Live Allowance Meter →
                        </Link>
                    </Panel>
                </div>

                <div className="grid gap-5 xl:grid-cols-[1fr_420px]">
                    <Panel title="Monthly Utilisation Details" className="min-w-0">
                        <SimpleTable
                            columns={['Month', 'Allowance (hrs)', 'Used (hrs)', '% Used', 'Remaining (hrs)', 'Notes']}
                            rows={months.map((x) => [x.label, hrs(x.allowance), hrs(x.used), `${Math.round(x.pct)}%`, hrs(x.remaining), note(x)])}
                        />
                        <Link href={`${base}/statement`} className="mt-3 inline-flex h-9 items-center gap-2 rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-ink-900">
                            <Download className="size-4" aria-hidden="true" /> View Full Utilisation Report
                        </Link>
                    </Panel>
                    <Panel title="Your Options">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">All four options are equally available. None is pre-selected or recommended by TBCA.</p>
                        <div className="grid grid-cols-2 gap-3" role="group" aria-label="Utilisation options">
                            {OPTIONS.map(({ key, icon: Icon, title, body }) => (
                                <button key={key} type="button" onClick={() => setChoice(key)} className="flex flex-col items-start rounded-[6px] border border-parchment-500 bg-white p-3 text-left hover:border-gold-500 focus:ring-2 focus:ring-gold-500/30 focus:outline-none">
                                    <Icon className="size-5 text-ink-700" aria-hidden="true" />
                                    <span className="mt-1.5 text-sm font-semibold text-ink-900">{title}</span>
                                    <span className="text-[0.6875rem] text-ink-500">{body}</span>
                                </button>
                            ))}
                        </div>
                        {decisions.length > 0 && (
                            <div className="mt-4 border-t border-parchment-300 pt-3 text-xs">
                                <p className="font-semibold text-ink-800">Recorded decisions (immutable)</p>
                                <ul className="mt-1 space-y-1 text-ink-600">
                                    {decisions.map((d, i) => (
                                        <li key={i}>
                                            {fmtDateTime(d.created_at)} — <span className="font-semibold capitalize">{d.choice.replace('_', '-')}</span>
                                            {d.requested_allowance ? ` to ${d.requested_allowance}h` : ''} · effective {fmtDate(d.effective_date)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                        <button type="button" onClick={() => openAskQuestion({ subject: `Advisory review — ${r.code}`, section: 'retainers' })} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900">
                            Request Advisory Review <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </Panel>
                </div>
                <p className="text-xs text-ink-400">Utilisation data is updated in real-time as advisory time is logged. For questions, contact your named advisor or support.</p>
            </div>

            <Modal
                open={choice !== null}
                onClose={() => setChoice(null)}
                title={`Confirm: ${OPTIONS.find((o) => o.key === choice)?.title ?? ''}`}
                footer={
                    <>
                        <button type="button" onClick={() => setChoice(null)} className="h-9 rounded-[4px] border border-parchment-500 px-4 text-sm">Back</button>
                        <button type="button" disabled={processing} onClick={confirm} className="h-9 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900 disabled:opacity-60">Confirm</button>
                    </>
                }
            >
                <div className="space-y-3 text-sm text-ink-700">
                    {choice === 'continue' && <p>Your Retainer continues at {hrs(r.allowance_qty)} hours / month and {zar(r.monthly_fee_zar)} excl. VAT.</p>}
                    {choice === 'right_size' && (
                        <>
                            <p>A right-size request is sent for the next period. Your choice is recorded and cannot be overwritten by a later offer.</p>
                            <label className="block text-xs font-medium text-ink-800" htmlFor="rs-allow">New allowance (hours / month)</label>
                            <input id="rs-allow" type="number" min={4} max={200} value={allowance} onChange={(e) => setAllowance(e.target.value)} className="h-10 w-full rounded-[4px] border border-parchment-500 px-3" />
                        </>
                    )}
                    {choice === 'pause' && <p>Your Retainer pauses from {fmtDate(m.period?.next_reset)}. Standing availability and benefits pause until you resume.</p>}
                    {choice === 'cancel' && <p>Your Retainer ends on {fmtDate(m.period?.ends_on)}. You keep access to your adviser and remaining allowance until then. No Sales approval is needed.</p>}
                </div>
            </Modal>
        </AccountShell>
    );
}

Utilisation.layout = null;
