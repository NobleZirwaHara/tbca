import { Head, Link } from '@inertiajs/react';
import { ClipboardList, FileCheck, Folder, Lock, MessageSquare, Target, TrendingUp, UserCheck, Users } from 'lucide-react';
import ChangeForm, { type ChangeRow, type Target as T } from '@/Components/Advisory/ChangeForm';
import { Card, CheckList, DarkHero, KV, TrustBand, zar } from '@/Components/Advisory/ui';
import type { VehicleRow } from '@/types/advisory';

export default function Upgrade({ vehicles, targets, changes }: { vehicles: VehicleRow[]; targets: T[]; changes: ChangeRow[] }) {
    const mandate = targets.find((t) => t.key === 'mandate');
    const sprint = vehicles.find((v) => v.type === 'Sprint');
    const steps = [[ClipboardList, 'Review Sprint', 'We review your completed Sprint, outputs, insights and recommendations.'], [Target, 'Define Expanded Scope', 'We co-create the mandate scope, deliverables, timeline and success measures.'], [FileCheck, 'Confirm Mandate & Fee', 'We agree on the mandate vehicle, fixed fee and engagement terms.'], [Users, 'Convert & Onboard', 'We convert your Sprint into a Mandate and kick off the plan.'], [TrendingUp, 'Deliver More Impact', 'We execute and implement until outcomes are achieved.']] as const;
    return (
        <>
            <Head title="Sprint-to-Mandate Upgrade" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: 'Sprint-to-Mandate Upgrade' }]}
                title="Sprint-to-Mandate Upgrade"
                tagline="More scope. More certainty. More impact."
                intro="You started with a Sprint. Let's take it further. Upgrade to a Mandate for deeper analysis, broader deliverables and hands-on implementation support."
                box={{ title: 'Why upgrade?', items: ['Deeper analysis and broader scope.', 'Implementation guidance and advisor support.', 'Stronger outcomes and measurable impact.', 'Greater certainty with fixed-fee mandates.', 'Seamless transition with no lost progress.'] }}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                <section className="space-y-4 lg:col-span-5">
                    <Card title="A seamless upgrade in 5 simple steps">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">We carry your progress forward and expand your outcomes.</p>
                        <ol className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                            {steps.map(([I, t, b], i) => (
                                <li key={t} className="text-center"><span className="mx-auto inline-flex size-11 items-center justify-center rounded-full border-2 border-gold-400 text-gold-700"><I className="size-5" /></span><p className="mt-1 text-[0.6875rem] font-semibold">{i + 1} {t}</p><p className="text-[0.625rem] text-ink-500">{b}</p></li>
                            ))}
                        </ol>
                    </Card>
                    <Card title="What stays the same">
                        <ul className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-5">
                            {[[Target, 'Your goals', 'Aligned to your original intent.'], [Folder, 'Your context', 'All insights and data carried forward.'], [UserCheck, 'Your team', 'Same experts, now with more capacity.'], [ClipboardList, 'Your progress', 'No steps repeated. We build on what’s done.'], [Lock, 'Your confidentiality', 'Same high standards. Always protected.']].map(([I, t, b]) => {
                                const Icon = I as typeof Target;
                                return <li key={t as string}><Icon className="size-4 text-gold-600" /><b className="block">{t as string}</b>{b as string}</li>;
                            })}
                        </ul>
                    </Card>
                </section>
                <Card title="Upgrade summary" className="lg:col-span-3">
                    <KV rows={[['Current vehicle', <span><span className="rounded bg-controlled-50 px-1.5 text-controlled-700">Sprint</span> {sprint?.name ?? 'Operational Efficiency Review'}</span>], ['Recommended vehicle', <span><span className="rounded bg-verified-50 px-1.5 text-verified-700">Mandate</span> {mandate?.label}</span>], ['Expanded scope', 'Strategy, systems, people and implementation'], ['Deliverables', 'Comprehensive report, roadmap, templates, toolkits and advisory support'], ['Timeline', '8 weeks'], ['Investment (fixed fee)', `${zar(mandate?.value ?? 84500)} (excl. VAT)`], ['Sprint credit', `- ${zar(sprint?.paid ?? 0)}`]]} />
                    <div className="mt-4 border-t border-parchment-300 pt-3">
                        <ChangeForm type="upgrade" vehicles={vehicles} targets={targets} allowedTargets={['mandate']} defaultVehicleType="Sprint" submitLabel="Request Upgrade" changes={changes} />
                    </div>
                </Card>
                <aside className="space-y-4 lg:col-span-4">
                    <Card title="Is an upgrade right for you?">
                        <CheckList items={['You want deeper analysis and broader outcomes.', 'You need implementation guidance and support.', 'You have more complex or interconnected challenges.', 'You want measurable impact and accountability.', 'You’re ready to move from insight to execution.']} />
                    </Card>
                    <Card title="Talk to an expert" tone="gold"><p className="text-xs text-ink-600">Let&rsquo;s discuss the best mandate option for your goals.</p><Link href="/services/proposal-request" className="mt-2 inline-flex items-center gap-1.5 rounded border border-gold-500 bg-white px-3 py-1.5 text-xs font-semibold"><MessageSquare className="size-3.5" />Talk to a Human</Link></Card>
                    <Card title="Prefer to start a new mandate?" tone="gold"><p className="text-xs text-ink-600">If your objectives have changed significantly.</p><Link href="/project-advisory/discovery" className="mt-2 inline-block rounded border border-gold-500 bg-white px-3 py-1.5 text-xs font-semibold">Request a New Mandate →</Link></Card>
                </aside>
            </div>
            <TrustBand items={[['We recommend by fit, not margin', 'Your success comes first.'], ['No obligation', 'You decide what’s best.'], ['Human review included', 'Real experts review every step.'], ['Transparent pricing', 'Clear, itemised and upfront.'], ['Secure & private', 'Your data is protected.'], ['Phase 1 – South Africa', 'ZAR source pricing.']]} />
        </>
    );
}
