import { Head, Link, useForm } from '@inertiajs/react';
import type { FormDataType } from '@inertiajs/core';
import { ArrowLeft, ArrowRight, Bookmark, Building2, ChevronDown, CircleCheck, CloudUpload, FileText, Info, Lock, Rocket, Shield, ShieldCheck, Trash2, UserRound, Users } from 'lucide-react';
import { useState, type FormEvent, type ReactNode } from 'react';
import { AuthShell, NatashaCard } from '@/Components/CorePages/AuthShell';
import { CheckList, ChipGroup, JourneySteps, NumberedList, OptionCard, ProgressRing } from '@/Components/CorePages/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { cn } from '@/lib/cn';

type Opt = { value: string; label: string };
interface Doc { name: string; size: number; type: string; path: string; status: string }
interface Props {
    step: number;
    totalSteps: number;
    completed: number;
    data: Record<string, unknown>;
    options: { clientTypes: Opt[]; interests: string[]; documentTypes: string[]; declarations: Record<string, string>; optionalConsents: Record<string, string>; countries: Opt[] };
    reference: string | null;
}

const STEPS = ['Client Type', 'Particulars', 'Interests', 'Documents', 'Consent & Submit'];
const typeIcons: Record<string, string> = { individual: 'user', entrepreneur: 'user-check', sme: 'bar-chart-3', corporate: 'building-2', investor: 'landmark', sponsor: 'factory', supplier: 'truck', public: 'landmark', ngo: 'heart-pulse', partner: 'handshake', other: 'circle-dot' };
const NEXT = ['Your submission is validated.', 'Duplicate and identity checks are run.', 'Your Zoho CRM profile is created.', 'Your interests are routed to the correct TBCA team.', 'Documents are scanned and secured.', 'Due Diligence begins where authorised.', 'Account approval by TBCA.', 'Portal invitation sent after approval.'];
const NEED = ['Personal or organisation details', 'A valid email address and phone number', 'Information about your interests', 'Relevant supporting documents', 'Consent for data processing'];
const SECURITY = ['Encrypted Submission', 'Secure Document Upload', 'Consent Recorded', 'POPIA-Aware Processing', 'Audit Event Created', 'Role-Based Access'];

const s = (v: unknown, d = '') => (typeof v === 'string' ? v : typeof v === 'number' ? String(v) : d);
const a = (v: unknown) => (Array.isArray(v) ? (v as string[]) : []);
const b = (v: unknown) => v === true || v === 1 || v === '1' || v === 'true';

export default function Register({ step, completed, data, options, reference }: Props) {
    const progress = step === 5 ? 92 : Math.round(((step - 1) / 5) * 100) + 20;

    return (
        <AuthShell
            switchLink={{ href: '/login', label: 'Existing Client Login' }}
            footerLinks={['Privacy Notice', 'Terms of Use', 'Due Diligence Notice', 'Document Security', 'Support', 'System Status', 'Existing Client Login']}
            panel={<LeftPanel step={step} completed={completed} reference={reference} />}
        >
            <Head title="New Client Registration" />
            <div className="mx-auto grid max-w-7xl gap-6 2xl:grid-cols-[1fr_20rem]">
                <div className="min-w-0">
                    <div className="text-center">
                        <h1 className="font-serif text-[1.75rem] font-semibold tracking-wide text-ink-900 md:text-[2.125rem]">NEW CLIENT REGISTRATION</h1>
                        <p className="font-serif text-[1.0625rem] text-gold-700">Tell Us About You and How TBCA Can Help</p>
                        {step === 1 && <p className="mx-auto mt-2 max-w-xl text-[0.875rem] text-ink-600">Create your secure TBCA client profile, identify your requirements and submit the information needed for controlled onboarding.</p>}
                        {step === 1 && <p className="mx-auto mt-3 inline-flex items-center gap-2 rounded-[6px] border border-controlled-500/30 bg-controlled-50 px-3 py-2 text-[0.8125rem] text-controlled-700"><Info className="size-4" aria-hidden="true" />Your information will be reviewed before any client account or service access is activated.</p>}
                    </div>
                    <JourneySteps steps={STEPS} current={step} className="mx-auto mt-5 max-w-3xl" />
                    <div className="mt-6">
                        {step === 1 && <StepClientType data={data} options={options} />}
                        {step === 2 && <StepParticulars data={data} options={options} />}
                        {step === 3 && <StepInterests data={data} options={options} />}
                        {step === 4 && <StepDocuments data={data} options={options} />}
                        {step === 5 && <StepSubmit data={data} options={options} reference={reference} />}
                    </div>
                </div>
                <aside className="space-y-4">
                    <section className="flex items-center gap-4 rounded-[10px] border border-parchment-300 p-4">
                        <ProgressRing value={progress} size={96} />
                        <div className="text-[0.8125rem]"><p className="font-semibold text-ink-900">{step === 5 ? 'Ready to submit' : 'Your progress'}</p><p>Step {step} of 5</p><p className="text-ink-500">{step === 5 ? 'Review, consent and submit to complete registration.' : 'Please complete the required fields.'}</p></div>
                    </section>
                    <SideCard title="What You Will Need"><ul className="list-disc space-y-1 pl-4 text-[0.8125rem] text-ink-700">{(step >= 4 ? ['Valid identity document', 'Proof of address (not older than 3 months)', 'Company registration documents', 'Company profile and key information', 'Business plan or project concept (if any)', 'Valid contact details', 'Authority or consent where relevant'] : NEED).map((n) => <li key={n}>{n}</li>)}</ul></SideCard>
                    <SideCard title="What Happens Next"><NumberedList items={NEXT} /></SideCard>
                    <SideCard title="Security & Privacy"><CheckList items={SECURITY} /></SideCard>
                    <NatashaCard chips={['Help Me Register', 'Which Client Type Should I Select?', 'Which Documents Do I Need?', 'Explain Due Diligence Consent', 'Help Me Select a Service', 'Book a Discovery Session']} />
                </aside>
            </div>
        </AuthShell>
    );
}

Register.layout = null;

function SideCard({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="rounded-[10px] border border-parchment-300 p-4">
            <h2 className="mb-2 border-b-2 border-gold-500 pb-1 text-[0.8125rem] font-bold tracking-wide text-ink-900 uppercase">{title}</h2>
            {children}
        </section>
    );
}

function LeftPanel({ step, completed, reference }: { step: number; completed: number; reference: string | null }) {
    if (step === 1) {
        return (
            <>
                <p className="mt-8 text-center text-[1.125rem] leading-snug text-parchment-100">One Secure Client Profile.<br />One Controlled Onboarding Journey.<br />One Connected TBCA Relationship.</p>
                <ul className="mt-8 space-y-5 text-[0.875rem] font-semibold text-parchment-100">
                    {[[Shield, 'Secure Document Submission'], [Users, 'Human-Reviewed Onboarding'], [Lock, 'Role-Based Information Access'], [Rocket, 'Controlled Zoho One Integration']].map(([I, t]) => {
                        const Ico = I as typeof Shield;
                        return <li key={t as string} className="flex items-center gap-3"><Ico className="size-6 text-gold-500" aria-hidden="true" />{t as string}</li>;
                    })}
                </ul>
            </>
        );
    }
    const subs: Record<number, string[]> = { 2: ['2.1 Your Particulars', '2.2 Organisation Details'], 3: ['3.1 Business & Service Interests', '3.2 Project or Investment Info', '3.3 Due Diligence Routing'], 4: ['4.1 Upload Documents', '4.2 Communication & Consent'], 5: ['5.1 Review', '5.2 Submit Registration'] };
    return (
        <>
            <h2 className="mt-6 text-[1rem] font-semibold text-parchment-100">Registration Progress</h2>
            <ol className="mt-3 space-y-2.5 text-[0.875rem]">
                {STEPS.map((l, i) => {
                    const n = i + 1;
                    const done = n <= completed && n !== step;
                    return (
                        <li key={l}>
                            {n <= completed + 1 ? (
                                <Link href={`/register/${n}`} className={cn('flex items-center gap-3', n === step ? 'font-semibold text-gold-400' : 'text-parchment-100')}>
                                    <span className={cn('flex size-6 items-center justify-center rounded-full text-[0.75rem] font-bold', done ? 'bg-verified-500 text-white' : n === step ? 'bg-gold-500 text-ink-900' : 'bg-ink-700')}>{done ? <CircleCheck className="size-4" aria-hidden="true" /> : n}</span>{l}
                                </Link>
                            ) : (
                                <span className="flex items-center gap-3 text-ink-300"><span className="flex size-6 items-center justify-center rounded-full bg-ink-700 text-[0.75rem]">{n}</span>{l}</span>
                            )}
                            {n === step && <ul className="mt-1.5 ml-9 space-y-1 text-[0.75rem] text-gold-300">{subs[n]?.map((x) => <li key={x}>{x}</li>)}</ul>}
                        </li>
                    );
                })}
            </ol>
            <div className="mt-6 rounded-[8px] border border-gold-600/60 p-4">
                <p className="font-serif text-[1rem] font-semibold text-gold-400">Why We Collect This Information</p>
                <p className="mt-1 text-[0.75rem]">We use your information to create or update your TBCA client profile, route your request to the right team and deliver the services you need.</p>
                <p className="mt-2 text-[0.75rem]">All data is handled in line with POPIA and our Privacy Notice.</p>
                <Link href="/about/governance" className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-parchment-200/40 px-3 py-1.5 text-[0.75rem]"><Lock className="size-3.5" aria-hidden="true" />Privacy Notice</Link>
            </div>
            <p className="mt-5 text-center text-[0.875rem]">Registration Reference (after submit)</p>
            <p className="mt-1 rounded-[6px] border-2 border-dashed border-gold-500 px-3 py-2.5 text-center font-mono text-[1.125rem] tracking-wider text-parchment-100">{reference ?? 'TBCA-REG-XXXXXX'}</p>
        </>
    );
}

function Actions({ back, nextLabel, processing, onSave }: { back?: number; nextLabel: string; processing: boolean; onSave: () => void }) {
    return (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {back ? <Link href={`/register/${back}`} className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-ink-300 px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" />Back to Step {back}</Link> : <span />}
            <button type="button" onClick={onSave} className="inline-flex items-center justify-center gap-1.5 text-[0.875rem] text-controlled-700"><Bookmark className="size-4" aria-hidden="true" />Save and Continue Later</button>
            <button type="submit" disabled={processing} className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-gold-600 px-6 text-sm font-semibold text-white hover:bg-gold-700 disabled:opacity-60">{processing ? 'Saving…' : nextLabel}<ArrowRight className="size-4" aria-hidden="true" /></button>
        </div>
    );
}

function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
    return (
        <section className="border-t border-parchment-300 pt-4 first:border-t-0 first:pt-0">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-[0.9375rem] font-bold tracking-wide text-ink-900 uppercase">{title}</h2>{aside}</div>
            {children}
        </section>
    );
}

type StepProps = { data: Record<string, unknown>; options: Props['options'] };

function useStepForm<T extends FormDataType<T>>(step: number, initial: T) {
    const form = useForm<T & { intent: string }>({ ...initial, intent: 'continue' } as T & { intent: string });
    const send = (intent: 'continue' | 'save', extra?: { forceFormData?: boolean }) => {
        form.transform((d) => ({ ...d, intent }));
        form.post(`/register/${step}`, { preserveScroll: true, ...extra });
    };
    return { form, send, err: form.errors as Record<string, string> };
}

function StepClientType({ data, options }: StepProps) {
    const { form, send, err } = useStepForm(1, { client_type: s(data.client_type), client_type_other: s(data.client_type_other) });
    const submit = (e: FormEvent) => { e.preventDefault(); send('continue'); };
    return (
        <form onSubmit={submit} noValidate>
            <Section title="1. How are you registering?">
                <div role="radiogroup" aria-label="Client type" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {options.clientTypes.map((t) => <OptionCard key={t.value} selected={form.data.client_type === t.value} onSelect={() => form.setData('client_type', t.value)} title={t.label} icon={typeIcons[t.value]} className="flex-col items-center text-center [&>span:nth-child(2)]:pr-0" />)}
                </div>
                {err.client_type && <p role="alert" className="mt-2 text-xs text-risk-500">Please choose how you are registering.</p>}
                {form.data.client_type === 'other' && <Field label="Please describe" required error={err.client_type_other} className="mt-3 max-w-md">{(id) => <Input id={id} value={form.data.client_type_other} onChange={(e) => form.setData('client_type_other', e.target.value)} />}</Field>}
                <p className="mt-3 inline-flex items-center gap-2 rounded-[6px] border border-gold-300 bg-gold-50 px-3 py-2 text-[0.8125rem] text-ink-700"><Info className="size-4" aria-hidden="true" />Your selection helps us collect the right information and route your request to the correct TBCA team.</p>
            </Section>
            <Actions nextLabel="Continue to Next Step" processing={form.processing} onSave={() => send('save')} />
        </form>
    );
}

function StepParticulars({ data, options }: StepProps) {
    const keys = ['title', 'first_name', 'middle_name', 'last_name', 'preferred_name', 'job_title', 'email', 'phone', 'whatsapp', 'contact_channel', 'contact_time', 'language', 'country', 'province', 'city', 'postal_code', 'company', 'trading_name', 'registration_number', 'organisation_type', 'industry', 'company_size', 'employees', 'registration_country', 'org_province', 'year_established', 'website', 'registered_address', 'operating_address', 'tax_number', 'parent_organisation', 'group_status', 'decision_maker'] as const;
    const initial = Object.fromEntries(keys.map((k) => [k, s(data[k], k === 'country' ? 'ZA' : k === 'language' ? 'English' : k === 'registration_country' ? 'South Africa' : '')])) as Record<(typeof keys)[number], string>;
    const { form, send, err } = useStepForm(2, { ...initial, individual: b(data.individual) || data.client_type === 'individual' });
    const d = form.data;
    const text = (k: (typeof keys)[number], label: string, req = false, type = 'text', ph?: string, ac?: string) => <Field label={label} required={req} error={err[k]}>{(id) => <Input id={id} type={type} placeholder={ph} autoComplete={ac} value={d[k]} onChange={(e) => form.setData(k, e.target.value)} />}</Field>;
    const sel = (k: (typeof keys)[number], label: string, opts: (string | Opt)[], req = false) => <Field label={label} required={req} error={err[k]}>{(id) => <Select id={id} placeholder="Select" options={opts} value={d[k]} onChange={(e) => form.setData(k, e.target.value)} />}</Field>;
    const submit = (e: FormEvent) => { e.preventDefault(); send('continue'); };

    return (
        <form onSubmit={submit} noValidate className="space-y-6">
            <Section title="2. Your Particulars">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {sel('title', 'Title', ['Mr', 'Ms', 'Mrs', 'Dr', 'Prof', 'Adv', 'Mx'], true)}
                    {text('first_name', 'First Name', true, 'text', 'e.g. Thabo', 'given-name')}
                    {text('middle_name', 'Middle Name', false, 'text', 'e.g. Johan', 'additional-name')}
                    {text('last_name', 'Surname', true, 'text', 'e.g. Maseko', 'family-name')}
                    {text('preferred_name', 'Preferred Name', false, 'text', 'e.g. TJ', 'nickname')}
                    {text('job_title', 'Job Title / Role', true, 'text', 'e.g. Founder', 'organization-title')}
                    {text('email', 'Work Email Address', true, 'email', 'name@company.co.za', 'email')}
                    {text('phone', 'Mobile Number', true, 'tel', '+27 82 123 4567', 'tel')}
                    {text('whatsapp', 'WhatsApp Number', false, 'tel', '+27 82 123 4567')}
                    {sel('contact_channel', 'Preferred Contact Channel', ['Email', 'Phone', 'WhatsApp', 'Client Portal'], true)}
                    {sel('contact_time', 'Preferred Contact Time', ['Morning', 'Afternoon', 'Any time'])}
                    {sel('language', 'Preferred Language', ['English', 'Afrikaans'], true)}
                    {sel('country', 'Country', options.countries, true)}
                    {text('province', 'Province / Region', true, 'text', 'e.g. Gauteng', 'address-level1')}
                    {text('city', 'City / Town', true, 'text', 'e.g. Pretoria', 'address-level2')}
                    {text('postal_code', 'Postal Code', false, 'text', 'e.g. 2000', 'postal-code')}
                </div>
            </Section>
            <Section
                title="Organisation or Business Details (if applicable)"
                aside={<label className="inline-flex items-center gap-2 text-[0.8125rem]"><input type="checkbox" role="switch" checked={d.individual} onChange={(e) => form.setData('individual', e.target.checked)} className="size-4 accent-gold-600" />I am registering as an Individual</label>}
            >
                {d.individual ? (
                    <p className="rounded-[6px] bg-parchment-200 p-3 text-[0.8125rem] text-ink-600">Organisation details are not required for individual registrations. Untick the switch to add an organisation.</p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {text('company', 'Legal Organisation Name', true, 'text', 'e.g. ABC Holdings (Pty) Ltd', 'organization')}
                        {text('trading_name', 'Trading Name (DBA)', false, 'text', 'e.g. ABC Group')}
                        {text('registration_number', 'Company Registration Number', false, 'text', 'e.g. 2021/123456/07')}
                        {sel('organisation_type', 'Organisation Type', ['Private Company (Pty) Ltd', 'Public Company', 'Sole Proprietor', 'Partnership', 'Trust', 'Non-Profit Company', 'Government Entity', 'Other'], true)}
                        {sel('industry', 'Industry / Sector', ['Agriculture & Agri-processing', 'Construction & Infrastructure', 'Energy & Renewables', 'Financial Services', 'Healthcare', 'ICT & Digital', 'Manufacturing', 'Mining & Resources', 'Professional Services', 'Retail & Wholesale', 'Tourism & Hospitality', 'Transport & Logistics', 'Other'], true)}
                        {sel('company_size', 'Organisation Size', ['Micro', 'Small', 'Medium', 'Large', 'Enterprise'], true)}
                        {sel('employees', 'No. of Employees', ['1-10', '11-50', '51-200', '201-500', '500+'])}
                        {text('registration_country', 'Country of Registration', true)}
                        {text('org_province', 'Province')}
                        {text('year_established', 'Year Established', false, 'number', 'e.g. 2018')}
                        {text('website', 'Website', false, 'url', 'https://www.example.co.za', 'url')}
                        {text('tax_number', 'Tax / VAT Number (if applicable)', false, 'text', 'e.g. 1234567890')}
                        <div className="sm:col-span-2">{text('registered_address', 'Registered Address', true, 'text', 'Building, Street, Suburb', 'street-address')}</div>
                        <div className="sm:col-span-2">{text('operating_address', 'Operating Address (if different)', false, 'text', 'Building, Street, Suburb')}</div>
                        {text('parent_organisation', 'Parent Organisation (if any)', false, 'text', 'e.g. ABC International')}
                        {sel('group_status', 'Group / Subsidiary Status', ['Independent', 'Holding Company', 'Subsidiary', 'Branch'])}
                        {text('decision_maker', 'Primary Decision-Maker', false, 'text', 'Name and Title')}
                    </div>
                )}
                <p className="mt-3 flex items-center gap-2 rounded-[6px] bg-gold-50 px-3 py-2 text-[0.75rem] text-ink-700"><Info className="size-4" aria-hidden="true" />Additional ownership and Ultimate Beneficial Owner (UBO) information may be requested securely during Due Diligence.</p>
            </Section>
            <Actions back={1} nextLabel="Continue to Step 3: Interests" processing={form.processing} onSave={() => send('save')} />
        </form>
    );
}

function StepInterests({ data, options }: StepProps) {
    const { form, send, err } = useStepForm(3, {
        interests: a(data.interests), primary_interest: s(data.primary_interest), assistance: s(data.assistance),
        project_name: s(data.project_name), project_country: s(data.project_country, 'South Africa'), project_stage: s(data.project_stage), capital_requirement: s(data.capital_requirement),
        preferred_currency: s(data.preferred_currency, 'ZAR'), capital_type: s(data.capital_type), target_date: s(data.target_date), nda_required: b(data.nda_required), project_details: s(data.project_details),
        dd_for: s(data.dd_for), dd_subject_type: s(data.dd_subject_type), dd_purpose: s(data.dd_purpose), dd_relationship: s(data.dd_relationship),
    });
    const d = form.data;
    const [more, setMore] = useState(Boolean(d.project_details));
    const toggle = (i: string) => {
        const next = d.interests.includes(i) ? d.interests.filter((x) => x !== i) : [...d.interests, i];
        form.setData((prev) => ({ ...prev, interests: next, primary_interest: next.includes(prev.primary_interest) ? prev.primary_interest : next[0] ?? '' }));
    };
    const sel = (k: keyof typeof d, label: string, opts: string[], req = false) => <Field label={label} required={req} error={err[k as string]}>{(id) => <Select id={id} placeholder="Select" options={opts} value={d[k] as string} onChange={(e) => form.setData(k, e.target.value as never)} />}</Field>;
    const submit = (e: FormEvent) => { e.preventDefault(); send('continue'); };

    return (
        <form onSubmit={submit} noValidate className="space-y-6">
            <Section title="3. What are you interested in?">
                <p className="mb-2 text-[0.8125rem] font-semibold text-ink-800">3.1 Select your areas of interest <em className="font-normal">(select all that apply)</em></p>
                <div role="group" aria-label="Areas of interest" className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
                    {options.interests.map((i) => <OptionCard key={i} multi selected={d.interests.includes(i)} onSelect={() => toggle(i)} title={i} className="p-2.5 [&_span]:text-[0.75rem]" />)}
                </div>
                {err.interests && <p role="alert" className="mt-1 text-xs text-risk-500">{err.interests}</p>}
                {d.interests.length > 0 && (
                    <div className="mt-3 flex flex-wrap items-center gap-2 rounded-[6px] bg-parchment-200 p-2">
                        <span className="text-[0.75rem] font-semibold">Selected Interests Summary:</span>
                        {d.interests.map((i) => <button key={i} type="button" onClick={() => toggle(i)} className="rounded-full border border-gold-300 bg-gold-50 px-2 py-0.5 text-[0.6875rem]" aria-label={`Remove ${i}`}>{i} ×</button>)}
                        <button type="button" onClick={() => form.setData((p) => ({ ...p, interests: [], primary_interest: '' }))} className="ml-auto text-[0.75rem] underline">Clear All</button>
                    </div>
                )}
                <div className="mt-3 grid gap-3 md:grid-cols-3">
                    <Field label="Primary Area of Interest" required error={err.primary_interest}>{(id) => <Select id={id} placeholder="Select from your interests" options={d.interests} value={d.primary_interest} onChange={(e) => form.setData('primary_interest', e.target.value)} />}</Field>
                    <Field label="Secondary Areas of Interest">{(id) => <Input id={id} readOnly value={d.interests.filter((i) => i !== d.primary_interest).join(', ')} />}</Field>
                    <Field label="Describe the specific assistance you require" required error={err.assistance} hint={`${d.assistance.length} / 1000`}>{(id) => <Textarea id={id} maxLength={1000} className="min-h-10" placeholder="e.g. Feasibility study, Funding support, Market entry advisory..." value={d.assistance} onChange={(e) => form.setData('assistance', e.target.value)} />}</Field>
                </div>
            </Section>
            <Section title="3.2 Project or Investment Information (if applicable)">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="Project or Opportunity Name">{(id) => <Input id={id} placeholder="e.g. Northern Cape Solar Project" value={d.project_name} onChange={(e) => form.setData('project_name', e.target.value)} />}</Field>
                    {sel('project_country', 'Project Country', options.countries.map((c) => c.label))}
                    {sel('project_stage', 'Project Stage', ['Concept', 'Pre-feasibility', 'Feasibility', 'Bankable / Financial Close', 'Construction', 'Operational'])}
                    {sel('capital_requirement', 'Estimated Capital Requirement', ['Under R1m', 'R1m - R10m', 'R10m - R50m', 'R50m - R150m', 'R150m+'])}
                    {sel('preferred_currency', 'Preferred Currency', ['ZAR', 'USD'])}
                    {sel('capital_type', 'Capital Type Required', ['Equity', 'Debt', 'Blended Finance', 'Grant', 'Not sure'])}
                    <Field label="Target Decision Date">{(id) => <Input id={id} type="date" value={d.target_date} onChange={(e) => form.setData('target_date', e.target.value)} />}</Field>
                    <div><p className="mb-1.5 text-[0.8125rem] font-medium text-ink-800">NDA Required?</p><div role="radiogroup" aria-label="NDA required" className="flex overflow-hidden rounded-[4px] border border-parchment-500">{[true, false].map((v) => <button key={String(v)} type="button" role="radio" aria-checked={d.nda_required === v} onClick={() => form.setData('nda_required', v)} className={cn('h-10 flex-1 text-sm', d.nda_required === v ? 'bg-gold-600 font-semibold text-white' : 'bg-white')}>{v ? 'Yes' : 'No'}</button>)}</div></div>
                </div>
                <button type="button" aria-expanded={more} onClick={() => setMore(!more)} className="mt-3 flex w-full items-center justify-between rounded-[6px] border border-parchment-400 px-3 py-2 text-[0.8125rem]"><span><strong>Additional Project Details</strong> (location, sector, partners, timeline...)</span><ChevronDown className={cn('size-4 transition-transform', more && 'rotate-180')} aria-hidden="true" /></button>
                {more && <Textarea aria-label="Additional project details" className="mt-2" maxLength={1000} value={d.project_details} onChange={(e) => form.setData('project_details', e.target.value)} />}
            </Section>
            <Section title="3.3 Due Diligence Routing (if applicable)">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {sel('dd_for', 'I am registering for', ['Due Diligence on my organisation', 'Due Diligence on a counterparty', 'Due Diligence on a project', 'Not applicable'])}
                    {sel('dd_subject_type', 'Subject Type', ['Company', 'Individual', 'Project', 'Trust'])}
                    {sel('dd_purpose', 'Purpose of the Check', ['Business Onboarding', 'Investment Decision', 'Supplier Vetting', 'Partnership', 'Lending'])}
                    {sel('dd_relationship', 'Relationship to Subject', ['Self (Organisation Representative)', 'Investor', 'Buyer / Client', 'Lender', 'Adviser'])}
                </div>
                <p className="mt-3 flex gap-2 rounded-[6px] bg-controlled-50 p-3 text-[0.75rem] text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" />Due Diligence will begin only after we receive the required consent and minimum information. Additional documents and verification may be requested securely.</p>
            </Section>
            <Actions back={2} nextLabel="Continue to Step 4: Documents" processing={form.processing} onSave={() => send('save')} />
        </form>
    );
}

function StepDocuments({ data, options }: StepProps) {
    const existing = (Array.isArray(data.documents) ? data.documents : []) as Doc[];
    const { form, send, err } = useStepForm(4, {
        documents: [] as File[], document_types: [] as string[], keep_documents: existing.map((x) => x.path),
        contact_channels: a(data.contact_channels).length ? a(data.contact_channels) : ['Email'], comm_language: s(data.comm_language, 'English'),
        comm_purposes: a(data.comm_purposes).length ? a(data.comm_purposes) : ['Registration & service updates', 'Document requests', 'Appointment reminders'],
    });
    const d = form.data;
    const [docType, setDocType] = useState(options.documentTypes[3]);
    const kept = existing.filter((x) => d.keep_documents.includes(x.path));
    const add = (files: FileList | null) => {
        const list = Array.from(files ?? []).slice(0, Math.max(0, 8 - kept.length - d.documents.length));
        form.setData((p) => ({ ...p, documents: [...p.documents, ...list], document_types: [...p.document_types, ...list.map(() => docType)] }));
    };
    const submit = (e: FormEvent) => { e.preventDefault(); send('continue', { forceFormData: true }); };
    const fileErrors = Object.entries(err).filter(([k]) => k.startsWith('documents'));

    return (
        <form onSubmit={submit} noValidate className="space-y-6">
            <Section title="4. Upload Supporting Documents">
                <div className="grid gap-4 lg:grid-cols-[18rem_1fr]">
                    <label
                        className="flex cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed border-parchment-500 p-6 text-center hover:border-gold-500"
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => { e.preventDefault(); add(e.dataTransfer.files); }}
                    >
                        <CloudUpload className="size-10 text-ink-700" aria-hidden="true" />
                        <span className="mt-2 text-[0.875rem] font-medium">Drag and drop files here</span>
                        <span className="text-[0.75rem] text-ink-500">or</span>
                        <span className="mt-2 inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-600 px-4 text-sm font-semibold text-white"><Lock className="size-4" aria-hidden="true" />Browse Securely</span>
                        <input type="file" multiple className="sr-only" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg" onChange={(e) => add(e.target.files)} />
                        <span className="mt-3 text-[0.6875rem] text-ink-500">Max file size: 25MB per file<br />Accepted: PDF, DOCX, XLSX, PPTX, PNG, JPG</span>
                    </label>
                    <div>
                        <p className="text-[0.8125rem] font-semibold">Select document type <span className="font-normal text-ink-500">(applied to the next files you add)</span></p>
                        <div className="mt-2"><ChipGroup label="Document type" options={options.documentTypes} value={[docType]} onChange={(v) => setDocType(v.filter((x) => x !== docType)[0] ?? docType)} /></div>
                        <p className="mt-4 text-[0.8125rem] font-semibold">Uploaded Documents</p>
                        <ul className="mt-2 divide-y divide-parchment-300 rounded-[6px] border border-parchment-300">
                            {kept.length + d.documents.length === 0 && <li className="p-3 text-[0.75rem] text-ink-500">No documents added yet. Documents are optional at registration; you may be asked for them during review.</li>}
                            {kept.map((x) => <DocRow key={x.path} name={x.name} size={x.size} type={x.type} status={x.status} onRemove={() => form.setData('keep_documents', d.keep_documents.filter((p) => p !== x.path))} />)}
                            {d.documents.map((f, i) => <DocRow key={`${f.name}${i}`} name={f.name} size={f.size} type={d.document_types[i]} status={f.size > 25 * 1024 * 1024 ? 'Needs Replacement' : 'Ready to upload'} onRemove={() => form.setData((p) => ({ ...p, documents: p.documents.filter((_, j) => j !== i), document_types: p.document_types.filter((_, j) => j !== i) }))} />)}
                        </ul>
                        {fileErrors.map(([k, v]) => <p key={k} role="alert" className="mt-1 text-xs text-risk-500">{v}</p>)}
                        <p className="mt-3 flex gap-2 rounded-[6px] bg-controlled-50 p-2.5 text-[0.75rem] text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" />Upload only documents relevant to your selected services. Ordinary onboarding documents route to secure storage; high-security transaction files may route to a Virtual Deal Room if required.</p>
                    </div>
                </div>
            </Section>
            <Section title="Communication Preferences">
                <div className="grid gap-4 md:grid-cols-3">
                    <div><p className="mb-2 text-[0.8125rem] font-semibold">Preferred Contact Channels <span className="text-risk-500">*</span></p><ChipGroup label="Preferred contact channels" options={['Email', 'Telephone', 'WhatsApp', 'Client Portal Notification']} value={d.contact_channels} onChange={(v) => form.setData('contact_channels', v)} />{err.contact_channels && <p className="mt-1 text-xs text-risk-500">{err.contact_channels}</p>}</div>
                    <Field label="Preferred Language" required>{(id) => <Select id={id} options={['English', 'Afrikaans', 'Portuguese', 'Chinese (Mandarin)', 'French', 'Swahili', 'Arabic']} value={d.comm_language} onChange={(e) => form.setData('comm_language', e.target.value)} />}</Field>
                    <div><p className="mb-2 text-[0.8125rem] font-semibold">Communication Purpose <span className="font-normal text-ink-500">(operational communications are required)</span></p><ChipGroup label="Communication purpose" options={['Registration & service updates', 'Project or advisory updates', 'Document requests', 'New products & insights', 'Appointment reminders', 'Due Diligence case updates']} value={d.comm_purposes} onChange={(v) => form.setData('comm_purposes', v)} /></div>
                </div>
            </Section>
            <Actions back={3} nextLabel="Continue to Step 5: Consent & Submit" processing={form.processing} onSave={() => send('save')} />
        </form>
    );
}

function DocRow({ name, size, type, status, onRemove }: { name: string; size: number; type: string; status: string; onRemove: () => void }) {
    return (
        <li className="flex flex-wrap items-center gap-3 p-2.5 text-[0.75rem]">
            <FileText className="size-4 text-risk-500" aria-hidden="true" />
            <span className="min-w-0 flex-1 truncate font-medium text-ink-900">{name}<span className="block font-normal text-ink-500">{type}</span></span>
            <span className="text-ink-500">{(size / 1024 / 1024).toFixed(1)} MB</span>
            <span className={cn('rounded-full px-2 py-0.5', status === 'Needs Replacement' ? 'bg-risk-50 text-risk-700' : 'bg-verified-50 text-verified-700')}>{status}</span>
            <button type="button" onClick={onRemove} aria-label={`Remove ${name}`}><Trash2 className="size-4 text-ink-500" /></button>
        </li>
    );
}

function StepSubmit({ data, options, reference }: StepProps & { reference: string | null }) {
    const decl = Object.keys(options.declarations);
    const { form, send, err } = useStepForm(5, {
        declarations: Object.fromEntries(decl.map((k) => [k, false])) as Record<string, boolean>,
        optional_consents: Object.fromEntries(Object.keys(options.optionalConsents).map((k) => [k, false])) as Record<string, boolean>,
        accept_terms: false,
        password: '',
        password_confirmation: '',
    });
    const d = form.data;
    const typeLabel = options.clientTypes.find((t) => t.value === data.client_type)?.label ?? '—';
    const docs = (Array.isArray(data.documents) ? data.documents : []) as Doc[];
    const allChecked = decl.every((k) => d.declarations[k]) && d.accept_terms;
    const submit = (e: FormEvent) => { e.preventDefault(); send('continue'); };
    const Card = ({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) => (
        <section className="rounded-[8px] border border-parchment-300 p-3">
            <h3 className="flex items-center gap-1.5 text-[0.75rem] font-bold tracking-wide text-ink-900 uppercase">{icon}{title}</h3>
            <div className="mt-2 text-[0.75rem] text-ink-700">{children}</div>
            <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-verified-700"><CircleCheck className="size-3.5" aria-hidden="true" />Completed</p>
        </section>
    );

    return (
        <form onSubmit={submit} noValidate className="space-y-5">
            <Section title="5. Review, Declarations and Submission">
                <p className="mb-3 flex items-center gap-2 rounded-[6px] border border-verified-500/30 bg-verified-50 px-3 py-2 text-[0.8125rem] text-verified-700"><CircleCheck className="size-4" aria-hidden="true" />Please review your information below. Tick the declarations, then submit your registration.</p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <Card title="Client Type" icon={<Building2 className="size-3.5" aria-hidden="true" />}><p className="font-semibold">{typeLabel}</p><Link href="/register/1" className="text-controlled-700 underline">Edit</Link></Card>
                    <Card title="Primary Contact" icon={<UserRound className="size-3.5" aria-hidden="true" />}><p className="font-semibold">{s(data.title)} {s(data.first_name)} {s(data.last_name)}</p><p>{s(data.job_title)}</p><p>{s(data.email)}</p><p>{s(data.phone)}</p><Link href="/register/2" className="text-controlled-700 underline">Edit</Link></Card>
                    <Card title="Organisation" icon={<Building2 className="size-3.5" aria-hidden="true" />}>{b(data.individual) ? <p>Registering as an individual</p> : <><p className="font-semibold">{s(data.company)}</p><p>{s(data.registration_number)}</p><p>{s(data.industry)}</p><p>{s(data.registration_country)}</p></>}</Card>
                    <Card title="Areas of Interest" icon={<Rocket className="size-3.5" aria-hidden="true" />}><ul className="list-disc pl-4">{a(data.interests).map((i) => <li key={i}>{i}{i === data.primary_interest ? ' (primary)' : ''}</li>)}</ul></Card>
                    <Card title="Project / Investment Info" icon={<Rocket className="size-3.5" aria-hidden="true" />}>{s(data.project_name) ? <ul className="list-disc pl-4"><li>{s(data.project_name)}</li><li>{s(data.project_country)}</li><li>{s(data.project_stage)} Stage</li><li>Estimated Capital: {s(data.capital_requirement, '—')}</li><li>Target Decision Date: {s(data.target_date, '—')}</li></ul> : <p>Not applicable</p>}</Card>
                    <Card title="Documents Uploaded" icon={<FileText className="size-3.5" aria-hidden="true" />}><p className="font-semibold">{docs.length} file{docs.length === 1 ? '' : 's'} uploaded</p><ul>{docs.slice(0, 5).map((x) => <li key={x.path} className="truncate">{x.name}</li>)}</ul>{docs.length > 5 && <p>+ {docs.length - 5} more</p>}</Card>
                </div>
            </Section>
            <Section title="Declarations and Consents">
                <div className="grid gap-4 lg:grid-cols-2">
                    <div className="space-y-2">
                        {decl.map((k) => (
                            <div key={k}>
                                <Checkbox label={<>{options.declarations[k]} <span className="text-attested-700">(Required)</span></>} checked={d.declarations[k]} onChange={(e) => form.setData('declarations', { ...d.declarations, [k]: e.target.checked })} className="text-[0.8125rem]" />
                                {err[`declarations.${k}`] && <p role="alert" className="ml-6 text-xs text-risk-500">{err[`declarations.${k}`]}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-2 lg:border-l lg:border-parchment-300 lg:pl-4">
                        {Object.entries(options.optionalConsents).map(([k, l]) => <Checkbox key={k} label={<>{l} <span className="text-ink-400">(Optional)</span></>} checked={d.optional_consents[k]} onChange={(e) => form.setData('optional_consents', { ...d.optional_consents, [k]: e.target.checked })} className="text-[0.8125rem]" />)}
                    </div>
                </div>
                <div className="mt-3 rounded-[6px] border border-controlled-500/30 bg-controlled-50 p-3">
                    <Checkbox label={<>I have read and accept the <Link href="/about/governance" className="text-controlled-700 underline">Terms of Use</Link>, <Link href="/about/governance" className="text-controlled-700 underline">Due Diligence Notice</Link> and <Link href="/about/governance" className="text-controlled-700 underline">Document Upload Notice</Link>.</>} checked={d.accept_terms} onChange={(e) => form.setData('accept_terms', e.target.checked)} className="text-[0.8125rem]" />
                    {err.accept_terms && <p role="alert" className="ml-6 text-xs text-risk-500">{err.accept_terms}</p>}
                </div>
            </Section>
            <Section title="Create Your Portal Password">
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Password" required error={err.password} hint="At least 10 characters with upper and lower case letters and a number.">{(id) => <Input id={id} type="password" autoComplete="new-password" value={d.password} onChange={(e) => form.setData('password', e.target.value)} />}</Field>
                    <Field label="Confirm Password" required>{(id) => <Input id={id} type="password" autoComplete="new-password" value={d.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} />}</Field>
                </div>
            </Section>
            <div className="rounded-[8px] border border-parchment-300 p-4">
                <h3 className="text-[0.8125rem] font-bold tracking-wide text-ink-900 uppercase">Submission Summary</h3>
                <dl className="mt-2 grid gap-2 text-[0.8125rem] sm:grid-cols-3">
                    {[['Registration Reference', reference ?? 'Issued on submit'], ['Registration Source', 'Website – /register'], ['Assigned Team', 'Client Onboarding Team'], ['Estimated Response Time', 'Within 1 – 2 Business Days'], ['Status after submit', 'Under Review']].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold text-ink-900">{v}</dd></div>)}
                </dl>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Link href="/register/4" className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-ink-300 px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" />Back to Step 4: Documents</Link>
                <button type="button" onClick={() => send('save')} className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] border border-controlled-500/40 px-5 text-sm text-controlled-700"><Bookmark className="size-4" aria-hidden="true" />Save and Continue Later</button>
                <button type="submit" disabled={form.processing || !allChecked} className="inline-flex h-11 items-center justify-center gap-2 rounded-[6px] bg-gold-600 px-6 text-sm font-semibold text-white disabled:opacity-50">{form.processing ? 'Submitting…' : 'Submit Registration Securely'}<Lock className="size-4" aria-hidden="true" /></button>
            </div>
            <p className="flex items-center justify-center gap-1.5 text-[0.75rem] text-ink-500"><ShieldCheck className="size-4" aria-hidden="true" />Your submission is encrypted and will be reviewed before account access is activated.</p>
        </form>
    );
}
