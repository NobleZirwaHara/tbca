import { Head, Link, useForm } from '@inertiajs/react';
import { Building2, CheckCircle2, CircleAlert, Circle, CreditCard, Download, Info, Landmark, Link2, Lock } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { ChoiceCard, Checkbox, Field, Input } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import { Card, CheckList, InfoRows, zarCode } from '@/Components/Marketplace/ui';
import { BriefJourney } from '@/Components/Marketplace/Brief';
import type { MkBrief } from '@/types/marketplace';

interface Props {
    brief: MkBrief;
    lines: { ledger: string; title: string; body: string; status: string; ex: number; vat: number; incl: number }[];
    order: { reference: string; status: string } | null;
    billing: { name: string; email: string };
}

export default function BriefCheckout({ brief, lines, order, billing }: Props) {
    const form = useForm({ billing_name: billing.name, billing_email: billing.email, vat_number: '', rail: 'card', accept_terms: false });
    const due = lines.reduce((a, l) => a + l.incl, 0);
    const s = brief.scope;
    const authority: [string, string, 'good' | 'warn' | 'none'][] = [
        ['Authority to Proceed (ATP)', 'Complete', 'good'], ['Payment Authorisation', 'Required', 'warn'], ['Third-Party Disclosure', 'Complete', 'good'],
        ['Procurement Approval', 'Complete', 'good'], ['Provider Selection', brief.provider ? 'Selected' : 'Not Yet Selected', brief.provider ? 'good' : 'none'], ['Floor Check', s.floor?.status ?? 'PASS', 'good'],
    ];

    return (
        <>
            <Head title={`Marketplace Checkout – ${brief.reference}`} />
            <section className="bg-white py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: 'Brief Review', href: `/marketplace/briefs/${brief.reference}/review` }, { label: 'Disclosure', href: `/marketplace/briefs/${brief.reference}/disclosure` }, { label: 'Checkout' }]} />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <h1 className="font-serif text-3xl font-bold text-ink-900">Marketplace Checkout</h1>
                            <p className="text-sm text-ink-500">Review the accepted Methodology Brief, authority and payment details before authorising payment.</p>
                        </div>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-1 rounded-[8px] border border-gold-300/60 bg-parchment-100 px-4 py-3 text-xs sm:grid-cols-4">
                            <div><p className="text-ink-500">Order ID</p><p className="font-bold">{order?.reference ?? 'Issued on payment'}</p></div>
                            <div><p className="text-ink-500">BRF ID</p><p className="font-bold">{brief.reference}</p></div>
                            <div><p className="text-ink-500">Status</p><p className="font-bold text-gold-700">Awaiting Payment</p></div>
                            <div><p className="text-ink-500">Gate</p><p className="font-bold">GATE-MP-25</p></div>
                        </div>
                    </div>
                    <BriefJourney current={3} className="max-w-2xl" />
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="space-y-5 lg:col-span-8">
                            <div className="grid gap-5 md:grid-cols-2">
                                <Card title="A. Accepted Methodology Brief" action={<StatusPill status="Accepted Scope" tone="good" />}>
                                    <InfoRows dense rows={[['Brief Title', brief.title], ...(s.package ? [['Selected Package', `${s.package.service_title} – ${s.package.name} (${zarCode(s.package.price_zar)}${s.package.delivery ? ` · ${s.package.delivery}` : ''})`] as [string, string]] : []), ['Outcome', s.objective], ['Deliverables', (s.deliverables ?? []).join(', ')], ['Exclusions', (s.exclusions ?? []).slice(0, 2).join('. ')], ['Delivery / QA Class', `${s.delivery_class} · ${s.qa_class}`], ['Price Version', s.price_version]]} />
                                </Card>
                                <Card title="B. Authority & Disclosure Status">
                                    <ul className="space-y-2 text-sm">
                                        {authority.map(([k, v, t]) => (
                                            <li key={k} className="flex items-center justify-between gap-2">
                                                <span className="flex items-center gap-2">{t === 'good' ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : t === 'warn' ? <CircleAlert className="size-4 text-attested-500" aria-hidden="true" /> : <Circle className="size-4 text-ink-300" aria-hidden="true" />}{k}</span>
                                                <span className={`text-xs font-bold uppercase ${t === 'good' ? 'text-verified-700' : t === 'warn' ? 'text-risk-600' : 'text-ink-500'}`}>{v}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </Card>
                            </div>
                            <Card title="C. Payment Details (Three-Ledger Model)">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[560px] text-[0.8125rem]">
                                        <thead className="text-xs text-ink-500"><tr>{['Ledger', 'Description', 'Amount (Ex VAT)', 'VAT (15%)', 'Total (Incl VAT)', 'Status'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                                        <tbody className="divide-y divide-parchment-300">
                                            {lines.map((l) => (
                                                <tr key={l.ledger}>
                                                    <td className="py-2"><span className="flex size-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold">{l.ledger}</span></td>
                                                    <td className="py-2"><p className="font-semibold text-ink-900">Ledger {l.ledger}: {l.title}</p><p className="text-xs text-ink-500">{l.body}</p></td>
                                                    <td className="py-2">{zarCode(l.ex, 2)}</td><td className="py-2">{zarCode(l.vat, 2)}</td><td className="py-2 font-semibold">{zarCode(l.incl, 2)}</td>
                                                    <td className="py-2"><StatusPill status={l.status} tone={l.ledger === 'C' ? 'warn' : 'good'} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <p className="mt-2 flex items-center gap-1.5 rounded bg-gold-50 px-3 py-2 text-xs text-ink-600"><Info className="size-3.5" aria-hidden="true" /> No blended total hides ledger identity. Amounts remain separate even when paid together through the same rail. A R250 platform fee and card charge (if applicable) are shown on the payment page.</p>
                            </Card>
                            <form id="pay" onSubmit={(e) => { e.preventDefault(); form.post(`/marketplace/briefs/${brief.reference}/checkout`); }}>
                                <Card title="D. Payment Method and Billing Details">
                                    <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                                        <div role="radiogroup" aria-label="Payment rail" className="space-y-2">
                                            <ChoiceCard selected={form.data.rail === 'card'} onSelect={() => form.setData('rail', 'card')} icon={<CreditCard className="size-5" />} title="Card" description="Pay securely online" />
                                            <ChoiceCard selected={form.data.rail === 'eft'} onSelect={() => form.setData('rail', 'eft')} icon={<Landmark className="size-5" />} title="EFT / Bank Transfer" description="Transfer from your bank" />
                                            <ChoiceCard selected={form.data.rail === 'link'} onSelect={() => form.setData('rail', 'link')} icon={<Link2 className="size-5" />} title="Secure Payment Link" description="Receive a secure link" />
                                        </div>
                                        <div className="grid gap-3 sm:grid-cols-2">
                                            <Field label="Cardholder Name / Organisation" required error={form.errors.billing_name}>{(id) => <Input id={id} value={form.data.billing_name} onChange={(e) => form.setData('billing_name', e.target.value)} />}</Field>
                                            <Field label="Billing Email" required error={form.errors.billing_email}>{(id) => <Input id={id} type="email" value={form.data.billing_email} onChange={(e) => form.setData('billing_email', e.target.value)} />}</Field>
                                            <Field label="VAT Number" error={form.errors.vat_number}>{(id) => <Input id={id} value={form.data.vat_number} onChange={(e) => form.setData('vat_number', e.target.value)} />}</Field>
                                            <Field label="Payment Reference">{(id) => <Input id={id} value={order?.reference ?? brief.reference} readOnly />}</Field>
                                            <div className="sm:col-span-2">
                                                <Checkbox label="I acknowledge and agree to the Marketplace Terms, QA Standard, Professional Model and this three-ledger payment structure." checked={form.data.accept_terms} onChange={(e) => form.setData('accept_terms', e.target.checked)} />
                                                {form.errors.accept_terms && <p role="alert" className="text-xs text-risk-500">{form.errors.accept_terms}</p>}
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </form>
                        </div>
                        <aside className="space-y-4 lg:col-span-4">
                            <Card title="A. Commercial Envelope Summary">
                                <ul className="space-y-2 text-sm">{lines.map((l) => <li key={l.ledger} className="flex justify-between gap-2"><span>Ledger {l.ledger}: {l.title}</span><span className="font-semibold">{zarCode(l.incl)}</span></li>)}</ul>
                                <p className="mt-3 flex justify-between border-t border-parchment-300 pt-2 text-xs text-ink-500"><span>Tax Treatment</span><span>VAT applies as invoiced</span></p>
                                <div className="mt-3 flex items-center justify-between rounded-[6px] border border-gold-400 bg-gold-50 px-3 py-2"><span className="font-semibold text-gold-800">Order Due Today</span><span className="text-xl font-bold text-gold-800">{zarCode(due)}</span></div>
                                {s.ledgers?.c_state !== 'actual' && <p className="mt-2 rounded bg-controlled-50 p-2 text-xs text-controlled-700">Provider not yet selected. Ledger C is a capped estimate until assignment.</p>}
                            </Card>
                            <Card title="B. Compliance & Guardrails"><CheckList items={['No hidden fees.', 'No work starts before authority and payment conditions pass.', 'External provider costs remain separately disclosed.', 'Professional permission remains separate from Marketplace capacity.']} /></Card>
                            <Card tone="cream"><p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Lock className="size-4" aria-hidden="true" /> Funding Note (Ledger C)</p><p className="mt-1 text-xs text-ink-600">The Ledger C advance is held for the provider and released only after QA pass and acceptance.</p></Card>
                        </aside>
                    </div>
                    <div className="sticky bottom-0 z-20 flex flex-wrap items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 shadow-raised">
                        <Link href={`/marketplace/briefs/${brief.reference}/disclosure`} className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 px-5 text-sm">← Back to Disclosure</Link>
                        <Button type="button" variant="outline" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" /> Download Summary</Button>
                        <p className="flex flex-1 items-start gap-1.5 text-xs text-ink-500"><Building2 className="size-4 shrink-0" aria-hidden="true" /> Primary Pay action is enabled only because scope, disclosure, ATP and payment prerequisites are satisfied.</p>
                        <Button type="submit" form="pay" size="lg" disabled={form.processing}><Lock className="size-4" aria-hidden="true" /> Pay {zarCode(due, 2)}</Button>
                    </div>
                </div>
            </section>
        </>
    );
}
