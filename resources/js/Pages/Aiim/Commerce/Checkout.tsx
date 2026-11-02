import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Banner, Flow, FlowSteps, SumBox } from '@/Components/Aiim/ProtoAccount';
import { B, Card, Check, Field, Ic, inputCls, useMoney } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { AiimPageProps } from '@/types/aiim';

export interface OrderProps {
    reference: string; title: string; kind: string | null; label: string | null; status: string;
    items: { name: string; code: string; amount: number }[];
    subtotal: number; vat: number; fees: number; total: number; date: string;
}

interface Props extends AiimPageProps {
    order: OrderProps;
    billing: { company: string | null; vat_number: string | null };
    wallet: number;
    walletAllowed: boolean;
}

/** Mock-up 30: Secure Checkout. */
export default function Checkout({ order, billing, wallet, walletAllowed }: Props) {
    const money = useMoney();
    const walletOk = walletAllowed && wallet >= order.subtotal;
    const form = useForm({ method: 'card', company: billing.company ?? '', vat_number: billing.vat_number ?? '', terms: false });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(`/aiim/checkout/${order.reference}`); };
    const methods: [string, string, string, boolean][] = [
        ['card', 'Card via payment provider', 'You will be passed to the provider’s secure page', true],
        ['eft', 'EFT / bank transfer', 'Invoice with reference; unlock on receipt', true],
        ['wallet', 'Wallet credits', walletAllowed ? `Debit your prepaid balance (${money(wallet)})` : 'Not available for a wallet top-up', walletOk],
    ];
    const err = (k: string) => (form.errors as Record<string, string | undefined>)[k];

    return (
        <Flow
            title="Secure Checkout"
            eyebrow="Pay for your manifest"
            crumbs={[{ label: 'Fee Manifest', href: '/aiim/fees/discover' }]}
            steps={<FlowSteps on={3} />}
            side={
                <>
                    <Card title="Order" act={<span className="font-mono text-[0.72rem] text-ink-400">{order.reference}</span>}>
                        {order.items.length ? <SumBox lines={order.items.map((i) => [i.name, i.amount])} vatAmount={order.vat} total={order.subtotal + order.vat} /> : <p className="text-[0.85rem] text-ink-500">Manifest empty. Add a brief first.</p>}
                        <p className="mt-2 text-[0.72rem] text-ink-400">Payment provider fees, if any, are shown on the provider’s page before you pay.</p>
                    </Card>
                    <Banner>Amounts are ZAR VAT-exclusive from the TBCA service catalogue, with VAT at 15 % added at payment.</Banner>
                    <p className="flex items-center gap-2 text-[0.75rem] text-ink-500"><Ic n="lock" /> ISO 27001 aligned · POPIA · bank-grade TLS</p>
                </>
            }
        >
            <form onSubmit={submit} noValidate className="grid gap-3 rounded-[6px] border border-parchment-400 bg-white p-4">
                <h3 className="text-[0.95rem] font-semibold text-ink-900">Payment method</h3>
                <div className="grid gap-3 sm:grid-cols-3" role="radiogroup">
                    {methods.map(([v, t, s, ok]) => (
                        <label key={v} className={cn('grid cursor-pointer gap-1 rounded-[6px] border p-3', form.data.method === v ? 'border-gold-500 bg-gold-50' : 'border-parchment-400', !ok && 'cursor-not-allowed opacity-60')}>
                            <span className="flex items-center gap-2"><input type="radio" name="pm" value={v} checked={form.data.method === v} disabled={!ok} onChange={() => form.setData('method', v)} className="accent-gold-600" /><b className="text-[0.85rem]">{t}</b></span>
                            <span className="text-[0.75rem] text-ink-500">{s}</span>
                        </label>
                    ))}
                </div>
                {form.data.method === 'wallet' && <p className="text-[0.75rem] text-ink-500">Credits are bought with VAT included, so the wallet is debited {money(order.subtotal)}.</p>}
                <Field label="Invoice to (organisation)"><input className={inputCls} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} placeholder="Organisation name" autoComplete="organization" /></Field>
                <Field label="VAT / tax number (optional)"><input className={inputCls} value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} /></Field>
                <Check checked={form.data.terms} onChange={(v) => form.setData('terms', v)}>I accept the Terms of Sale and the refund policy.</Check>
                {(err('terms') || err('method')) && <p role="alert" className="text-[0.75rem] text-risk-600">{err('terms') ?? err('method')}</p>}
                <div className="flex flex-wrap gap-2">
                    <B v="pri" type="submit" disabled={form.processing}>Pay {money(form.data.method === 'wallet' ? order.subtotal : order.subtotal + order.vat)}</B>
                    <B onClick={() => window.history.back()}>Back</B>
                </div>
            </form>
        </Flow>
    );
}
