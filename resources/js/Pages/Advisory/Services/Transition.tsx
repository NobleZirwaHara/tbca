import { Head, Link } from '@inertiajs/react';
import { Download, MessageSquare } from 'lucide-react';
import ChangeForm, { type ChangeRow, type Target } from '@/Components/Advisory/ChangeForm';
import { Card, CheckList, DarkHero, KV, TrustBand, zar } from '@/Components/Advisory/ui';
import type { VehicleRow } from '@/types/advisory';

export default function Transition({ vehicles, targets, changes }: { vehicles: VehicleRow[]; targets: Target[]; changes: ChangeRow[] }) {
    const current = vehicles.find((v) => v.type === 'Sprint') ?? vehicles[0];
    const project = targets.find((t) => t.key === 'project');
    const credit = current?.paid ?? 9950;
    return (
        <>
            <Head title="Vehicle Transition Proposal" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: 'Vehicle Transition Proposal' }]}
                title="Vehicle Transition Proposal"
                tagline="The right outcome, through the right vehicle."
                intro="We recommend transitioning to a vehicle that better fits your goals, scope, complexity and desired outcomes. Here's a tailored proposal showing why this option is better and how we'll make the transition seamless."
                box={{ title: 'Why we’re recommending this transition', items: ['Better alignment to your goals and context.', 'Stronger outcomes and measurable impact.', 'More efficient use of time and budget.', 'Reduced risk and greater certainty of success.', 'Seamless transition with no loss of momentum.'] }}
            />
            <div className="container-tbca grid gap-4 py-8 lg:grid-cols-12">
                <Card num={1} title="Current situation" className="lg:col-span-3">
                    <KV rows={[['Current vehicle', current?.type ?? 'Sprint'], ['Primary outcome', current?.name ?? 'Operational efficiency review'], ['Scope summary', 'Limited diagnostic and recommendation'], ['Started on', current?.start ?? '—'], ['Progress', `${current?.progress ?? 0}%`], ['Investment to date', zar(credit)]]} />
                </Card>
                <Card num={2} title="Recommended transition" className="lg:col-span-4">
                    <p className="text-xs text-ink-500">Recommended vehicle</p>
                    <span className="inline-block rounded bg-verified-50 px-2 text-xs font-semibold text-verified-700">Project</span>
                    <p className="mt-2 text-sm font-semibold">Full operational improvement and implementation support</p>
                    <p className="mt-1 text-xs text-ink-600">This project approach provides deeper analysis, implementation planning, stakeholder alignment and measurable results with ongoing support.</p>
                    <CheckList className="mt-2" items={['Comprehensive analysis and root cause identification', 'Detailed implementation roadmap and change management', 'Access to specialist experts and tools', 'Stronger governance and quality assurance', 'Measurable outcomes and post-implementation support']} />
                    <div className="mt-3 rounded border border-parchment-400 p-3 text-center"><p className="text-xs text-ink-500">Fit score (vs current)</p><p className="text-2xl font-bold text-verified-700">92%</p><p className="text-[0.6875rem] text-ink-500">Excellent fit vs 54% with current vehicle</p></div>
                </Card>
                <Card num={3} title="Transition plan" className="lg:col-span-2">
                    <ol className="space-y-2 text-xs">
                        {[['Confirm decision', 'You approve the transition proposal.'], ['Scope alignment', 'We refine the scope, deliverables and plan.'], ['Commercial update', 'We adjust the proposal and investment.'], ['Seamless handover', 'We transition your work with no loss of data.'], ['Project kick-off', 'We start strong and deliver results.']].map(([t, b], i) => (
                            <li key={t} className="flex gap-2"><span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-verified-500 text-[0.625rem] font-bold text-white">{i + 1}</span><span><b>{t}</b><br />{b}</span></li>
                        ))}
                    </ol>
                </Card>
                <Card num={4} title="Investment summary" className="lg:col-span-3">
                    <KV rows={[['New vehicle', 'Project'], ['Estimated investment', zar(project?.value ?? 74850)], ['Investment to date (credit)', `- ${zar(credit)}`], ['Additional investment', zar(Math.max(0, (project?.value ?? 74850) - credit))], ['Payment terms', '50% upfront, 50% on delivery'], ['Validity', '7 days from today']]} />
                </Card>
                <Card title="You're in control" icon="shield-check" className="lg:col-span-8">
                    <p className="text-sm text-ink-600">This is a recommendation, not an obligation. You&rsquo;re free to stay with your current vehicle if it remains the right fit.</p>
                    <div className="mt-3 flex flex-wrap gap-3 text-sm">
                        <Link href="/services/proposal-request" className="inline-flex items-center gap-1.5 rounded border border-gold-500 px-3 py-2"><MessageSquare className="size-4" />Talk to a Human</Link>
                        <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1.5 rounded border border-gold-500 px-3 py-2"><Download className="size-4" />Download Proposal (PDF)</button>
                    </div>
                </Card>
                <Card title="Approve Transition & Proceed" className="lg:col-span-4">
                    <ChangeForm type="transition" vehicles={vehicles} targets={targets} allowedTargets={['project', 'mandate']} defaultVehicleType="Sprint" submitLabel="Approve Transition & Proceed" changes={changes} />
                </Card>
            </div>
            <TrustBand items={[['No obligation', 'You decide what’s best.'], ['Transparent pricing', 'Clear, itemised and upfront.'], ['Human review included', 'Real experts review every step.'], ['Secure & private', 'Your data is protected.'], ['Phase 1 – South Africa', 'ZAR source pricing.'], ['Credit carried forward', 'Investment to date counts']]} />
        </>
    );
}
