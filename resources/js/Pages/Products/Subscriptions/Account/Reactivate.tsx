import { useForm } from '@inertiajs/react';
import { RefreshCw } from 'lucide-react';
import { Checkbox } from '@/Components/ui/Form';
import { CheckList, LabelValues, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, SubStatus, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';

export default function Reactivate({ subscription: sub, currentPrice }: { subscription: SubSubscription; currentPrice: number }) {
    const form = useForm({ mandate_consent: false });
    const eligible = sub.display_status === 'REACTIVATABLE';
    const period = sub.billing_interval === 'annual' ? 'year' : 'month';
    const errors = form.errors as Record<string, string>;

    return (
        <AccountShell sub={sub} title="Reactivation" crumb="Reactivation">
            <RecordHeader
                icon={RefreshCw}
                title="Reactivation"
                sub={sub}
                lead="Bring your subscription back online. Reactivate anytime when you're ready to continue."
                aside={eligible ? <p className="text-xs font-semibold text-risk-700">Inactive since {fmtDate(sub.cancel_effective_at ?? sub.current_period_end)}</p> : undefined}
            />

            {eligible ? (
                <Notice tone="good" className="mb-5" title="Good news — you can reactivate your subscription now.">
                    Your data and settings will be restored and your access is renewed as soon as payment succeeds.
                </Notice>
            ) : (
                <Notice tone="info" className="mb-5" title="This subscription is not inactive">
                    Only a cancelled or closed subscription can be reactivated. Current state: {sub.display_status.replace(/_/g, ' ')}.
                </Notice>
            )}

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="Reactivation Includes">
                            <CheckList items={['Immediate restoration of full subscription access', 'Return to current plan and features', 'Preservation of your data and history', 'No setup fees (just continue)']} />
                        </Card>
                        <Card title="How to Reactivate">
                            <ol className="space-y-2 text-xs text-ink-700">
                                <li><span className="font-semibold">1 Review your plan</span> — confirm you want to continue with {sub.plan.name}.</li>
                                <li><span className="font-semibold">2 Authorise and pay</span> — a fresh recurring authority at the current price.</li>
                                <li><span className="font-semibold">3 Access restored</span> — you're back online with full benefits.</li>
                            </ol>
                        </Card>
                    </div>
                    {eligible && (
                        <Card title="Confirm reactivation">
                            <p className="text-[0.8125rem] text-ink-700">
                                Reactivation is a new, affirmative decision under the current plan, price and terms: <strong>{zar(currentPrice)}</strong> (ex VAT) every {period}.
                            </p>
                            <Checkbox className="mt-3" label={`I authorise TBCA to charge ${zar(currentPrice)} (ex VAT) every ${period} for ${sub.plan.name} until I cancel.`} checked={form.data.mandate_consent} onChange={(e) => form.setData('mandate_consent', e.target.checked)} />
                            {(errors.mandate_consent || errors.status) && <p role="alert" className="mt-1 text-xs text-risk-500">{errors.mandate_consent ?? errors.status}</p>}
                            <div className="mt-4">
                                <PurpleButton onClick={() => form.post(`/subscriptions/account/${sub.reference}/reactivate`)} disabled={form.processing}>
                                    <RefreshCw className="size-4" aria-hidden="true" /> Reactivate Subscription
                                </PurpleButton>
                            </div>
                        </Card>
                    )}
                </div>

                <div className="space-y-4">
                    <Card title="Subscription Status">
                        <LabelValues
                            rows={[
                                { label: 'Status', value: <SubStatus status={eligible ? 'CANCELLED' : sub.display_status} raw={eligible} /> },
                                { label: 'Plan', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                                { label: 'Price (ex VAT)', value: `${zar(currentPrice)} / ${period}` },
                                { label: 'Previous price', value: zar(sub.price_zar) },
                            ]}
                        />
                    </Card>
                    <Notice tone="good" title="Why Reactivate?">Keep your progress. Resume where you left off.</Notice>
                    <Notice tone="gold" title="Important">Your subscription continues at the current price and plan terms.</Notice>
                    <HelpCard sub={sub} title="Still have questions?" body="Chat to our Client Success team." />
                </div>
            </div>
        </AccountShell>
    );
}

Reactivate.layout = null;
