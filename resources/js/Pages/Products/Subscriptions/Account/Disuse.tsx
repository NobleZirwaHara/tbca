import { router } from '@inertiajs/react';
import { Activity, CircleCheck, Eye, PauseCircle, TrendingDown, TriangleAlert, XCircle } from 'lucide-react';
import { CheckList, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, StatTile, fmtDate } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';

const CHOICES = [
    { choice: 'CONTINUE', icon: CircleCheck, title: 'Continue as is', body: 'Keep your plan. Nothing changes.' },
    { choice: 'PAUSE', icon: PauseCircle, title: 'Pause your subscription', body: 'Temporarily pause billing while you reassess.' },
    { choice: 'CHANGE', icon: TrendingDown, title: 'Change / downgrade your plan', body: 'Switch to a plan that better matches your current needs.' },
    { choice: 'CANCEL', icon: XCircle, title: 'Cancel your subscription', body: 'Cancel anytime. No penalties.' },
];

export default function Disuse({ subscription: sub }: { subscription: SubSubscription }) {
    const u = sub.usage;
    const choose = (choice: string) => router.post(`/subscriptions/account/${sub.reference}/disuse`, { choice });

    return (
        <AccountShell sub={sub} title="Proactive Disuse Notice" crumb="Disuse Notice">
            <RecordHeader icon={Activity} title="Proactive Disuse Notice" sub={sub} lead="We haven't seen much activity recently. Let's make sure your subscription continues to deliver value." />

            {!sub.disuse_flagged && (
                <Notice tone="good" className="mb-4" title="No open low-use notice">
                    Your engagement does not currently meet a disuse threshold. This page shows your options at any time.
                </Notice>
            )}

            <Notice tone="warn" icon={TriangleAlert} className="mb-5" title="We've noticed low engagement with your subscription.">
                You've had limited activity over the past 60 days ({u.days_inactive ?? 0} days since last qualifying activity, confidence {u.confidence ?? 'HIGH'}). Regular use ensures you get the most value from your subscription. Payment is never treated as proof of value, and nothing changes unless you choose.
            </Notice>

            <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    <Card title="Your Engagement at a Glance (compared to previous 60 days)">
                        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
                            <StatTile icon={Activity} tone="red" label="Logins" value={u.logins ?? 0} delta={u.logins_delta} />
                            <StatTile icon={Eye} tone="red" label="Content Accessed" value={u.content ?? 0} delta={u.content_delta} />
                            <StatTile icon={Activity} tone="red" label="Reports Generated" value={u.reports ?? 0} delta={u.reports_delta} />
                            <StatTile icon={Activity} tone="red" label="Avg. Session Time" value={`${u.session_minutes ?? 0}m`} delta={u.session_delta} />
                            <StatTile icon={Activity} tone="red" label="Tasks Completed" value={u.tasks ?? 0} delta={u.tasks_delta} />
                        </div>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">These numbers help us understand how we can better support you. TBCA may not see use after download or through another authorised user.</p>
                    </Card>

                    <Card title="Choose what you'd like to do">
                        <p className="mb-3 text-xs text-ink-500">All options carry equal weight. None is preselected.</p>
                        <div className="grid gap-3 sm:grid-cols-2">
                            {CHOICES.map(({ choice, icon: Icon, title, body }) => (
                                <button key={choice} type="button" onClick={() => choose(choice)} className="flex items-start gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 text-left hover:border-ink-900 focus-visible:ring-2 focus-visible:ring-gold-500">
                                    <Icon className="mt-0.5 size-5 shrink-0 text-ink-700" aria-hidden="true" />
                                    <span>
                                        <span className="block text-sm font-semibold text-ink-900">{title}</span>
                                        <span className="block text-xs text-ink-500">{body}</span>
                                    </span>
                                </button>
                            ))}
                        </div>
                    </Card>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="What You're Missing Out On">
                            <CheckList items={u.missing ?? sub.plan.entitlements.slice(0, 5)} />
                        </Card>
                        <Card title="Your Recent Activity (last 90 days)">
                            <ul className="divide-y divide-parchment-300 text-xs">
                                {(u.activity ?? []).map(([date, item, act]) => (
                                    <li key={date + item} className="flex justify-between gap-2 py-1.5">
                                        <span className="text-ink-800">{item}</span>
                                        <span className="text-ink-500">
                                            {act} · {fmtDate(date, { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </span>
                                    </li>
                                ))}
                                {(u.activity ?? []).length === 0 && <li className="py-1.5 text-ink-500">No recorded activity.</li>}
                            </ul>
                        </Card>
                    </div>
                </div>

                <div className="space-y-4">
                    <HelpCard sub={sub} title="We're Here to Help" body="If you have questions or need guidance, reach out and we'll assist." />
                    <Card title="Need More Time?">
                        <p className="text-xs text-ink-600">You can pause your subscription for up to 90 days in any 12 months.</p>
                    </Card>
                </div>
            </div>
        </AccountShell>
    );
}

Disuse.layout = null;
