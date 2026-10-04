import { Head } from '@inertiajs/react';
import { CalendarDays, CircleCheck, ClipboardList, FileCheck, MessageCircle, Search } from 'lucide-react';
import ChangeForm, { type ChangeRow, type Target } from '@/Components/Advisory/ChangeForm';
import { Card, CheckList, DarkHero, Notice, TrustBand, zar } from '@/Components/Advisory/ui';
import type { VehicleRow } from '@/types/advisory';

const RECUR = [
    ['retainer-mandate', 'Retainer Mandate', 'Dedicated capacity for ongoing advice and implementation support.', 'Strategic support'],
    ['subscription-plan', 'Subscription Plan', 'Access to tools, updates, resources and ongoing intelligence.', 'Knowledge & tools'],
    ['managed-service', 'Managed Service', 'We manage specific processes or functions for you.', 'Operational delivery'],
    ['project-retainer', 'Project Retainer', 'Ongoing project work with variable scope and milestones.', 'Project continuity'],
];

export default function Recurrence({ vehicles, targets, changes }: { vehicles: VehicleRow[]; targets: Target[]; changes: ChangeRow[] }) {
    const steps = [[Search, 'Review outcome', 'We assess your completed engagement and ongoing needs.'], [CalendarDays, 'Identify ongoing needs', 'We identify recurring activities, monitoring and support requirements.'], [ClipboardList, 'Recommend structure', 'We recommend the right recurring vehicle, scope and cadence.'], [FileCheck, 'Agree terms', 'We agree the mandate, fees, start date and engagement terms.'], [CircleCheck, 'Activate & onboard', 'We activate your ongoing plan and onboard your team.']] as const;
    return (
        <>
            <Head title="Recurrence Conversion" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: 'Recurrence Conversion' }]}
                title="Recurrence Conversion"
                tagline="From once-off to ongoing value."
                intro="Some outcomes create ongoing needs. We'll help you convert your once-off engagement into a structured, recurring relationship that delivers continuous value."
                box={{ title: 'Why convert to a recurring relationship?', items: ['Sustained results through continuous support.', 'Proactive management reduces risk and cost.', 'Predictable planning with budget certainty.', 'Stronger outcomes and measurable impact.', 'Scales with your business needs.'] }}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                <section className="space-y-4 lg:col-span-6">
                    <Card title="How recurrence conversion works">
                        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                            {steps.map(([I, t, b], i) => (
                                <li key={t} className="text-center"><span className="mx-auto inline-flex size-12 items-center justify-center rounded-full border-2 border-gold-400 text-gold-700"><I className="size-5" /></span><p className="mt-1 text-[0.6875rem] font-semibold">{i + 1}. {t}</p><p className="text-[0.625rem] text-ink-500">{b}</p></li>
                            ))}
                        </ol>
                    </Card>
                    <Notice tone="good"><span><b>No disruption. No starting over.</b> We build on what we&rsquo;ve already achieved and keep your momentum.</span></Notice>
                    <Card title="Recommended recurring vehicles">
                        <ul className="divide-y divide-parchment-300">
                            {RECUR.map(([k, t, b, best]) => (
                                <li key={k} className="flex items-center justify-between gap-3 py-2.5">
                                    <span><b className="block text-sm">{t}</b><span className="text-xs text-ink-500">{b}</span></span>
                                    <span className="text-right text-[0.6875rem]"><span className="block rounded bg-verified-50 px-2 text-verified-700">Best for {best}</span><span className="text-ink-500">{zar(targets.find((x) => x.key === k)?.value)} / month</span></span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </section>
                <Card title="Convert an engagement" className="lg:col-span-3">
                    <ChangeForm type="recurrence" vehicles={vehicles} targets={targets} allowedTargets={RECUR.map((r) => r[0])} submitLabel="Request Recurring Plan" changes={changes} />
                </Card>
                <aside className="space-y-4 lg:col-span-3">
                    <Card title="Is recurrence right for you?"><CheckList items={['You need ongoing advice or implementation.', 'Your environment or regulations change.', 'You want proactive risk management.', 'You want predictable costs and planning.', 'You value continuous improvement.']} /></Card>
                    <Card title="Prefer to chat now?" tone="gold"><a href="https://wa.me/27120010567" className="flex h-10 items-center justify-center gap-2 rounded border border-verified-500 bg-white text-sm font-semibold text-verified-700"><MessageCircle className="size-4" />Chat on WhatsApp</a></Card>
                </aside>
            </div>
            <TrustBand items={[['We recommend by fit, not margin', 'Your success is our priority.'], ['Human review included', 'Real experts. Real accountability.'], ['Transparent pricing', 'Clear, itemised and upfront.'], ['Secure & private', 'Your data is protected.'], ['Phase 1 – South Africa', 'ZAR source pricing.'], ['Fresh assent', 'No silent renewals']]} />
        </>
    );
}
