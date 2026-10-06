import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Clock, Lock, MessageSquare, Search, Sparkles } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Select, Textarea } from '@/Components/ui/Form';
import { ArrowLink, CheckList, DarkHero, Notice, TrustBand } from '@/Components/Advisory/ui';
import type { ResolverResult } from '@/types/advisory';

interface Opt { key: string; title?: string; label?: string }
interface Props {
    reference: string | null;
    result: ResolverResult | null;
    answers: Record<string, string> | null;
    needs: Opt[];
    outcomes: Opt[];
    sizes: Opt[];
    timings: Opt[];
    budgets: Opt[];
    countries: string[];
}

export default function Decline({ reference, result, needs, outcomes, sizes, timings, budgets, countries }: Props) {
    const form = useForm({ need: '', outcome: '', budget: '', size: '', timing: '', country: 'South Africa', regulated: 'no', description: '' });
    const opts = (l: Opt[]) => l.map((x) => ({ value: x.key, label: x.title ?? x.label ?? x.key }));
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/services/honest-decline', { preserveScroll: true });
    };
    const e = form.errors as Record<string, string>;
    return (
        <>
            <Head title="Honest Decline" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Honest Decline' }]}
                title="We may not be the right fit right now."
                tagline="Honest guidance today. Better outcomes tomorrow."
                intro="If we're not the best fit for your situation, we'll tell you. No obligation, no hard sell. You'll still walk away with clarity and options."
                box={{ title: 'What this means', items: ['We’ll explain why another option may serve you better.', 'You’ll receive alternative suggestions.', 'You can return anytime if your needs change.', 'There’s no charge for this recommendation.'] }}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                {result ? (
                    <section className="space-y-4 lg:col-span-8">
                        {result.outcome === 'decline' ? (
                            <Notice tone="warn"><span><b>Honest decline</b> — reference <span className="font-mono">{reference}</span>. {result.decline_reasons.join(' ')}</span></Notice>
                        ) : (
                            <Notice tone="good"><span>Good news — {result.viable_count} way(s) of working fit your need. <Link href={`/services/choice-comparison?ref=${reference}`} className="font-semibold underline">See your comparison</Link>.</span></Notice>
                        )}
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Better alternatives for you</h2>
                            <ul className="mt-3 grid gap-3 sm:grid-cols-2">
                                {result.alternatives.map((a) => (
                                    <li key={a.title} className="rounded-[6px] border border-parchment-400 p-3">
                                        <p className="text-sm font-semibold text-ink-900">{a.title}</p>
                                        <p className="text-xs text-ink-600">{a.body}</p>
                                        <ArrowLink href={a.href} className="mt-2">Explore</ArrowLink>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Why each option was or wasn&rsquo;t suitable</h2>
                            <ul className="mt-2 space-y-1.5 text-xs text-ink-700">
                                {result.rows.map((r) => (
                                    <li key={r.key}><b>{r.name}</b>: {r.viable ? `${r.fit} — ${r.reasons.join(' ')}` : r.excluded.join(' ')}</li>
                                ))}
                            </ul>
                        </div>
                        <ButtonLink href="/services/honest-decline" variant="outline">Start again</ButtonLink>
                    </section>
                ) : (
                    <form onSubmit={submit} className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-6">
                        <h2 className="font-semibold text-ink-900">Before we decline, help us understand</h2>
                        <p className="text-xs text-ink-500">A few quick details help us recommend better alternatives.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <Field label="What best describes your main need?" required error={e.need}>{(id) => <Select id={id} value={form.data.need} onChange={(x) => form.setData('need', x.target.value)} placeholder="Select your main need" options={opts(needs)} />}</Field>
                            <Field label="What is your estimated budget?" required error={e.budget}>{(id) => <Select id={id} value={form.data.budget} onChange={(x) => form.setData('budget', x.target.value)} placeholder="Select budget range" options={opts(budgets)} />}</Field>
                            <Field label="What outcome are you trying to achieve?" required error={e.outcome}>{(id) => <Select id={id} value={form.data.outcome} onChange={(x) => form.setData('outcome', x.target.value)} placeholder="Select your desired outcome" options={opts(outcomes)} />}</Field>
                            <Field label="What stage is your business at?" required error={e.size}>{(id) => <Select id={id} value={form.data.size} onChange={(x) => form.setData('size', x.target.value)} placeholder="Select stage" options={opts(sizes)} />}</Field>
                            <Field label="What is your expected timeframe?" required error={e.timing}>{(id) => <Select id={id} value={form.data.timing} onChange={(x) => form.setData('timing', x.target.value)} placeholder="Select timeframe" options={opts(timings)} />}</Field>
                            <Field label="Where is the work needed?" required error={e.country}>{(id) => <Select id={id} value={form.data.country} onChange={(x) => form.setData('country', x.target.value)} options={countries} />}</Field>
                            <Field label="Regulated advice needed?" error={e.regulated}>{(id) => <Select id={id} value={form.data.regulated} onChange={(x) => form.setData('regulated', x.target.value)} options={[{ value: 'no', label: 'No' }, { value: 'yes', label: 'Yes (legal, tax, audit, licensed)' }]} />}</Field>
                            <Field label="Anything else we should know? (optional)" className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.description} onChange={(x) => form.setData('description', x.target.value)} placeholder="Share any additional context..." />}</Field>
                        </div>
                        <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" />Your information is confidential and used only to guide you to the best option.</p>
                        <Button type="submit" className="mt-4" disabled={form.processing} trailingIcon="arrow-right">Get My Recommendation</Button>
                        <p className="mt-1 flex items-center gap-1 text-xs text-ink-500"><Clock className="size-3.5" />Takes less than 2 minutes</p>
                    </form>
                )}
                {!result && (
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-3">
                        <h2 className="font-semibold text-ink-900">Why we may not be the right fit</h2>
                        <p className="text-xs text-ink-500">Some reasons we might recommend another option:</p>
                        <CheckList className="mt-3" tone="gold" items={['Your need falls outside our current capability.', 'Your budget or timeline may not align with the best outcome.', 'A specialist provider may deliver more value for this need.', 'A different approach may serve you better right now.']} />
                    </section>
                )}
                <aside className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-3">
                    <h2 className="font-semibold text-ink-900">What happens next?</h2>
                    <ul className="mt-3 space-y-3 text-xs text-ink-600">
                        <li className="flex gap-2"><Search className="size-5 text-gold-600" /><span><b className="text-ink-900">We&rsquo;ll review your information</b><br />Our experts will quickly assess your needs.</span></li>
                        <li className="flex gap-2"><MessageSquare className="size-5 text-gold-600" /><span><b className="text-ink-900">You&rsquo;ll get honest feedback</b><br />We&rsquo;ll explain our recommendation clearly.</span></li>
                        <li className="flex gap-2"><Sparkles className="size-5 text-gold-600" /><span><b className="text-ink-900">You&rsquo;ll receive better options</b><br />We&rsquo;ll suggest alternatives that may be a better fit.</span></li>
                    </ul>
                </aside>
            </div>
            <TrustBand items={[['Our commitment to you', 'We recommend by fit, not margin.'], ['No obligation', 'This is free and comes with no commitment.'], ['Honest always', 'We’ll tell you the truth, even if it’s no.'], ['Human review', 'Real experts review every response.'], ['Return anytime', 'We’re here when you’re ready.'], ['Africa (Active)', 'ZAR source pricing.']]} />
        </>
    );
}
