import { Link } from '@inertiajs/react';
import { AlertTriangle, ArrowRight, Briefcase, ChevronRight, Clock, Download, FileText, Headphones, Info, MessageCircle, Plus, Timer, TrendingUp, Users, Gauge } from 'lucide-react';
import { ProductsWorkspaceLayout } from '@/Components/Products/Layouts';
import { Panel, Progress, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { RetMeter, RetRetainer } from '@/Components/Products/Retainers/types';
import { C, Donut, Legend, LineChart, StatTile, fmtDate, fmtDateTime, hrs, zar } from '@/Components/Products/Retainers/ui';

interface Row extends RetRetainer {
    meter: RetMeter;
    order_status: string | null;
}

interface Props {
    retainers: Row[];
    summary: { active: number; allowance: number; used: number };
    trend: { label: string; value: number }[];
    alerts: { tone: string; title: string; body: string; href: string }[];
    activity: { type: string; summary: string; at: string; retainer?: string | null }[];
    proposals: { reference: string; status: string; service: string; monthly_fee_zar: number; valid_until: string | null; hold_reason: string | null; retainer: string | null }[];
}

const ALERT_ICON = { bad: AlertTriangle, warn: AlertTriangle, info: Info } as const;
const ALERT_TONE = { bad: 'text-risk-500', warn: 'text-attested-500', info: 'text-controlled-500' } as const;

export default function Index({ retainers, summary, trend, alerts, activity, proposals }: Props) {
    const available = Math.max(0, summary.allowance - summary.used);
    const usedPct = summary.allowance > 0 ? Math.round((summary.used / summary.allowance) * 100) : 0;
    const first = retainers.find((r) => r.status === 'active') ?? retainers[0];

    return (
        <ProductsWorkspaceLayout
            title="Retainers Portal"
            description="Manage your retained advisory capacity, utilisation, invoices and team."
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Retainers', href: '/retainers' }, { label: 'Retainers Portal' }]}
            actions={
                <ButtonLink href="/retainers/choose" size="sm" trailingIcon="arrow-right">
                    Request Additional Retainer
                </ButtonLink>
            }
        >
            <p className="-mt-3 mb-4 text-xs text-ink-500">Data as at: {fmtDateTime(new Date().toISOString())} SAST</p>

            {retainers.length === 0 && (
                <Panel>
                    <div className="py-10 text-center">
                        <Briefcase className="mx-auto size-10 text-gold-600" aria-hidden="true" />
                        <p className="mt-3 font-semibold text-ink-900">You have no Retainers yet</p>
                        <p className="mt-1 text-sm text-ink-500">Retainers are proposal-based. Start by choosing a service.</p>
                        <ButtonLink href="/retainers/choose" size="sm" className="mt-4">
                            Choose a Retainer Service
                        </ButtonLink>
                    </div>
                </Panel>
            )}

            {retainers.length > 0 && (
                <div className="space-y-5">
                    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr_1fr]">
                        <Panel title="Retainer Summary">
                            <div className="grid gap-3 sm:grid-cols-2">
                                <StatTile icon={Briefcase} label="Active Retainers" value={summary.active} caption={<Link href="#active" className="font-semibold text-gold-700">View all →</Link>} />
                                <StatTile icon={Gauge} tone="good" label="Total Allowance / Month" value={hrs(summary.allowance)} unit="Hours" caption="Across all retainers" />
                                <StatTile icon={Clock} tone="info" label="Used This Month" value={hrs(summary.used)} unit="Hours" caption={`${usedPct}% of total allowance`} />
                                <StatTile icon={Timer} tone="purple" label="Available This Month" value={hrs(available)} unit="Hours" caption={`${100 - usedPct}% remaining`} />
                            </div>
                        </Panel>
                        <Panel title="Utilisation Trend (Last 6 Months)">
                            <LineChart points={trend} suffix="%" />
                        </Panel>
                        <Panel title="Alerts">
                            {alerts.length === 0 && <p className="text-sm text-ink-400">No alerts. Everything is on track.</p>}
                            <ul className="divide-y divide-parchment-300">
                                {alerts.map((a, i) => {
                                    const Icon = ALERT_ICON[a.tone as keyof typeof ALERT_ICON] ?? Info;
                                    return (
                                        <li key={i}>
                                            <Link href={a.href} className="flex items-start gap-3 py-2.5 hover:bg-parchment-100">
                                                <Icon className={`mt-0.5 size-5 shrink-0 ${ALERT_TONE[a.tone as keyof typeof ALERT_TONE] ?? ''}`} aria-hidden="true" />
                                                <span className="flex-1 text-xs">
                                                    <span className="block text-[0.8125rem] font-semibold text-ink-900">{a.title}</span>
                                                    <span className="text-ink-600">{a.body}</span>
                                                </span>
                                                <ChevronRight className="size-4 text-ink-400" aria-hidden="true" />
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </Panel>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[2fr_1fr]">
                        <Panel title="Active Retainers" className="min-w-0">
                            <div id="active" />
                            <SimpleTable
                                columns={['Retainer', 'Allowance / Month', 'Used This Month', 'Utilisation', 'Next Review', 'Status', 'Actions']}
                                rows={retainers.map((r) => [
                                    <div key="n">
                                        <p className="font-semibold text-ink-900">{r.name}</p>
                                        <p className="text-xs text-ink-500">{r.client_name}</p>
                                        <p className="text-xs text-ink-400">Ref: {r.code}</p>
                                    </div>,
                                    `${hrs(r.meter.denominator ?? r.allowance_qty)} Hours`,
                                    `${hrs(r.meter.confirmed)} Hours`,
                                    <div key="u" className="w-28">
                                        <span className="text-xs font-semibold">{Math.round(r.meter.utilisation ?? 0)}%</span>
                                        <Progress value={r.meter.utilisation ?? 0} tone={(r.meter.utilisation ?? 0) >= 75 ? 'gold' : 'good'} />
                                    </div>,
                                    <div key="d" className="text-xs">
                                        {fmtDate(r.meter.period?.next_reset)}
                                        <span className="block text-ink-400">In {r.meter.days_left ?? 0} days</span>
                                    </div>,
                                    <StatusPill key="s" status={r.status === 'pending_activation' && r.order_status ? `${r.status} (${r.order_status})` : r.status} />,
                                    <Link key="a" href={`/retainers/account/${r.code}`} className="text-xs font-semibold text-gold-700">
                                        Open →
                                    </Link>,
                                ])}
                            />
                        </Panel>
                        <Panel title="Allowance Meter (All Retainers)">
                            <div className="flex flex-wrap items-center gap-5">
                                <Donut segments={[{ value: summary.used, color: C.green }, { value: available, color: C.grey }]} centre={hrs(available)} sub="Hours Available" />
                                <div className="min-w-0 flex-1 space-y-3">
                                    <Legend items={[{ color: C.green, label: 'Used', value: `${hrs(summary.used)} Hours (${usedPct}%)` }, { color: C.grey, label: 'Available', value: `${hrs(available)} Hours (${100 - usedPct}%)` }]} />
                                    <p className="text-xs text-ink-500">
                                        Total Allowance
                                        <span className="block text-base font-bold text-ink-900">{hrs(summary.allowance)} Hours / Month</span>
                                    </p>
                                </div>
                            </div>
                        </Panel>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-[1.4fr_1fr_1fr]">
                        <Panel title="Recent Activity">
                            <ul className="divide-y divide-parchment-300">
                                {activity.map((a, i) => (
                                    <li key={i} className="flex items-start gap-3 py-2.5 text-xs">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700">
                                            {a.type.includes('consumption') || a.type === 'usage' ? <Clock className="size-4" aria-hidden="true" /> : a.type.includes('overage') ? <TrendingUp className="size-4" aria-hidden="true" /> : a.type.includes('substitution') ? <Users className="size-4" aria-hidden="true" /> : <FileText className="size-4" aria-hidden="true" />}
                                        </span>
                                        <span className="flex-1">
                                            <span className="block font-semibold text-ink-900">{a.summary}</span>
                                            <span className="text-ink-500">{a.retainer}</span>
                                        </span>
                                        <span className="text-ink-400">{fmtDateTime(a.at)}</span>
                                    </li>
                                ))}
                            </ul>
                        </Panel>
                        <Panel title="Quick Actions">
                            {first && (
                                <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                                    {[
                                        [Gauge, 'View Allowance Details', `/retainers/account/${first.code}`],
                                        [Plus, 'Request Additional Capacity', `/retainers/account/${first.code}/renew`],
                                        [TrendingUp, 'Raise Overage Request', `/retainers/account/${first.code}/overage`],
                                        [Download, 'Download Usage Report', `/retainers/account/${first.code}/statement`],
                                        [Users, 'Manage Retainer Team', `/retainers/account/${first.code}/substitution`],
                                    ].map(([Icon, label, href]) => {
                                        const I = Icon as typeof Gauge;
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
                            )}
                        </Panel>
                        <Panel title="Need Help?">
                            <p className="text-xs text-ink-500">Our team is ready to support you.</p>
                            <button type="button" onClick={() => openAskQuestion({ subject: 'Retainer support', section: 'retainers' })} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-50">
                                <Headphones className="size-4" aria-hidden="true" /> Talk to a Specialist
                            </button>
                            <button type="button" onClick={() => openAskQuestion({ subject: 'Question about my Retainer', section: 'retainers' })} className="mt-2 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-50">
                                <MessageCircle className="size-4" aria-hidden="true" /> Ask a Question
                            </button>
                        </Panel>
                    </div>
                </div>
            )}

            {proposals.length > 0 && (
                <Panel title="My Proposals" className="mt-5">
                    <SimpleTable
                        columns={['Proposal', 'Service', 'Monthly fee', 'Valid until', 'Status', '']}
                        rows={proposals.map((p) => [
                            <span key="r" className="font-mono text-xs">{p.reference}</span>,
                            p.service,
                            zar(p.monthly_fee_zar),
                            fmtDate(p.valid_until),
                            <StatusPill key="s" status={p.hold_reason ? `${p.status} · ${p.hold_reason}` : p.status} />,
                            <Link key="l" href={p.retainer ? `/retainers/account/${p.retainer}` : p.status === 'accepted' ? `/retainers/agreement/${p.reference}` : `/retainers/proposal/${p.reference}`} className="text-xs font-semibold text-gold-700">
                                Open →
                            </Link>,
                        ])}
                    />
                </Panel>
            )}
        </ProductsWorkspaceLayout>
    );
}

Index.layout = null;
