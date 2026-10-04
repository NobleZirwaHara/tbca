import { Head, router } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, CreditCard, Hourglass, Lock, RefreshCw, ShieldCheck, X } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, DdHero, NextStepBand, rand, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdJourneyStep } from '@/types/due-diligence';

interface Props {
    state: 'processing' | 'success' | 'failed';
    kind: 'case' | 'monitoring';
    order: { reference: string; status: string; subtotal: number; vat: number; fees: number; total: number; billing: Record<string, string> | null; createdAt: string; paidAt: string | null; items: { name: string; item_code: string; item_type: string; line_zar: number }[] };
    payment: { reference: string; method: string; status: string; reason: string | null; createdAt: string; idempotency: string } | null;
    attempts: number;
    quote: { reference: string; payer: string | null } | null;
    subscription: { reference: string; plan: string; status: string } | null;
    case: { reference: string; name: string; package: string; status: string } | null;
    journey: DdJourneyStep[];
}

/** DD-028 Payment Processing, DD-029 Payment Success and Case Activation, DD-030 Payment Failure and Recovery. */
export default function Status({ state, kind, order, payment, attempts, quote, subscription, case: c, journey }: Props) {
    const sum = (type: string) => order.items.filter((i) => i.item_type === type).reduce((s, i) => s + i.line_zar, 0);
    const summary = (
        <Card title="Payment summary">
            <dl className="space-y-1 text-[0.8125rem]">
                {[['TBCA Expert Fee', sum('dd-expert')], ['TBCA Platform Fee', sum('dd-platform')], ['External Third-Party Costs*', sum('dd-external')], ['Payment Handling Fee', order.fees]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd>{rand(v as number, 2)}</dd></div>)}
                <div className="flex justify-between border-t border-parchment-300 pt-1 font-semibold"><dt>Subtotal (ex VAT)</dt><dd>{rand(order.subtotal + order.fees, 2)}</dd></div>
                <div className="flex justify-between"><dt className="text-ink-500">VAT (15%)</dt><dd>{rand(order.vat, 2)}</dd></div>
                <div className={cn('flex justify-between rounded px-2 py-1 font-bold', state === 'failed' ? 'bg-risk-50 text-risk-700' : 'bg-gold-50')}><dt>Total (incl. VAT)</dt><dd>{rand(order.total, 2)}</dd></div>
            </dl>
            <p className="mt-2 text-[0.6875rem] text-ink-500">* External costs are pass-through costs charged by data providers, registries or authorities and vary by jurisdiction and scope.</p>
        </Card>
    );
    const steps = ['Payment Initiated', 'Processing', 'Verifying', 'Confirmed', kind === 'case' ? 'Case Unlocked' : 'Monitoring Active'];
    const reached = state === 'success' ? 5 : 2;

    const titles = {
        processing: ['Payment Processing', 'We are securely processing your payment.', 'Do not close this window. We will confirm your payment and unlock your case automatically.', 'CS2 Payment Pending', 'PY2 Payment Pending'],
        success: [kind === 'case' ? 'Payment Success and Case Activation' : 'Monitoring Activated', 'Payment verified. Entitlement active.', 'Your payment has been verified and your entitlement is active.', kind === 'case' ? 'CS3 Active' : 'CS6 Monitoring', 'PY3 Paid'],
        failed: ['Payment Failure and Recovery', 'We were unable to complete your payment.', 'No successful charge has been made. You can safely retry, choose another payment method, or contact our support team for assistance.', 'CS2 Payment Pending', 'PY4 Failed'],
    }[state];

    return (
        <>
            <Head title={titles[0]} />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: titles[0] }]}
                title={titles[0]}
                subtitle={titles[1]}
                description={titles[2]}
                chips={[{ label: 'Lifecycle Stage', value: state === 'success' ? '0' : 'C' }, { label: 'Public Stage', value: '2 Consent & Payment' }, { label: 'Case State', value: titles[3] }, { label: 'Payment State', value: titles[4] }, { label: 'Entitlement', value: state === 'success' ? 'EN2 Active' : 'EN1 Locked' }]}
                journey={journey}
                current={state === 'success' ? 3 : 2}
                completed={state === 'success' ? 2 : 1}
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-12">
                    <div className="space-y-5 lg:col-span-8">
                        {state === 'failed' && (
                            <div className="grid gap-4 rounded-[10px] border border-risk-500/30 bg-risk-50 p-4 md:grid-cols-4">
                                <div className="flex gap-3 md:col-span-1"><AlertTriangle className="size-8 shrink-0 text-risk-600" aria-hidden="true" /><div><p className="font-serif text-lg font-semibold text-ink-900">Payment was not completed</p><p className="text-xs text-ink-600">Transaction could not be authorised at this time.</p></div></div>
                                {[['No charge was recorded.', 'We do not take payment until it is verified.'], ['Your order remains safe.', 'No duplicate case was created.'], ['You can retry or choose an alternative.', 'The same order ID remains valid.']].map(([a, b]) => (
                                    <div key={a} className="flex gap-2 text-xs"><CheckCircle2 className="size-4 shrink-0 text-risk-500" aria-hidden="true" /><span><strong className="block text-ink-900">{a}</strong>{b}</span></div>
                                ))}
                            </div>
                        )}

                        <Card>
                            <div className="grid gap-5 md:grid-cols-2">
                                <div>
                                    <p className="flex items-center gap-2 font-serif text-lg font-semibold">
                                        {state === 'success' ? <CheckCircle2 className="size-6 text-verified-500" aria-hidden="true" /> : state === 'failed' ? <X className="size-6 text-risk-500" aria-hidden="true" /> : <Lock className="size-6 text-gold-600" aria-hidden="true" />}
                                        {state === 'success' ? 'Payment verified' : state === 'failed' ? 'What happened?' : 'Payment is being processed securely'}
                                    </p>
                                    {state === 'processing' && <p className="mt-1 text-xs text-ink-500">We are verifying the payment response. Your case will unlock only after a verified webhook, bank match or approved enterprise credit.</p>}
                                    <dl className="mt-3 space-y-1.5 text-[0.8125rem]">
                                        {[
                                            ['Order ID', order.reference],
                                            ['Reference', quote?.reference ?? subscription?.reference ?? '—'],
                                            ...(payment ? [['Payment Reference', payment.reference], ['Attempted', shortDate(payment.createdAt, true)], ['Payment Method', payment.method.toUpperCase()]] : []),
                                            ...(state === 'failed' && payment ? [['Gateway / Bank Response', 'Payment Declined'], ['Reason Code', payment.reason ?? 'Declined'], ['Idempotency Key', payment.idempotency], ['Attempts', String(attempts)]] : []),
                                            ['Amount (incl. VAT)', rand(order.total, 2)],
                                            ['Payer', quote?.payer ?? order.billing?.company ?? order.billing?.name ?? '—'],
                                        ].map(([k, v]) => <div key={k} className="flex justify-between gap-3"><dt className="text-ink-500">{k}</dt><dd className={cn('text-right font-medium', k === 'Gateway / Bank Response' && 'rounded bg-risk-50 px-1.5 text-risk-700')}>{v}</dd></div>)}
                                    </dl>
                                </div>
                                <div>
                                    <ol className="flex items-start">
                                        {steps.map((s, i) => (
                                            <li key={s} className="flex flex-1 flex-col items-center text-center">
                                                <span className={cn('flex size-9 items-center justify-center rounded-full border-2', i < reached ? 'border-gold-500 bg-gold-500 text-ink-950' : state === 'failed' && i === 2 ? 'border-risk-500 text-risk-500' : 'border-parchment-400 text-ink-300')}>
                                                    {i === 1 && state === 'processing' ? <Hourglass className="size-4" /> : i < reached ? <CheckCircle2 className="size-4" /> : i + 1}
                                                </span>
                                                <span className="mt-1 text-[0.625rem] leading-tight text-ink-600">{s}</span>
                                            </li>
                                        ))}
                                    </ol>
                                    {state === 'processing' && (
                                        <div className="mt-4 space-y-3">
                                            <p className="rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs"><strong className="block">Almost there</strong>This usually takes a few seconds. For EFTs, bank confirmation may take up to 2 business days.</p>
                                            <p className="rounded-[8px] bg-parchment-200 p-3 text-xs"><strong className="block">For your safety</strong>Do not click the back button repeatedly. Use “Check status” to refresh safely.</p>
                                        </div>
                                    )}
                                    {state === 'success' && c && (
                                        <div className="mt-4 rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-sm">
                                            <p className="font-semibold text-ink-900">Case {c.reference} activated</p>
                                            <p className="text-xs text-ink-600">{c.name} · {c.package}</p>
                                            <p className="mt-1 text-xs text-ink-600">Next: complete the consent centre, subject details and evidence uploads.</p>
                                        </div>
                                    )}
                                    {state === 'success' && kind === 'monitoring' && subscription && <p className="mt-4 rounded-[8px] bg-verified-50 p-3 text-sm">Subscription {subscription.reference} ({subscription.plan}) is {subscription.status}.</p>}
                                </div>
                            </div>
                        </Card>

                        {state === 'failed' && (
                            <div className="grid gap-4 md:grid-cols-3">
                                <Card title="Retry Payment"><p className="mb-3 text-xs text-ink-500">Retry this order using the same or updated details.</p><ButtonLink href={`/checkout/${order.reference}`} className="w-full bg-risk-600" trailingIcon="arrow-right"><RefreshCw className="size-4" aria-hidden="true" /> Retry Payment</ButtonLink></Card>
                                <Card title="Choose Another Method"><p className="mb-3 text-xs text-ink-500">Use EFT or wallet on the secure payment page.</p><ButtonLink href={`/checkout/${order.reference}`} variant="outline" className="w-full"><CreditCard className="size-4" aria-hidden="true" /> Change Method</ButtonLink></Card>
                                <Card title="Save & Try Later"><p className="mb-3 text-xs text-ink-500">We will save your order. Return when ready.</p><ButtonLink href="/due-diligence/cases" variant="outline" className="w-full">Save & Exit</ButtonLink></Card>
                            </div>
                        )}
                    </div>
                    <aside className="space-y-4 lg:col-span-4">
                        {summary}
                        {state === 'processing' && (
                            <>
                                <Button type="button" className="w-full" onClick={() => router.reload()}><RefreshCw className="size-4" aria-hidden="true" /> Check status</Button>
                                <ButtonLink href={`/checkout/${order.reference}`} variant="outline" className="w-full">Complete Payment</ButtonLink>
                                <ButtonLink href="/due-diligence/cases" variant="ghost" className="w-full">Cancel Safely — resume from your dashboard</ButtonLink>
                            </>
                        )}
                        {state === 'success' && c && <ButtonLink href={`/due-diligence/cases/${c.reference}`} size="lg" className="w-full" trailingIcon="arrow-right">Go to Case Dashboard</ButtonLink>}
                        {state === 'success' && kind === 'monitoring' && c && <ButtonLink href={`/due-diligence/cases/${c.reference}/monitoring`} size="lg" className="w-full" trailingIcon="arrow-right">Open Monitoring Dashboard</ButtonLink>}
                        {state === 'success' && <ButtonLink href={`/checkout/${order.reference}/confirmation`} variant="outline" className="w-full">View Invoice</ButtonLink>}
                        <p className="flex items-start gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 text-xs text-ink-600"><ShieldCheck className="size-5 shrink-0 text-verified-500" aria-hidden="true" />Your information and order are secure. {state === 'failed' ? 'No payment has been captured.' : 'Card numbers are never stored by TBCA.'}</p>
                    </aside>
                </div>
            </section>
            <NextStepBand
                trust
                items={[
                    { icon: 'Target', title: state === 'failed' ? 'Stay in control' : 'What happens next?', body: state === 'failed' ? 'You can retry, change method or save and return anytime.' : 'Once verified, your case unlocks and the work starts.' },
                    { icon: 'Headphones', title: 'Payment support', body: <button type="button" className="underline" onClick={() => openAskQuestion({ subject: `Payment support ${order.reference}`, section: 'due-diligence' })}>Open a secure question to Payment Support</button> },
                ]}
            />
        </>
    );
}
