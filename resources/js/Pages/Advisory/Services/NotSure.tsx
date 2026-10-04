import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Clock, HelpCircle, MessageSquare } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Select, Textarea } from '@/Components/ui/Form';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { DarkHero, TrustBand } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';

interface Props {
    challenges: { key: string; title: string; body: string; icon: string }[];
    industries: string[];
    stages: string[];
    timings: { key: string; label: string }[];
}

export default function NotSure({ challenges, industries, stages, timings }: Props) {
    const form = useForm({ challenge: '', description: '', industry: '', stage: '', timing: '' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/services/not-sure-which', { preserveScroll: true });
    };
    return (
        <>
            <Head title="Not Sure Which Service?" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Not Sure Which?' }]}
                title="Not sure which service is right for you?"
                tagline="Answer a few simple questions and we'll recommend the best ways to work with TBCA."
                intro="Free, no obligation and completely confidential. You'll see all viable options with clear reasons."
                box={{ title: 'Good to know', items: ['We compare all viable options for your situation.', 'We recommend by fit, not by margin.', 'You stay in control. You choose what’s best.', 'You can talk to a human at any time.'] }}
            />
            <form onSubmit={submit} className="container-tbca grid gap-6 py-8 lg:grid-cols-12">
                <section className="lg:col-span-8">
                    <h2 className="font-semibold text-ink-900">What&rsquo;s your main challenge right now?</h2>
                    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4" role="radiogroup" aria-label="Main challenge">
                        {challenges.map((c) => (
                            <button key={c.key} type="button" role="radio" aria-checked={form.data.challenge === c.key} onClick={() => form.setData('challenge', c.key)}
                                className={cn('flex flex-col items-start gap-2 rounded-[8px] border p-3 text-left transition', form.data.challenge === c.key ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400 bg-white hover:border-gold-300')}>
                                <AdvIcon name={c.icon} className="size-6 text-ink-800" />
                                <span className="text-[0.8125rem] font-semibold text-ink-900">{c.title}</span>
                                <span className="text-[0.6875rem] text-ink-500">{c.body}</span>
                            </button>
                        ))}
                    </div>
                    {form.errors.challenge && <p className="mt-2 text-xs text-risk-500" role="alert">Choose the challenge that best describes your situation.</p>}
                    <div className="mt-5 flex flex-col items-start justify-between gap-3 rounded-[8px] border border-gold-300 bg-white p-4 sm:flex-row sm:items-center">
                        <div className="flex items-center gap-3">
                            <HelpCircle className="size-8 text-ink-700" />
                            <div>
                                <p className="text-sm font-semibold text-ink-900">Not sure at all?</p>
                                <p className="text-xs text-ink-500">That&rsquo;s okay. Start with a conversation and we&rsquo;ll help you explore your options.</p>
                            </div>
                        </div>
                        <Link href="/services/proposal-request" className="inline-flex items-center gap-1.5 rounded border border-gold-500 px-4 py-2 text-sm font-semibold"><MessageSquare className="size-4" />Talk to a Human</Link>
                    </div>
                </section>
                <aside className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-4">
                    <h2 className="font-semibold text-ink-900">Tell us more (optional)</h2>
                    <p className="text-xs text-ink-500">Add a few details to help us understand your situation better.</p>
                    <Field label="Your challenge" className="mt-3">{(id) => <Textarea id={id} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Describe your challenge or what you would like to achieve..." />}</Field>
                    <div className="mt-3 grid grid-cols-2 gap-3">
                        <Field label="Industry (optional)">{(id) => <Select id={id} value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)} placeholder="Select an industry" options={industries} />}</Field>
                        <Field label="Stage of business (optional)">{(id) => <Select id={id} value={form.data.stage} onChange={(e) => form.setData('stage', e.target.value)} placeholder="Select stage" options={stages} />}</Field>
                    </div>
                    <Field label="Timeframe" className="mt-3">{(id) => <Select id={id} value={form.data.timing} onChange={(e) => form.setData('timing', e.target.value)} placeholder="Select timeframe" options={timings.map((t) => ({ value: t.key, label: t.label }))} />}</Field>
                    <Button type="submit" className="mt-5 w-full" disabled={form.processing} trailingIcon="arrow-right">Get My Recommendation</Button>
                    <p className="mt-2 flex items-center justify-center gap-1 text-xs text-ink-500"><Clock className="size-3.5" />Takes less than 1 minute</p>
                </aside>
            </form>
            <TrustBand items={[['Free recommendation', 'No charge, no obligation.'], ['All viable options shown', 'Always equal visibility.'], ['Recommendation by fit', 'Not by margin or revenue.'], ['Human review available', 'Talk to an expert anytime.'], ['Professional boundaries', 'Always respected.'], ['Secure & private', 'Your data is protected.']]} tone="dark" />
        </>
    );
}
