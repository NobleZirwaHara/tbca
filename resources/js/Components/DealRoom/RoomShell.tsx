import { Head, Link } from '@inertiajs/react';
import { Bot, Briefcase, Building2, CircleCheck, FileSearch, Lock, PauseCircle, ShieldCheck, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';
import type { RoomHeader, StepperStage } from '@/types/deal-room';

export const roomUrl = (slug: string, path = '') => `/virtual-deal-room/rooms/${slug}${path ? `/${path}` : ''}`;

/** URL for a stage's primary screen (Stage A lives on the public enquiry, Stage 0 on the set-up wizard). */
export function stageHref(slug: string, s: Pick<StepperStage, 'code' | 'page'>): string {
    if (s.code === 'A') return roomUrl(slug);
    if (s.code === '0') return roomUrl(slug, 'setup/deal-basics');
    return roomUrl(slug, s.page);
}

const chips = [
    { label: 'Role-Based Access', icon: Users },
    { label: 'Source-Grounded AI', icon: Bot },
    { label: 'Human Review', icon: UserCheck },
    { label: 'Full Audit Trail', icon: ShieldCheck },
];

/** Full transaction stepper A, B, C, 0-15. Unlocked/complete stages link to their screen. */
export function StageStepper({ room, active }: { room: RoomHeader; active?: string }) {
    return (
        <nav aria-label="Transaction stages" className="overflow-x-auto border-b border-parchment-400 bg-white">
            <ol className="container-tbca flex min-w-max items-start gap-0 py-3">
                {room.stepper.map((s, i) => {
                    const isActive = s.code === active;
                    const clickable = s.status !== 'locked' && (room.manages || ['5', '9', '10'].includes(s.code));
                    const dot = (
                        <span
                            className={cn(
                                'relative z-10 flex size-7 items-center justify-center rounded-full border-2 text-[0.6875rem] font-bold',
                                s.status === 'completed' && 'border-verified-500 bg-verified-500 text-white',
                                s.status === 'unlocked' && !isActive && 'border-gold-500 bg-white text-gold-700',
                                isActive && 'border-gold-500 bg-gold-500 text-ink-900 ring-4 ring-gold-500/20',
                                s.status === 'locked' && !isActive && 'border-parchment-500 bg-parchment-200 text-ink-400',
                            )}
                        >
                            {s.status === 'completed' ? <CircleCheck className="size-4" /> : s.status === 'locked' ? <Lock className="size-3" /> : s.code}
                        </span>
                    );
                    return (
                        <li key={s.code} className="relative flex w-[4.75rem] flex-col items-center text-center">
                            {i > 0 && (
                                <span aria-hidden className={cn('absolute top-3.5 right-1/2 h-0.5 w-full', s.status === 'locked' ? 'bg-parchment-400' : 'bg-verified-500')} />
                            )}
                            {clickable ? (
                                <Link href={stageHref(room.slug, s)} className="flex flex-col items-center rounded focus-visible:outline-2 focus-visible:outline-gold-500" aria-current={isActive ? 'step' : undefined}>
                                    {dot}
                                    <span className={cn('mt-1 text-[0.625rem] leading-tight', isActive ? 'font-bold text-gold-700' : 'text-ink-600')}>{s.short}</span>
                                </Link>
                            ) : (
                                <span className="flex flex-col items-center" title={s.status === 'locked' ? 'Locked until the previous stage gate passes' : s.name}>
                                    {dot}
                                    <span className={cn('mt-1 text-[0.625rem] leading-tight', isActive ? 'font-bold text-gold-700' : 'text-ink-400')}>{s.short}</span>
                                </span>
                            )}
                            <span className="sr-only">{`Stage ${s.code}: ${s.name} (${s.status})`}</span>
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

/**
 * Shared room page frame: dark hero (crumbs, title, status pill, governance
 * chips, room card with current / next stage), stage stepper, then content.
 */
export default function RoomShell({
    room,
    title,
    eyebrow,
    badge,
    description,
    activeStage,
    children,
    actionBar,
    headTitle,
}: {
    room: RoomHeader;
    title: ReactNode;
    eyebrow?: ReactNode;
    badge?: ReactNode;
    description?: ReactNode;
    activeStage?: string;
    children: ReactNode;
    actionBar?: ReactNode;
    headTitle?: string;
}) {
    return (
        <>
            <Head title={headTitle ?? (typeof title === 'string' ? `${title} — ${room.name}` : room.name)} />
            <section className="bg-ink-950 text-parchment-100">
                <div className="container-tbca grid gap-6 py-7 lg:grid-cols-[1fr_minmax(0,34rem)]">
                    <div>
                        <p className="text-xs font-semibold text-gold-400">
                            <Link href="/virtual-deal-room/rooms" className="hover:underline">
                                Virtual Deal Room
                            </Link>{' '}
                            / <Link href={roomUrl(room.slug)} className="hover:underline">{room.name}</Link>
                            {eyebrow ? <> / {eyebrow}</> : null}
                        </p>
                        <div className="mt-2 flex flex-wrap items-center gap-3">
                            <h1 className="font-serif text-2xl font-bold sm:text-3xl">{title}</h1>
                            {badge}
                        </div>
                        {description && <p className="mt-2 max-w-2xl text-sm text-ink-200">{description}</p>}
                        <ul className="mt-4 flex flex-wrap gap-2">
                            {chips.map(({ label, icon: I }) => (
                                <li key={label} className="inline-flex items-center gap-1.5 rounded-[4px] border border-gold-600/50 px-2.5 py-1 text-[0.6875rem] text-gold-200">
                                    <I className="size-3.5" aria-hidden />
                                    {label}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-[8px] border border-gold-600/60 p-4 text-xs sm:grid-cols-5">
                        <div className="sm:col-span-1">
                            <dt className="flex items-center gap-1 text-gold-400"><Briefcase className="size-3.5" aria-hidden /> Deal Room</dt>
                            <dd className="mt-1 font-semibold text-parchment-100">{room.name}</dd>
                            <dd className="text-ink-300">{room.reference}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1 text-gold-400"><Building2 className="size-3.5" aria-hidden /> Company</dt>
                            <dd className="mt-1 font-semibold text-parchment-100">{room.company}</dd>
                            <dd className="text-ink-300">{room.country}</dd>
                        </div>
                        <div>
                            <dt className="flex items-center gap-1 text-gold-400"><FileSearch className="size-3.5" aria-hidden /> Transaction</dt>
                            <dd className="mt-1 text-parchment-100">{room.transactionType}</dd>
                            <dd className="text-ink-300">{room.dealType}</dd>
                        </div>
                        <div className="text-center">
                            <dt className="text-gold-400">Current Stage</dt>
                            <dd className="mx-auto mt-1 flex size-8 items-center justify-center rounded-full bg-gold-500 text-sm font-bold text-ink-900">{room.currentStage.code}</dd>
                            <dd className="mt-1 text-[0.6875rem] text-parchment-100">{room.currentStage.name}</dd>
                        </div>
                        <div className="text-center">
                            <dt className="text-gold-400">Next Stage</dt>
                            <dd className="mx-auto mt-1 flex size-8 items-center justify-center rounded-full bg-ink-700 text-sm font-bold text-parchment-100">{room.nextStage?.code ?? '—'}</dd>
                            <dd className="mt-1 text-[0.6875rem] text-ink-300">{room.nextStage?.name ?? 'Final stage'}</dd>
                        </div>
                    </dl>
                </div>
            </section>
            <StageStepper room={room} active={activeStage} />
            {room.status === 'paused' && (
                <div className="border-b border-risk-500/30 bg-risk-50">
                    <div className="container-tbca flex flex-wrap items-center gap-3 py-3 text-sm text-risk-700">
                        <PauseCircle className="size-5" aria-hidden />
                        <span>
                            <strong>Transaction paused.</strong> {room.pausedReason}. No stage can progress until the pause is resolved.
                        </span>
                        {room.manages && (
                            <Link href={roomUrl(room.slug, 'billing/transaction-pause')} className="ml-auto font-semibold underline">
                                Review pause
                            </Link>
                        )}
                    </div>
                </div>
            )}
            <div className="bg-parchment-200 py-6">
                <div className="container-tbca space-y-5">{children}</div>
            </div>
            {actionBar && (
                <div className="sticky bottom-0 z-30 border-t border-parchment-400 bg-white/95 backdrop-blur">
                    <div className="container-tbca flex flex-wrap items-center justify-end gap-2 py-3">{actionBar}</div>
                </div>
            )}
        </>
    );
}
