import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, Info, Mic, Pencil, Sparkles } from 'lucide-react';
import type { FormEvent } from 'react';
import { ConsentLine, FINDER_STEPS, FinderHeader, FinderSidebar, ProtectedList } from '@/Components/CorePages/FinderParts';
import { ChipGroup, OptionCard } from '@/Components/CorePages/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import type { FinderShared } from '@/types/core-pages';

interface Answers {
    need: string; description: string; describes: string; role: string; heard_from: string; language: string; currency: string; engage: string; email: string; whatsapp: string;
    business_name: string; stage: string; industry: string; company_size: string; country: string; province: string; turnover: string; challenge: string; looking_for: string[]; context: string;
    how_soon: string; timeline: string; budget: string; purchase: string; formats: string[]; support: string; alternatives: string; notes: string;
}

interface Props extends FinderShared {
    step: number;
    needs: { key: string; title: string; icon: string; body: string }[];
    options: Record<string, string[]>;
    answers: Answers;
}

const formatIcons: Record<string, string> = { 'Guided Sprint': 'rocket', 'Template Pack': 'file-text', Calculator: 'calculator', Toolkit: 'wrench', Dashboard: 'layout-dashboard', Report: 'clipboard-list' };
const supportIcons: Record<string, string> = { 'Self-service access': 'user', 'Light guidance': 'compass', 'Advisor support': 'users' };
const nextSteps: Record<number, string[]> = {
    1: ['Tell us about your role.', 'Provide basic business context.', 'Select your timing and budget range.', 'Receive matched TBCA recommendations.'],
    2: ['Provide basic business context.', 'Select your timing and budget range.', 'Receive matched TBCA recommendations.'],
    3: ['Select your timing and budget range.', 'Review matched Sprints, tools and templates.', 'Choose your preferred next step.'],
    4: ['Review your timing and budget range.', 'Generate matched Sprints, tools and templates.', 'Compare the best-fit options.', 'Choose your preferred next step.'],
};

export default function FinderStep(props: Props) {
    const { step, steps, needs, options, answers } = props;
    const form = useForm({ ...answers, intent: 'continue' });
    const d = form.data;
    const err = form.errors as Record<string, string>;
    const meta = steps[step - 1];
    const nextLabel = step === 4 ? 'Continue to Recommendations' : `Continue to ${steps[step].label}`;
    const back = step === 1 ? '/services' : `/find-the-right-service/${steps[step - 2].slug}`;

    const send = (intent: 'continue' | 'save') => {
        form.transform((data) => ({ ...data, intent }));
        form.post(`/find-the-right-service/${meta.slug}`, { preserveScroll: true });
    };
    const submit = (e: FormEvent) => {
        e.preventDefault();
        send('continue');
    };
    const sel = (key: keyof Answers, label: string, opts: string[], required = true) => (
        <Field label={label} required={required} error={err[key]}>
            {(id) => <Select id={id} placeholder="Select an option" options={opts} value={d[key] as string} onChange={(e) => form.setData(key, e.target.value as never)} invalid={!!err[key]} />}
        </Field>
    );

    return (
        <div className="bg-parchment-200">
            <Head title={`Find the Right Service — ${meta.label}`} />
            <FinderHeader subtitle={meta.subtitle} crumbs={[{ label: 'Home', href: '/' }, { label: 'Services', href: '/services' }, { label: 'Find the Right Service' }]} steps={FINDER_STEPS} current={step} />

            <form onSubmit={submit} noValidate className="container-tbca grid gap-5 py-8 xl:grid-cols-12">
                <div className="xl:col-span-8">
                    <section className="rounded-[10px] border border-parchment-400 bg-white p-5">
                        {step === 1 && (
                            <>
                                <h2 className="font-serif text-[1.375rem] font-semibold text-ink-900">What do you need help with?</h2>
                                <p className="text-[0.8125rem] text-ink-500">Select the option that best describes your immediate priority.</p>
                                <div role="radiogroup" aria-label="Your need" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                                    {needs.map((n) => <OptionCard key={n.key} selected={d.need === n.key} onSelect={() => form.setData('need', n.key)} title={n.title} body={n.body} icon={n.icon} />)}
                                </div>
                                {err.need && <p role="alert" className="mt-2 text-xs text-risk-500">{err.need}</p>}
                                <div className="mt-4 flex flex-col gap-3 rounded-[8px] border border-parchment-400 p-3 sm:flex-row sm:items-center">
                                    <Pencil className="hidden size-5 text-ink-600 sm:block" aria-hidden="true" />
                                    <div className="flex-1">
                                        <label htmlFor="need-description" className="text-[0.8125rem] font-semibold text-ink-900">Describe what you need in your own words</label>
                                        <p className="text-[0.6875rem] text-ink-500">Optional. Tell us the outcome you are trying to achieve.</p>
                                        <Input id="need-description" maxLength={1000} placeholder="Example: I need to improve cash flow and prepare my company for funding." value={d.description} onChange={(e) => form.setData('description', e.target.value)} />
                                    </div>
                                    <span className="inline-flex size-10 items-center justify-center rounded-[6px] border border-parchment-400 text-ink-400" title="Voice input is coming soon" aria-hidden="true"><Mic className="size-4" /></span>
                                    <button type="button" onClick={() => openAskQuestion({ subject: `AI guidance: ${d.description || 'choosing a service'}`, section: 'core' })} className="inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-700"><Sparkles className="size-4 text-gold-600" aria-hidden="true" />AI Guidance</button>
                                </div>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <h2 className="font-serif text-[1.375rem] font-semibold text-ink-900">Tell us about you</h2>
                                <p className="text-[0.8125rem] text-ink-500">This helps us recommend the right Sprint, tool or template for your needs.</p>
                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                    {sel('describes', 'What best describes you?', options.describes)}
                                    {sel('role', 'Your role in the business', options.role)}
                                    {sel('heard_from', 'How did you hear about TBCA?', options.heard_from)}
                                    {sel('language', 'Preferred language', options.language)}
                                    {sel('currency', 'Preferred currency', options.currency)}
                                    {sel('engage', 'How do you prefer to engage?', options.engage)}
                                </div>
                                <div className="mt-4 grid gap-4 md:grid-cols-2">
                                    <Field label="Your email address" required error={err.email}>{(id) => <Input id={id} type="email" autoComplete="email" value={d.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                                    <Field label="Your WhatsApp number (for updates)" required error={err.whatsapp}>{(id) => <Input id={id} type="tel" autoComplete="tel" placeholder="+27 82 123 4567" value={d.whatsapp} onChange={(e) => form.setData('whatsapp', e.target.value)} />}</Field>
                                </div>
                                <WhyNote title="Why we need this information">We use these details to personalise your experience, show relevant Sprints and digital products, and keep you updated on your requests.</WhyNote>
                            </>
                        )}

                        {step === 3 && (
                            <>
                                <h2 className="font-serif text-[1.375rem] font-semibold text-ink-900">Tell us about your business</h2>
                                <p className="text-[0.8125rem] text-ink-500">This helps us recommend the right Sprint, tool or template for your business stage and operational needs.</p>
                                <div className="mt-4 grid gap-4 md:grid-cols-3">
                                    <Field label="Business name" required error={err.business_name}>{(id) => <Input id={id} autoComplete="organization" value={d.business_name} onChange={(e) => form.setData('business_name', e.target.value)} />}</Field>
                                    {sel('stage', 'Business stage', options.stage)}
                                    {sel('industry', 'Industry', options.industry)}
                                    {sel('company_size', 'Company size', options.company_size)}
                                    {sel('country', 'Country', options.country)}
                                    {sel('province', 'Province', options.province)}
                                    {sel('turnover', 'Annual turnover band', options.turnover)}
                                    <div className="md:col-span-2">{sel('challenge', 'Primary business challenge', options.challenge)}</div>
                                </div>
                                <div className="mt-4">
                                    <p className="mb-2 text-[0.8125rem] font-medium text-ink-800">What are you looking for today? (Select all that apply) <span className="text-risk-500">*</span></p>
                                    <ChipGroup label="What are you looking for" options={options.looking_for} value={d.looking_for} onChange={(v) => form.setData('looking_for', v)} />
                                    {err.looking_for && <p role="alert" className="mt-1 text-xs text-risk-500">{err.looking_for}</p>}
                                </div>
                                <Field label="Business context or desired outcome" required error={err.context} className="mt-4" hint={`${d.context.length} / 1000`}>
                                    {(id) => <Textarea id={id} maxLength={1000} value={d.context} onChange={(e) => form.setData('context', e.target.value)} />}
                                </Field>
                                <WhyNote title="Why this helps">We use your business context to match relevant Sprints, digital tools and templates for your sector, scale and operational priorities.</WhyNote>
                            </>
                        )}

                        {step === 4 && (
                            <>
                                <h2 className="font-serif text-[1.375rem] font-semibold text-ink-900">Timing and budget</h2>
                                <p className="text-[0.8125rem] text-ink-500">Help us match the right Sprint, tool or template to your urgency, budget and preferred delivery approach.</p>
                                <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                    {sel('how_soon', 'How soon do you need this?', options.how_soon)}
                                    {sel('timeline', 'Preferred delivery timeline', options.timeline)}
                                    {sel('budget', 'Estimated budget range', options.budget)}
                                    {sel('purchase', 'How would you like to purchase?', options.purchase)}
                                </div>
                                <p className="mt-4 mb-2 text-[0.8125rem] font-medium text-ink-800">What format do you prefer? (Select all that apply) <span className="text-risk-500">*</span></p>
                                <div role="group" aria-label="Preferred formats" className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
                                    {options.formats.map((f) => (
                                        <OptionCard key={f} multi selected={d.formats.includes(f)} onSelect={() => form.setData('formats', d.formats.includes(f) ? d.formats.filter((x) => x !== f) : [...d.formats, f])} title={f} icon={formatIcons[f]} className="items-center p-2.5 [&>span:first-child]:size-8" />
                                    ))}
                                </div>
                                {err.formats && <p role="alert" className="mt-1 text-xs text-risk-500">{err.formats}</p>}
                                <p className="mt-4 mb-2 text-[0.8125rem] font-medium text-ink-800">Preferred support level <span className="text-risk-500">*</span></p>
                                <div role="radiogroup" aria-label="Preferred support level" className="grid gap-2 sm:grid-cols-3">
                                    {options.support.map((s) => <OptionCard key={s} selected={d.support === s} onSelect={() => form.setData('support', s)} title={s} icon={supportIcons[s]} className="items-center p-2.5 [&>span:first-child]:size-8" />)}
                                </div>
                                {err.support && <p role="alert" className="mt-1 text-xs text-risk-500">{err.support}</p>}
                                <p className="mt-4 mb-2 text-[0.8125rem] font-medium text-ink-800">Are you open to recommended alternatives? <span className="text-risk-500">*</span></p>
                                <div role="radiogroup" aria-label="Open to alternatives" className="grid gap-2 sm:grid-cols-2">
                                    {options.alternatives.map((a) => <OptionCard key={a} selected={d.alternatives === a} onSelect={() => form.setData('alternatives', a)} title={a} />)}
                                </div>
                                {err.alternatives && <p role="alert" className="mt-1 text-xs text-risk-500">{err.alternatives}</p>}
                                <Field label="Anything else we should consider?" className="mt-4" hint={`${d.notes.length}/1000`}>
                                    {(id) => <Textarea id={id} maxLength={1000} value={d.notes} onChange={(e) => form.setData('notes', e.target.value)} />}
                                </Field>
                                <WhyNote title="Why this helps">We use your timing, budget and support preferences to recommend the most suitable Sprint, tools and templates for your immediate priorities.</WhyNote>
                            </>
                        )}
                    </section>

                    <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <Link href={back} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" />{step === 1 ? 'Back to Services' : 'Back'}</Link>
                        <div className="flex flex-col gap-3 sm:flex-row">
                            <button type="button" disabled={form.processing} onClick={() => send('save')} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><Bookmark className="size-4" aria-hidden="true" />Save and Continue Later</button>
                            <button type="submit" disabled={form.processing} className="inline-flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 px-6 text-sm font-semibold text-ink-900 disabled:opacity-60">{form.processing ? 'Saving…' : nextLabel}<ArrowRight className="size-4" aria-hidden="true" /></button>
                        </div>
                    </div>
                    <ConsentLine />
                </div>
                <div className="xl:col-span-4">
                    <FinderSidebar shared={props} currentLabel={meta.label} next={nextSteps[step]}>
                        {step === 1 && <ProtectedList />}
                    </FinderSidebar>
                </div>
            </form>
        </div>
    );
}

function WhyNote({ title, children }: { title: string; children: React.ReactNode }) {
    return (
        <div className="mt-4 flex gap-3 rounded-[6px] border border-gold-300 bg-gold-50 p-3 text-[0.75rem] text-ink-700">
            <Info className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p><strong className="block text-ink-900">{title}</strong>{children}</p>
        </div>
    );
}
