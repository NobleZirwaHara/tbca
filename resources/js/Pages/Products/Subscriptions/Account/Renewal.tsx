import { router } from '@inertiajs/react';
import { CalendarClock, CircleCheck, PauseCircle, TrendingUp, XCircle } from 'lucide-react';
import { CheckList, LabelValues, Notice, TrustRow } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, OptionRows, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { CONTROL_TRUST, Card, RecordHeader, SubStatus, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';

export default function Renewal({ subscription: sub }: { subscription: SubSubscription }) {
    const base = `/subscriptions/account/${sub.reference}`;
    const date = fmtDate(sub.next_charge_at);
    const active = sub.status === 'ACTIVE';
    const pc = sub.price_change?.state === 'pending' || sub.price_change?.state === 'accepted' ? sub.price_change : null;
    const nextPrice = pc && sub.next_charge_at && pc.effective_at <= sub.next_charge_at ? pc.new_price_zar : sub.price_zar;

    return (
        <AccountShell sub={sub} title="Continuation / Renewal Notice" crumb="Renewal Notice">
            <RecordHeader icon={CalendarClock} title="Continuation / Renewal Notice" sub={sub} lead="Stay in control. Review your upcoming continuation and choose your next step." />

            {active ? (
                <Notice tone="warn" icon={CalendarClock} className="mb-5" title={`Your subscription continues on ${date}.`}>
                    This is your advance notice. Review the details below and choose what works best for you.
                </Notice>
            ) : (
                <Notice tone="info" className="mb-5" title="No continuation scheduled">
                    This subscription is {sub.display_status.replace(/_/g, ' ').toLowerCase()}, so no automatic continuation charge is scheduled.
                </Notice>
            )}
            {sub.disuse_flagged && (
                <Notice tone="warn" className="mb-5" title="Low-use disclosure">
                    We have recorded low use of this subscription. You can continue, pause, change or cancel before the charge. <a className="font-semibold underline" href={`${base}/disuse`}>Review options</a>
                </Notice>
            )}

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-5 lg:grid-cols-3">
                        <Card title="Your Current Plan">
                            <LabelValues
                                rows={[
                                    { label: 'Plan', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                                    { label: 'Price (ex VAT)', value: `${zar(sub.price_zar)} / ${sub.billing_interval === 'annual' ? 'year' : 'month'}` },
                                    { label: 'Billing interval', value: `${sub.billing_interval === 'annual' ? 'Annual' : 'Monthly'} in advance` },
                                    { label: 'Next charge date', value: date },
                                    { label: 'Payment method', value: sub.mandate?.last4 ? `•••• ${sub.mandate.last4}` : 'On file' },
                                    { label: 'Status', value: <SubStatus status={sub.display_status} /> },
                                ]}
                            />
                        </Card>
                        <Card title="What Happens Next">
                            <CheckList
                                items={[
                                    `You will be charged ${zar(nextPrice)} (ex VAT) on ${date}.`,
                                    'Your subscription will continue without interruption.',
                                    'You will keep full access to all plan features.',
                                    `You can change, pause or cancel before ${date}.`,
                                ]}
                            />
                            <Notice tone="info" className="mt-3" title="Act at your convenience">
                                You are in control. Take action now or before {date} if you want to make changes.
                            </Notice>
                        </Card>
                        <Card title="Your Renewal Options">
                            <OptionRows
                                items={[
                                    { icon: CircleCheck, title: 'Continue as is', body: 'Do nothing and your plan will continue.', onClick: () => router.post(`${base}/renewal`, {}, { preserveScroll: true }) },
                                    { icon: TrendingUp, title: 'Change your plan', body: 'Upgrade, downgrade or modify your plan.', href: `${base}/change-plan` },
                                    { icon: PauseCircle, title: 'Pause your subscription', body: 'Take a break and pause recurring billing.', href: `${base}/pause` },
                                    { icon: XCircle, title: 'Cancel your subscription', body: `Cancel before ${date} to avoid charges.`, href: `${base}/cancel` },
                                ]}
                            />
                        </Card>
                    </div>
                    <Notice tone="purple" title="Explore more value">
                        Check out additional tools, reports and intelligence you can add to your plan. <a className="font-semibold underline" href="/subscriptions/choose-subscription">Browse Add-ons →</a>
                    </Notice>
                </div>

                <div className="space-y-4">
                    <Card title="Renewal Summary">
                        <LabelValues
                            rows={[
                                { label: 'Plan', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                                { label: 'Current price (ex VAT)', value: zar(sub.price_zar) },
                                ...(pc ? [{ label: 'Price from ' + fmtDate(pc.effective_at), value: <span className="text-risk-700">{zar(pc.new_price_zar)}</span> }] : []),
                                { label: 'Next charge date', value: date },
                                { label: 'Status', value: <SubStatus status={sub.display_status} /> },
                            ]}
                        />
                        {active && (
                            <div className="mt-3">
                                <PurpleButton onClick={() => router.post(`${base}/renewal`, {}, { preserveScroll: true })}>Continue as is</PurpleButton>
                            </div>
                        )}
                    </Card>
                    <Notice tone="good" title="No action required to continue">Your subscription will automatically continue on {date}.</Notice>
                    <Notice tone="info" title="Price change? We'll tell you.">If there is any change to your price, we'll notify you at least 30 days in advance and you'll have the right to cancel.</Notice>
                    <HelpCard sub={sub} title="Need help deciding?" />
                </div>
            </div>
            <div className="mt-6">
                <TrustRow items={CONTROL_TRUST} />
            </div>
        </AccountShell>
    );
}

Renewal.layout = null;
