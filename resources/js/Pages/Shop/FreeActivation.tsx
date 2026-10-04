import type { FormEvent } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Clock, Info, Lock, ShieldCheck, ThumbsUp } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { FlowSteps, NextSteps, ShopCrumbs, SideCard, TrustStrip } from '@/Components/Shop/Bits';
import { CheckList } from '@/Components/Shop/ProductParts';
import type { ProductDetail } from '@/types/shop';

interface Opt { value: string; label: string; eligible: boolean }
interface Props {
    product: ProductDetail;
    options: { countries: string[]; business_types: Opt[]; turnovers: Opt[]; heard: string[] };
    eligibleCountries: string[];
    defaults: Record<string, string | null>;
}

export default function FreeActivation({ product, options, eligibleCountries, defaults }: Props) {
    const form = useForm({
        country: defaults.country ?? '', business_type: defaults.business_type ?? '', turnover: defaults.turnover ?? '', full_name: defaults.full_name ?? '', email: defaults.email ?? '',
        company: defaults.company ?? '', phone: defaults.phone ?? '', heard: defaults.heard ?? '',
    });
    const e = form.errors as Record<string, string | undefined>;
    // Eligibility is derived from the current answers (the server re-checks on submit).
    const eligible = eligibleCountries.includes(form.data.country)
        && (options.business_types.find((b) => b.value === form.data.business_type)?.eligible ?? false)
        && (options.turnovers.find((t) => t.value === form.data.turnover)?.eligible ?? true);
    const detailsDone = Boolean(form.data.full_name && form.data.email && form.data.company && form.data.phone);
    const current = !eligible ? 1 : detailsDone ? 3 : 2;
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(`/shop/free/${product.slug}`, { preserveScroll: true }); };
    const name = product.content.entitlement_name ?? product.name;

    return (
        <>
            <Head title="Free Entitlement Activation" />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Free Resources', href: '/shop/aisle/diagnostics-free-tools' }, { label: 'Diagnostic', href: product.url }, { label: 'Activate Access' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <form onSubmit={submit} noValidate className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap items-center gap-3"><h1 className="font-serif text-[1.875rem] font-semibold text-ink-900">Free Entitlement Activation</h1><span className="inline-flex items-center gap-1 text-sm font-semibold text-verified-700"><Lock className="size-4" /> Secure Checkout</span></div>
                        <p className="-mt-3 text-sm text-ink-600">You have selected a free resource. Complete the steps below to activate your access.</p>
                        <FlowSteps current={current} steps={[{ title: 'Verify Eligibility' }, { title: 'Confirm Details' }, { title: 'Activate Access' }, { title: "You're Ready!" }]} />

                        <SideCard title="1. Your Free Entitlement">
                            <div className="grid gap-4 md:grid-cols-[1fr_14rem]">
                                <div className="flex gap-3"><ShopIcon name={product.icon} size="md" /><div><p className="font-semibold text-ink-900">{name} <span className="ml-1 rounded bg-verified-50 px-1.5 text-[0.625rem] font-semibold text-verified-700">100% Free</span></p><p className="text-xs text-ink-600">{product.content.entitlement_body ?? product.tagline}</p><p className="mt-1 text-[0.6875rem] text-ink-500">Licence: {product.content.licence} | Format: {product.content.format} | Validity: {product.content.validity_days} Days</p></div></div>
                                <CheckList tone="green" items={['No payment required', 'No credit card required', 'Immediate access', 'No obligations']} />
                            </div>
                        </SideCard>

                        <SideCard title="2. Verify Eligibility">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">To ensure this resource is used ethically and responsibly, please confirm you meet the eligibility criteria.</p>
                            <div className="grid gap-3 md:grid-cols-3">
                                <Field label="Country of Operation" error={e.country} required>{(id) => <Select id={id} options={options.countries} value={form.data.country} onChange={(x) => form.setData('country', x.target.value)} />}</Field>
                                <Field label="Business Type" error={e.business_type} required>{(id) => <Select id={id} options={options.business_types} value={form.data.business_type} onChange={(x) => form.setData('business_type', x.target.value)} />}</Field>
                                <Field label="Annual Turnover" error={e.turnover}>{(id) => <Select id={id} options={options.turnovers} value={form.data.turnover} onChange={(x) => form.setData('turnover', x.target.value)} />}</Field>
                            </div>
                            {eligible ? (
                                <p className="mt-3 flex gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-xs text-ink-700"><CheckCircle2 className="size-5 shrink-0 text-verified-500" aria-hidden="true" /><span><strong className="block text-verified-700">You are eligible for this free entitlement.</strong>This resource is available to qualifying small businesses in South Africa.</span></p>
                            ) : (
                                <p role="alert" className="mt-3 flex gap-2 rounded-[6px] border border-attested-500/40 bg-attested-50 p-3 text-xs text-ink-700"><AlertTriangle className="size-5 shrink-0 text-attested-700" aria-hidden="true" /><span><strong className="block text-attested-700">Not eligible for free access.</strong>This resource is available to qualifying small businesses in South Africa. You can still explore our paid diagnostics.</span></p>
                            )}
                            {e.eligibility && <p role="alert" className="mt-2 text-xs text-risk-500">{e.eligibility}</p>}
                        </SideCard>

                        <SideCard title="3. Confirm Your Details">
                            <p className="-mt-2 mb-3 text-xs text-ink-500">These details will be used to create your entitlement and provide access.</p>
                            <div className="grid gap-3 md:grid-cols-3">
                                <Field label="Full Name" error={e.full_name} required>{(id) => <Input id={id} value={form.data.full_name} onChange={(x) => form.setData('full_name', x.target.value)} />}</Field>
                                <Field label="Work Email" error={e.email} required>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(x) => form.setData('email', x.target.value)} />}</Field>
                                <Field label="Company Name" error={e.company} required>{(id) => <Input id={id} value={form.data.company} onChange={(x) => form.setData('company', x.target.value)} />}</Field>
                                <Field label="Phone Number" error={e.phone} required>{(id) => <Input id={id} type="tel" value={form.data.phone} onChange={(x) => form.setData('phone', x.target.value)} />}</Field>
                                <Field label="How did you hear about us?" error={e.heard}>{(id) => <Select id={id} options={options.heard} value={form.data.heard} onChange={(x) => form.setData('heard', x.target.value)} />}</Field>
                            </div>
                            <p className="mt-3 flex gap-2 rounded-[6px] bg-controlled-50 p-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" /> We respect your privacy. Your details will only be used to provide access to this free resource and communicate important updates.</p>
                        </SideCard>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <ButtonLink href={product.url} variant="outline"><ArrowLeft className="size-4" /> Back to Resource</ButtonLink>
                            <div className="text-center">
                                <button type="submit" disabled={form.processing || !eligible} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-verified-700 px-6 text-sm font-semibold text-white disabled:opacity-50">Activate My Free Access <ArrowRight className="size-4" /></button>
                                <p className="mt-1 text-[0.6875rem] text-ink-500">Secure & Instant Activation</p>
                            </div>
                        </div>
                    </form>

                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title="Entitlement Summary">
                            <div className="flex gap-3"><ShopIcon name={product.icon} size="sm" /><div className="flex-1 text-xs"><p className="font-semibold text-ink-900">{name}</p><p>{product.content.licence}</p></div><span className="text-xs font-semibold text-verified-700">100% Free</span></div>
                            <dl className="mt-3 space-y-1 text-xs"><div className="flex justify-between"><dt>Price</dt><dd>ZAR 0.00</dd></div><div className="flex justify-between"><dt>VAT (0%)</dt><dd>ZAR 0.00</dd></div></dl>
                            <p className="mt-2 flex justify-between border-t border-parchment-300 pt-2 font-semibold">Total (Incl. VAT)<span className="text-verified-700">ZAR 0.00</span></p>
                        </SideCard>
                        <SideCard><p className="flex items-center gap-2 font-semibold text-ink-900"><ThumbsUp className="size-4 text-verified-500" /> What you get</p><div className="mt-2"><CheckList tone="green" items={['Full diagnostic assessment', 'Personalised results report', 'Actionable improvement recommendations', `Resource library access (${product.content.validity_days ?? 30} days)`]} /></div></SideCard>
                        <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs text-ink-700"><ShieldCheck className="size-5 shrink-0 text-controlled-700" /><p><strong className="block text-[0.8125rem] text-ink-900">No Risk. No Obligation.</strong>This is a free resource with no hidden costs and no automatic sign-ups.</p></div>
                        <div className="flex gap-3 rounded-[8px] border border-attested-500/30 bg-attested-50 p-4 text-xs text-ink-700"><Clock className="size-5 shrink-0 text-attested-700" /><p><strong className="block text-[0.8125rem] text-ink-900">Validity</strong>Your access will be valid for {product.content.validity_days ?? 30} days from the date of activation. You can retake the diagnostic anytime within this period.</p></div>
                        <SideCard title="What happens next?"><NextSteps steps={[['Activate Access', 'Your entitlement will be created instantly.'], ['Start Diagnostic', "You'll be redirected to begin your assessment."], ['Get Your Report', 'Receive your personalised results and insights.'], ['Take Action', 'Access resources and recommendations.']]} /></SideCard>
                    </aside>
                </div>
            </div>
            <TrustStrip items={[{ title: 'Trusted & Independent', body: 'We are not vendors. We advise.' }, { title: 'Secure & Compliant', body: 'Your data is encrypted and protected.' }, { title: 'Free & Fair', body: 'No fees. No catch. Just support.' }, { title: 'Here to Help', body: 'Questions? Talk to our advisors.' }]} />
        </>
    );
}
