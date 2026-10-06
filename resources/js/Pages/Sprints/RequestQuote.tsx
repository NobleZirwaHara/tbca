import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, CircleCheck, Clock, Lock, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import Icon from '@/Components/ui/Icon';
import { Box, type Pkg } from '@/Components/Sprints/DetailParts';
import { Crumbs, NightBackdrop } from '@/Components/Sprints/SprintHero';
import type { SharedProps, SprintRecord } from '@/types';

interface Props {
    sprint: SprintRecord | null;
    package: Pkg | null;
    categories: { value: string; label: string }[];
    options: { projectTypes: string[]; scopes: string[]; budgets: string[]; sources: string[] };
    prefill: Record<string, string | null | undefined>;
    submitted: { reference: string; subject: string; email: string; created_at: string } | null;
}

const STEPS = [
    ['Tell us what you need', 'Complete the form with your requirements.'],
    ['We review your request', 'A TBCA expert reviews and may contact you.'],
    ['We prepare your quote', 'You receive a tailored solution and quote.'],
    ['You decide the next step', 'Approve, adjust or discuss with our team.'],
];

/** Request a Quote — general Sprint Support form, or the quote route of a single Sprint. */
export default function RequestQuote({ sprint, package: pkg, categories, options, prefill, submitted }: Props) {
    const { contact } = usePage<SharedProps>().props;
    const action = sprint ? `/sprints/${sprint.slug}/quote` : '/sprints/request-a-quote';
    const p = (k: string, d = '') => (prefill[k] ?? d) as string;
    const form = useForm({
        need: p('need', sprint ? `I would like a quote for the ${sprint.title}${pkg ? ` (${pkg.name} package)` : ''}.` : ''),
        category: p('category', sprint?.category ?? ''),
        organisation: p('organisation'),
        role: p('role'),
        name: p('name'),
        email: p('email'),
        phone: p('phone'),
        language: p('language', 'English'),
        currency: p('currency', 'ZAR'),
        source: p('source'),
        project_type: p('project_type'),
        scope: p('scope'),
        start_date: p('start_date'),
        budget: p('budget'),
        details: p('details'),
        package: pkg?.key ?? '',
        attachments: [] as File[],
        action: 'submit',
    });
    const e = form.errors as Record<string, string | undefined>;
    const attachError = Object.entries(e).find(([k]) => k.startsWith('attachments'))?.[1];
    const whatsapp = (contact?.whatsapp ?? '+27608011365').replace(/[^\d]/g, '');

    function send(kind: 'submit' | 'save') {
        form.transform((d) => ({ ...d, action: kind }));
        form.post(action, { preserveScroll: true, forceFormData: form.data.attachments.length > 0 });
    }

    function submit(ev: FormEvent) {
        ev.preventDefault();
        send('submit');
    }

    const title = sprint ? `Request a Quote: ${sprint.title}` : 'Request a Quote';

    return (
        <>
            <Head title={title} />
            <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
                <NightBackdrop />
                <div className="container-tbca relative grid gap-6 py-9 lg:grid-cols-[minmax(0,1fr)_330px_250px]">
                    <div>
                        <Crumbs items={[{ label: 'Home', href: '/' }, { label: 'Sprints', href: '/sprints' }, ...(sprint ? [{ label: sprint.title, href: `/sprints/${sprint.slug}` }] : [{ label: 'Sprint Support' }]), { label: 'Request a Quote' }]} />
                        <h1 className="font-serif text-[2.25rem] leading-tight font-semibold text-white md:text-[3rem]">{sprint ? 'Request a Quote' : 'Request a Quote'}</h1>
                        <p className="mt-2 max-w-xl text-parchment-200">
                            {sprint ? `${sprint.title} is scoped to your requirements. ` : ''}Tell us what you need and we&rsquo;ll provide a tailored solution, scope and transparent quote for your Sprint.
                        </p>
                        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[
                                ['user-check', 'Expert Review', 'Reviewed by TBCA consultants'],
                                ['settings', 'Tailored Solution', 'Built around your unique needs'],
                                ['receipt', 'Transparent Pricing', 'Clear scope, deliverables and pricing'],
                                ['shield-check', 'Secure & Confidential', 'Your information is always protected'],
                            ].map(([i, t, b]) => (
                                <li key={t} className="flex gap-2">
                                    <Icon name={i} className="size-6 shrink-0 text-gold-400" />
                                    <span>
                                        <span className="block text-[0.8125rem] font-semibold text-white">{t}</span>
                                        <span className="block text-[0.75rem] text-parchment-300">{b}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="rounded-[8px] border border-ink-700 bg-ink-900/90 p-4">
                        <p className="font-semibold text-gold-400">How it works</p>
                        <ol className="mt-3 space-y-3">
                            {STEPS.map(([t, b], i) => (
                                <li key={t} className="flex gap-3">
                                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[0.75rem] font-bold text-ink-900">{i + 1}</span>
                                    <span>
                                        <span className="block text-[0.8125rem] font-semibold text-white">{t}</span>
                                        <span className="block text-[0.75rem] text-parchment-300">{b}</span>
                                    </span>
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div className="self-start rounded-[8px] bg-white p-4 text-ink-900">
                        <p className="font-semibold">Need help now?</p>
                        <p className="mt-1 text-[0.75rem] text-ink-600">Chat with our team on WhatsApp for immediate assistance.</p>
                        <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer" className="mt-3 flex h-10 items-center justify-center gap-2 rounded-[4px] border border-verified-500 text-[0.8125rem] font-semibold">
                            Continue on WhatsApp <MessageCircle className="size-4 text-verified-500" aria-hidden="true" />
                        </a>
                        <p className="mt-3 text-[0.75rem] text-ink-600">Or call us between 08:00 – 17:00 (SAST)</p>
                        <a href={`tel:${contact?.phone ?? '+27608011365'}`} className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-gold-700">
                            <Phone className="size-4" aria-hidden="true" /> {contact?.phone ?? '+27 60 801 1365'}
                        </a>
                    </div>
                </div>
            </section>

            <div className="bg-parchment-100">
                <div className="container-tbca py-8">
                    {submitted ? (
                        <Box className="mx-auto max-w-2xl text-center">
                            <CircleCheck className="mx-auto size-14 text-verified-500" aria-hidden="true" />
                            <h2 className="mt-3 text-2xl font-bold text-ink-900">Quote request received</h2>
                            <p className="mt-2 text-sm text-ink-600">
                                Your reference is <strong className="font-mono">{submitted.reference}</strong>. A TBCA expert will review your request and respond to <strong>{submitted.email}</strong> within 1 business day.
                            </p>
                            <div className="mt-5 flex flex-wrap justify-center gap-3">
                                <Link href="/sprints" className="inline-flex h-10 items-center gap-1.5 rounded-[4px] bg-gold-500 px-4 text-sm font-semibold text-ink-900">
                                    Browse Sprints <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                                <Link href={action} className="inline-flex h-10 items-center rounded-[4px] border border-ink-300 px-4 text-sm font-semibold">
                                    Submit another request
                                </Link>
                            </div>
                        </Box>
                    ) : (
                        <form onSubmit={submit} noValidate>
                            <div className="grid gap-5 lg:grid-cols-2">
                                <Box title="1. Tell us about your request">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label="What do you need help with?" required error={e.need} className="sm:col-span-1">
                                            {(id) => <Textarea id={id} rows={3} value={form.data.need} onChange={(ev) => form.setData('need', ev.target.value)} placeholder="Describe your challenge, objective or the Sprint you are looking for..." invalid={!!e.need} />}
                                        </Field>
                                        <Field label={<>Select a Category <span className="font-normal text-ink-400">(optional)</span></>} error={e.category}>
                                            {(id) => <Select id={id} value={form.data.category} onChange={(ev) => form.setData('category', ev.target.value)} placeholder="Select a category" options={categories} />}
                                        </Field>
                                        <Field label="Business / Organisation Name" required error={e.organisation}>
                                            {(id) => <Input id={id} value={form.data.organisation} onChange={(ev) => form.setData('organisation', ev.target.value)} placeholder="Enter your business or organisation name" invalid={!!e.organisation} />}
                                        </Field>
                                        <Field label="Your Role" required error={e.role}>
                                            {(id) => <Input id={id} value={form.data.role} onChange={(ev) => form.setData('role', ev.target.value)} placeholder="e.g. Founder, CEO, Project Manager, Program Lead..." invalid={!!e.role} />}
                                        </Field>
                                        <Field label="Email Address" required error={e.email}>
                                            {(id) => <Input id={id} type="email" value={form.data.email} onChange={(ev) => form.setData('email', ev.target.value)} placeholder="Enter your email address" invalid={!!e.email} autoComplete="email" />}
                                        </Field>
                                        <Field label="Phone Number" required error={e.phone}>
                                            {(id) => <Input id={id} type="tel" value={form.data.phone} onChange={(ev) => form.setData('phone', ev.target.value)} placeholder="+27 Enter your phone number" invalid={!!e.phone} autoComplete="tel" />}
                                        </Field>
                                        <Radios label="Preferred Language" name="language" value={form.data.language} options={['English', 'Afrikaans']} onChange={(v) => form.setData('language', v)} />
                                        <Radios label="Preferred Currency" name="currency" value={form.data.currency} options={['ZAR', 'USD']} onChange={(v) => form.setData('currency', v)} />
                                        <Field label="How did you hear about TBCA?" error={e.source}>
                                            {(id) => <Select id={id} value={form.data.source} onChange={(ev) => form.setData('source', ev.target.value)} placeholder="Select an option" options={options.sources} />}
                                        </Field>
                                    </div>
                                </Box>
                                <Box title="2. Project and Requirement Details">
                                    <div className="grid gap-3 sm:grid-cols-2">
                                        <Field label={<>Project Type <span className="font-normal text-ink-400">(optional)</span></>} error={e.project_type}>
                                            {(id) => <Select id={id} value={form.data.project_type} onChange={(ev) => form.setData('project_type', ev.target.value)} placeholder="Select project type" options={options.projectTypes} />}
                                        </Field>
                                        <Field label={<>Scope / Size <span className="font-normal text-ink-400">(optional)</span></>} error={e.scope}>
                                            {(id) => <Select id={id} value={form.data.scope} onChange={(ev) => form.setData('scope', ev.target.value)} placeholder="Select scope or size" options={options.scopes} />}
                                        </Field>
                                        <Field label={<>Expected Start Date <span className="font-normal text-ink-400">(optional)</span></>} error={e.start_date}>
                                            {(id) => <Input id={id} type="date" min={new Date().toISOString().slice(0, 10)} value={form.data.start_date} onChange={(ev) => form.setData('start_date', ev.target.value)} />}
                                        </Field>
                                        <Field label={<>Budget Range <span className="font-normal text-ink-400">(optional)</span></>} error={e.budget}>
                                            {(id) => <Select id={id} value={form.data.budget} onChange={(ev) => form.setData('budget', ev.target.value)} placeholder="Select budget range" options={options.budgets} />}
                                        </Field>
                                        <Field label={<>Additional Information <span className="font-normal text-ink-400">(optional)</span></>} error={e.details} className="sm:col-span-2">
                                            {(id) => <Textarea id={id} rows={3} value={form.data.details} onChange={(ev) => form.setData('details', ev.target.value)} placeholder="Any additional details, documents or context that will help us understand your needs..." />}
                                        </Field>
                                        <Field label="Attachments" error={attachError} hint="PDF, DOCX, XLSX, PPTX, ZIP (Max 10MB each, 5 files)" className="sm:col-span-2">
                                            {(id) => (
                                                <input
                                                    id={id}
                                                    type="file"
                                                    multiple
                                                    accept=".pdf,.docx,.xlsx,.pptx,.zip"
                                                    onChange={(ev) => form.setData('attachments', Array.from(ev.target.files ?? []).slice(0, 5))}
                                                    className="block w-full rounded-[6px] border border-dashed border-parchment-500 bg-parchment-100 p-4 text-[0.8125rem] file:mr-3 file:rounded-[3px] file:border-0 file:bg-ink-900 file:px-3 file:py-1.5 file:text-parchment-100"
                                                />
                                            )}
                                        </Field>
                                    </div>
                                </Box>
                            </div>

                            <div className="mt-5 grid gap-4 rounded-[8px] border border-gold-300 bg-gold-50/60 p-4 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
                                <div>
                                    <p className="font-semibold text-ink-900">We value your time and confidentiality.</p>
                                    <p className="text-[0.8125rem] text-ink-600">Your request will be handled by our team and you will receive a response within 1 business day.</p>
                                </div>
                                {[
                                    [Clock, 'Response Time', 'Within 1 business day'],
                                    [ShieldCheck, 'Confidential', '100% secure & private'],
                                    [Lock, 'No Obligation', 'Quotes are obligation-free'],
                                ].map(([I, t, b]) => {
                                    const C = I as typeof Clock;
                                    return (
                                        <p key={t as string} className="flex gap-2 text-[0.8125rem]">
                                            <C className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                            <span>
                                                <span className="block font-semibold text-ink-900">{t as string}</span>
                                                <span className="text-ink-600">{b as string}</span>
                                            </span>
                                        </p>
                                    );
                                })}
                            </div>

                            <div className="mt-5 flex flex-wrap items-center gap-3">
                                <Link href={sprint ? `/sprints/${sprint.slug}` : '/sprints'} className="inline-flex h-11 items-center rounded-[4px] border border-gold-500 bg-white px-6 text-sm font-semibold">
                                    Cancel
                                </Link>
                                <button type="button" onClick={() => send('save')} disabled={form.processing} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-500 bg-white px-5 text-sm font-semibold">
                                    <Bookmark className="size-4" aria-hidden="true" /> Save and Continue Later
                                </button>
                                <button type="submit" disabled={form.processing} className="ml-auto inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-8 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50">
                                    Submit Request <ArrowRight className="size-4" aria-hidden="true" />
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );
}

function Radios({ label, name, value, options, onChange }: { label: string; name: string; value: string; options: string[]; onChange: (v: string) => void }) {
    return (
        <fieldset>
            <legend className="text-[0.8125rem] font-medium text-ink-800">
                {label} <span className="text-risk-500">*</span>
            </legend>
            <div className="mt-2 flex gap-5 text-[0.8125rem]">
                {options.map((o) => (
                    <label key={o} className="flex items-center gap-1.5">
                        <input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} className="accent-gold-600" />
                        {o}
                    </label>
                ))}
            </div>
        </fieldset>
    );
}
