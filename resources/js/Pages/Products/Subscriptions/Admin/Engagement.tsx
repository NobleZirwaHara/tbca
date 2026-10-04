import { useState } from 'react';
import { Activity, BarChart3, CheckCircle2, Eye, HeartHandshake, Mail, Play, Scale, TriangleAlert, UserMinus, Users, Zap } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { BarRow } from '@/Components/Products/Shared';
import { ConsoleBtn, FilterSelect, SubAdminShell, filterTo, post } from '@/Components/Products/Subscriptions/Admin';
import { Card, ClassChip, StatTile, shortDate } from '@/Components/Products/Subscriptions/ui';
import { Donut, LineChart } from '@/Components/Products/Subscriptions/charts';
import type { SubOpRow } from '@/Components/Products/Subscriptions/types';

type Case = SubOpRow & { days_inactive: number };

interface Props {
    cases: Case[];
    platform: { reference: string; client: string | null; plan: string; class: string; score: number; days_inactive: number; idle_periods: number; confidence: string; flagged: boolean; qualifies: boolean }[];
    health: [string, number][];
    trend: [string, number, number, number, number][];
    indicators: [string, number][];
    byClass: [string, number][];
    filters: { risk: string; outreach: string; q: string };
}

const PATH = '/admin/products/subscriptions/engagement';

export default function Engagement({ cases, platform, health, trend, indicators, byClass, filters }: Props) {
    const [q, setQ] = useState(filters.q);
    const total = health.reduce((s, h) => s + h[1], 0);
    const indTotal = indicators.reduce((s, i) => s + i[1], 0) || 1;
    const classMax = Math.max(1, ...byClass.map((c) => c[1]));
    const highRisk = cases.filter((c) => c.data.risk === 'High Risk').length;

    return (
        <SubAdminShell
            title="Engagement Monitoring and Disuse Queue"
            description="Monitor client engagement and act on potential disuse to deliver value and prevent silent churn. Disuse alerts are never suppressed for commercial reasons."
            actions={
                <ConsoleBtn tone="dark" onClick={() => post(`${PATH}/check`, {}, 'Apply the class-specific disuse thresholds to all live subscriptions now?')}>
                    <Play className="size-3.5" aria-hidden="true" /> Run Disuse Check
                </ConsoleBtn>
            }
            strip={[
                { icon: Zap, title: 'Act Early', body: 'Proactive outreach prevents silent churn.' },
                { icon: HeartHandshake, title: 'Deliver Value', body: 'Re-engage clients with relevant outcomes.' },
                { icon: Scale, title: 'Fair & Transparent', body: 'No penalties — we earn retention with value.' },
                { icon: Eye, title: 'Track Everything', body: 'All outreach and actions are logged.' },
                { icon: BarChart3, title: 'Improve Continuously', body: 'Disuse insights drive product and content.' },
            ]}
            note="Disuse does not equal disengagement. No-login alone never triggers disuse; telemetry failure is a data exception, not disuse. Reach out, deliver value, and help clients succeed."
        >
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">
                <StatTile icon={Users} tone="purple" label="Active Subscriptions" value={total.toLocaleString()} caption="100% of portfolio" />
                <StatTile icon={TriangleAlert} tone="orange" label="At Risk (Disuse)" value={cases.length} caption="Open queue" />
                <StatTile icon={Activity} tone="red" label="High Risk (Escalate)" value={highRisk} />
                <StatTile icon={Mail} tone="blue" label="Outreach Pending" value={cases.filter((c) => c.data.outreach === 'Not Contacted').length} />
                <StatTile icon={CheckCircle2} tone="green" label="Platform Flagged" value={platform.filter((p) => p.flagged).length} caption="Disclosed to clients" />
                <StatTile icon={UserMinus} tone="gold" label="Qualifying, Not Yet Flagged" value={platform.filter((p) => p.qualifies && !p.flagged).length} caption="Run the check" />
            </div>

            <div className="grid gap-5 lg:grid-cols-3">
                <Card title="Engagement Health Overview">
                    <Donut data={health} center={total.toLocaleString()} caption="Total" size={120} colors={['#2f9e5b', '#c9a227', '#e8892b', '#d64545']} />
                </Card>
                <Card title="Engagement Trend (Last 6 Months)">
                    <LineChart
                        labels={trend.map((t) => t[0].slice(0, 3))}
                        area={false}
                        series={[
                            { name: 'Healthy', values: trend.map((t) => t[1]), color: '#2f9e5b' },
                            { name: 'Moderate', values: trend.map((t) => t[2]), color: '#c9a227' },
                            { name: 'At Risk', values: trend.map((t) => t[3]), color: '#e8892b' },
                            { name: 'High Risk', values: trend.map((t) => t[4]), color: '#d64545' },
                        ]}
                    />
                </Card>
                <Card title="Top Disuse Indicators (This Month)">
                    <div className="space-y-2">
                        {indicators.map(([l, n]) => (
                            <BarRow key={l} label={l} value={n} max={indTotal} tone="bad" />
                        ))}
                    </div>
                </Card>
            </div>

            <Card title="Platform subscriptions — engagement covenant">
                <SimpleTable
                    columns={['Subscription', 'Client', 'Plan', 'Class', 'Engagement Score', 'Days Inactive', 'Idle Periods', 'Confidence', 'Disuse State']}
                    rows={platform.map((p) => [
                        <span className="font-mono text-xs">{p.reference}</span>,
                        p.client ?? '—',
                        p.plan,
                        <ClassChip code={p.class} compact />,
                        `${p.score}%`,
                        p.days_inactive,
                        p.idle_periods,
                        p.confidence,
                        p.flagged ? <StatusPill status="DISUSE_FLAGGED" tone="bad" /> : p.qualifies ? <StatusPill status="Qualifies" tone="warn" /> : <StatusPill status="Healthy" tone="good" />,
                    ])}
                    empty="No active platform subscriptions."
                />
            </Card>

            <div className="flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3">
                <FilterSelect label="Risk Level" value={filters.risk} onChange={(v) => filterTo(PATH, filters, { risk: v })} options={['At Risk', 'High Risk'].map((r) => ({ value: r, label: r }))} />
                <FilterSelect label="Outreach Status" value={filters.outreach} onChange={(v) => filterTo(PATH, filters, { outreach: v })} options={['Not Contacted', 'Email Sent', 'Call Scheduled'].map((r) => ({ value: r, label: r }))} />
                <form
                    className="flex min-w-0 flex-1 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500"
                    onSubmit={(e) => {
                        e.preventDefault();
                        filterTo(PATH, filters, { q });
                    }}
                >
                    <label htmlFor="dq">Search client or subscription</label>
                    <input id="dq" value={q} onChange={(e) => setQ(e.target.value)} className="h-9 rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" />
                </form>
            </div>

            <div className="grid gap-5 xl:grid-cols-[1fr_280px]">
                <Card title="Disuse Queue (Oldest First)">
                    <SimpleTable
                        columns={['Client / Account', 'Subscription / Plan', 'Class', 'Last Activity', 'Days Inactive', 'Engagement Health', 'Risk Level', 'Primary Disuse Indicators', 'Next Action', 'Outreach', 'Owner', 'Actions']}
                        rows={cases.map((c) => [
                            c.client,
                            <span>
                                {c.plan_name}
                                <span className="block font-mono text-[0.625rem] text-ink-500">{c.reference}</span>
                            </span>,
                            c.recurrence_class && <ClassChip code={c.recurrence_class} compact />,
                            shortDate(c.data.last_activity),
                            <span className="font-semibold text-risk-700">{c.days_inactive}</span>,
                            <StatusPill status={c.data.health} tone={c.data.health === 'Low' ? 'bad' : 'warn'} />,
                            <StatusPill status={c.data.risk} tone={c.data.risk === 'High Risk' ? 'bad' : 'warn'} />,
                            c.data.indicators,
                            <span>
                                {c.data.next_action}
                                <span className="block text-xs text-ink-500">by {shortDate(c.due_at)}</span>
                            </span>,
                            <StatusPill status={c.status === 'open' ? c.data.outreach : c.status ?? ''} tone={c.status !== 'open' ? 'good' : c.data.outreach === 'Not Contacted' ? 'neutral' : 'info'} />,
                            <span className="inline-flex size-7 items-center justify-center rounded-full bg-referenced-50 text-[0.625rem] font-bold text-referenced-700">{c.data.owner}</span>,
                            c.status === 'open' ? (
                                <span className="flex flex-wrap gap-1">
                                    <ConsoleBtn onClick={() => post(`${PATH}/${c.id}`, { action: 'reminder' })}>Value Reminder</ConsoleBtn>
                                    <ConsoleBtn onClick={() => post(`${PATH}/${c.id}`, { action: 'call' })}>Call Task</ConsoleBtn>
                                    <ConsoleBtn tone="gold" onClick={() => post(`${PATH}/${c.id}`, { action: 'reengaged' })}>Re-engaged</ConsoleBtn>
                                    <ConsoleBtn onClick={() => post(`${PATH}/${c.id}`, { action: 'waiver' })}>Waiver</ConsoleBtn>
                                </span>
                            ) : (
                                <span className="text-xs text-ink-500">Closed</span>
                            ),
                        ])}
                        empty="No accounts match these filters."
                    />
                </Card>
                <div className="space-y-5">
                    <Card title="Disuse Rules Snapshot">
                        <ul className="space-y-1 text-xs text-ink-700">
                            <li>R1: two consecutive refreshes unengaged</li>
                            <li>R2: no qualifying interaction where expected</li>
                            <li>R3: two consecutive deliverables unengaged</li>
                            <li>R4: three zero-utilisation periods → value review</li>
                            <li>R5: three periods without engagement</li>
                            <li>LOW / INSUFFICIENT confidence: no automated decision</li>
                        </ul>
                    </Card>
                    <Card title="Top Disuse by Plan / Class">
                        <div className="space-y-2">
                            {byClass.map(([l, n]) => (
                                <BarRow key={l} label={l} value={n} max={classMax} />
                            ))}
                        </div>
                    </Card>
                </div>
            </div>
        </SubAdminShell>
    );
}

Engagement.layout = null;
