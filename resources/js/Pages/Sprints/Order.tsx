import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, CalendarDays } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Checkbox, ChoiceCard, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Stepper } from '@/Components/ui/Kit';
import { BookCallModal, Box, ClientsStrip, DetailHero, type Pkg } from '@/Components/Sprints/DetailParts';
import OrderAside from '@/Components/Sprints/OrderAside';
import { computeTotals, RECURRING_LABEL } from '@/Components/Sprints/lib';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import type { SprintRecord } from '@/types';
import type { GenericAttributes, Pricing } from '@/types/sprints';

interface Brief {
    title: string;
    purposeLabel: string;
    purposes: string[];
    industries: string[];
    stages: string[];
    fundingGoals: string[];
}

interface Props {
    sprint: SprintRecord;
    selectedPackage: string;
    selectedAddons: string[];
    pricing: Pricing;
    packages: Pkg[];
    customer: { name: string; email: string; phone: string | null; company: string | null; job_title: string | null; country: string | null; client_id: string | null } | null;
    brief: Brief;
}

const COUNTRIES = ['South Africa', 'Botswana', 'Ghana', 'Kenya', 'Mozambique', 'Namibia', 'Nigeria', 'Rwanda', 'Tanzania', 'Uganda', 'Zambia', 'Zimbabwe', 'Other'];

/** Order Sprint — new customer (capture details, guest or create account) and existing customer (prefilled). */
export default function Order({ sprint, selectedPackage, selectedAddons, pricing, packages, customer, brief }: Props) {
    const a = (sprint.attributes ?? {}) as GenericAttributes;
    const existing = customer !== null;
    const [booking, setBooking] = useState(false);
    const [editContact, setEditContact] = useState(false);
    const recurring = sprint.commercial_act === 'subscription' || sprint.commercial_act === 'retainer';
    const recurringLabel = recurring ? RECURRING_LABEL[a.billing_period ?? 'month'] : null;
    const free = sprint.commercial_act === 'free';

    const form = useForm({
        package: selectedPackage,
        addons: selectedAddons,
        name: customer?.name ?? '',
        email: customer?.email ?? '',
        phone: customer?.phone ?? '',
        company: customer?.company ?? '',
        role: customer?.job_title ?? '',
        country: 'South Africa',
        language: 'English',
        account: 'guest',
        password: '',
        password_confirmation: '',
        use_different_contact: false,
        project_name: customer?.company ?? '',
        industry: '',
        stage: '',
        funding_goal: '',
        target_market: '',
        description: '',
        purposes: [] as string[],
        preferred_date: '',
        notes: '',
        documents: [] as File[],
        channel: 'whatsapp',
        start: 'asap',
        accept_terms: typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('terms') === '1',
    });

    const pkg = packages.find((p) => p.key === form.data.package) ?? packages[0];
    const addonList = a.addons ?? [];
    const chosen = addonList.filter((x) => form.data.addons.includes(x.key));
    const totals = computeTotals(pkg, chosen, pricing);
    const e = form.errors as Record<string, string | undefined>;
    const docError = Object.entries(e).find(([k]) => k.startsWith('documents'))?.[1];

    function toggle(list: 'addons' | 'purposes', value: string) {
        const cur = form.data[list];
        form.setData(list, cur.includes(value) ? cur.filter((v) => v !== value) : [...cur, value]);
    }

    function submit(ev: FormEvent) {
        ev.preventDefault();
        form.post(`/sprints/${sprint.slug}/order`, { preserveScroll: true, forceFormData: form.data.documents.length > 0 });
    }

    const submitLabel = free ? 'Confirm Free Access' : recurring ? 'Proceed to Payment (first period)' : 'Proceed to Payment';
    const contactEditable = !existing || editContact;

    return (
        <>
            <Head title={`Order ${sprint.title}`} />
            <DetailHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, { label: sprint.title, href: `/sprints/${sprint.slug}` }, { label: existing ? `Order Sprint (${pkg?.name})` : 'Order Sprint' }]}
                icon={a.icon ?? 'briefcase'}
                title={existing ? `Order ${sprint.title} (${pkg?.name})` : `Order ${sprint.title}`}
                summary={existing ? "You're just a few steps away from starting your sprint." : `Complete your order for the ${pkg?.name} package and provide the information TBCA needs to begin your Sprint.`}
                chips={
                    existing
                        ? [
                              { label: 'Existing Customer', icon: 'circle-check' },
                              { label: 'Secure Checkout', icon: 'shield-check' },
                              { label: 'Instant Confirmation', icon: 'zap' },
                              { label: 'Expert Delivery', icon: 'user-check' },
                          ]
                        : [
                              { label: `${pkg?.name} Package Selected`, icon: 'layers' },
                              { label: 'Delivered by TBCA Experts', icon: 'shield-check' },
                              { label: pkg?.delivery ?? 'Delivery after scope', icon: 'clock' },
                              { label: 'Secure Checkout', icon: 'lock' },
                          ]
                }
                idealFor={a.ideal_for}
            />

            <div className="bg-parchment-100">
                <div className="container-tbca grid gap-6 pb-10 lg:grid-cols-[minmax(0,1fr)_360px]">
                    <aside className="order-last pt-6 lg:-mt-56 lg:pt-0">
                        <div className="lg:sticky lg:top-24">
                            <OrderAside
                                title={sprint.title}
                                packages={packages}
                                pkgKey={form.data.package}
                                onPackage={(k) => form.setData('package', k)}
                                addons={chosen}
                                totals={totals}
                                recurringLabel={recurringLabel}
                                free={free}
                                processing={form.processing}
                                submitLabel={submitLabel}
                            />
                        </div>
                    </aside>

                    <form id="sprint-order" onSubmit={submit} noValidate className="min-w-0 space-y-5 pt-6">
                        <Stepper steps={['Package Selected', 'Client Details', 'Project Brief', 'Review & Payment']} current={2} className="rounded-[8px] border border-parchment-400 bg-white p-4" />
                        {Object.keys(e).length > 0 && (
                            <p role="alert" className="rounded-[6px] border border-risk-500/30 bg-risk-50 p-3 text-[0.8125rem] text-risk-700">
                                Please correct the highlighted fields below.
                            </p>
                        )}

                        <div className="grid gap-5 xl:grid-cols-2">
                            {existing && !editContact ? (
                                <Box title="1. Account & Contact" action={<span className="rounded-full bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">Existing Customer</span>}>
                                    <p className="text-[0.8125rem] text-ink-700">
                                        Welcome back, <strong>{customer.name.split(' ')[0]}</strong>. You are logged in as:
                                    </p>
                                    <div className="mt-3 flex items-center gap-3 rounded-[6px] border border-parchment-400 p-3">
                                        <span className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-gold-300 to-gold-700 font-bold" aria-hidden="true">
                                            {customer.name.split(' ').map((n) => n[0]).join('')}
                                        </span>
                                        <div className="text-[0.8125rem]">
                                            <p className="font-semibold text-ink-900">{customer.name}</p>
                                            <p className="text-ink-600">{customer.email}</p>
                                            <p className="text-ink-600">{customer.phone}</p>
                                            {customer.client_id && <p className="text-[0.6875rem] text-ink-400">Client ID {customer.client_id}</p>}
                                        </div>
                                    </div>
                                    <Checkbox
                                        className="mt-3"
                                        label="Use a different contact for this Sprint"
                                        checked={form.data.use_different_contact}
                                        onChange={(ev) => {
                                            form.setData('use_different_contact', ev.target.checked);
                                            setEditContact(ev.target.checked);
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Box title={existing ? '1. Sprint Contact' : '1. Your Details'}>
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label="Full Name" required error={e.name}>
                                            {(id) => <Input id={id} value={form.data.name} onChange={(ev) => form.setData('name', ev.target.value)} placeholder="Enter your full name" invalid={!!e.name} autoComplete="name" />}
                                        </Field>
                                        <Field label="Email Address" required error={e.email}>
                                            {(id) => <Input id={id} type="email" value={form.data.email} onChange={(ev) => form.setData('email', ev.target.value)} placeholder="your@email.com" invalid={!!e.email} autoComplete="email" />}
                                        </Field>
                                        <Field label="Mobile / WhatsApp" required error={e.phone}>
                                            {(id) => <Input id={id} type="tel" value={form.data.phone ?? ''} onChange={(ev) => form.setData('phone', ev.target.value)} placeholder="+27 71 123 4567" invalid={!!e.phone} autoComplete="tel" />}
                                        </Field>
                                        {!existing && (
                                            <>
                                                <Field label="Company Name" required error={e.company}>
                                                    {(id) => <Input id={id} value={form.data.company ?? ''} onChange={(ev) => form.setData('company', ev.target.value)} placeholder="Enter company name" invalid={!!e.company} />}
                                                </Field>
                                                <Field label="Role / Position" required error={e.role}>
                                                    {(id) => <Input id={id} value={form.data.role ?? ''} onChange={(ev) => form.setData('role', ev.target.value)} placeholder="e.g. Founder, CEO" invalid={!!e.role} />}
                                                </Field>
                                                <Field label="Country" required error={e.country}>
                                                    {(id) => <Select id={id} value={form.data.country} onChange={(ev) => form.setData('country', ev.target.value)} options={COUNTRIES} />}
                                                </Field>
                                            </>
                                        )}
                                        <Field label="Preferred Language" required error={e.language} hint="Afrikaans available">
                                            {(id) => <Select id={id} value={form.data.language} onChange={(ev) => form.setData('language', ev.target.value)} options={['English', 'Afrikaans']} />}
                                        </Field>
                                    </div>
                                    {existing && (
                                        <button type="button" onClick={() => { setEditContact(false); form.setData('use_different_contact', false); }} className="mt-3 text-[0.75rem] font-semibold text-gold-700">
                                            Use my account details instead
                                        </button>
                                    )}
                                    {!existing && (
                                        <fieldset className="mt-4 border-t border-parchment-300 pt-4">
                                            <legend className="text-[0.8125rem] font-semibold text-ink-900">How would you like to continue?</legend>
                                            <div className="mt-2 grid gap-2 sm:grid-cols-2" role="radiogroup">
                                                <ChoiceCard selected={form.data.account === 'guest'} onSelect={() => form.setData('account', 'guest')} title="Continue as guest" description="Order with your email; create an account later." />
                                                <ChoiceCard selected={form.data.account === 'create'} onSelect={() => form.setData('account', 'create')} title="Create my TBCA account" description="Track this Sprint in the Client Portal." />
                                            </div>
                                            {form.data.account === 'create' && (
                                                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                                                    <Field label="Password" required error={e.password} hint="At least 8 characters">
                                                        {(id) => <Input id={id} type="password" autoComplete="new-password" value={form.data.password} onChange={(ev) => form.setData('password', ev.target.value)} invalid={!!e.password} />}
                                                    </Field>
                                                    <Field label="Confirm Password" required>
                                                        {(id) => <Input id={id} type="password" autoComplete="new-password" value={form.data.password_confirmation} onChange={(ev) => form.setData('password_confirmation', ev.target.value)} />}
                                                    </Field>
                                                </div>
                                            )}
                                            <p className="mt-2 text-[0.75rem] text-ink-500">
                                                Already a client?{' '}
                                                <Link href="/login" className="font-semibold text-gold-700">
                                                    Sign in
                                                </Link>{' '}
                                                to prefill your details.
                                            </p>
                                        </fieldset>
                                    )}
                                </Box>
                            )}

                            <BriefPanel data={form.data} set={(k, v) => form.setData(k, v as never)} brief={brief} errors={e} docError={docError} onToggle={(v) => toggle('purposes', v)} />
                        </div>

                        <div className="grid gap-5 xl:grid-cols-2">
                            {addonList.length > 0 && (
                                <Box title="3. Add-ons" subtitle="Optional extras added to this order.">
                                    <ul className="space-y-2">
                                        {addonList.map((x) => (
                                            <li key={x.key}>
                                                <label className={cn('flex cursor-pointer items-start gap-3 rounded-[6px] border p-2.5', form.data.addons.includes(x.key) ? 'border-gold-500 bg-gold-50' : 'border-parchment-400')}>
                                                    <input type="checkbox" checked={form.data.addons.includes(x.key)} onChange={() => toggle('addons', x.key)} className="mt-0.5 size-4 accent-gold-600" />
                                                    <span className="flex-1 text-[0.8125rem]">
                                                        <span className="font-semibold text-ink-900">{x.name}</span>
                                                        {x.body && <span className="block text-[0.75rem] text-ink-500">{x.body}</span>}
                                                    </span>
                                                    <span className="text-[0.8125rem] font-semibold">{formatZar(x.zar)}</span>
                                                </label>
                                            </li>
                                        ))}
                                    </ul>
                                </Box>
                            )}

                            <Box title={`${addonList.length ? 4 : 3}. Delivery & Communication`} subtitle="How would you like us to deliver your sprint?">
                                <p className="rounded-[6px] border border-parchment-400 p-3 text-[0.8125rem]">
                                    <span className="font-semibold text-ink-900">Delivery Method: Secure Client Portal</span>
                                    <span className="block text-[0.75rem] text-ink-500">You will receive updates and final deliverables in your client portal.</span>
                                </p>
                                <fieldset className="mt-3">
                                    <legend className="text-[0.8125rem] font-medium text-ink-800">Communication Channel</legend>
                                    <div className="mt-1.5 flex flex-wrap gap-4 text-[0.8125rem]">
                                        {[['whatsapp', 'WhatsApp'], ['email', 'Email'], ['phone', 'Phone']].map(([v, l]) => (
                                            <label key={v} className="flex items-center gap-1.5">
                                                <input type="radio" name="channel" checked={form.data.channel === v} onChange={() => form.setData('channel', v)} className="accent-gold-600" />
                                                {l}
                                            </label>
                                        ))}
                                    </div>
                                </fieldset>
                                <fieldset className="mt-3">
                                    <legend className="text-[0.8125rem] font-medium text-ink-800">Preferred Start Date</legend>
                                    <div className="mt-1.5 flex flex-wrap gap-4 text-[0.8125rem]">
                                        <label className="flex items-center gap-1.5">
                                            <input type="radio" name="start" checked={form.data.start === 'asap'} onChange={() => form.setData('start', 'asap')} className="accent-gold-600" /> As soon as possible
                                        </label>
                                        <label className="flex items-center gap-1.5">
                                            <input type="radio" name="start" checked={form.data.start === 'date'} onChange={() => form.setData('start', 'date')} className="accent-gold-600" /> On a specific date
                                        </label>
                                    </div>
                                    {form.data.start === 'date' && <p className="mt-1 text-[0.75rem] text-ink-500">Set the date under “Preferred delivery date” in the brief.</p>}
                                </fieldset>
                                <p className="mt-3 rounded-[6px] bg-gold-50 p-2.5 text-[0.75rem] text-ink-700">Our team will review your order and confirm the sprint kickoff via email and WhatsApp within 24 hours.</p>
                            </Box>
                        </div>

                        <Box title="How TBCA will use your information & next steps">
                            <div className="grid gap-5 md:grid-cols-2">
                                <ul className="space-y-1.5 text-[0.8125rem] text-ink-700">
                                    {['Your brief helps match the right experts', 'Structured intake is reviewed by TBCA experts', 'Confidential & used only for sprint delivery', 'Delivery through the secure Client Portal'].map((t) => (
                                        <li key={t}>✓ {t}</li>
                                    ))}
                                </ul>
                                <ol className="flex justify-between gap-1">
                                    {[['Discovery Call', '24–48 hours'], ['Intake Review', '2 days'], ['Research & Analysis', '3–4 days'], ['Draft & Review', '2 days'], ['Final Delivery', pkg?.delivery?.replace(' delivery', '') ?? 'As agreed']].map(([t, d], i) => (
                                        <li key={t} className="flex flex-1 flex-col items-center text-center">
                                            <span className="flex size-7 items-center justify-center rounded-full bg-gold-500 text-[0.75rem] font-bold">{i + 1}</span>
                                            <span className="mt-1 text-[0.6875rem] font-semibold leading-tight text-ink-900">{t}</span>
                                            <span className="text-[0.625rem] text-ink-500">{d}</span>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <Checkbox
                                className="mt-4"
                                checked={form.data.accept_terms}
                                onChange={(ev) => form.setData('accept_terms', ev.target.checked)}
                                label={<>I agree to the <a href="/terms" className="font-semibold text-gold-700 underline">Terms &amp; Conditions</a> and confirm the order details above.{recurring && ' I understand this is billed every period until cancelled.'}</>}
                            />
                            {e.accept_terms && <p role="alert" className="mt-1 text-xs font-medium text-risk-500">{e.accept_terms}</p>}
                        </Box>

                        <div className="flex flex-wrap items-center gap-3">
                            <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50">
                                {free ? 'Confirm Free Access' : 'Continue to Review & Payment'} <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                            <button type="button" onClick={() => setBooking(true)} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-500 bg-white px-5 font-semibold text-ink-900">
                                <CalendarDays className="size-4" aria-hidden="true" /> Book Discovery Call
                            </button>
                            <Link href={`/sprints/${sprint.slug}`} className="text-[0.8125rem] font-semibold text-ink-600 underline">
                                Back to Sprint Details
                            </Link>
                        </div>

                        <ClientsStrip attrs={a} />
                    </form>
                </div>
            </div>
            <BookCallModal open={booking} onClose={() => setBooking(false)} topic={sprint.title} />
        </>
    );
}

interface BriefData {
    project_name: string;
    industry: string;
    stage: string;
    funding_goal: string;
    target_market: string;
    description: string;
    purposes: string[];
    preferred_date: string;
    notes: string;
    documents: File[];
}

function BriefPanel({ data, set, brief, errors: e, docError, onToggle }: { data: BriefData; set: <K extends keyof BriefData>(k: K, v: BriefData[K]) => void; brief: Brief; errors: Record<string, string | undefined>; docError?: string; onToggle: (v: string) => void }) {
    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    return (
        <Box title={`2. ${brief.title}`}>
            <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Business / Project Name" required error={e.project_name}>
                    {(id) => <Input id={id} value={data.project_name} onChange={(ev) => set('project_name', ev.target.value)} placeholder="Enter the name or project name" invalid={!!e.project_name} />}
                </Field>
                <Field label="Industry / Sector" required error={e.industry}>
                    {(id) => <Select id={id} value={data.industry} onChange={(ev) => set('industry', ev.target.value)} placeholder="Select Industry" options={brief.industries} invalid={!!e.industry} />}
                </Field>
                <Field label="Stage of Business" required error={e.stage}>
                    {(id) => <Select id={id} value={data.stage} onChange={(ev) => set('stage', ev.target.value)} placeholder="Select stage" options={brief.stages} invalid={!!e.stage} />}
                </Field>
                <Field label="Funding Goal" error={e.funding_goal}>
                    {(id) => <Select id={id} value={data.funding_goal} onChange={(ev) => set('funding_goal', ev.target.value)} placeholder="Select funding goal" options={brief.fundingGoals} />}
                </Field>
                <Field label="Target Market" error={e.target_market} className="sm:col-span-2">
                    {(id) => <Input id={id} value={data.target_market} onChange={(ev) => set('target_market', ev.target.value)} placeholder="e.g. South Africa, Africa, Global" />}
                </Field>
                <Field label="Short Business Description" required error={e.description} className="sm:col-span-2">
                    {(id) => <Textarea id={id} rows={3} maxLength={2000} value={data.description} onChange={(ev) => set('description', ev.target.value)} placeholder="Briefly describe your business, what you do and the problem you solve..." invalid={!!e.description} />}
                </Field>
            </div>
            <fieldset className="mt-3">
                <legend className="text-[0.8125rem] font-medium text-ink-800">
                    {brief.purposeLabel} <span className="text-risk-500">*</span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
                    {brief.purposes.map((p) => (
                        <Checkbox key={p} label={p} checked={data.purposes.includes(p)} onChange={() => onToggle(p)} className="text-[0.8125rem]" />
                    ))}
                </div>
                {e.purposes && <p role="alert" className="mt-1 text-xs font-medium text-risk-500">{e.purposes}</p>}
            </fieldset>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Field label="Preferred delivery date" error={e.preferred_date}>
                    {(id) => <Input id={id} type="date" min={tomorrow} value={data.preferred_date} onChange={(ev) => set('preferred_date', ev.target.value)} invalid={!!e.preferred_date} />}
                </Field>
                <Field label="Upload Supporting Documents" error={docError} hint="PDF, DOCX, XLSX, PPTX (max 15MB each, 5 files)">
                    {(id) => (
                        <input
                            id={id}
                            type="file"
                            multiple
                            accept=".pdf,.docx,.xlsx,.pptx"
                            onChange={(ev) => set('documents', Array.from(ev.target.files ?? []).slice(0, 5))}
                            className="block w-full rounded-[4px] border border-dashed border-parchment-500 bg-parchment-100 p-2 text-[0.75rem] file:mr-2 file:rounded-[3px] file:border-0 file:bg-ink-900 file:px-2 file:py-1 file:text-parchment-100"
                        />
                    )}
                </Field>
                <Field label="Additional Notes" error={e.notes}>
                    {(id) => <Textarea id={id} rows={2} value={data.notes} onChange={(ev) => set('notes', ev.target.value)} placeholder="Anything else we should know?" />}
                </Field>
            </div>
        </Box>
    );
}
