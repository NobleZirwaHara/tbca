import { useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import { CreditCard, Lock, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { Field, Input } from '@/Components/ui/Form';
import { Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, OptionRows, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';

const TIMELINE = [
    ['Day 0 (Today)', 'Payment attempt failed', "We'll try again automatically."],
    ['Day 1', 'Friendly reminder', 'Email reminder with secure payment link.'],
    ['Day 3', 'Second payment attempt', 'Another automatic retry.'],
    ['Day 7', 'Final notice', 'Service may be paused if payment not received.'],
    ['Day 10', 'Access paused', 'Plan features paused until payment is cleared. Your subscription is never cancelled and no data is deleted.'],
];

export default function BillingRecovery({ subscription: sub, eftReference }: { subscription: SubSubscription; eftReference: string }) {
    const [tab, setTab] = useState<'pay' | 'card' | 'eft'>('pay');
    const card = useForm({ card_number: '', expiry: '' });
    const base = `/subscriptions/account/${sub.reference}`;
    const overdue = ['IN_GRACE', 'PAST_DUE'].includes(sub.status);
    const d = sub.meta.dunning;
    const inv = sub.meta.invoice;
    const failedAt = sub.payment_failed_at ? new Date(sub.payment_failed_at) : null;
    const dayIndex = failedAt ? Math.min(4, [0, 1, 3, 7, 10].filter((n) => (Date.now() - failedAt.getTime()) / 86400000 >= n).length - 1) : 0;

    return (
        <AccountShell sub={sub} title="Payment Failure and Dunning" crumb="Payment Failure and Dunning">
            <RecordHeader
                icon={CreditCard}
                tone="red"
                title="Payment Failure and Dunning"
                sub={sub}
                lead={overdue ? "We couldn't process your most recent payment. Let's get this sorted." : 'Your billing is up to date.'}
                aside={
                    overdue ? (
                        <div className="grid grid-cols-2 gap-2 text-center text-xs">
                            <div className="rounded-[6px] border border-risk-500/30 bg-risk-50 p-2">
                                <p className="text-ink-500">Amount overdue</p>
                                <p className="text-base font-bold text-risk-700">{zar(sub.overdue_zar, 2)}</p>
                                <p className="text-ink-500">(ex VAT)</p>
                            </div>
                            <div className="rounded-[6px] border border-parchment-400 p-2">
                                <p className="text-ink-500">Payment due date</p>
                                <p className="text-base font-bold">{fmtDate(sub.payment_failed_at)}</p>
                            </div>
                        </div>
                    ) : undefined
                }
            />

            {!overdue && <Notice tone="good" className="mb-5" title="Nothing overdue">Your payments are up to date. You can still update the card used for future charges below.</Notice>}

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-5 lg:grid-cols-3">
                        <Card title="What happens next">
                            <ol className="space-y-3">
                                {TIMELINE.map(([day, title, body], i) => (
                                    <li key={day} className="flex gap-2">
                                        <span className={cn('mt-0.5 size-3 shrink-0 rounded-full', overdue && i <= dayIndex ? 'bg-risk-500' : 'bg-parchment-400')} aria-hidden="true" />
                                        <div>
                                            <p className="text-xs font-semibold text-ink-900">
                                                {day} · {title}
                                            </p>
                                            <p className="text-[0.6875rem] text-ink-500">{body}</p>
                                        </div>
                                    </li>
                                ))}
                            </ol>
                            {overdue && <p className="mt-3 text-xs font-semibold text-risk-700">Avoid interruption – settle now to keep full access.</p>}
                        </Card>

                        <Card title="Make a payment">
                            <div role="tablist" className="mb-3 grid grid-cols-3 rounded-[6px] border border-parchment-400 p-0.5 text-xs">
                                {(
                                    [
                                        ['pay', 'Pay now'],
                                        ['card', 'Update card'],
                                        ['eft', 'Pay by EFT'],
                                    ] as const
                                ).map(([k, l]) => (
                                    <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('rounded-[4px] py-1.5 font-semibold', tab === k ? 'bg-referenced-500 text-white' : 'text-ink-600')}>
                                        {l}
                                    </button>
                                ))}
                            </div>
                            {tab === 'pay' && (
                                <div className="space-y-3 text-[0.8125rem]">
                                    <p>
                                        Amount to pay <span className="font-bold">{zar(sub.overdue_zar, 2)}</span> (ex VAT)
                                    </p>
                                    <p className="text-xs text-ink-500">Card {sub.mandate?.last4 ? `•••• ${sub.mandate.last4} (Default)` : 'on file'}</p>
                                    <PurpleButton onClick={() => router.post(`${base}/billing-recovery/pay`)} disabled={!overdue}>
                                        <Lock className="size-4" aria-hidden="true" /> Pay now
                                    </PurpleButton>
                                    <p className="flex items-center gap-1 text-[0.6875rem] text-ink-500">
                                        <ShieldCheck className="size-3.5" aria-hidden="true" /> Secure payment page · card, EFT or wallet
                                    </p>
                                </div>
                            )}
                            {tab === 'card' && (
                                <form
                                    className="space-y-3"
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        card.post(`${base}/billing-recovery/card`, { preserveScroll: true, onSuccess: () => card.reset() });
                                    }}
                                >
                                    <Field label="Card number" error={card.errors.card_number} required>
                                        {(id) => <Input id={id} inputMode="numeric" autoComplete="cc-number" value={card.data.card_number} onChange={(e) => card.setData('card_number', e.target.value)} placeholder="4111 1111 1111 1111" />}
                                    </Field>
                                    <Field label="Expiry (MM / YY)" error={card.errors.expiry} required>
                                        {(id) => <Input id={id} autoComplete="cc-exp" value={card.data.expiry} onChange={(e) => card.setData('expiry', e.target.value)} placeholder="12 / 29" />}
                                    </Field>
                                    <PurpleButton type="submit" disabled={card.processing}>Save card for future charges</PurpleButton>
                                </form>
                            )}
                            {tab === 'eft' && (
                                <Notice tone="info" title="Prefer to pay by EFT?">
                                    Use your unique reference so we can match your payment. Reference: <span className="font-mono font-semibold">{eftReference}</span>
                                </Notice>
                            )}
                        </Card>

                        <Card title="Need help?">
                            <OptionRows
                                items={[
                                    { icon: MessageCircle, title: 'Talk to a Specialist', body: 'Available now', onClick: () => openAskQuestion({ subject: `Payment help: ${sub.reference}`, section: 'subscriptions' }) },
                                    { icon: Phone, title: 'Request a Call Back', body: "We'll call you", onClick: () => openAskQuestion({ subject: `Call back about ${sub.reference}`, section: 'subscriptions' }) },
                                    { icon: Mail, title: 'Payment arrangement / hardship', body: 'Ask about more time or a lower plan', onClick: () => openAskQuestion({ subject: `Payment arrangement: ${sub.reference}`, section: 'subscriptions' }) },
                                ]}
                            />
                        </Card>
                    </div>
                    <Notice tone="warn" title="Act now to avoid interruption.">
                        We're here to help if you need more time or a different payment option. You can also pause, change to a lower plan or cancel — your data stays safe either way.
                    </Notice>
                </div>

                <div className="space-y-4">
                    {overdue && (
                        <Notice tone="bad" title="Payment Failed">
                            We attempted to charge your card{sub.mandate?.last4 ? ` ending in ${sub.mandate.last4}` : ''} on {failedAt ? failedAt.toLocaleString('en-ZA') : '—'}. Reason: {d?.reason ?? 'Declined'}. Stage: {d?.stage ?? 'Payment Failed'}.
                        </Notice>
                    )}
                    <Notice tone="info" title="Keep your data safe">Your data is secure. Pay any time to restore access without losing what you've created.</Notice>
                    {inv && (
                        <Card title="Recent invoice">
                            <p className="text-xs text-ink-700">
                                Invoice #{inv.number}
                                <br />
                                Issued: {fmtDate(inv.issued)} · Due: {fmtDate(inv.due)}
                            </p>
                        </Card>
                    )}
                    <HelpCard sub={sub} />
                </div>
            </div>
        </AccountShell>
    );
}

BillingRecovery.layout = null;
