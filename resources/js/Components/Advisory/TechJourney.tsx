import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { Check, MessageCircle } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { PageTitle } from '@/Components/Advisory/ui';
import type { Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';

export interface JourneyState { tower: string | null; progress: Record<string, boolean>; org: string | null }

const STEPS: [string, string, string, string][] = [
    ['context', 'Context', 'Business & goals', '/technology-solutions/context'],
    ['towers', 'Towers', 'Select focus areas', '/technology-solutions/towers'],
    ['diagnose', 'Diagnose', 'Answer & assess', '/technology-solutions/readiness'],
    ['configure', 'Configure', 'Build your solution', '/technology-solutions/configure'],
    ['fees', 'Fees', 'Transparent fees', '/technology-solutions/fees'],
    ['letter', 'Letter', 'Engagement letter', '/technology-solutions/engagement-letter'],
];

/** Shared layout for the public Technology Solutions journey: stepper, progress rail, help box. */
export default function TechJourney({ step, journey, title, sub, crumbs, badge, children, aside, footer }: { step: number; journey: JourneyState | null; title: string; sub: ReactNode; crumbs?: Crumb[]; badge?: ReactNode; children: ReactNode; aside?: ReactNode; footer?: ReactNode }) {
    const done = (k: string, i: number) => (journey?.progress[k] ?? false) || i + 1 < step;
    return (
        <div className="container-tbca py-8">
            <PageTitle crumbs={crumbs ?? [{ label: 'Technology Solutions', href: '/technology-solutions' }, { label: title }]} title={title} sub={sub} actions={badge} />
            <ol className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-6" aria-label="Journey steps">
                {STEPS.map(([k, t, s, href], i) => {
                    const n = i + 1;
                    const isDone = done(k, i) && n !== step;
                    return (
                        <li key={k}>
                            <Link href={href} className={cn('flex items-center gap-2 rounded-[6px] border p-2', n === step ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white')} aria-current={n === step ? 'step' : undefined}>
                                <span className={cn('inline-flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold', isDone ? 'bg-verified-500 text-white' : n === step ? 'bg-gold-500 text-ink-900' : 'bg-parchment-300 text-ink-500')}>{isDone ? <Check className="size-4" /> : n}</span>
                                <span className="min-w-0"><span className="block text-xs font-semibold">{t}</span><span className="block truncate text-[0.625rem] text-ink-500">{s}</span></span>
                            </Link>
                        </li>
                    );
                })}
            </ol>
            <div className="grid gap-5 lg:grid-cols-12">
                <aside className="space-y-4 lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <p className="text-sm font-semibold">Your Journey Progress</p>
                        <p className="text-xs text-ink-500">Step {step} of 6</p>
                        <div className="mt-2 h-1.5 rounded-full bg-parchment-300"><div className="h-full rounded-full bg-gold-500" style={{ width: `${(step / 6) * 100}%` }} /></div>
                        <ul className="mt-3 space-y-1.5 text-xs">
                            {STEPS.map(([k, t], i) => <li key={k} className="flex justify-between"><span>{t}</span><span className={cn('rounded px-1.5', i + 1 === step ? 'bg-gold-100 text-gold-800' : done(k, i) ? 'bg-verified-50 text-verified-700' : 'bg-parchment-300 text-ink-500')}>{i + 1 === step ? 'In Progress' : done(k, i) ? 'Completed' : 'Pending'}</span></li>)}
                            <li className="flex justify-between"><span>Gate Approval</span><span className="rounded bg-parchment-300 px-1.5 text-ink-500">Not Started</span></li>
                            <li className="flex justify-between"><span>Delivery Kickoff</span><span className="rounded bg-parchment-300 px-1.5 text-ink-500">Not Started</span></li>
                        </ul>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                        <p className="font-semibold">Need Help?</p>
                        <p className="text-xs text-ink-500">Book a free discovery call with a TBCA expert. We&rsquo;ll guide you through the right next steps.</p>
                        <ButtonLink href="/contact" size="sm" className="mt-2 w-full" icon="calendar-days">Book Discovery Call</ButtonLink>
                        <a href="https://wa.me/27608011365" className="mt-2 flex items-center justify-center gap-1 text-xs text-verified-700"><MessageCircle className="size-3.5" />Chat with us on WhatsApp</a>
                    </div>
                    {aside}
                </aside>
                <div className="space-y-4 lg:col-span-9">{children}</div>
            </div>
            {footer && <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">{footer}</div>}
        </div>
    );
}
