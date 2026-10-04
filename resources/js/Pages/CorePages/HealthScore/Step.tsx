import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, CalendarRange, Clock, ExternalLink, Gauge, Layers, Lock, Shield, ShieldCheck, Sparkles, User, Users, Zap } from 'lucide-react';
import type { FormEvent } from 'react';
import { AssistanceBox, HealthHeader, SignInPrompt, stepLabels } from '@/Components/CorePages/HealthParts';
import { CheckList, DarkCard, ProgressRing, Segmented } from '@/Components/CorePages/Kit';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import Icon from '@/Components/ui/Icon';
import { cn } from '@/lib/cn';
import type { HealthSection, HealthStep } from '@/types/core-pages';

interface Profile {
    first_name: string; last_name: string; business_name: string; email: string; mobile: string; country: string; province: string; industry: string;
    stage: string; revenue_band: string; employees: string; language: string; currency: string;
    consent_privacy: boolean; consent_contact: boolean; consent_benchmark: boolean; client_mode: string;
}

interface Props {
    step: number;
    steps: HealthStep[];
    completed: number;
    section: HealthSection | null;
    sectionKey: string;
    sections: { key: string; title: string; about: string }[] | null;
    answers: Record<string, string | number>;
    profile: Profile;
    options: { provinces: string[]; countries: string[]; industries: string[]; stages: string[]; revenue_bands: string[]; employees: string[] };
    reference: string | null;
}

const sectionIcons: Record<string, string> = { growth: 'target', finance: 'bar-chart-3', sales: 'radio', operations: 'settings', people: 'users' };
const sectionTints: Record<string, string> = { growth: 'bg-verified-50', finance: 'bg-controlled-50', sales: 'bg-referenced-50', operations: 'bg-attested-50', people: 'bg-parchment-300' };

export default function HealthStepPage({ step, steps, section, sectionKey, sections, answers, profile, options }: Props) {
    const form = useForm({ ...profile, answers: { ...answers } as Record<string, string | number>, intent: 'continue' });
    const progress = step === 7 ? 100 : Math.round(((step - 1) / 7) * 100) || 14;
    const crumb = steps[step - 1].crumb;
    const back = step === 1 ? '/' : `/business-health-score/step/${step - 1}`;
    const backLabel = step === 1 ? 'Back to Home' : `Back to ${steps[step - 2].crumb}`;
    const nextLabel = step === 1 ? 'Continue to Growth Readiness' : step === 7 ? 'Submit My Business Health Score' : `Continue to ${section?.next ?? 'next step'}`;
    const err = form.errors as Record<string, string>;

    const send = (intent: 'continue' | 'save') => {
        form.transform((d) => {
            if (step === 1) {
                const { answers: _a, ...rest } = d;
                return { ...rest, intent };
            }
            if (step <= 6) return { answers: d.answers, intent };
            return { intent };
        });
        form.post(`/business-health-score/step/${step}`, { preserveScroll: true });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        send('continue');
    };
    const setAnswer = (k: string, v: string) => form.setData('answers', { ...form.data.answers, [k]: v });

    return (
        <div className="bg-parchment-200">
            <Head title={`Business Health Score — ${crumb}`} />
            <div className="container-tbca grid gap-6 py-8 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    <HealthHeader
                        crumbs={[{ label: 'Home', href: '/' }, { label: 'Business Health Score', href: step > 1 ? '/business-health-score' : undefined }, ...(step > 1 ? [{ label: crumb }] : [])]}
                        subtitle={step === 1 ? 'Let us understand your business before we calculate your score.' : step === 7 ? 'Review your answers before we calculate your score.' : section?.title}
                        intro={step === 1 ? 'Complete this free diagnostic to identify what is working, what needs attention and which action should come first.' : step === 7 ? 'Please review your information and responses. You can edit any section before submitting.' : section?.intro}
                        steps={stepLabels(steps)}
                        current={step}
                        progress={progress}
                        stepLabel={`Step ${step} of 7`}
                    />
                    {step === 1 && (
                        <ul className="mt-4 flex flex-wrap gap-2 text-[0.75rem]">
                            {[[Sparkles, 'Free Diagnostic'], [Clock, 'Approximately 6 to 8 minutes'], [Layers, 'Five Business Dimensions'], [Zap, 'Instant Initial Score']].map(([I, l]) => {
                                const Ico = I as typeof Clock;
                                return <li key={l as string} className="inline-flex items-center gap-1.5 rounded-[4px] border border-parchment-400 bg-white px-2.5 py-1.5"><Ico className="size-3.5 text-gold-600" aria-hidden="true" />{l as string}</li>;
                            })}
                        </ul>
                    )}

                    <form onSubmit={submit} noValidate className="mt-6">
                        {step === 1 && <ProfileStep form={form} options={options} err={err} />}

                        {section && (
                            <div className="rounded-[10px] border border-parchment-400 bg-white p-5">
                                <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                                    {section.questions.map((q, i) => (
                                        <Field key={q.key} label={`${i + 1}. ${q.label}`} required={q.required} error={err[`answers.${q.key}`]} className={cn(section.questions.length === 7 && i === 2 && 'lg:col-span-2')}>
                                            {(id) =>
                                                q.type === 'select' ? (
                                                    <Select id={id} placeholder="Select an option" options={q.options ?? []} value={String(form.data.answers[q.key] ?? '')} onChange={(e) => setAnswer(q.key, e.target.value)} invalid={!!err[`answers.${q.key}`]} />
                                                ) : q.type === 'amount' ? (
                                                    <div className="relative">
                                                        <Input id={id} type="number" min={0} inputMode="decimal" placeholder="Enter amount" className="pr-12" value={String(form.data.answers[q.key] ?? '')} onChange={(e) => setAnswer(q.key, e.target.value)} invalid={!!err[`answers.${q.key}`]} />
                                                        <span className="pointer-events-none absolute top-2.5 right-3 text-[0.75rem] text-ink-400">ZAR</span>
                                                    </div>
                                                ) : (
                                                    <Input id={id} placeholder="Type your answer" maxLength={500} value={String(form.data.answers[q.key] ?? '')} onChange={(e) => setAnswer(q.key, e.target.value)} invalid={!!err[`answers.${q.key}`]} />
                                                )
                                            }
                                        </Field>
                                    ))}
                                </div>
                                <p className="mt-5 flex items-center gap-2 rounded-[6px] bg-gold-50 px-3 py-2.5 text-[0.75rem] text-ink-600">
                                    <Shield className="size-4 text-gold-600" aria-hidden="true" /> Your answers are saved when you continue or save. You can return anytime within the next 30 days.
                                </p>
                            </div>
                        )}

                        {step === 7 && sections && (
                            <div className="space-y-4">
                                <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                                    <div className="flex items-center justify-between">
                                        <h2 className="flex items-center gap-2 text-[1rem] font-bold text-ink-900"><User className="size-4 text-gold-600" aria-hidden="true" />Your Business Profile</h2>
                                        <Link href="/business-health-score/step/1" className="text-[0.8125rem] font-semibold text-gold-700">Edit</Link>
                                    </div>
                                    <dl className="mt-3 grid gap-x-6 gap-y-2 text-[0.8125rem] sm:grid-cols-2 lg:grid-cols-3">
                                        {[
                                            ['First Name', profile.first_name], ['Last Name', profile.last_name], ['Email Address', profile.email], ['Mobile / WhatsApp', profile.mobile],
                                            ['Business Name', profile.business_name], ['Country', profile.country], ['Province', profile.province], ['Industry / Sector', profile.industry],
                                            ['Business Stage', profile.stage], ['Annual Revenue Band', profile.revenue_band], ['Number of Employees', profile.employees], ['Preferred Language', profile.language], ['Display Currency', profile.currency],
                                        ].map(([k, v]) => (
                                            <div key={k} className="flex justify-between gap-2 border-b border-parchment-300 py-1"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium text-ink-900">{v}</dd></div>
                                        ))}
                                    </dl>
                                </section>
                                <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                                    <h2 className="text-[1rem] font-bold text-ink-900">Assessment Sections Completed</h2>
                                    <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                        {sections.map((s, i) => (
                                            <li key={s.key} className={cn('rounded-[8px] p-3 text-center', sectionTints[s.key])}>
                                                <Icon name={sectionIcons[s.key]} className="mx-auto size-7 text-gold-700" />
                                                <p className="mt-2 text-[0.8125rem] font-bold text-ink-900">{s.title}</p>
                                                <p className="text-[0.75rem] font-semibold text-verified-700">Completed</p>
                                                <Link href={`/business-health-score/step/${i + 2}`} className="mt-1 inline-block text-[0.6875rem] text-gold-700 underline">Edit answers</Link>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                                <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                                    <h2 className="text-[1rem] font-bold text-ink-900">Your Privacy and Consent</h2>
                                    <CheckList
                                        className="mt-3"
                                        items={[
                                            'You have read the TBCA Privacy Notice and consent to TBCA using your answers to calculate and deliver your Business Health Score.',
                                            profile.consent_contact ? 'You have chosen to receive your results and relevant business support information.' : 'You have chosen not to receive follow-up communication.',
                                            profile.consent_benchmark ? 'You allow anonymised information to improve Africa business intelligence and diagnostic benchmarks.' : 'Your answers will not be used for benchmarks.',
                                        ]}
                                    />
                                    <p className="mt-3 flex gap-4 text-[0.75rem]"><Link href="/about/governance" className="inline-flex items-center gap-1 underline">View Privacy Notice <ExternalLink className="size-3" aria-hidden="true" /></Link><Link href="/about/governance" className="inline-flex items-center gap-1 underline">View Terms of Use <ExternalLink className="size-3" aria-hidden="true" /></Link></p>
                                </section>
                            </div>
                        )}

                        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Link href={back} className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-[0.875rem] font-medium"><ArrowLeft className="size-4" aria-hidden="true" />{backLabel}</Link>
                            <div className="flex flex-col gap-3 sm:flex-row">
                                <button type="button" disabled={form.processing} onClick={() => send('save')} className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] border border-gold-500 bg-white px-5 text-[0.875rem] font-semibold text-gold-700">Save and Continue Later <Bookmark className="size-4" aria-hidden="true" /></button>
                                <button type="submit" disabled={form.processing} className="inline-flex h-12 items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-6 text-[0.875rem] font-semibold text-ink-900 disabled:opacity-60">{form.processing ? 'Saving…' : nextLabel} <ArrowRight className="size-4" aria-hidden="true" /></button>
                            </div>
                        </div>
                        <p className="mt-2 text-right text-[0.75rem] text-ink-500">{step === 7 ? <span className="inline-flex items-center gap-1"><Lock className="size-3" aria-hidden="true" />Your answers are secure and confidential.</span> : 'You can review all answers before submitting your diagnostic.'}</p>
                    </form>
                </div>

                <aside className="xl:col-span-3">
                    {step === 1 && (
                        <DarkCard title="What You Will Receive">
                            <ul className="space-y-3">
                                {[[Gauge, 'Overall Business Health Score out of 100'], [Layers, 'Five-Dimension Performance Breakdown'], [ShieldCheck, 'Your Three Most Important Business Gaps'], [CalendarRange, 'Practical Thirty-Day Priority Action Plan'], [Users, 'Recommended TBCA Service or Toolkit']].map(([I, l]) => {
                                    const Ico = I as typeof Gauge;
                                    return <li key={l as string} className="flex items-center gap-3 border-b border-ink-800 pb-3 text-[0.875rem] text-parchment-100"><Ico className="size-7 shrink-0 text-gold-500" aria-hidden="true" />{l as string}</li>;
                                })}
                            </ul>
                            <p className="mt-3 flex gap-2 text-[0.75rem]"><Clock className="size-4 text-gold-500" aria-hidden="true" />Usually completed in less than 8 minutes</p>
                            <p className="mt-2 flex gap-2 text-[0.75rem]"><Lock className="size-4 shrink-0 text-gold-500" aria-hidden="true" />Your answers are used only for the diagnostic, authorised follow-up and the consent choices you make.</p>
                            <SignInPrompt />
                        </DarkCard>
                    )}
                    {section && (
                        <DarkCard title="About This Section">
                            <p className="text-[0.8125rem] leading-relaxed">{section.about}</p>
                            <ul className="mt-4 space-y-3 border-t border-ink-800 pt-4">
                                {section.bullets.map((b, i) => (
                                    <li key={b} className="flex gap-3 text-[0.8125rem] text-parchment-100"><Icon name={['target', 'bar-chart-3', 'rocket', 'shield-check'][i] ?? 'circle'} className="size-6 shrink-0 text-gold-500" />{b}</li>
                                ))}
                            </ul>
                            <AssistanceBox />
                        </DarkCard>
                    )}
                    {step === 7 && (
                        <DarkCard title="Your Progress Summary">
                            <div className="flex items-center gap-4 text-parchment-100">
                                <ProgressRing value={100} tone="good" track="dark" />
                                <div>
                                    <p className="text-[1.125rem] font-bold">All Sections Completed</p>
                                    <p className="text-[0.8125rem] text-parchment-200">You are ready to submit your diagnostic.</p>
                                </div>
                            </div>
                            <h3 className="mt-5 font-serif text-[1.0625rem] font-semibold text-gold-400">What Happens Next?</h3>
                            <CheckList tone="dark" className="mt-2" items={['Your Business Health Score will be calculated.', 'You will receive your results instantly.', 'You will receive your 30-Day Priority Action Plan.', 'A recommended TBCA solution will be suggested.']} />
                            <AssistanceBox />
                        </DarkCard>
                    )}
                </aside>
            </div>
        </div>
    );
}

type ProfileForm = ReturnType<typeof useForm<Profile & { answers: Record<string, string | number>; intent: string }>>;

function ProfileStep({ form, options, err }: { form: ProfileForm; options: Props['options']; err: Record<string, string> }) {
    const d = form.data;
    const set = <K extends keyof Profile>(k: K, v: Profile[K]) => form.setData(k, v as never);

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div role="tablist" aria-label="Client type" className="flex gap-2">
                    {[['new', 'I am new to TBCA'], ['existing', 'I am an existing TBCA client']].map(([k, l]) => (
                        <button key={k} type="button" role="tab" aria-selected={d.client_mode === k} onClick={() => set('client_mode', k)} className={cn('h-10 rounded-[4px] border px-4 text-[0.8125rem] font-medium', d.client_mode === k ? 'border-gold-500 bg-gold-50 text-ink-900' : 'border-parchment-400 bg-white text-ink-600')}>
                            {l}
                        </button>
                    ))}
                </div>
                {d.client_mode === 'existing' && <Link href="/login" className="inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-controlled-700">Sign in to prefill your details <ExternalLink className="size-3.5" aria-hidden="true" /></Link>}
            </div>
            <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                <h2 className="font-serif text-[1.25rem] font-semibold text-ink-900">Tell us about your business</h2>
                <p className="text-[0.75rem] text-ink-500">Your answers help us personalise the questions and calculate the most relevant Business Health Score.</p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Field label="First Name" required error={err.first_name}>{(id) => <Input id={id} autoComplete="given-name" placeholder="Enter your first name" value={d.first_name} onChange={(e) => set('first_name', e.target.value)} />}</Field>
                    <Field label="Last Name" required error={err.last_name}>{(id) => <Input id={id} autoComplete="family-name" placeholder="Enter your last name" value={d.last_name} onChange={(e) => set('last_name', e.target.value)} />}</Field>
                    <Field label="Business Name" required error={err.business_name}>{(id) => <Input id={id} autoComplete="organization" placeholder="Enter your business name" value={d.business_name} onChange={(e) => set('business_name', e.target.value)} />}</Field>
                    <Field label="Email Address" required error={err.email}>{(id) => <Input id={id} type="email" autoComplete="email" placeholder="Enter your email address" value={d.email} onChange={(e) => set('email', e.target.value)} />}</Field>
                    <Field label="Mobile or WhatsApp Number" required error={err.mobile}>{(id) => <Input id={id} type="tel" autoComplete="tel" placeholder="+27 Enter your number" value={d.mobile} onChange={(e) => set('mobile', e.target.value)} />}</Field>
                    <Field label="Country" required error={err.country}>{(id) => <Select id={id} options={options.countries} value={d.country} onChange={(e) => set('country', e.target.value)} />}</Field>
                    <Field label="Province" required error={err.province}>
                        {(id) => (d.country === 'South Africa' ? <Select id={id} placeholder="Select province" options={options.provinces} value={d.province} onChange={(e) => set('province', e.target.value)} /> : <Input id={id} placeholder="Province / region" value={d.province} onChange={(e) => set('province', e.target.value)} />)}
                    </Field>
                    <Field label="Industry or Sector" required error={err.industry}>{(id) => <Select id={id} placeholder="Select industry or sector" options={options.industries} value={d.industry} onChange={(e) => set('industry', e.target.value)} />}</Field>
                    <Field label="Business Stage" required error={err.stage}>{(id) => <Select id={id} placeholder="Select business stage" options={options.stages} value={d.stage} onChange={(e) => set('stage', e.target.value)} />}</Field>
                    <Field label="Annual Revenue Band" required error={err.revenue_band}>{(id) => <Select id={id} placeholder="Select revenue band" options={options.revenue_bands} value={d.revenue_band} onChange={(e) => set('revenue_band', e.target.value)} />}</Field>
                    <Field label="Number of Employees" required error={err.employees}>{(id) => <Select id={id} placeholder="Select number of employees" options={options.employees} value={d.employees} onChange={(e) => set('employees', e.target.value)} />}</Field>
                    <div>
                        <p className="mb-1.5 text-[0.8125rem] font-medium text-ink-800">Preferred Language <span className="text-risk-500">*</span></p>
                        <Segmented label="Preferred language" options={['English', 'Afrikaans']} value={d.language} onChange={(v) => set('language', v)} />
                    </div>
                    <div>
                        <p className="mb-1.5 text-[0.8125rem] font-medium text-ink-800">Display Currency <span className="text-risk-500">*</span></p>
                        <Segmented label="Display currency" options={['ZAR', 'USD']} value={d.currency} onChange={(v) => set('currency', v)} />
                    </div>
                    <p className="rounded-[6px] bg-parchment-200 p-3 text-[0.75rem] text-ink-600 sm:col-span-2 lg:col-span-3"><strong>Why we ask:</strong> These details help us tailor the questions to your business context and compare your performance with relevant benchmarks.</p>
                </div>
            </section>
            <section className="rounded-[10px] border border-gold-300 bg-gold-50/60 p-5">
                <h2 className="text-[0.9375rem] font-bold text-ink-900">Your Privacy and Consent</h2>
                <div className="mt-2 space-y-2">
                    <Checkbox label={<>I have read the TBCA <Link href="/about/governance" className="text-controlled-700 underline">Privacy Notice</Link> and consent to TBCA using my answers to calculate and deliver my Business Health Score.</>} checked={d.consent_privacy} onChange={(e) => set('consent_privacy', e.target.checked)} />
                    {err.consent_privacy && <p role="alert" className="text-xs text-risk-500">{err.consent_privacy}</p>}
                    <Checkbox label={<>Send my score, completion link and related business support information by email or WhatsApp. <span className="text-ink-400">(Optional)</span></>} checked={d.consent_contact} onChange={(e) => set('consent_contact', e.target.checked)} />
                    <Checkbox label={<>Allow anonymised and aggregated information to help improve TBCA&rsquo;s Africa business intelligence and diagnostic benchmarks. <span className="text-ink-400">(Optional)</span></>} checked={d.consent_benchmark} onChange={(e) => set('consent_benchmark', e.target.checked)} />
                </div>
                <p className="mt-3 flex items-center gap-1.5 text-[0.75rem] text-ink-500"><Lock className="size-3.5" aria-hidden="true" />This diagnostic does not provide legal, tax, audit, investment or regulated financial advice. See our <Link href="/about/governance" className="underline">Terms of Use</Link>.</p>
            </section>
        </div>
    );
}
