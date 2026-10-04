import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { Bell } from 'lucide-react';
import { CheckList, LabelValues, Notice, TrustRow } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { CONTROL_TRUST, Card, RecordHeader, SubStatus, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';
import { cn } from '@/lib/cn';

export default function PriceChange({ subscription: sub }: { subscription: SubSubscription }) {
    const pc = sub.price_change;
    const base = `/subscriptions/account/${sub.reference}`;
    const [choice, setChoice] = useState<'accept' | 'change' | 'pause' | 'exit' | null>(null);

    if (!pc) {
        return (
            <AccountShell sub={sub} title="Price Change Notice and Exit Right" crumb="Price Change Notice">
                <RecordHeader icon={Bell} title="Price Change Notice and Exit Right" sub={sub} />
                <Notice tone="good" title="No price change">There is no price change on this subscription. We will always give at least 30 days' notice and an exit right.</Notice>
            </AccountShell>
        );
    }

    const diff = pc.new_price_zar - pc.old_price_zar;
    const pct = pc.old_price_zar ? ((diff / pc.old_price_zar) * 100).toFixed(2) : '0.00';
    const pending = pc.state === 'pending';
    const effective = fmtDate(pc.effective_at);

    const submit = () => {
        if (choice === 'accept') router.post(`${base}/price-change`, { decision: 'accept' });
        else if (choice === 'exit' && window.confirm(`Cancel before ${effective}? Access continues to the end of your current period and the new price never applies.`)) router.post(`${base}/price-change`, { decision: 'exit' });
        else if (choice === 'change') router.visit(`${base}/change-plan`);
        else if (choice === 'pause') router.visit(`${base}/pause`);
    };

    const options = [
        { key: 'accept' as const, title: 'Accept the new price', body: 'Continue your subscription at the new price.', extra: `New price from ${effective}: ${zar(pc.new_price_zar)} / month (ex VAT)` },
        { key: 'change' as const, title: 'Change your plan', body: 'Explore other plans that may better suit your needs.' },
        { key: 'pause' as const, title: 'Pause your subscription', body: 'Take a break and pause recurring billing.' },
        { key: 'exit' as const, title: `Cancel before ${effective}`, body: 'Exercise your exit right and cancel penalty-free.' },
    ];

    return (
        <AccountShell sub={sub} title="Price Change Notice and Exit Right" crumb="Price Change Notice">
            <RecordHeader
                icon={Bell}
                title="Price Change Notice and Exit Right"
                sub={sub}
                lead="We're updating the price of your subscription. Review the details and choose what works for you."
                aside={
                    <div className="rounded-[6px] border border-parchment-400 px-3 py-2 text-right text-xs">
                        <p>Effective date <span className="font-semibold">{effective}</span></p>
                        <p className="font-semibold text-risk-700">You have until {fmtDate(pc.decide_by)} to decide</p>
                        <p className="text-ink-500">(30 days notice)</p>
                    </div>
                }
            />

            {pending ? (
                <Notice tone="warn" className="mb-5" title="We are changing the price of your subscription.">
                    {pc.basis}. You have the right to accept the new price or cancel without penalty.
                </Notice>
            ) : (
                <Notice tone="good" className="mb-5" title="Decision recorded">
                    {pc.state === 'accepted' ? `You accepted the new price from ${effective}.` : pc.state === 'exit' ? 'You exercised your exit right.' : 'The new price is now in effect.'}
                </Notice>
            )}

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-5 lg:grid-cols-3">
                        <Card title="Your Current Plan">
                            <LabelValues
                                rows={[
                                    { label: 'Plan', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                                    { label: 'Current price (ex VAT)', value: zar(pc.old_price_zar) },
                                    { label: 'Billing interval', value: 'Monthly in advance' },
                                    { label: 'Next charge date', value: fmtDate(sub.next_charge_at) },
                                    { label: 'Status', value: <SubStatus status={sub.display_status} /> },
                                ]}
                            />
                        </Card>
                        <Card title="Your New Price (ex VAT)">
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="rounded-[6px] border border-parchment-400 p-3">
                                    <p className="text-xs text-ink-500">Current</p>
                                    <p className="text-lg font-bold">{zar(pc.old_price_zar)}</p>
                                </div>
                                <div className="rounded-[6px] border border-risk-500/30 bg-risk-50 p-3">
                                    <p className="text-xs text-ink-500">New</p>
                                    <p className="text-lg font-bold text-risk-700">{zar(pc.new_price_zar)}</p>
                                </div>
                            </div>
                            <p className="mt-2 text-center text-sm font-semibold text-risk-700">
                                {diff >= 0 ? 'Increase +' : 'Decrease −'}
                                {zar(Math.abs(diff))} / month ({diff >= 0 ? '+' : ''}
                                {pct}%)
                            </p>
                            <p className="mt-1 text-center text-[0.6875rem] text-ink-500">VAT will be added at the applicable rate.</p>
                        </Card>
                        <Card title="What stays the same">
                            <CheckList items={['Your plan features and access', 'Billing interval and cadence', `Next charge date (${fmtDate(sub.next_charge_at)})`, 'Payment method and settings', 'Your data, history and reports']} />
                        </Card>
                    </div>

                    {pending && (
                        <Card title="Choose what you'd like to do">
                            <p className="mb-3 text-xs text-ink-500">Your choice will apply from the effective date above.</p>
                            <div role="radiogroup" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {options.map((o) => (
                                    <button key={o.key} type="button" role="radio" aria-checked={choice === o.key} onClick={() => setChoice(o.key)} className={cn('rounded-[8px] border p-4 text-left', choice === o.key ? 'border-referenced-500 bg-referenced-50 ring-1 ring-referenced-500' : 'border-parchment-400 bg-white')}>
                                        <p className="text-sm font-semibold text-ink-900">{o.title}</p>
                                        <p className="mt-1 text-xs text-ink-500">{o.body}</p>
                                        {o.extra && <p className="mt-2 text-xs font-semibold text-ink-800">{o.extra}</p>}
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                <PurpleButton onClick={submit} disabled={!choice} tone={choice === 'exit' ? 'danger' : 'purple'}>
                                    Confirm my choice
                                </PurpleButton>
                                <span className="text-xs text-ink-500">If you do nothing, your subscription will continue at the new price from {effective}.</span>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card title="Price Change Summary">
                        <LabelValues
                            rows={[
                                { label: 'Plan', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                                { label: 'Current price', value: zar(pc.old_price_zar) },
                                { label: 'New price', value: <span className="text-risk-700">{zar(pc.new_price_zar)}</span> },
                                { label: 'Change', value: `${diff >= 0 ? '+' : '−'}${zar(Math.abs(diff))} (${pct}%)` },
                                { label: 'Effective date', value: effective },
                                { label: 'Notice period', value: `30 days (until ${fmtDate(pc.decide_by)})` },
                            ]}
                        />
                    </Card>
                    <Notice tone="good" title="Your exit right">You can cancel before {effective} and avoid the new price.</Notice>
                    <HelpCard sub={sub} title="Need help deciding?" />
                    <p className="text-xs text-ink-500">
                        <Link href="/subscriptions/compare" className="font-semibold text-referenced-700">Compare plans</Link> · <Link href={`/subscriptions/${sub.plan.slug}/disclosure`} className="font-semibold text-referenced-700">See full terms</Link>
                    </p>
                </div>
            </div>
            <div className="mt-6">
                <TrustRow items={CONTROL_TRUST} />
            </div>
        </AccountShell>
    );
}

PriceChange.layout = null;
