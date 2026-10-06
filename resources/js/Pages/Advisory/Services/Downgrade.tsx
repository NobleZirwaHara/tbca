import { Head } from '@inertiajs/react';
import { ArrowLeftRight, Download, FileX2, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import ChangeForm, { type ChangeRow, type Target } from '@/Components/Advisory/ChangeForm';
import { Card, CheckList, DarkHero, TrustBand } from '@/Components/Advisory/ui';
import { cn } from '@/lib/cn';
import type { VehicleRow } from '@/types/advisory';

export default function Downgrade({ vehicles, targets, changes }: { vehicles: VehicleRow[]; targets: Target[]; changes: ChangeRow[] }) {
    const [action, setAction] = useState<'downgrade' | 'switch' | 'exit'>('downgrade');
    const choices = [
        ['downgrade', Download, 'Downgrade', 'Move to a lower vehicle or simpler way of working.', 'Start Downgrade', 'bg-verified-500'],
        ['switch', ArrowLeftRight, 'Switch Vehicle', 'Move to a different vehicle that fits your new needs.', 'Switch Vehicle', 'bg-controlled-500'],
        ['exit', FileX2, 'Exit (Close Engagement)', 'End our engagement completely and securely.', 'Start Exit', 'bg-risk-500'],
    ] as const;
    return (
        <>
            <Head title="Downgrade and Exit" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA', href: '/services/ways-to-work-with-tbca' }, { label: 'Downgrade and Exit' }]}
                title="Downgrade and Exit"
                tagline="Change your path. Keep control. Exit with confidence."
                intro="Your needs may change. We make it easy to scale down, switch vehicles or exit completely — without disruption, hidden fees or losing your progress."
                chips={[{ label: 'Market', sub: 'Africa (Active)' }, { label: 'Languages', sub: '7 Languages' }, { label: 'No lock-in', sub: 'Fair terms always' }, { label: 'Human Review', sub: 'Available' }, { label: 'We recommend', sub: 'by fit, not margin' }]}
                box={{ title: 'Why you’re in control', items: ['Your business. Your decision.', 'Change at any time.', 'We protect your information.', 'Transparent terms. No penalties.', 'We help you land on the right next step.'] }}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-12">
                <Card num={1} title="What would you like to do?" className="lg:col-span-5">
                    <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Change type">
                        {choices.map(([k, I, t, b, btn, c]) => (
                            <button key={k} type="button" role="radio" aria-checked={action === k} onClick={() => setAction(k)} className={cn('flex flex-col items-center rounded-[8px] border p-3 text-center', action === k ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                <I className="size-8 text-ink-700" />
                                <span className="mt-1 text-sm font-semibold">{t}</span>
                                <span className="text-[0.6875rem] text-ink-500">{b}</span>
                                <span className={cn('mt-2 rounded px-3 py-1 text-xs font-semibold text-white', c)}>{btn}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-4 border-t border-parchment-300 pt-4">
                        <ChangeForm key={action} type={action} vehicles={vehicles} targets={targets} allowedTargets={action === 'downgrade' ? ['sprint', 'subscription-plan'] : undefined} submitLabel={choices.find((c) => c[0] === action)![4]} changes={changes} />
                    </div>
                </Card>
                <Card num={2} title="What happens next?" className="lg:col-span-4">
                    <ol className="space-y-2.5 text-xs">
                        {[['Confirm your choice', 'You tell us what you’d like to do.'], ['Review current status', 'We share a summary of scope, progress and value delivered.'], ['Recommend best next step', 'We suggest the right downgrade, switch or close plan.'], ['Agree terms & timing', 'We confirm any fees, credits, timelines and handover details.'], ['Transition & confirm', 'We action the change and confirm it’s complete.']].map(([t, b], i) => (
                            <li key={t} className="flex gap-2"><span className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[0.625rem] font-bold">{i + 1}</span><span><b>{t}</b><br />{b}</span></li>
                        ))}
                    </ol>
                    <h3 className="mt-5 text-sm font-semibold">Examples of common changes</h3>
                    <ul className="mt-2 space-y-2 text-xs">
                        <li className="flex justify-between gap-2"><span><b>From Mandate to Sprint</b> — scale down from ongoing advisory to a once-off project</span><span className="rounded bg-verified-50 px-1.5 text-verified-700">Downgrade</span></li>
                        <li className="flex justify-between gap-2"><span><b>Change Service Focus</b> — move from implementation support to strategy</span><span className="rounded bg-controlled-50 px-1.5 text-controlled-700">Switch</span></li>
                        <li className="flex justify-between gap-2"><span><b>Take a Break or Exit</b> — close the engagement with a clean handover</span><span className="rounded bg-risk-50 px-1.5 text-risk-700">Exit</span></li>
                    </ul>
                </Card>
                <aside className="space-y-4 lg:col-span-3">
                    <Card title="You keep what's yours"><CheckList items={['All work and deliverables you’ve paid for.', 'Key insights, reports and frameworks.', 'Access to completed tools and assets.', 'Secure handover and confirmation.']} /></Card>
                    <Card title="Prefer to chat now?" tone="gold"><a href="https://wa.me/27608011365" className="flex h-10 items-center justify-center gap-2 rounded border border-verified-500 bg-white text-sm font-semibold text-verified-700"><MessageCircle className="size-4" />Chat on WhatsApp</a></Card>
                </aside>
            </div>
            <TrustBand items={[['No penalties', 'No lock-in contracts. No hidden fees.'], ['Fair pricing', 'Prorated credits where applicable.'], ['Human review included', 'Real experts. Real accountability.'], ['Secure & private', 'Your data is protected.'], ['Africa (Active)', 'ZAR source pricing.'], ['Clean handover', 'Confirmed in writing']]} />
        </>
    );
}
