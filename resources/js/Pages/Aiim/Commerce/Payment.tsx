import { router } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Flow, FlowSteps, SumBox } from '@/Components/Aiim/ProtoAccount';
import { A, Card, Chip, Dl } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { AiimPageProps } from '@/types/aiim';
import type { OrderProps } from './Checkout';

interface Props extends AiimPageProps {
    order: OrderProps;
    paid: boolean;
    payment: { reference: string; method: string; status: string; reason: string | null } | null;
    next: { label: string; url: string };
    ledgerUrl: string;
}

const STAGES = ['Payment request created', 'Authorising with provider', 'Recording invoice and receipt', 'Assigning entitlements'];

/** Mock-ups 31 (Payment Processing, while unpaid) and 32 (Payment Confirmation, once paid). */
export default function Payment({ order, paid, payment, next, ledgerUrl }: Props) {
    const [tick, setTick] = useState(1);
    useEffect(() => {
        if (paid) return;
        const a = window.setInterval(() => setTick((t) => Math.min(2, t + 1)), 600);
        const b = window.setInterval(() => router.reload({ only: ['order', 'paid', 'payment', 'next'] }), 5000);
        return () => { window.clearInterval(a); window.clearInterval(b); };
    }, [paid]);

    const side = (
        <Card title="Order" act={<span className="font-mono text-[0.72rem] text-ink-400">{order.reference}</span>}>
            <SumBox lines={order.items.map((i) => [i.name, i.amount])} vatAmount={order.vat} total={order.total} />
            {order.fees > 0 && <p className="mt-1 text-[0.72rem] text-ink-400">Total includes payment charges.</p>}
        </Card>
    );

    if (!paid) {
        const failed = payment?.status === 'failed';
        return (
            <Flow title="Payment Processing" crumbs={[{ label: 'Secure Checkout', href: `/aiim/checkout/${order.reference}` }]} steps={<FlowSteps on={3} />} side={side}>
                <section className="grid justify-items-center gap-4 rounded-[6px] border border-parchment-400 bg-white px-6 py-10">
                    <ol className="grid min-w-[280px] gap-2" aria-live="polite">
                        {STAGES.map((s, i) => {
                            const done = !failed && i < tick;
                            const on = !failed && i === tick;
                            return (
                                <li key={s} className={cn('flex items-center gap-2.5 text-[0.88rem]', done ? 'text-ink-900' : on ? 'font-semibold text-ink-900' : 'text-ink-400')}>
                                    <span className={cn('grid size-5 place-items-center rounded-full border text-[0.65rem]', done ? 'border-verified-500 bg-verified-500 text-white' : on ? 'animate-pulse border-gold-500 bg-gold-100' : 'border-parchment-500')}>{done ? '✓' : ''}</span>
                                    {s}
                                </li>
                            );
                        })}
                    </ol>
                    {payment?.status === 'pending' && <p className="max-w-md text-center text-[0.8rem] text-ink-600">Waiting for the provider to confirm. For EFT, use the order reference {order.reference} as your payment reference; access unlocks on receipt. This page checks again every few seconds.</p>}
                    {failed && <p role="alert" className="max-w-md text-center text-[0.8rem] text-risk-600">{payment?.reason ?? 'The payment did not go through.'}</p>}
                    {(failed || !payment) && <A v="pri" sm href={`/checkout/${order.reference}`}>Return to payment options</A>}
                </section>
            </Flow>
        );
    }

    return (
        <Flow title="Payment Confirmation" crumbs={[{ label: 'Secure Checkout', href: '/aiim/workspace' }]} steps={<FlowSteps on={4} />} side={side}>
            <Card title="Thank you">
                <p className="mb-3 text-[0.88rem] text-ink-700">Your order is recorded in your account.</p>
                <Dl rows={[
                    ['Reference', <span key="r" className="font-mono">{order.reference}</span>],
                    ['Items', String(order.items.length)],
                    ['Status', <Chip key="s" t="Confirmed" tone="ok" />],
                    ['Paid', `${order.date}${payment ? ` · ${payment.method === 'wallet' ? 'wallet credits' : payment.method.toUpperCase()}` : ''}`],
                    ['Tax document', 'Invoice and receipt (AAB-EMB-233)'],
                ]} />
                <div className="mt-4 flex flex-wrap gap-2">
                    <A v="pri" href={next.url}>{next.label}</A>
                    <A href={ledgerUrl}>Ledger</A>
                </div>
            </Card>
        </Flow>
    );
}
