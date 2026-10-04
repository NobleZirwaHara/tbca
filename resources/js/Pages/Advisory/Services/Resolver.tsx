import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Check, CircleSlash, Lock, MessageSquare } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { ChoiceCard, Field, Select, Textarea } from '@/Components/ui/Form';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { DarkHero, TrustBand } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Opt { key: string; title?: string; label?: string; body?: string; icon?: string }
interface Props {
    step: number;
    answers: Record<string, string>;
    needs: Opt[];
    outcomes: Opt[];
    industries: string[];
    sizes: Opt[];
    timings: Opt[];
    budgets: Opt[];
    countries: string[];
}

const STEPS = [
    ['Your Need', 'What do you need help with?'],
    ['Outcome', 'What outcome do you want?'],
    ['Context', 'Your situation and industry?'],
    ['Timing', 'When do you need this?'],
    ['Your Match', 'We show your best fit'],
];

export default function Resolver({ step, answers, needs, outcomes, industries, sizes, timings, budgets, countries }: Props) {
    const form = useForm({
        need: answers.need ?? '',
        description: answers.description ?? '',
        outcome: answers.outcome ?? '',
        industry: answers.industry ?? '',
        size: answers.size ?? '',
        country: answers.country ?? 'South Africa',
        regulated: answers.regulated ?? 'no',
        timing: answers.timing ?? '',
        budget: answers.budget ?? '',
    });
    const e = form.errors as Record<string, string>;

    function submit(ev: FormEvent) {
        ev.preventDefault();
        form.post(`/services/resolver/${step}`, { preserveScroll: true });
    }

    return (
        <>
            <Head title="Vehicle Resolver" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Vehicle Resolver' }]}
                title="Vehicle Resolver"
                tagline="Five simple steps to match your need with the best way to work with TBCA."
                intro="Answer a few questions and we'll show you the best fit, all viable alternatives and any options that are not suitable — with clear reasons."
                chips={[
                    { label: 'Phase 1 Country', sub: 'South Africa' },
                    { label: 'Languages', sub: 'English & Afrikaans' },
                    { label: 'Pricing From', sub: 'ZAR (Source) · USD (Display)' },
                    { label: 'Human Review', sub: 'Available' },
                    { label: 'Margin Neutral', sub: 'Only fit decides' },
                ]}
                box={{
                    title: 'How it works',
                    items: ['Answer 5 quick questions', 'See your recommended option', 'Review all viable alternatives', 'Understand why other options are excluded', 'Choose your next step or talk to a human'],
                    footer: (
                        <div>
                            <p className="text-xs text-ink-300">Your progress · Step {step} of 5</p>
                            <div className="mt-1.5 flex gap-1">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <span key={i} className={cn('h-1.5 flex-1 rounded-full', i <= step ? 'bg-gold-500' : 'bg-ink-700')} />
                                ))}
                            </div>
                        </div>
                    ),
                }}
            />
            <div className="container-tbca py-8">
                <ol className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                    {STEPS.map(([t, s], i) => {
                        const n = i + 1;
                        const done = n < step;
                        return (
                            <li key={t}>
                                {done ? (
                                    <Link href={`/services/resolver/${n}`} className="flex h-full gap-2 rounded-[8px] border border-gold-400 bg-gold-50 p-3">
                                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-900"><Check className="size-4" /></span>
                                        <span><span className="block text-sm font-semibold">{t}</span><span className="block text-[0.6875rem] text-ink-500">{s}</span></span>
                                    </Link>
                                ) : (
                                    <div className={cn('flex h-full gap-2 rounded-[8px] border p-3', n === step ? 'border-gold-500 bg-white ring-1 ring-gold-400' : 'border-parchment-400 bg-parchment-100')} aria-current={n === step ? 'step' : undefined}>
                                        <span className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', n === step ? 'bg-gold-500 text-ink-900' : 'bg-parchment-400 text-ink-500')}>{n}</span>
                                        <span><span className="block text-sm font-semibold">{t}</span><span className="block text-[0.6875rem] text-ink-500">{s}</span></span>
                                    </div>
                                )}
                            </li>
                        );
                    })}
                </ol>

                <div className="mt-6 grid gap-5 lg:grid-cols-12">
                    <form onSubmit={submit} className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-7">
                        {step === 1 && (
                            <>
                                <h2 className="font-semibold text-ink-900">What best describes your primary need?</h2>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Primary need">
                                    {needs.map((n) => (
                                        <ChoiceCard key={n.key} selected={form.data.need === n.key} onSelect={() => form.setData('need', n.key)} title={n.title} description={n.body} icon={<AdvIcon name={n.icon} className="size-5 text-gold-600" />} />
                                    ))}
                                </div>
                                {e.need && <p className="mt-2 text-xs text-risk-500" role="alert">{e.need}</p>}
                                <Field label="Or describe your need in your own words (optional)" hint={`${form.data.description.length} / 500`} className="mt-4" error={e.description}>
                                    {(id) => <Textarea id={id} maxLength={500} value={form.data.description} onChange={(x) => form.setData('description', x.target.value)} placeholder="Tell us a bit more about what you need..." />}
                                </Field>
                            </>
                        )}
                        {step === 2 && (
                            <>
                                <h2 className="font-semibold text-ink-900">What outcome do you want?</h2>
                                <div className="mt-3 grid gap-2 sm:grid-cols-2" role="radiogroup" aria-label="Outcome">
                                    {outcomes.map((o) => (
                                        <ChoiceCard key={o.key} selected={form.data.outcome === o.key} onSelect={() => form.setData('outcome', o.key)} title={o.title} description={o.body} />
                                    ))}
                                </div>
                                {e.outcome && <p className="mt-2 text-xs text-risk-500" role="alert">{e.outcome}</p>}
                            </>
                        )}
                        {step === 3 && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <h2 className="font-semibold text-ink-900 sm:col-span-2">Tell us about your situation</h2>
                                <Field label="Industry" required error={e.industry}>{(id) => <Select id={id} value={form.data.industry} onChange={(x) => form.setData('industry', x.target.value)} placeholder="Select industry" options={industries} />}</Field>
                                <Field label="Organisation size" required error={e.size}>{(id) => <Select id={id} value={form.data.size} onChange={(x) => form.setData('size', x.target.value)} placeholder="Select size" options={sizes.map((s) => ({ value: s.key, label: s.label! }))} />}</Field>
                                <Field label="Where is the work needed?" required error={e.country}>{(id) => <Select id={id} value={form.data.country} onChange={(x) => form.setData('country', x.target.value)} options={countries} />}</Field>
                                <fieldset>
                                    <legend className="text-[0.8125rem] font-medium text-ink-800">Does it require regulated advice (legal, tax, audit, licensed financial)?</legend>
                                    <div className="mt-2 flex gap-2">
                                        {['no', 'yes'].map((v) => (
                                            <ChoiceCard key={v} selected={form.data.regulated === v} onSelect={() => form.setData('regulated', v)} title={v === 'yes' ? 'Yes' : 'No'} className="py-2" />
                                        ))}
                                    </div>
                                </fieldset>
                            </div>
                        )}
                        {step === 4 && (
                            <div className="space-y-4">
                                <h2 className="font-semibold text-ink-900">Timing and budget</h2>
                                <div role="radiogroup" aria-label="Timing" className="grid gap-2 sm:grid-cols-2">
                                    {timings.map((t) => (
                                        <ChoiceCard key={t.key} selected={form.data.timing === t.key} onSelect={() => form.setData('timing', t.key)} title={t.label} />
                                    ))}
                                </div>
                                {e.timing && <p className="text-xs text-risk-500" role="alert">{e.timing}</p>}
                                <Field label="Budget range" required error={e.budget}>{(id) => <Select id={id} value={form.data.budget} onChange={(x) => form.setData('budget', x.target.value)} placeholder="Select budget" options={budgets.map((b) => ({ value: b.key, label: b.label! }))} />}</Field>
                                <p className="text-xs text-ink-500">Budget is used only as a saleability check (we never show options you can't use as if they were viable). It never changes the ranking.</p>
                            </div>
                        )}
                        <div className="mt-6 flex items-center justify-between gap-3">
                            {step > 1 ? <Link href={`/services/resolver/${step - 1}`} className="text-sm font-medium text-ink-600 hover:text-ink-900">← Back</Link> : <span />}
                            <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">
                                {['', 'Next: Outcome', 'Next: Context', 'Next: Timing', 'See Your Match'][step]}
                            </Button>
                        </div>
                    </form>
                    <aside className="space-y-4 lg:col-span-3">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                            <h2 className="font-semibold text-ink-900">What to expect next</h2>
                            <ul className="mt-2 space-y-1.5 text-xs text-ink-600">
                                {['We recommend the best fit for your need.', 'We show all viable alternatives with equal visibility.', 'We explain any options that are not suitable.', 'You choose your next step — no obligation.'].map((x) => (
                                    <li key={x} className="flex gap-1.5"><Check className="size-3.5 text-verified-500" />{x}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                            <h2 className="font-semibold text-ink-900">Prefer to talk first?</h2>
                            <p className="text-xs text-ink-600">Speak to a human expert who will help you answer these questions.</p>
                            <Link href="/services/proposal-request" className="mt-2 inline-flex items-center gap-1.5 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold"><MessageSquare className="size-3.5" />Talk to a Human</Link>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs text-ink-600">
                            <p className="flex items-center gap-1.5 font-semibold text-ink-900"><Lock className="size-3.5" />Your privacy, your choice</p>
                            <p className="mt-1">Your answers are private and used only to find the best fit. We never share your information without your permission.</p>
                        </div>
                    </aside>
                    <aside className="rounded-[8px] bg-ink-950 p-5 text-parchment-100 lg:col-span-2">
                        <p className="text-sm font-semibold text-gold-400">We do not recommend based on:</p>
                        <ul className="mt-3 space-y-2 text-xs">
                            {['Internal margin', 'Commission', 'Provider spread', 'Fast cash', 'Revenue priority', 'Lifetime value', 'Sales targets', 'Premium upsell potential'].map((x) => (
                                <li key={x} className="flex items-center gap-2"><CircleSlash className="size-3.5 text-gold-500" />{x}</li>
                            ))}
                        </ul>
                        <p className="mt-4 text-xs text-ink-300">We recommend based only on <b className="text-parchment-100">what best fits your need.</b></p>
                    </aside>
                </div>
            </div>
            <TrustBand items={[['Free recommendation', 'No obligation'], ['Human review available', 'When you need it'], ['All viable options', 'Always shown'], ['Professional boundaries', 'Always respected'], ['South Africa Phase 1', 'ZAR Source Pricing'], ['Secure & Private', 'Your data is protected!']]} />
        </>
    );
}
