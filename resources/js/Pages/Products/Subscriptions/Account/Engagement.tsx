import { useState } from 'react';
import { Activity, CheckCircle2, Clock, FileText, LogIn, TriangleAlert } from 'lucide-react';
import { Tabs } from '@/Components/ui/Kit';
import { BarRow, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, StatTile, TextLink, fmtDate } from '@/Components/Products/Subscriptions/ui';
import { LineChart } from '@/Components/Products/Subscriptions/charts';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';

export default function Engagement({ subscription: sub }: { subscription: SubSubscription }) {
    const [tab, setTab] = useState('overview');
    const u = sub.usage;
    const base = `/subscriptions/account/${sub.reference}`;
    const daily = u.daily ?? [];
    const score = u.score ?? 0;
    const health = u.health ?? {};

    return (
        <AccountShell sub={sub} title="Engagement & Usage" crumb="Engagement & Usage">
            <RecordHeader icon={Activity} title="Engagement & Usage" sub={sub} lead="See how you are engaging with your subscription and the value you are receiving." />

            {sub.disuse_flagged && (
                <Notice tone="warn" className="mb-4" title="We may be seeing less use of this subscription">
                    TBCA may not see use after download, through another authorised user, or outside the platform. <TextLink href={`${base}/disuse`}>Review your options</TextLink>
                </Notice>
            )}

            <Tabs
                className="mb-4"
                value={tab}
                onChange={setTab}
                tabs={[
                    { key: 'overview', label: 'Overview' },
                    { key: 'content', label: 'Content & Access' },
                    { key: 'value', label: 'Value Delivered' },
                    { key: 'activity', label: 'Activity Log' },
                ]}
            />

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <StatTile icon={LogIn} tone="green" label="Logins" value={u.logins ?? 0} caption="This period" delta={u.logins_delta} />
                        <StatTile icon={FileText} tone="blue" label="Content Accessed" value={u.content ?? 0} delta={u.content_delta} />
                        <StatTile icon={Activity} tone="purple" label="Reports Generated" value={u.reports ?? 0} delta={u.reports_delta} />
                        <StatTile icon={Clock} tone="orange" label="Average Session Time" value={`${u.session_minutes ?? 0}m`} caption="Per session" delta={u.session_delta} />
                    </div>

                    {(tab === 'overview' || tab === 'content') && (
                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card title="Engagement Over Time">
                                {daily.length > 1 ? (
                                    <LineChart
                                        labels={daily.map((d) => fmtDate(d.date, { day: '2-digit', month: 'short' }))}
                                        series={[
                                            { name: 'Logins', values: daily.map((d) => d.logins), color: '#2f9e5b' },
                                            { name: 'Content Accesses', values: daily.map((d) => d.content), color: '#3b7dd8' },
                                        ]}
                                    />
                                ) : (
                                    <p className="text-xs text-ink-500">Daily activity appears here once you start using the subscription.</p>
                                )}
                            </Card>
                            <Card title="Top Content Accessed">
                                <ol className="space-y-1.5 text-[0.8125rem]">
                                    {(u.top_content ?? []).map(([name, n], i) => (
                                        <li key={name} className="flex justify-between gap-2">
                                            <span>
                                                {i + 1}. {name}
                                            </span>
                                            <span className="text-xs text-ink-500">Viewed {n} times</span>
                                        </li>
                                    ))}
                                    {(u.top_content ?? []).length === 0 && <li className="text-xs text-ink-500">No content accessed this period.</li>}
                                </ol>
                            </Card>
                        </div>
                    )}

                    {(tab === 'overview' || tab === 'value') && (
                        <div className="grid gap-5 lg:grid-cols-2">
                            <Card title="Feature Usage">
                                <div className="space-y-2">
                                    {(u.features ?? []).map(([f, pct]) => (
                                        <BarRow key={f} label={f} value={pct} max={100} suffix="%" tone="info" />
                                    ))}
                                </div>
                            </Card>
                            <Card title="Value Delivered This Period">
                                {u.value ? (
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div><p className="text-2xl font-bold text-ink-900">{u.value.decisions}</p><p className="text-xs text-ink-500">Decisions supported</p><p className="text-[0.6875rem] text-verified-700">↑{u.value.decisions_delta}%</p></div>
                                        <div><p className="text-2xl font-bold text-ink-900">{u.value.hours} hrs</p><p className="text-xs text-ink-500">Time saved (est.)</p><p className="text-[0.6875rem] text-verified-700">↑{u.value.hours_delta}%</p></div>
                                        <div><p className="text-2xl font-bold text-ink-900">{u.value.risks}</p><p className="text-xs text-ink-500">Risks mitigated</p><p className="text-[0.6875rem] text-verified-700">↑{u.value.risks_delta}%</p></div>
                                    </div>
                                ) : (
                                    <p className="text-xs text-ink-500">Value estimates are produced after the first full period.</p>
                                )}
                            </Card>
                        </div>
                    )}

                    {tab === 'activity' && (
                        <Card title="Activity Log">
                            <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                                {(u.activity ?? []).map(([date, item, act]) => (
                                    <li key={date + item} className="flex justify-between gap-2 py-2">
                                        <span>{item}</span>
                                        <span className="text-xs text-ink-500">
                                            {act} · {fmtDate(date)}
                                        </span>
                                    </li>
                                ))}
                                {(u.activity ?? []).length === 0 && <li className="py-2 text-xs text-ink-500">No activity recorded.</li>}
                            </ul>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card title="Engagement Health">
                        <div className="flex items-center gap-4">
                            <div className="relative size-24 shrink-0">
                                <svg viewBox="0 0 36 36" className="size-full -rotate-90" aria-hidden="true">
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--color-parchment-300)" strokeWidth="3.5" />
                                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={score >= 60 ? '#2f9e5b' : '#e8892b'} strokeWidth="3.5" strokeDasharray={`${score} ${100 - score}`} />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold">{score}%</span>
                            </div>
                            <div className="text-xs text-ink-600">
                                <p className="font-semibold text-ink-900">{score >= 60 ? 'Your engagement looks good.' : 'Engagement is lower than expected.'}</p>
                                Telemetry confidence: {u.confidence ?? 'HIGH'}
                            </div>
                        </div>
                        <ul className="mt-3 space-y-1 text-xs">
                            {Object.entries(health).map(([k, ok]) => (
                                <li key={k} className="flex items-center gap-2">
                                    {ok ? <CheckCircle2 className="size-3.5 text-verified-600" aria-hidden="true" /> : <TriangleAlert className="size-3.5 text-attested-600" aria-hidden="true" />}
                                    {k}
                                </li>
                            ))}
                        </ul>
                    </Card>
                    <Card title="Alerts & Notices">
                        <ul className="space-y-1.5 text-xs text-ink-700">
                            <li>{sub.disuse_flagged ? 'Low-use notice open — review your options.' : 'All updates current. You have the latest content and alerts.'}</li>
                            <li>{sub.price_change?.state === 'pending' ? `Price change effective ${fmtDate(sub.price_change.effective_at)}.` : 'No price changes pending.'}</li>
                            <li>Next review due {fmtDate(sub.next_review_at)}.</li>
                        </ul>
                    </Card>
                    <HelpCard sub={sub} title="Need More Value?" body="Our specialists can help you get the most from your subscription." />
                </div>
            </div>
        </AccountShell>
    );
}

Engagement.layout = null;
