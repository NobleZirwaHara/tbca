import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, CreditCard, Download, Landmark, Lock, Mail, Minus, Plus, ShieldCheck, UserCheck, Wallet } from 'lucide-react';
import type { FormEvent, ReactNode } from 'react';
import { ProductThumb, ToolsHero } from '@/Components/CorePages/ToolsParts';
import { JourneySteps, Segmented } from '@/Components/CorePages/Kit';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { formatZar } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { LicenceOption, ToolProduct } from '@/types/core-pages';

interface Props {
    product: ToolProduct;
    typeLabel: string;
    licences: LicenceOption[];
    selected: string;
    commerce: { vat_rate: number; platform_fee: number; bank_rates: Record<string, number> };
    billing: { first_name: string; last_name: string; company: string; email: string; phone: string; country: string; city: string; vat_number: string };
}

const money = (n: number) => `R ${formatZar(n).slice(1)}.00`;

export default function Checkout({ product, typeLabel, licences, selected, commerce, billing }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const form = useForm({
        ...billing,
        licence: licences.some((l) => l.key === selected) ? selected : 'single',
        language: 'English',
        quantity: 1,
        method: 'card',
        accept_terms: false,
        accept_delivery: false,
    });
    const d = form.data;
    const err = form.errors as Record<string, string>;
    const lic = licences.find((l) => l.key === d.licence) ?? licences[0];
    const subtotal = lic.zar * d.quantity;
    const vat = Math.round(subtotal * commerce.vat_rate);
    const bank = Math.round(subtotal * (commerce.bank_rates[d.method] ?? 0));
    const platform = subtotal > 0 ? commerce.platform_fee : 0;
    const total = subtotal + vat + bank + platform;
    const base = `/tools/${product.type}/${product.slug}`;

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post(`${base}/checkout`, { preserveScroll: true });
    };
    const f = (k: keyof typeof billing, label: string, required = true, type = 'text', ac?: string) => (
        <Field label={label} required={required} error={err[k]}>{(id) => <Input id={id} type={type} autoComplete={ac} value={d[k]} onChange={(e) => form.setData(k, e.target.value)} />}</Field>
    );

    return (
        <>
            <Head title={`Secure Checkout — ${product.title}`} />
            <ToolsHero
                title="Secure Checkout"
                lead={product.title}
                body="Complete your order to unlock instant download and secure client portal access."
                aside={
                    <div className="hidden items-center justify-end gap-4 lg:flex" aria-hidden="true">
                        <ProductThumb title={`${product.title} workbook preview`} type="XLSX" className="w-44" />
                        <div className="flex size-36 flex-col items-center justify-center rounded-[10px] border border-gold-600/60 text-center">
                            <Lock className="size-12 text-gold-500" />
                            <p className="mt-2 text-[0.75rem] font-bold text-parchment-100">SECURE PAYMENT</p>
                            <p className="text-[0.5625rem] text-ink-300">ENCRYPTED &amp; PROTECTED</p>
                        </div>
                    </div>
                }
            >
                <JourneySteps steps={['Product', 'Checkout', 'Payment', 'Download']} current={2} tone="dark" className="mt-5 max-w-lg" />
            </ToolsHero>

            <form onSubmit={submit} noValidate className="bg-parchment-200">
                <div className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                    <div className="space-y-4 xl:col-span-8">
                        <div className="grid gap-4 md:grid-cols-3">
                            <Lettered letter="A" title="Already a client?">
                                {auth.user ? (
                                    <p className="text-[0.8125rem] text-ink-600">Signed in as <strong>{auth.user.name}</strong>. Your download will appear in My Downloads.</p>
                                ) : (
                                    <>
                                        <p className="text-[0.8125rem] text-ink-600">Sign in to your account to speed up your checkout.</p>
                                        <Link href="/login" className="mt-3 inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-gold-500 text-[0.875rem] font-semibold text-gold-700">Client Login</Link>
                                    </>
                                )}
                            </Lettered>
                            <div className="md:col-span-2">
                                <Lettered letter="B" title="Billing Details">
                                    <div className="grid gap-3 sm:grid-cols-3">
                                        {f('first_name', 'First Name', true, 'text', 'given-name')}
                                        {f('last_name', 'Last Name', true, 'text', 'family-name')}
                                        {f('company', 'Company / Organisation', true, 'text', 'organization')}
                                        {f('email', 'Email Address', true, 'email', 'email')}
                                        {f('phone', 'Phone Number', true, 'tel', 'tel')}
                                        <Field label="Country" required error={err.country}>{(id) => <Select id={id} options={['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Malawi', 'Other']} value={d.country} onChange={(e) => form.setData('country', e.target.value)} />}</Field>
                                        {f('city', 'City', false, 'text', 'address-level2')}
                                        {f('vat_number', 'VAT Number (Optional)', false)}
                                    </div>
                                </Lettered>
                            </div>
                        </div>

                        <Lettered letter="C" title="Product Options">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div role="radiogroup" aria-label="Licence" className="space-y-1.5">
                                    {licences.map((l) => (
                                        <label key={l.key} className="flex cursor-pointer items-center justify-between gap-2 text-[0.8125rem]">
                                            <span className="flex items-center gap-2"><input type="radio" name="licence" checked={d.licence === l.key} onChange={() => form.setData('licence', l.key)} className="accent-gold-600" />{l.label}</span>
                                            <span className="font-semibold">{money(l.zar)}</span>
                                        </label>
                                    ))}
                                </div>
                                <div className="space-y-2 text-[0.8125rem]">
                                    <div className="flex items-center gap-3"><span className="w-20 text-ink-500">Language:</span><Segmented label="Language" options={product.languages.includes('AF') ? ['English', 'Afrikaans'] : ['English']} value={d.language} onChange={(v) => form.setData('language', v)} className="max-w-[14rem]" /></div>
                                    {err.language && <p className="text-xs text-risk-500">{err.language}</p>}
                                    <p className="flex gap-3"><span className="w-20 text-ink-500">Format:</span>{product.calculator ? 'XLSX' : product.formats.join(', ')}</p>
                                    <p className="flex items-center gap-1.5"><Download className="size-4 text-verified-500" aria-hidden="true" />Delivery: Instant Download via Secure Client Portal</p>
                                    <p className="flex items-center gap-1.5"><UserCheck className="size-4 text-verified-500" aria-hidden="true" />Review Status: <span className="rounded-full bg-verified-50 px-2 text-verified-700">Human Reviewed</span></p>
                                </div>
                            </div>
                        </Lettered>

                        <Lettered letter="D" title="Choose Payment Method">
                            <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-3">
                                {[['card', 'Card Payment', CreditCard], ['eft', 'EFT / Bank Transfer', Landmark], ['wallet', 'Secure Wallet / Pay per Use', Wallet]].map(([k, l, I]) => {
                                    const Ico = I as typeof CreditCard;
                                    return (
                                        <button key={k as string} type="button" role="radio" aria-checked={d.method === k} onClick={() => form.setData('method', k as string)} className={cn('flex h-11 items-center justify-center gap-2 rounded-[4px] border text-[0.8125rem]', d.method === k ? 'border-gold-500 bg-gold-50 font-semibold' : 'border-parchment-400 bg-white')}>
                                            <Ico className="size-4" aria-hidden="true" />{l as string}
                                        </button>
                                    );
                                })}
                            </div>
                            <p className="mt-2 text-[0.75rem] text-ink-500">Card, EFT or wallet details are captured on the next, secure payment step. Bank charges vary by method and are shown in your order summary.</p>
                            <ul className="mt-3 grid gap-2 text-[0.6875rem] text-ink-600 sm:grid-cols-3">
                                {[['Secure Checkout', '256-bit SSL Encryption'], ['Encrypted Payment', 'PCI DSS Compliant'], ['Bank-Grade Security', 'PCI Certified']].map(([t, s]) => <li key={t} className="flex gap-2"><ShieldCheck className="size-5 text-verified-500" aria-hidden="true" /><span><strong className="block">{t}</strong>{s}</span></li>)}
                            </ul>
                        </Lettered>

                        <Lettered letter="E" title="Terms & Authorisation">
                            <Checkbox label={<>I agree to the <Link href="/about/governance" className="text-gold-700 underline">Terms and Conditions</Link> and the <Link href="/about/governance" className="text-gold-700 underline">Digital Products Disclaimer Policy</Link>.</>} checked={d.accept_terms} onChange={(e) => form.setData('accept_terms', e.target.checked)} />
                            {err.accept_terms && <p className="text-xs text-risk-500">{err.accept_terms}</p>}
                            <Checkbox className="mt-2" label="I understand this product will be delivered digitally through a secure client portal." checked={d.accept_delivery} onChange={(e) => form.setData('accept_delivery', e.target.checked)} />
                            {err.accept_delivery && <p className="text-xs text-risk-500">{err.accept_delivery}</p>}
                        </Lettered>

                        <Lettered letter="F" title="What Happens Next">
                            <ol className="grid gap-3 text-[0.75rem] sm:grid-cols-4">
                                {[[ShieldCheck, 'Verified Payment', 'Your payment is securely processed'], [UserCheck, 'Portal Entitlement', 'You’ll get portal access & download rights'], [Download, 'Instant Download', 'Download your product from your portal'], [Mail, 'Email Receipt', 'Receipt and access details sent to your inbox']].map(([I, t, s], i) => {
                                    const Ico = I as typeof Mail;
                                    return <li key={t as string} className="flex gap-2"><Ico className="size-6 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">{i + 1}. {t as string}</strong>{s as string}</span></li>;
                                })}
                            </ol>
                        </Lettered>
                    </div>

                    <aside className="xl:col-span-4">
                        <section className="sticky top-4 rounded-[10px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-serif text-[1.25rem] font-semibold text-ink-900">Order Summary</h2>
                            <div className="mt-3 flex gap-3">
                                <ProductThumb title={product.title} type="XLSX" className="w-24 shrink-0" />
                                <div className="text-[0.75rem] text-ink-600">
                                    <p className="text-[0.875rem] font-bold text-ink-900">{product.title}</p>
                                    <p>Product Type: {typeLabel}</p>
                                    <p>Format: {product.calculator ? 'XLSX' : product.formats.join(', ')}</p>
                                    <p>Delivery: Instant Download</p>
                                    <p>Language: {d.language}</p>
                                    <p>Licence: {lic.label}</p>
                                </div>
                            </div>
                            <div className="mt-3 flex items-center justify-between text-[0.8125rem]">
                                <span>Quantity:</span>
                                <span className="inline-flex items-center rounded-[4px] border border-parchment-500">
                                    <button type="button" aria-label="Decrease quantity" onClick={() => form.setData('quantity', Math.max(1, d.quantity - 1))} className="px-2 py-1"><Minus className="size-3.5" /></button>
                                    <span className="w-8 text-center" aria-live="polite">{d.quantity}</span>
                                    <button type="button" aria-label="Increase quantity" onClick={() => form.setData('quantity', Math.min(10, d.quantity + 1))} className="px-2 py-1"><Plus className="size-3.5" /></button>
                                </span>
                            </div>
                            <dl className="mt-4 space-y-1.5 border-t border-parchment-300 pt-3 text-[0.8125rem]">
                                {[['Product Price', subtotal], [`VAT (${Math.round(commerce.vat_rate * 100)}%)`, vat], ['Bank Charges', bank], ['Platform Charges', platform]].map(([k, v]) => (
                                    <div key={k as string} className="flex justify-between"><dt className="text-ink-600">{k as string}</dt><dd>{money(v as number)}</dd></div>
                                ))}
                                <div className="flex justify-between border-t border-parchment-300 pt-2 text-[1rem] font-bold"><dt>Total Due Today</dt><dd>{money(total)}</dd></div>
                            </dl>
                            <button type="submit" disabled={form.processing} className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 disabled:opacity-60"><Lock className="size-4" aria-hidden="true" />{form.processing ? 'Creating order…' : 'Proceed to Secure Payment'}</button>
                            <Link href={base} className="mt-2 inline-flex h-10 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 text-[0.8125rem]"><ArrowLeft className="size-4" aria-hidden="true" />Back to Product</Link>
                            {Object.keys(err).length > 0 && <p role="alert" className="mt-2 text-xs text-risk-500">Please complete the highlighted fields.</p>}
                            <p className="mt-4 text-[0.8125rem] font-semibold text-ink-900">Need help?</p>
                            <p className="text-[0.75rem] text-ink-500">We&rsquo;re here to assist and support! Fast. Human. Relevant.</p>
                            <Link href="/shop" className="mt-3 inline-flex h-10 w-full items-center justify-center gap-1 rounded-[4px] bg-ink-900 text-[0.8125rem] font-semibold text-gold-400">Start a Sprint <ArrowRight className="size-4" aria-hidden="true" /></Link>
                        </section>
                    </aside>
                </div>
            </form>
        </>
    );
}

function Lettered({ letter, title, children }: { letter: string; title: string; children: ReactNode }) {
    return (
        <section className="h-full rounded-[10px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 flex items-center gap-2.5 text-[0.9375rem] font-bold text-ink-900"><span className="inline-flex size-7 items-center justify-center rounded-[4px] bg-ink-900 text-[0.8125rem] text-gold-400">{letter}</span>{title}</h2>
            {children}
        </section>
    );
}
