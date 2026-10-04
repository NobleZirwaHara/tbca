import { Head, router, useForm, usePage } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Clock, Lock, MessageSquare } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { DarkHero, Notice, TrustBand } from '@/Components/Advisory/ui';
import type { SharedProps } from '@/types';

interface Props {
    draft: Record<string, string>;
    families: string[];
    outcomes: { key: string; title: string }[];
    budgets: { key: string; label: string }[];
    industries: string[];
}

export default function Proposal({ draft, families, outcomes, budgets, industries }: Props) {
    const { auth, flash } = usePage<SharedProps>().props;
    const u = auth.user;
    const form = useForm({
        family: draft.family ?? '', outcome: draft.outcome ?? '', urgency: draft.urgency ?? '', context: draft.context ?? '', budget: draft.budget ?? '', start: draft.start ?? '', mode: draft.mode ?? '',
        name: draft.name ?? u?.name ?? '', email: draft.email ?? u?.email ?? '', company: draft.company ?? '', role: draft.role ?? '', phone: draft.phone ?? '', country: draft.country ?? 'South Africa', industry: draft.industry ?? '', heard: draft.heard ?? '',
    });
    const e = form.errors as Record<string, string>;
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.post('/services/proposal-request', { preserveScroll: true, onSuccess: () => form.reset() });
    };
    const saveDraft = () => router.post('/services/proposal-request', { ...form.data, draft: true }, { preserveScroll: true });
    const label = (s: string) => s.replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

    return (
        <>
            <Head title="Request a Proposal" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: 'Proposal Request' }]}
                title="Request a Proposal"
                tagline="Tell us what you need. We'll prepare a tailored proposal for you."
                intro="Share a few details about your needs and context. Our experts will review your request and send you a clear, no-obligation proposal."
                box={{ title: 'What happens next?', items: ['We review your request within 1 business day.', 'We may ask a few quick questions for clarity.', 'You’ll receive a tailored proposal.', 'You’re in control. No obligation.'] }}
            />
            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-12">
                <form onSubmit={submit} className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-9">
                    {flash.reference && flash.success?.startsWith('Proposal') && <Notice tone="good" className="mb-4">Request received — reference <b className="font-mono">{flash.reference}</b>.</Notice>}
                    <h2 className="font-semibold text-ink-900">1. Tell us about your needs</h2>
                    <p className="text-xs text-ink-500">The more detail you share, the better we can help.</p>
                    <div className="mt-3 grid gap-3 md:grid-cols-3">
                        <Field label="What do you need help with?" required error={e.family}>{(id) => <Select id={id} value={form.data.family} onChange={(x) => form.setData('family', x.target.value)} placeholder="Select a service or capability family" options={families.map((f) => ({ value: f, label: label(f) }))} />}</Field>
                        <Field label="What is the primary outcome you want to achieve?" required error={e.outcome}>{(id) => <Select id={id} value={form.data.outcome} onChange={(x) => form.setData('outcome', x.target.value)} placeholder="Select desired outcome" options={outcomes.map((o) => o.title)} />}</Field>
                        <Field label="How urgent is this?" required error={e.urgency}>{(id) => <Select id={id} value={form.data.urgency} onChange={(x) => form.setData('urgency', x.target.value)} placeholder="Select urgency" options={['Low', 'Medium', 'High', 'Critical']} />}</Field>
                        <Field label="Describe your situation and context" required hint={`${form.data.context.length} / 1000 characters`} error={e.context} className="md:col-span-3">{(id) => <Textarea id={id} maxLength={1000} value={form.data.context} onChange={(x) => form.setData('context', x.target.value)} placeholder="Tell us about your current situation, challenges, background and what you want to achieve..." />}</Field>
                        <Field label="What is your estimated budget range?" required error={e.budget}>{(id) => <Select id={id} value={form.data.budget} onChange={(x) => form.setData('budget', x.target.value)} placeholder="Select budget range" options={budgets.map((b) => b.label)} />}</Field>
                        <Field label="When would you like to get started?" required error={e.start}>{(id) => <Select id={id} value={form.data.start} onChange={(x) => form.setData('start', x.target.value)} placeholder="Select timeframe" options={['Immediately', 'Within 1 month', '1–3 months', '3–6 months']} />}</Field>
                        <Field label="What is your preferred engagement mode?" required error={e.mode}>{(id) => <Select id={id} value={form.data.mode} onChange={(x) => form.setData('mode', x.target.value)} placeholder="Select engagement mode" options={['One-off Sprint', 'Project Advisory', 'Retainer', 'Subscription', 'Partner Services', 'Not sure']} />}</Field>
                    </div>
                    <h2 className="mt-6 font-semibold text-ink-900">2. About you</h2>
                    <div className="mt-3 grid gap-3 md:grid-cols-4">
                        <Field label="Full name" required error={e.name}>{(id) => <Input id={id} value={form.data.name} onChange={(x) => form.setData('name', x.target.value)} placeholder="Enter your full name" />}</Field>
                        <Field label="Work email" required error={e.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(x) => form.setData('email', x.target.value)} placeholder="Enter your work email" />}</Field>
                        <Field label="Company / Organisation" required error={e.company}>{(id) => <Input id={id} value={form.data.company} onChange={(x) => form.setData('company', x.target.value)} placeholder="Enter company name" />}</Field>
                        <Field label="Role / Position">{(id) => <Input id={id} value={form.data.role} onChange={(x) => form.setData('role', x.target.value)} placeholder="Enter your role" />}</Field>
                        <Field label="Phone number" required error={e.phone}>{(id) => <Input id={id} value={form.data.phone} onChange={(x) => form.setData('phone', x.target.value)} placeholder="+27 Enter phone number" />}</Field>
                        <Field label="Country" required error={e.country}>{(id) => <Select id={id} value={form.data.country} onChange={(x) => form.setData('country', x.target.value)} options={['South Africa', 'Other African country']} />}</Field>
                        <Field label="Industry (optional)">{(id) => <Select id={id} value={form.data.industry} onChange={(x) => form.setData('industry', x.target.value)} placeholder="Select industry" options={industries} />}</Field>
                        <Field label="How did you hear about us?">{(id) => <Select id={id} value={form.data.heard} onChange={(x) => form.setData('heard', x.target.value)} placeholder="Select an option" options={['Search', 'Referral', 'LinkedIn', 'Event', 'WhatsApp', 'Other']} />}</Field>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
                        <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" />Your information is confidential and used only to prepare your proposal.</p>
                        <div className="flex gap-2">
                            <Button type="button" variant="outline" onClick={saveDraft}>Save Draft</Button>
                            <Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Submit Request</Button>
                        </div>
                    </div>
                    <p className="mt-1 flex items-center justify-end gap-1 text-xs text-ink-500"><Clock className="size-3.5" />Takes less than 3 minutes</p>
                </form>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                        <p className="font-semibold">What we need to create a great proposal</p>
                        <dl className="mt-2 space-y-2 text-xs"><div><dt className="font-semibold">Clear context</dt><dd className="text-ink-500">Help us understand your situation and goals.</dd></div><div><dt className="font-semibold">Scope</dt><dd className="text-ink-500">What needs to be done (and what&rsquo;s in/out).</dd></div><div><dt className="font-semibold">Constraints</dt><dd className="text-ink-500">Budget, timeline, resources or other factors.</dd></div><div><dt className="font-semibold">Success</dt><dd className="text-ink-500">How will we know we&rsquo;ve delivered value?</dd></div></dl>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-4 text-sm"><p className="font-semibold">Prefer to talk?</p><p className="text-xs text-ink-500">Speak to a human expert who can help you define your needs.</p><a href="https://wa.me/27120010567" className="mt-2 inline-flex items-center gap-1.5 rounded border border-gold-500 px-3 py-1.5 text-xs font-semibold"><MessageSquare className="size-3.5" />Talk to a Human</a></div>
                    <div className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-4 text-sm"><p className="font-semibold">Need inspiration?</p><p className="text-xs text-ink-500">Explore our capability families to see what&rsquo;s possible.</p><ButtonLink href="/services/business-consultancy" size="sm" variant="outline" className="mt-2">Explore Services</ButtonLink></div>
                </aside>
            </div>
            <TrustBand items={[['We recommend by fit, not margin', 'Your success is our priority.'], ['Human review available', 'Real experts, real judgement.'], ['Professional boundaries', 'We act with independence.'], ['Secure & private', 'Your data is protected.'], ['Phase 1 – South Africa', 'ZAR source pricing.'], ['No obligation', 'Proposals are free']]} />
        </>
    );
}
