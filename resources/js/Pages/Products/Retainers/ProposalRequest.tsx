import type { FormEvent } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowRight, Bookmark, Building2, ClipboardList, FileText, Headphones, Lock, ScanSearch, ThumbsUp, Users, UserRound, UsersRound, CalendarRange } from 'lucide-react';
import { PageTitle, Notice } from '@/Components/Products/Shared';
import { Stepper } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { RetServiceFull } from '@/Components/Products/Retainers/types';

const NEEDS = ['Strategic guidance & advisory', 'Board & governance support', 'Procurement & supply chain', 'Due diligence & screening', 'Project oversight', 'Technology & automation', 'Finance & risk', 'Other'];
const OBJECTIVES = ['Improve strategic decision-making', 'Strengthen governance', 'Reduce cost', 'Prepare for investment', 'Accelerate delivery', 'Manage risk'];
const SKILLS = ['Strategy & Leadership', 'Corporate Finance', 'Legal & Regulatory', 'Risk Management', 'Financial Advisory', 'ESG & Sustainability', 'Digital Transformation', 'M&A Advisory', 'Other / Not Sure'];
const LEVELS = [
    { key: 'Standard', sub: '1 business day' },
    { key: 'Priority', sub: 'Same day' },
    { key: 'Executive', sub: 'Within 4 hours' },
];
const OWNERS = [
    { key: 'NAMED_PERSON', icon: UserRound, title: 'Named Adviser', sub: 'A specific senior adviser dedicated to your account' },
    { key: 'DEFINED_ROLE', icon: Users, title: 'Defined Role', sub: 'A senior role committed to your Retainer' },
    { key: 'TEAM', icon: UsersRound, title: 'Adviser Team', sub: 'A small team aligned to your engagement' },
];

interface Props {
    service: RetServiceFull;
    allowance: number | null;
    prefill: { organisation?: string | null; email?: string | null; phone?: string | null } | null;
    draft: Record<string, unknown> | null;
}

function Section({ n, icon: Icon, title, children, className }: { n: number; icon: typeof Building2; title: string; children: React.ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-4', className)}>
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Icon className="size-4 text-gold-600" aria-hidden="true" />
                {n}. {title}
            </h2>
            <div className="space-y-3">{children}</div>
        </section>
    );
}

export default function ProposalRequest({ service, allowance, prefill, draft }: Props) {
    const { auth } = usePage<SharedProps>().props;
    const d = (draft ?? {}) as Record<string, string>;
    const form = useForm({
        service: service.slug,
        organisation: d.organisation ?? prefill?.organisation ?? '',
        country: d.country ?? 'South Africa',
        role: d.role ?? '',
        email: d.email ?? prefill?.email ?? '',
        phone: d.phone ?? prefill?.phone ?? '',
        primary_need: d.primary_need ?? '',
        objective: d.objective ?? '',
        description: d.description ?? '',
        start_date: d.start_date ?? '',
        duration: d.duration ?? '',
        service_level: d.service_level ?? 'Standard',
        budget: d.budget ?? '',
        heard: d.heard ?? '',
        owner_model: d.owner_model ?? service.owner_model,
        skills: (draft?.skills as string[] | undefined) ?? [],
        allowance: allowance ? String(allowance) : '',
        save_only: false,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((data) => ({ ...data, save_only: false }));
        form.post('/retainers/proposal-request', { preserveScroll: true });
    };
    const save = () => {
        form.transform((data) => ({ ...data, save_only: true }));
        form.post('/retainers/proposal-request', { preserveScroll: true });
    };
    const err = form.errors as Record<string, string>;

    return (
        <>
            <Head title="Request a Retainer Proposal" />
            <PageTitle
                crumbs={[{ label: 'Retainers', href: '/retainers' }, { label: service.name, href: `/retainers/${service.slug}` }, { label: 'Proposal Request' }]}
                title="Request a Retainer Proposal"
                lead={`Tell us what you need for the ${service.name}. We will scope, test capacity, and return a tailored Retainer proposal.`}
                aside={<Stepper className="w-72" steps={['Request', 'Review proposal', 'Sign']} current={1} />}
            />
            <form onSubmit={submit} className="container-tbca grid gap-5 py-8 lg:grid-cols-[1fr_300px]" noValidate>
                <div className="min-w-0 space-y-4">
                    {!auth.user && (
                        <Notice tone="warn" title="Sign in to submit">
                            Proposals are tied to your client account. <Link href="/login" className="font-semibold text-gold-700 underline">Sign in</Link> or <Link href="/register/1" className="font-semibold text-gold-700 underline">register</Link> first — your exclusion and disclosure acknowledgements are kept for this session.
                        </Notice>
                    )}
                    <div className="grid gap-4 xl:grid-cols-3">
                        <Section n={1} icon={Building2} title="Your Organisation">
                            <Field label="Organisation / Entity Name" required error={err.organisation}>
                                {(id) => <Input id={id} placeholder="Enter legal or trading name" value={form.data.organisation} onChange={(e) => form.setData('organisation', e.target.value)} invalid={!!err.organisation} />}
                            </Field>
                            <Field label="Country of Primary Operation" required error={err.country}>
                                {(id) => <Select id={id} value={form.data.country} onChange={(e) => form.setData('country', e.target.value)} options={['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Other']} />}
                            </Field>
                            <Field label="Your Role" required error={err.role}>
                                {(id) => <Select id={id} value={form.data.role} onChange={(e) => form.setData('role', e.target.value)} placeholder="Select your role" options={['Chief Executive Officer', 'Chief Financial Officer', 'Director', 'Head of Strategy', 'Procurement Lead', 'Other']} invalid={!!err.role} />}
                            </Field>
                            <Field label="Email" required error={err.email}>
                                {(id) => <Input id={id} type="email" placeholder="name@company.com" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} invalid={!!err.email} />}
                            </Field>
                            <Field label="Phone / WhatsApp (with country code)" error={err.phone}>
                                {(id) => <Input id={id} type="tel" placeholder="+27 Enter phone number" value={form.data.phone ?? ''} onChange={(e) => form.setData('phone', e.target.value)} />}
                            </Field>
                        </Section>
                        <Section n={2} icon={ClipboardList} title="What You Need">
                            <Field label="What best describes your primary need?" required error={err.primary_need}>
                                {(id) => <Select id={id} value={form.data.primary_need} onChange={(e) => form.setData('primary_need', e.target.value)} placeholder="Select your primary need" options={NEEDS} invalid={!!err.primary_need} />}
                            </Field>
                            <Field label="Key objective for this Retainer" required error={err.objective}>
                                {(id) => <Select id={id} value={form.data.objective} onChange={(e) => form.setData('objective', e.target.value)} placeholder="Select key objective" options={OBJECTIVES} invalid={!!err.objective} />}
                            </Field>
                            <Field label="Short description of your requirement" required error={err.description} hint={`${form.data.description.length} / 500`}>
                                {(id) => <Textarea id={id} maxLength={500} rows={6} placeholder="Describe the challenge, goals and expected outcomes..." value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} invalid={!!err.description} />}
                            </Field>
                        </Section>
                        <Section n={3} icon={CalendarRange} title="Scope and Engagement">
                            <Field label="Estimated start date" required error={err.start_date}>
                                {(id) => <Input id={id} type="date" value={form.data.start_date} onChange={(e) => form.setData('start_date', e.target.value)} invalid={!!err.start_date} />}
                            </Field>
                            <Field label="Expected engagement duration" required error={err.duration}>
                                {(id) => <Select id={id} value={form.data.duration} onChange={(e) => form.setData('duration', e.target.value)} placeholder="Select duration" options={['6 months (minimum term)', '12 months', '18 months', '24 months', 'Ongoing']} invalid={!!err.duration} />}
                            </Field>
                            <fieldset>
                                <legend className="mb-1.5 text-[0.8125rem] font-medium text-ink-800">Preferred service level</legend>
                                <div className="grid grid-cols-3 gap-2" role="radiogroup">
                                    {LEVELS.map((l) => (
                                        <button key={l.key} type="button" role="radio" aria-checked={form.data.service_level === l.key} onClick={() => form.setData('service_level', l.key)} className={cn('rounded-[4px] border px-1 py-2 text-center text-xs', form.data.service_level === l.key ? 'border-gold-500 bg-gold-50 font-semibold text-ink-900 ring-1 ring-gold-500' : 'border-parchment-400 text-ink-600')}>
                                            {l.key}
                                            <span className="block text-[0.625rem] font-normal text-ink-500">{l.sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                            <Field label="Indicative allowance (hours / month)" hint={`From the sizing tool, or leave blank for the standard ${service.allowance_qty} hours.`} error={err.allowance}>
                                {(id) => <Input id={id} type="number" min={4} max={200} value={form.data.allowance} onChange={(e) => form.setData('allowance', e.target.value)} />}
                            </Field>
                            <Field label="Do you have a target budget range? (Optional)">
                                {(id) => <Select id={id} value={form.data.budget} onChange={(e) => form.setData('budget', e.target.value)} placeholder="Select range" options={['Under R50,000 / month', 'R50,000 – R100,000 / month', 'R100,000 – R200,000 / month', 'Above R200,000 / month']} />}
                            </Field>
                            <Field label="How did you hear about TBCA? (Optional)">
                                {(id) => <Select id={id} value={form.data.heard} onChange={(e) => form.setData('heard', e.target.value)} placeholder="Select an option" options={['Referral', 'LinkedIn', 'Search engine', 'Event or webinar', 'Existing client', 'Other']} />}
                            </Field>
                        </Section>
                    </div>

                    <Section n={4} icon={Users} title="Capacity and People">
                        <div className="grid gap-5 lg:grid-cols-2">
                            <fieldset>
                                <legend className="mb-2 text-[0.8125rem] font-medium text-ink-800">Preferred capacity owner model</legend>
                                <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
                                    {OWNERS.map(({ key, icon: Icon, title, sub }) => (
                                        <button key={key} type="button" role="radio" aria-checked={form.data.owner_model === key} onClick={() => form.setData('owner_model', key)} className={cn('rounded-[6px] border p-3 text-center', form.data.owner_model === key ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 hover:border-gold-300')}>
                                            <Icon className="mx-auto size-5 text-ink-700" aria-hidden="true" />
                                            <span className="mt-1 block text-[0.8125rem] font-semibold text-ink-900">{title}</span>
                                            <span className="block text-[0.6875rem] text-ink-500">{sub}</span>
                                        </button>
                                    ))}
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend className="mb-2 text-[0.8125rem] font-medium text-ink-800">Specific skills or expertise you require (Select all that apply)</legend>
                                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                    {SKILLS.map((s) => (
                                        <Checkbox key={s} label={<span className="text-xs">{s}</span>} checked={form.data.skills.includes(s)} onChange={(e) => form.setData('skills', e.target.checked ? [...form.data.skills, s] : form.data.skills.filter((x) => x !== s))} />
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                    </Section>

                    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3">
                        <p className="text-xs text-ink-700">All Retainers are proposal-based. No Retainer purchase or commitment is created until you formally accept a proposal and sign the agreement. Submitting does not reserve capacity or create a payment obligation.</p>
                        <div className="flex gap-2">
                            <button type="button" onClick={save} disabled={form.processing || !auth.user} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 bg-white px-4 text-sm font-semibold text-ink-900 disabled:opacity-50">
                                <Bookmark className="size-4" aria-hidden="true" /> Save for Later
                            </button>
                            <button type="submit" disabled={form.processing || !auth.user} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50">
                                Submit for Scoping <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                        </div>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">What Happens Next?</h2>
                        <ol className="mt-3 space-y-3 text-xs">
                            {[
                                [ScanSearch, 'We review your request', 'Our team reviews your needs and checks capacity.'],
                                [ClipboardList, 'We scope and test capacity', 'We define scope, exclusions and test capacity.'],
                                [FileText, 'You receive a proposal', 'You get a transparent proposal with pricing.'],
                                [ThumbsUp, 'You decide', 'No obligation until you accept.'],
                            ].map(([Icon, t, b]) => {
                                const I = Icon as typeof ScanSearch;
                                return (
                                    <li key={t as string} className="flex gap-3">
                                        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-gold-50 text-gold-700"><I className="size-4" aria-hidden="true" /></span>
                                        <span><span className="block font-semibold text-ink-900">{t as string}</span><span className="text-ink-600">{b as string}</span></span>
                                    </li>
                                );
                            })}
                        </ol>
                        <div className="mt-4 flex gap-2 rounded-[6px] bg-parchment-100 p-3 text-xs text-ink-600">
                            <Lock className="size-4 shrink-0 text-gold-600" aria-hidden="true" />
                            <p><span className="block font-semibold text-ink-900">Your information is safe</span>We respect your privacy. Your information is used only to respond to your proposal request. <Link href="/privacy" className="font-semibold text-gold-700">Privacy Policy →</Link></p>
                        </div>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">Need help?</h2>
                        <p className="mt-1 text-xs text-ink-600">Speak to a human expert who can help you shape your requirement.</p>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Proposal help — ${service.name}`, section: 'retainers' })} className="mt-3 inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-ink-900">
                            <Headphones className="size-4" aria-hidden="true" /> Talk to a Specialist
                        </button>
                    </div>
                </aside>
            </form>
        </>
    );
}
