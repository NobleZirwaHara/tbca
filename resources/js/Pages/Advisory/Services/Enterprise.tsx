import { Head, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { BarChart3, Gauge, Network, RefreshCw, Rocket, Search, ShieldCheck, Target, TrendingUp, UserCheck, Users } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Field, Input } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { CheckList, DarkHero, TrustBand } from '@/Components/Advisory/ui';

export default function Enterprise() {
    const [open, setOpen] = useState(false);
    const form = useForm({ date: '', time: '10:00', name: '', email: '', company: '', type: 'enterprise-intro', topic: 'Enterprise Relationship intro call', duration_minutes: 30, channel: 'video', redirect: '/services/enterprise-relationship' });
    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post('/bookings', { preserveScroll: true, onSuccess: () => setOpen(false) });
    };
    const steps = [[Search, 'Understand', 'We learn your context, priorities, challenges and desired outcomes.'], [Target, 'Align', 'We agree on scope, capabilities, success measures and plan.'], [Users, 'Onboard', 'We set up your team, governance, access and communication.'], [BarChart3, 'Deliver', 'We execute, coordinate and keep you informed with clarity.'], [RefreshCw, 'Improve', 'We measure results, learn and continuously improve together.']] as const;
    return (
        <>
            <Head title="Enterprise Relationship" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: 'Enterprise Relationship' }]}
                title="Enterprise Relationship"
                tagline="Strategic partnership. Coordinated capability. Sustainable impact."
                intro="For organisations with complex challenges and long-term ambitions, we offer a coordinated, enterprise-wide relationship that aligns our capabilities with your strategy, operations and people."
                box={{ title: 'What you can expect', items: ['A dedicated relationship team and governance structure.', 'Coordinated access across relevant capability families.', 'Prioritised support, insights and continuous improvement.', 'Aligned to your strategy, people and performance.', 'Built for impact, accountability and long-term value.'] }}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                <section className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-3">
                    <h2 className="font-semibold text-ink-900">What is an Enterprise Relationship?</h2>
                    <p className="mt-1 text-xs text-ink-600">A tailored, long-term partnership that connects your organisation to TBCA&rsquo;s capabilities, people and systems in a structured and accountable way.</p>
                    <ul className="mt-3 space-y-3 text-xs">
                        {[[Target, 'Strategic alignment', 'We align to your goals, priorities and operating context.'], [Network, 'Coordinated access', 'Relevant services, experts and tools across our ecosystem.'], [ShieldCheck, 'Dedicated governance', 'Clear roles, cadence, reporting and decision rights.'], [TrendingUp, 'Continuous value', 'Insights, improvements and performance you can measure.']].map(([I, t, b]) => {
                            const Icon = I as typeof Target;
                            return <li key={t as string} className="flex gap-2"><Icon className="size-5 shrink-0 text-gold-600" /><span><b className="block text-ink-900">{t as string}</b>{b as string}</span></li>;
                        })}
                    </ul>
                </section>
                <section className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-6">
                    <h2 className="font-semibold text-ink-900">How we work together</h2>
                    <ol className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-5">
                        {steps.map(([I, t, b], i) => (
                            <li key={t} className="text-center">
                                <span className="mx-auto inline-flex size-12 items-center justify-center rounded-full border-2 border-gold-400 text-gold-700"><I className="size-5" /></span>
                                <p className="mt-1 text-xs font-semibold">{i + 1}. {t}</p>
                                <p className="text-[0.6875rem] text-ink-500">{b}</p>
                            </li>
                        ))}
                    </ol>
                    <h3 className="mt-6 text-sm font-semibold text-ink-900">Typical value drivers</h3>
                    <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-5">
                        {[[Gauge, 'Better decisions', 'More clarity, faster with expert insight and data.'], [Rocket, 'Operational efficiency', 'Less friction, duplication and wasted time.'], [ShieldCheck, 'Risk management', 'Stronger controls, compliance and resilience.'], [TrendingUp, 'Growth enablement', 'Access to expertise, markets and capital.'], [UserCheck, 'Capability uplift', 'Stronger people, systems and ways of working.']].map(([I, t, b]) => {
                            const Icon = I as typeof Gauge;
                            return <div key={t as string} className="rounded border border-parchment-400 p-2"><Icon className="size-4 text-gold-600" /><p className="mt-1 text-[0.6875rem] font-semibold">{t as string}</p><p className="text-[0.625rem] text-ink-500">{b as string}</p></div>;
                        })}
                    </div>
                </section>
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="font-semibold text-ink-900">Is this right for you?</h2>
                        <CheckList className="mt-2" items={['You have complex or multi-faceted priorities.', 'You need coordinated support across areas.', 'You value a long-term, trusted partnership.', 'You expect accountability and measurable impact.', 'You want a partner who understands your context.']} />
                    </div>
                    <div className="rounded-[8px] border border-gold-300 bg-gold-50 p-5">
                        <h2 className="font-semibold text-ink-900">Start the conversation</h2>
                        <p className="text-xs text-ink-600">Let&rsquo;s explore how an Enterprise Relationship can create lasting value for your organisation.</p>
                        <Button className="mt-3 w-full" onClick={() => setOpen(true)} trailingIcon="arrow-right">Book an Intro Call</Button>
                        <ButtonLink href="/services/proposal-request" variant="outline" className="mt-2 w-full">Talk to a Human</ButtonLink>
                    </div>
                </aside>
            </div>
            <TrustBand items={[['We recommend by fit, not margin', 'Your outcomes come first.'], ['Human review available', 'Real experts, real judgement.'], ['Professional boundaries', 'We act with independence and integrity.'], ['Secure & private', 'Your data is protected.'], ['Phase 1 – South Africa', 'ZAR source pricing.'], ['REL-01', 'Relationship mode across all vehicles']]} />
            <Modal open={open} onClose={() => setOpen(false)} title="Book an Enterprise intro call" footer={<Button type="submit" form="ent-book" disabled={form.processing}>Confirm booking</Button>}>
                <form id="ent-book" onSubmit={submit} className="grid gap-3 sm:grid-cols-2">
                    <Field label="Date" required error={form.errors.date}>{(id) => <Input id={id} type="date" value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} />}</Field>
                    <Field label="Time" required error={form.errors.time}>{(id) => <Input id={id} type="time" value={form.data.time} onChange={(e) => form.setData('time', e.target.value)} />}</Field>
                    <Field label="Full name" required error={form.errors.name}>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Work email" required error={form.errors.email}>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                    <Field label="Organisation" className="sm:col-span-2">{(id) => <Input id={id} value={form.data.company} onChange={(e) => form.setData('company', e.target.value)} />}</Field>
                </form>
            </Modal>
        </>
    );
}
