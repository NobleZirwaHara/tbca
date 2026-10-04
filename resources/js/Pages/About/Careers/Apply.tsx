import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { ArrowLeft, ArrowRight, Check, CircleCheck, FileText, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import FileDrop from '@/Components/About/FileDrop';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import { cn } from '@/lib/cn';
import type { RoleSummary } from '@/types/about';

type StepKey = 'personal' | 'experience' | 'education' | 'skills' | 'documents' | 'review';
type FV = string | boolean | File | null | string[];
type Data = Partial<Record<StepKey, Record<string, unknown>>>;

interface Props {
    role: RoleSummary;
    steps: { key: StepKey; label: string; done: boolean }[];
    step: StepKey;
    data: Data;
}

const descriptions: Record<StepKey, string> = {
    personal: 'Tell us about yourself',
    experience: 'Your work history',
    education: 'Your academic background',
    skills: 'Skills and screening questions',
    documents: 'Upload your CV and more',
    review: 'Review and submit application',
};

const countries = ['South African', 'Botswanan', 'Ghanaian', 'Kenyan', 'Malawian', 'Namibian', 'Nigerian', 'Rwandan', 'Zambian', 'Zimbabwean', 'Other'];
const authorizations = ['Citizen / permanent resident', 'Valid work permit', 'Require sponsorship', 'Remote contractor (outside SA)'];
const years = ['Less than 1 year', '1-2 years', '3-5 years', '5-8 years', '8+ years'];
const levels = ['Matric / high school', 'Diploma / certificate', "Bachelor's degree", 'Honours degree', "Master's degree", 'Doctorate', 'Professional qualification'];
const notices = ['Immediately', '2 weeks', '1 month', '2 months', '3 months'];

function Shell({ role, steps, step, children }: Omit<Props, 'data'> & { children: ReactNode }) {
    return (
        <section className="bg-parchment-100 py-8">
            <div className="container-tbca">
                <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: role.title, href: `/careers/${role.slug}` }, { label: 'Apply' }]} />
                <h1 className="font-serif text-[2rem] font-semibold text-ink-900">Job Application</h1>
                <p className="font-serif text-lg text-violet-700">{role.title}</p>
                <p className="mt-1 text-[0.8125rem] text-ink-600">{role.employment_type} • {role.location} • Posted {fmtDate(role.posted_at)}</p>
                <div className="mt-6 grid gap-6 lg:grid-cols-[15rem_1fr_19rem]">
                    <aside className="space-y-4">
                        <Link href={`/careers/${role.slug}`} className="inline-flex items-center gap-1 text-[0.8125rem] text-violet-700"><ArrowLeft className="size-4" aria-hidden="true" /> Back to Role Detail</Link>
                        <nav aria-label="Application progress" className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">Application Progress</h2>
                            <ol className="mt-3 space-y-1">
                                {steps.map((s, i) => {
                                    const active = s.key === step;
                                    const reachable = s.done || active || steps.slice(0, i).every((p) => p.done);
                                    const inner = (
                                        <span className={cn('flex items-start gap-3 rounded-[6px] p-2', active && 'bg-violet-50')}>
                                            <span className={cn('inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold', s.done ? 'bg-verified-500 text-white' : active ? 'bg-violet-700 text-white' : 'bg-parchment-300 text-ink-500')}>
                                                {s.done ? <Check className="size-3.5" aria-hidden="true" /> : i + 1}
                                            </span>
                                            <span className="text-[0.8125rem]"><span className="block font-semibold text-ink-900">{s.label}</span><span className="text-xs text-ink-500">{descriptions[s.key]}</span></span>
                                        </span>
                                    );
                                    return <li key={s.key} aria-current={active ? 'step' : undefined}>{reachable && !active ? <Link href={`/careers/${role.slug}/apply/${s.key}`}>{inner}</Link> : inner}</li>;
                                })}
                            </ol>
                        </nav>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-[0.8125rem]">
                            <p className="flex items-center gap-2 font-semibold text-ink-900"><ShieldCheck className="size-5 text-violet-700" aria-hidden="true" /> Your Information is Safe</p>
                            <p className="mt-1 text-xs text-ink-600">Your data is encrypted and handled in accordance with our Candidate Privacy notice.</p>
                            <Link href="/candidate-privacy" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-violet-700">View Privacy Policy <ArrowRight className="size-3" aria-hidden="true" /></Link>
                        </div>
                    </aside>
                    <div>{children}</div>
                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><FileText className="size-5 text-violet-700" aria-hidden="true" /> Application Summary</h2>
                            <dl className="mt-3 space-y-2 text-[0.8125rem]">
                                {[['Role', role.title], ['Department', role.department], ['Location', role.location], ['Employment Type', role.employment_type], ['Experience Level', role.experience_level ?? '—'], ['Date Posted', fmtDate(role.posted_at)], ['Closing Date', fmtDate(role.closes_at)]].map(([l, v]) => (
                                    <div key={l} className="flex justify-between gap-3"><dt className="text-ink-500">{l}</dt><dd className="text-right text-ink-900">{v}</dd></div>
                                ))}
                            </dl>
                        </div>
                        <div className="rounded-[8px] border border-violet-200 bg-violet-50/60 p-4">
                            <h2 className="font-semibold text-violet-800">Tips for a Great Application</h2>
                            <ul className="mt-2 space-y-2 text-[0.8125rem] text-ink-700">
                                {['Tailor your CV to highlight relevant experience and skills.', 'Showcase your impact with measurable achievements.', "Explain why you're excited to join TBCA and make a difference."].map((t) => <li key={t} className="flex gap-2"><CircleCheck className="mt-0.5 size-4 shrink-0 text-violet-600" aria-hidden="true" />{t}</li>)}
                            </ul>
                        </div>
                        <p className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs text-ink-600">
                            AI may assist with administration and structured screening, but every decision on your application is made by a person.
                        </p>
                    </aside>
                </div>
            </div>
        </section>
    );
}

function Actions({ processing, onDraft, submitLabel = 'Save and Continue', back }: { processing: boolean; onDraft?: () => void; submitLabel?: string; back?: string }) {
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300 pt-4">
            {back ? <Link href={back} className="text-[0.8125rem] text-ink-600 hover:text-ink-900">← Previous step</Link> : <span />}
            <div className="flex gap-2">
                {onDraft && <button type="button" onClick={onDraft} disabled={processing} className="h-10 rounded-[4px] border border-violet-300 px-4 text-sm font-medium text-violet-700">Save Draft</button>}
                <button type="submit" disabled={processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-violet-700 px-5 text-sm font-semibold text-white hover:bg-violet-800 disabled:opacity-50">{submitLabel} <ArrowRight className="size-4" aria-hidden="true" /></button>
            </div>
        </div>
    );
}

export default function Apply(props: Props) {
    const { role, steps, step, data } = props;
    const idx = steps.findIndex((s) => s.key === step);
    const back = idx > 0 ? `/careers/${role.slug}/apply/${steps[idx - 1].key}` : undefined;

    return (
        <>
            <Head title={`Apply — ${role.title}`} />
            <Shell role={role} steps={steps} step={step}>
                <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                    <p className="mb-3 text-right text-xs text-ink-500">* Required fields</p>
                    <StepForm key={step} role={role} step={step} data={data} back={back} index={idx} />
                </div>
            </Shell>
        </>
    );
}

function StepForm({ role, step, data, back, index }: { role: RoleSummary; step: StepKey; data: Data; back?: string; index: number }) {
    const initial: Record<string, unknown> = {
        personal: { full_name: '', email: '', phone: '', location: '', nationality: '', work_authorization: '', linkedin: '', portfolio: '' },
        experience: { years: '', title: '', employer: '', from: '', to: '', current: false },
        education: { level: '', institution: '', field: '', year: '' },
        skills: { skills: [] as string[], notice_period: '', motivation: '' },
        documents: { cv: null as File | null, cover_letter: null as File | null },
        review: { privacy_ack: false, accuracy_ack: false },
    }[step] as Record<string, unknown>;
    const saved = (step === 'documents' || step === 'review' ? {} : data[step]) ?? {};
    const form = useForm<Record<string, FV>>({ ...(initial as Record<string, FV>), ...(saved as Record<string, FV>), save_draft: false });
    const err = form.errors as Record<string, string | undefined>;
    const url = `/careers/${role.slug}/apply/${step}`;
    const val = (k: string) => (form.data[k] as string) ?? '';
    const set = (k: string) => (e: { target: { value: string } }) => form.setData(k, e.target.value);

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.transform((d) => ({ ...d, save_draft: false }));
        form.post(url, { preserveScroll: true, forceFormData: step === 'documents' });
    };
    const draft = () => {
        form.transform((d) => ({ ...d, save_draft: true }));
        form.post(url, { preserveScroll: true, forceFormData: step === 'documents' });
    };

    const heading = (t: string) => <h2 className="mb-4 font-semibold text-violet-800">{index + 1}. {t}</h2>;

    if (step === 'personal') {
        return (
            <form onSubmit={submit} className="space-y-4">
                {heading('Personal Information')}
                <div className="grid gap-4 md:grid-cols-3">
                    <Field label="Full Name" required error={err.full_name}>{(id) => <Input id={id} value={val('full_name')} onChange={set('full_name')} placeholder="Enter your full name" />}</Field>
                    <Field label="Email Address" required error={err.email}>{(id) => <Input id={id} type="email" value={val('email')} onChange={set('email')} placeholder="Enter your email address" />}</Field>
                    <Field label="Phone Number" required error={err.phone}>{(id) => <Input id={id} type="tel" value={val('phone')} onChange={set('phone')} placeholder="+27 Enter your phone number" />}</Field>
                    <Field label="Current Location" required error={err.location}>{(id) => <Input id={id} value={val('location')} onChange={set('location')} placeholder="City, country" />}</Field>
                    <Field label="Nationality" required error={err.nationality}>{(id) => <Select id={id} placeholder="Select your nationality" options={countries} value={val('nationality')} onChange={set('nationality')} />}</Field>
                    <Field label="Work Authorization" required error={err.work_authorization}>{(id) => <Select id={id} placeholder="Select your work authorization" options={authorizations} value={val('work_authorization')} onChange={set('work_authorization')} />}</Field>
                    <Field label="LinkedIn Profile" error={err.linkedin}>{(id) => <Input id={id} type="url" value={val('linkedin')} onChange={set('linkedin')} placeholder="https://www.linkedin.com/in/yourprofile" />}</Field>
                    <Field label="Portfolio / Website (Optional)" error={err.portfolio}>{(id) => <Input id={id} type="url" value={val('portfolio')} onChange={set('portfolio')} placeholder="https://your-portfolio.com" />}</Field>
                </div>
                <Actions processing={form.processing} onDraft={draft} back={back} />
            </form>
        );
    }

    if (step === 'experience') {
        return (
            <form onSubmit={submit} className="space-y-4">
                {heading('Experience')}
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Total Years of Professional Experience" required error={err.years}>{(id) => <Select id={id} placeholder="Select years of experience" options={years} value={val('years')} onChange={set('years')} />}</Field>
                    <Field label="Current / Most Recent Job Title" required error={err.title}>{(id) => <Input id={id} value={val('title')} onChange={set('title')} placeholder="Enter your current or most recent job title" />}</Field>
                    <Field label="Current / Most Recent Employer" required error={err.employer}>{(id) => <Input id={id} value={val('employer')} onChange={set('employer')} placeholder="Enter employer name" />}</Field>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Employment Period — from" required error={err.from}>{(id) => <Input id={id} type="month" value={val('from')} onChange={set('from')} />}</Field>
                        <Field label="to" error={err.to}>{(id) => <Input id={id} type="month" value={val('to')} disabled={Boolean(form.data.current)} onChange={set('to')} />}</Field>
                    </div>
                </div>
                <Checkbox label="I am currently employed at this company" checked={Boolean(form.data.current)} onChange={(e) => form.setData('current', e.target.checked)} />
                <Actions processing={form.processing} onDraft={draft} back={back} />
            </form>
        );
    }

    if (step === 'education') {
        return (
            <form onSubmit={submit} className="space-y-4">
                {heading('Education')}
                <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Highest Qualification" required error={err.level}>{(id) => <Select id={id} placeholder="Select qualification" options={levels} value={val('level')} onChange={set('level')} />}</Field>
                    <Field label="Institution" required error={err.institution}>{(id) => <Input id={id} value={val('institution')} onChange={set('institution')} />}</Field>
                    <Field label="Field of Study" required error={err.field}>{(id) => <Input id={id} value={val('field')} onChange={set('field')} />}</Field>
                    <Field label="Year Completed" required error={err.year}>{(id) => <Input id={id} inputMode="numeric" maxLength={4} value={val('year')} onChange={set('year')} placeholder="YYYY" />}</Field>
                </div>
                <p className="text-xs text-ink-500">A qualification does not imply professional registration; registrations are verified separately where relevant.</p>
                <Actions processing={form.processing} onDraft={draft} back={back} />
            </form>
        );
    }

    if (step === 'skills') {
        const chosen = (form.data.skills as string[]) ?? [];
        const toggle = (s: string) => form.setData('skills', chosen.includes(s) ? chosen.filter((x) => x !== s) : [...chosen, s]);
        const pool = Array.from(new Set([...(role.skills ?? []), 'Communication', 'Stakeholder Management', 'Project Management', 'Data Analysis', 'Report Writing', 'Python', 'SQL', 'Financial Modelling']));
        return (
            <form onSubmit={submit} className="space-y-4">
                {heading('Skills & Questions')}
                <fieldset>
                    <legend className="text-[0.8125rem] font-medium text-ink-800">Select your relevant skills <span className="text-risk-500">*</span></legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {pool.map((s) => (
                            <button key={s} type="button" aria-pressed={chosen.includes(s)} onClick={() => toggle(s)} className={cn('rounded-full border px-3 py-1 text-xs', chosen.includes(s) ? 'border-violet-600 bg-violet-600 text-white' : 'border-violet-300 text-violet-700')}>{s}</button>
                        ))}
                    </div>
                    {err.skills && <p className="mt-1 text-xs text-risk-500" role="alert">{err.skills}</p>}
                </fieldset>
                <Field label="Notice Period" required error={err.notice_period}>{(id) => <Select id={id} placeholder="Select notice period" options={notices} value={val('notice_period')} onChange={set('notice_period')} />}</Field>
                <Field label="Why do you want to join TBCA in this role?" required error={err.motivation} hint="At least 20 characters.">{(id) => <Textarea id={id} rows={4} value={val('motivation')} onChange={set('motivation')} />}</Field>
                <Actions processing={form.processing} onDraft={draft} back={back} />
            </form>
        );
    }

    if (step === 'documents') {
        const docs = (data.documents ?? {}) as { cv?: { name: string }; cover_letter?: { name: string } };
        return (
            <form onSubmit={submit} className="space-y-4">
                {heading('Upload Documents')}
                <div className="grid gap-4 md:grid-cols-2">
                    <FileDrop accent="purple" required label="CV / Resume" hint="PDF, DOC, DOCX (Max 5MB)" accept=".pdf,.doc,.docx" file={form.data.cv as File | null} existing={docs.cv?.name} onChange={(f) => form.setData('cv', f)} error={err.cv} />
                    <FileDrop accent="purple" label="Cover Letter (Optional)" hint="PDF, DOC, DOCX (Max 5MB)" accept=".pdf,.doc,.docx" file={form.data.cover_letter as File | null} existing={docs.cover_letter?.name} onChange={(f) => form.setData('cover_letter', f)} error={err.cover_letter} />
                </div>
                <p className="text-xs text-ink-500">Files are stored privately and only accessible to the recruitment team.</p>
                <Actions processing={form.processing} onDraft={draft} back={back} />
            </form>
        );
    }

    // Review & submit
    const p = (data.personal ?? {}) as Record<string, string>;
    const x = (data.experience ?? {}) as Record<string, string | boolean>;
    const ed = (data.education ?? {}) as Record<string, string>;
    const sk = (data.skills ?? {}) as { skills?: string[]; notice_period?: string; motivation?: string };
    const docs = (data.documents ?? {}) as { cv?: { name: string }; cover_letter?: { name: string } };
    const block = (title: string, stepKey: StepKey, rows: [string, ReactNode][]) => (
        <div className="rounded-[6px] border border-parchment-400 p-4">
            <div className="flex items-center justify-between"><h3 className="text-sm font-semibold text-ink-900">{title}</h3><Link href={`/careers/${role.slug}/apply/${stepKey}`} className="text-xs font-semibold text-violet-700">Edit</Link></div>
            <dl className="mt-2 grid gap-1.5 text-[0.8125rem] sm:grid-cols-2">{rows.map(([l, v]) => <div key={l}><dt className="text-xs text-ink-500">{l}</dt><dd className="text-ink-900">{v || '—'}</dd></div>)}</dl>
        </div>
    );

    return (
        <form onSubmit={submit} className="space-y-4">
            {heading('Review & Submit')}
            {block('Personal Information', 'personal', [['Name', p.full_name], ['Email', p.email], ['Phone', p.phone], ['Location', p.location], ['Nationality', p.nationality], ['Work authorization', p.work_authorization]])}
            {block('Experience', 'experience', [['Years', x.years as string], ['Title', x.title as string], ['Employer', x.employer as string], ['Period', `${x.from ?? ''} – ${x.current ? 'present' : (x.to ?? '')}`]])}
            {block('Education', 'education', [['Qualification', ed.level], ['Institution', ed.institution], ['Field', ed.field], ['Year', ed.year]])}
            {block('Skills & Questions', 'skills', [['Skills', (sk.skills ?? []).join(', ')], ['Notice period', sk.notice_period], ['Motivation', sk.motivation]])}
            {block('Documents', 'documents', [['CV', docs.cv?.name], ['Cover letter', docs.cover_letter?.name]])}
            <div className="space-y-2 rounded-[6px] bg-violet-50 p-4">
                <Checkbox
                    label={<>I have read the <Link href="/candidate-privacy" className="font-semibold text-violet-700 underline">Candidate Privacy</Link> notice and consent to TBCA processing my information for this application.</>}
                    checked={Boolean(form.data.privacy_ack)}
                    onChange={(e) => form.setData('privacy_ack', e.target.checked)}
                />
                {err.privacy_ack && <p className="text-xs text-risk-500" role="alert">You must acknowledge the Candidate Privacy notice.</p>}
                <Checkbox label="I confirm the information provided is accurate and complete." checked={Boolean(form.data.accuracy_ack)} onChange={(e) => form.setData('accuracy_ack', e.target.checked)} />
                {err.accuracy_ack && <p className="text-xs text-risk-500" role="alert">Please confirm the accuracy of your information.</p>}
            </div>
            <Actions processing={form.processing} submitLabel="Submit Application" back={back} />
        </form>
    );
}
