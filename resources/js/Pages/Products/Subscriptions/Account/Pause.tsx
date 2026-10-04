import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Lock, PauseCircle } from 'lucide-react';
import { CheckList, LabelValues, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, PurpleButton, SummaryCard } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, fmtDate } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

function addMonths(months: number): string {
    const d = new Date();
    d.setMonth(d.getMonth() + months);
    return d.toISOString().slice(0, 10);
}

function shiftDate(iso: string | null, days: number): string | null {
    if (!iso) return null;
    const d = new Date(`${iso}T00:00:00`);
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
}

export default function Pause({ subscription: sub, pausedDays, maxDays }: { subscription: SubSubscription; pausedDays: number; maxDays: number }) {
    const [duration, setDuration] = useState<'1' | '2' | '3' | 'custom'>('1');
    const [custom, setCustom] = useState('');
    const [processing, setProcessing] = useState(false);
    const resume = duration === 'custom' ? custom : addMonths(Number(duration));
    const days = resume ? Math.round((new Date(`${resume}T00:00:00`).getTime() - new Date(new Date().toISOString().slice(0, 10)).getTime()) / 86400000) : 0;
    const remaining = Math.max(0, maxDays - pausedDays);
    const pastDue = ['IN_GRACE', 'PAST_DUE'].includes(sub.status);
    const blocked = sub.status !== 'ACTIVE' || !sub.plan.pause_allowed;
    const tooLong = days > remaining;

    const confirm = () =>
        router.post(`/subscriptions/account/${sub.reference}/pause`, { duration, resume_on: duration === 'custom' ? custom : null }, { onStart: () => setProcessing(true), onFinish: () => setProcessing(false) });

    return (
        <AccountShell sub={sub} title="Pause Your Subscription" crumb="Pause Subscription">
            <RecordHeader icon={PauseCircle} title="Pause Your Subscription" sub={sub} lead="Take a break while keeping your data and settings safe." />

            <Notice tone="info" className="mb-5" title="How pausing works">
                You can pause your subscription for a continuous period of 1 to 3 months ({maxDays} days in any 12 months; {remaining} days remaining). You won't be billed during the pause. Most access will be paused. Your data and settings are kept safe. You can resume anytime.
            </Notice>
            {pastDue && <Notice tone="bad" className="mb-4" title="Billing is past due">Please settle outstanding payments before pausing.</Notice>}
            {!sub.plan.pause_allowed && <Notice tone="warn" className="mb-4" title="Pause not available">This plan does not offer a pause. You can change plan or cancel instead.</Notice>}
            {sub.status === 'PAUSED' && <Notice tone="info" className="mb-4" title="Already paused">Your subscription resumes on {fmtDate(sub.pause_until)}. You can resume earlier from the Overview page.</Notice>}

            <div className="grid gap-5 xl:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    <Card title="1. Choose a pause duration">
                        <div role="radiogroup" aria-label="Pause duration" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            {(['1', '2', '3'] as const).map((m) => (
                                <button
                                    key={m}
                                    type="button"
                                    role="radio"
                                    aria-checked={duration === m}
                                    onClick={() => setDuration(m)}
                                    className={cn('rounded-[8px] border p-4 text-left', duration === m ? 'border-referenced-500 bg-referenced-50 ring-1 ring-referenced-500' : 'border-parchment-400 bg-white')}
                                >
                                    <p className="font-semibold text-ink-900">
                                        {m} Month{m === '1' ? '' : 's'}
                                    </p>
                                    <p className="text-xs text-ink-500">{m === '1' ? 'Ideal for short breaks' : m === '2' ? 'For planned downtime' : 'Extended break'}</p>
                                    <p className="mt-2 text-xs text-ink-700">Resume: {fmtDate(addMonths(Number(m)))}</p>
                                    <p className="mt-2 border-t border-parchment-300 pt-2 text-[0.6875rem] text-ink-500">No charge</p>
                                </button>
                            ))}
                            <div className={cn('rounded-[8px] border p-4', duration === 'custom' ? 'border-referenced-500 bg-referenced-50 ring-1 ring-referenced-500' : 'border-parchment-400 bg-white')}>
                                <button type="button" role="radio" aria-checked={duration === 'custom'} onClick={() => setDuration('custom')} className="text-left">
                                    <p className="font-semibold text-ink-900">Custom Period</p>
                                    <p className="text-xs text-ink-500">Choose your dates</p>
                                </button>
                                <label className="mt-2 block text-xs text-ink-700">
                                    Resume on
                                    <input type="date" value={custom} onChange={(e) => { setCustom(e.target.value); setDuration('custom'); }} className="mt-1 h-8 w-full rounded border border-parchment-500 px-2 text-xs" />
                                </label>
                            </div>
                        </div>
                        {tooLong && <Notice tone="warn" className="mt-3" title="Pausing for longer?">This exceeds your remaining pause allowance. Talk to us to discuss the best option for you.</Notice>}
                    </Card>

                    <Card title="2. What happens when you pause?">
                        <CheckList items={['Billing is paused immediately.', 'Most content and tools access will be paused.', 'Your data, settings and history remain safe.', 'You can resume anytime.', 'Your next billing date will adjust when you resume.']} />
                    </Card>

                    <Card title="3. Impact on your subscription">
                        <LabelValues
                            rows={[
                                { label: 'Billing', value: 'No charges during pause' },
                                { label: 'Access to content & tools', value: 'Paused' },
                                { label: 'Data & settings', value: 'Safe and retained' },
                                { label: 'Support', value: 'Paused (reactivates on resume)' },
                                { label: 'Next billing date', value: `${fmtDate(shiftDate(sub.next_charge_at, Math.max(0, days)))} (if paused for ${days} days)` },
                            ]}
                        />
                        <div className="mt-4 flex flex-wrap items-center gap-3">
                            <PurpleButton onClick={confirm} disabled={blocked || pastDue || processing || !resume || days < 30 || tooLong}>
                                Confirm Pause ({duration === 'custom' ? `${days} days` : `${duration} Month${duration === '1' ? '' : 's'}`})
                            </PurpleButton>
                            <PurpleButton tone="outline" onClick={() => router.visit(`/subscriptions/account/${sub.reference}`)}>Cancel</PurpleButton>
                            <span className="flex items-center gap-1 text-xs text-ink-500">
                                <Lock className="size-3.5" aria-hidden="true" /> You can resume or cancel anytime.
                            </span>
                        </div>
                        {duration === 'custom' && resume && days < 30 && <p className="mt-2 text-xs text-risk-600">The minimum pause is 1 month (30 days).</p>}
                    </Card>
                </div>

                <div className="space-y-4">
                    <SummaryCard sub={sub} />
                    <Card title="During the pause, you will keep">
                        <CheckList items={['Your data and settings', 'Account history and reports', 'Saved templates and custom content', 'Any purchased reports or downloads']} />
                    </Card>
                    <HelpCard sub={sub} />
                </div>
            </div>
        </AccountShell>
    );
}

Pause.layout = null;
