import { useForm } from '@inertiajs/react';
import { Lock, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { DeeperBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

export interface OrderProps {
    reference: string; title: string; kind: string | null; label: string | null; status: string;
    items: { name: string; code: string; amount: number }[];
    subtotal: number; vat: number; fees: number; total: number; date: string; payer: string | null; email: string | null;
}

export function OrderSummary({ order }: { order: OrderProps }) {
    return (
        <dl className="text-sm">
            {order.items.map((i) => <div key={i.code + i.name} className="flex justify-between gap-3 border-b border-parchment-300 py-1.5"><dt className="text-ink-600">{i.name}</dt><dd className="whitespace-nowrap">{zar2(i.amount)}</dd></div>)}
            <div className="flex justify-between py-1.5 font-semibold"><dt>Subtotal (excl. VAT)</dt><dd>{zar2(order.subtotal)}</dd></div>
            <div className="flex justify-between py-1"><dt className="text-ink-600">VAT (15%)</dt><dd>{zar2(order.vat)}</dd></div>
            <div className="flex justify-between py-1"><dt className="text-ink-600">Platform &amp; bank charges</dt><dd>{zar2(order.fees)}</dd></div>
            <div className="mt-1 flex justify-between rounded bg-gold-50 px-2 py-2 text-base font-bold"><dt>Total (incl. VAT)</dt><dd className="text-risk-500">{zar2(order.total)}</dd></div>
        </dl>
    );
}

interface Props extends AiimPageProps {
    order: OrderProps;
    billing: Record<string, string | null>;
}

export default function Checkout({ order, billing }: Props) {
    const form = useForm({ name: billing.name ?? '', email: billing.email ?? '', country: billing.country ?? 'South Africa', company: billing.company ?? '', vat_number: billing.vat_number ?? '', phone: billing.phone ?? '' });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(`/aiim/checkout/${order.reference}`); };
    return (
        <AiimPage
            title="Secure Checkout"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Secure Checkout' }]}
            heading={<>Secure Checkout <Lock className="size-6 text-gold-600" /></>}
            subtitle="Complete your payment securely."
            description="Your payment is protected with bank-grade security."
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <SectionCard className="mb-4"><Stepper steps={['Review Order', 'Billing Details', 'Payment', 'Confirmation']} current={2} /></SectionCard>
            <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem]" noValidate>
                <SectionCard title="Items in Your Order">
                    <Chip tone="gold">{(order.kind ?? 'order').replace('-', ' ').toUpperCase()}</Chip>
                    <p className="mt-2 font-semibold">{order.label ?? order.title}</p>
                    <ul className="mt-2 space-y-1 text-xs text-ink-600">{order.items.map((i) => <li key={i.code + i.name} className="flex justify-between"><span>{i.name}</span><span>{zar2(i.amount)}</span></li>)}</ul>
                    <p className="mt-2 text-xs text-ink-400">Order {order.reference}</p>
                    <div className="mt-4 flex gap-3 rounded bg-gold-50 p-3 text-xs"><ShieldCheck className="size-6 shrink-0 text-gold-600" /><span><strong className="block">Your payment is safe with us</strong>We use 256-bit SSL encryption and secure payment gateways (PCI DSS, Visa, Mastercard SecureCode, Instant EFT).</span></div>
                </SectionCard>
                <SectionCard title="Billing Details">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <Field label="Full Name" error={form.errors.name} required>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoComplete="name" />}</Field>
                        <Field label="Email Address" error={form.errors.email} required>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" />}</Field>
                        <Field label="Country" error={form.errors.country} required>{(id) => <Select id={id} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} options={['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Other']} />}</Field>
                        <Field label="Company (Optional)" error={form.errors.company}>{(id) => <Input id={id} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} autoComplete="organization" />}</Field>
                        <Field label="VAT Number (Optional)" error={form.errors.vat_number}>{(id) => <Input id={id} value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} />}</Field>
                        <Field label="Phone Number" error={form.errors.phone} required>{(id) => <Input id={id} type="tel" value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} placeholder="+27" autoComplete="tel" />}</Field>
                    </div>
                    <p className="mt-3 text-xs text-ink-400">We respect your privacy and never share your details.</p>
                </SectionCard>
                <div className="space-y-3">
                    <SectionCard title="Order Summary"><OrderSummary order={order} /><p className="mt-2 rounded bg-controlled-50 p-2 text-xs text-controlled-700">All amounts are in ZAR. VAT is calculated at 15% and applied at checkout.</p></SectionCard>
                    <Button type="submit" disabled={form.processing} className="w-full" icon="lock" trailingIcon="arrow-right">Pay Securely {zar2(order.total)}</Button>
                    <p className="text-center text-xs text-ink-400">You will be redirected to our secure payment partner.</p>
                </div>
            </form>
        </AiimPage>
    );
}
