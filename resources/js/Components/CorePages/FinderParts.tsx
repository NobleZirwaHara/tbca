import { Link } from '@inertiajs/react';
import { CircleCheck, Clock, Compass, Gift, Lock, MessageCircle, Ban, Sparkles, UserCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { openAskQuestion } from '@/Components/AskQuestion';
import { JourneySteps, Flag } from '@/Components/CorePages/Kit';
import type { FinderShared } from '@/types/core-pages';

export function FinderHeader({
    title = 'Find the Right Service',
    subtitle,
    crumbs,
    steps,
    current,
    chips = ['Takes about 3 minutes', 'Free recommendation', 'No obligation'],
    icon,
    assist = false,
}: {
    title?: string;
    subtitle: string;
    crumbs: Crumb[];
    steps: string[];
    current: number;
    chips?: string[];
    icon?: ReactNode;
    assist?: boolean;
}) {
    const progress = Math.min(100, Math.round((Math.min(current, 5) / 5) * 100));
    const chipIcons = [Clock, Gift, Ban];

    return (
        <section className="relative overflow-hidden bg-ink-950 text-parchment-100">
            <div className="pointer-events-none absolute inset-0 motif-grid opacity-25" aria-hidden="true" />
            <div className="container-tbca relative py-6">
                <div className="[&_a]:text-ink-300 [&_a:hover]:text-gold-300 [&_li]:text-ink-300">
                    <Breadcrumbs items={crumbs} />
                </div>
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-start gap-4">
                        <span className="hidden size-14 shrink-0 items-center justify-center rounded-[8px] border border-gold-600/60 text-gold-400 sm:inline-flex">{icon ?? <Compass className="size-8" aria-hidden="true" />}</span>
                        <div>
                            <h1 className="font-serif text-[1.75rem] leading-tight font-semibold md:text-[2.25rem]">{title}</h1>
                            <p className="mt-1 text-[0.875rem] text-parchment-200">{subtitle}</p>
                            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[0.75rem] text-ink-300">
                                {chips.map((c, i) => {
                                    const I = chipIcons[i] ?? CircleCheck;
                                    return <li key={c} className="inline-flex items-center gap-1"><I className="size-3.5 text-gold-500" aria-hidden="true" />{c}</li>;
                                })}
                            </ul>
                        </div>
                    </div>
                    <ul className="grid grid-cols-2 gap-3 text-[0.75rem] sm:grid-cols-4">
                        <li className="flex items-center gap-2"><Flag iso="ZA" className="text-xl" /><span>South Africa<br />Active Market</span></li>
                        <li className="flex items-center gap-2"><MessageCircle className="size-5 text-gold-500" aria-hidden="true" /><span>English &amp;<br />Afrikaans</span></li>
                        <li className="flex items-center gap-2"><span className="font-bold text-verified-500">R $</span><span>ZAR Source Pricing<br />USD Available</span></li>
                        <li className="flex items-center gap-2"><UserCheck className="size-5 text-gold-500" aria-hidden="true" /><span>Human-Reviewed<br />{assist ? 'Assistance' : 'Recommendations'}</span></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-gold-700/40">
                <div className="container-tbca flex flex-col gap-3 py-4 md:flex-row md:items-center">
                    <JourneySteps steps={steps} current={current} tone="dark" captions className="flex-1" />
                    <p className="shrink-0 text-right text-[0.8125rem] md:w-32">
                        <span className="block font-semibold">Step {Math.min(current, steps.length)} of {steps.length}</span>
                        <span className="text-gold-400">{progress}% complete</span>
                    </p>
                </div>
            </div>
        </section>
    );
}

export function FinderSidebar({ shared, currentLabel, next, children }: { shared: FinderShared; currentLabel: string; next?: string[]; children?: ReactNode }) {
    const s = shared.summary;
    const rows: [string, ReactNode][] = [
        ['Your Need', s.need ? <span className="inline-flex items-center gap-1">{s.need}<CircleCheck className="size-3.5 text-verified-500" aria-hidden="true" /></span> : '—'],
        ['Current Step', <span key="c" className="text-gold-400">{currentLabel}</span>],
        ['Market', s.market],
        ['Language', s.language],
        ['Currency', s.currency],
        ...(s.formats ? ([['Format Preference', s.formats]] as [string, ReactNode][]) : []),
        ...(s.budget ? ([['Budget Range', s.budget]] as [string, ReactNode][]) : []),
        ['Recommendation Status', s.status],
    ];

    return (
        <aside className="rounded-[10px] border border-gold-700/40 bg-ink-950 p-5 text-parchment-200">
            <h2 className="font-serif text-[1.1875rem] font-semibold text-gold-400">Your Service Finder</h2>
            <dl className="mt-3 space-y-2 text-[0.8125rem]">
                {rows.map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[8.5rem_1fr] gap-2"><dt className="text-ink-300">{k}</dt><dd className="text-parchment-100">{v}</dd></div>
                ))}
            </dl>
            <div className="mt-4 flex gap-3 rounded-[8px] border border-gold-600/60 p-3">
                <Sparkles className="size-5 shrink-0 text-gold-500" aria-hidden="true" />
                <p className="text-[0.75rem]"><strong className="text-parchment-100">AI-Guided | Human-Reviewed Where Required</strong><br />Our recommendations are AI-guided and human-reviewed where required.</p>
            </div>
            {next && (
                <>
                    <p className="mt-4 text-[0.875rem] font-semibold text-gold-400">What happens next?</p>
                    <ul className="mt-2 space-y-1.5">
                        {next.map((n) => <li key={n} className="flex gap-2 text-[0.75rem]"><CircleCheck className="mt-0.5 size-3.5 shrink-0 text-gold-500" aria-hidden="true" />{n}</li>)}
                    </ul>
                </>
            )}
            {children}
            <p className="mt-4 text-[0.75rem]">
                Need help?{' '}
                <button type="button" className="font-semibold text-gold-400 underline" onClick={() => openAskQuestion({ subject: 'Find the Right Service help', section: 'core' })}>Ask an Advisor</button> or start a{' '}
                <a href="https://wa.me/27608916365" target="_blank" rel="noreferrer" className="font-semibold text-gold-400 underline">WhatsApp chat</a>.
            </p>
        </aside>
    );
}

export function ProtectedList() {
    return (
        <>
            <p className="mt-4 text-[0.875rem] font-semibold text-gold-400">Your information is protected</p>
            <ul className="mt-2 space-y-1.5 text-[0.75rem]">
                {['POPIA-aligned information handling.', 'Secure recommendation process.', 'No payment required at this stage.', 'Human review available.', 'No unsupported professional conclusions.'].map((t) => (
                    <li key={t} className="flex gap-2"><Lock className="mt-0.5 size-3.5 shrink-0 text-gold-500" aria-hidden="true" />{t}</li>
                ))}
            </ul>
        </>
    );
}

export function ConsentLine() {
    return (
        <p className="mt-3 flex gap-2 text-[0.6875rem] text-ink-500">
            <Lock className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            <span>
                By continuing, you allow TBCA to use your answers to recommend suitable services and next steps. Your responses do not constitute professional advice, a funding decision or a binding quotation.{' '}
                <Link href="/about/governance" className="text-gold-700 underline">Privacy Notice</Link> | <Link href="/about/methodology" className="text-gold-700 underline">How Recommendations Work</Link> |{' '}
                <Link href="/find-the-right-service/request-human-assistance" className="text-gold-700 underline">Request Human Assistance</Link>
            </span>
        </p>
    );
}

export const FINDER_STEPS = ['Your Need', 'About You', 'Business Context', 'Timing & Budget', 'Recommendations'];
export const ASSIST_STEPS = [...FINDER_STEPS, 'Human Assistance'];
