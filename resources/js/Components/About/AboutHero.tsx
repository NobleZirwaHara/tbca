import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import AboutIcon from '@/Components/About/AboutIcon';
import { cn } from '@/lib/cn';

export type AboutAccent = 'gold' | 'purple';

/** Faint line-art city skyline used behind every About page title (replaces mockup photography). */
export function Skyline({ className }: { className?: string }) {
    const towers = [
        [0, 70, 18], [20, 52, 14], [36, 88, 16], [54, 40, 22], [78, 110, 14], [94, 64, 18], [114, 132, 12], [128, 96, 20],
        [150, 58, 16], [168, 120, 18], [188, 76, 14], [204, 146, 16], [222, 90, 22], [246, 60, 14], [262, 104, 18], [282, 48, 20],
        [304, 82, 14], [320, 126, 16], [338, 66, 22], [362, 92, 14], [378, 54, 18],
    ];

    return (
        <svg viewBox="0 0 400 160" preserveAspectRatio="xMidYMax meet" className={cn('pointer-events-none', className)} aria-hidden="true">
            <g fill="none" stroke="currentColor" strokeWidth="0.8">
                {towers.map(([x, h, w], i) => (
                    <g key={i}>
                        <rect x={x} y={160 - h} width={w} height={h} />
                        {Array.from({ length: Math.floor(h / 14) }).map((_, j) => (
                            <line key={j} x1={x + 3} x2={x + w - 3} y1={160 - h + 8 + j * 14} y2={160 - h + 8 + j * 14} strokeOpacity="0.6" />
                        ))}
                        {i % 4 === 2 && <line x1={x + w / 2} x2={x + w / 2} y1={160 - h} y2={160 - h - 14} />}
                    </g>
                ))}
                <path d="M0 158 Q200 140 400 158" strokeOpacity="0.5" />
            </g>
        </svg>
    );
}

export interface AsideCardProps {
    icon?: string;
    title: string;
    body?: ReactNode;
    link?: { label: string; href: string };
    accent?: AboutAccent;
}

/** Bordered note card shown at the top-right of most About pages ("Our Correction Protocol", "Why Boundaries Matter" ...). */
export function AsideCard({ icon = 'shield-check', title, body, link, accent = 'gold' }: AsideCardProps) {
    const purple = accent === 'purple';

    return (
        <div className={cn('rounded-[8px] border p-5', purple ? 'border-violet-200 bg-violet-50/60' : 'border-gold-300 bg-gold-50/50')}>
            <div className="flex items-start gap-3.5">
                <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full border', purple ? 'border-violet-300 text-violet-700' : 'border-gold-400 text-gold-700')}>
                    <AboutIcon name={icon} className="size-5" />
                </span>
                <div className="min-w-0">
                    <h2 className="text-[0.9375rem] font-semibold text-ink-900">{title}</h2>
                    {body && <div className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{body}</div>}
                    {link && (
                        <Link href={link.href} className={cn('mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold hover:underline', purple ? 'text-violet-700' : 'text-gold-700')}>
                            {link.label}
                            <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}

interface AboutHeroProps {
    crumbs: Crumb[];
    title: string;
    lead?: string;
    intro?: ReactNode;
    accent?: AboutAccent;
    /** Right-hand column: an AsideCard, a seal, or any node. */
    aside?: ReactNode;
    /** Content rendered under the intro (fact strips, meta lines ...). */
    children?: ReactNode;
    className?: string;
}

/**
 * Standard About page header: breadcrumb, serif title, coloured serif strapline,
 * intro copy, faint skyline motif and an optional right-hand aside.
 */
export default function AboutHero({ crumbs, title, lead, intro, accent = 'gold', aside, children, className }: AboutHeroProps) {
    return (
        <header className={cn('relative overflow-hidden border-b border-parchment-300 bg-white', className)}>
            <Skyline className={cn('absolute right-[18%] bottom-0 hidden h-40 w-[34rem] lg:block', accent === 'purple' ? 'text-violet-300/60' : 'text-gold-400/45')} />

            <div className="container-tbca relative py-8 md:py-10">
                <Breadcrumbs items={crumbs} />

                <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                    <div className={aside ? 'lg:col-span-7' : 'lg:col-span-9'}>
                        <h1 className="font-serif text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-ink-900 md:text-[3rem]">{title}</h1>
                        {lead && (
                            <p className={cn('mt-2 font-serif text-[1.125rem] md:text-[1.375rem]', accent === 'purple' ? 'text-violet-700' : 'text-gold-700')}>{lead}</p>
                        )}
                        {intro && <div className="mt-4 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-700">{intro}</div>}
                        {children}
                    </div>

                    {aside && <div className="lg:col-span-5 lg:pl-6 xl:pl-12">{aside}</div>}
                </div>
            </div>
        </header>
    );
}

/** Generic content card with icon, title, body, optional bullet list and link — used across About grids. */
export function InfoCard({
    icon,
    title,
    body,
    items,
    link,
    tone = 'gold',
    marker = 'dot',
    className,
    children,
}: {
    icon: string;
    title: string;
    body?: ReactNode;
    items?: string[];
    link?: { label: string; href: string };
    tone?: 'gold' | 'purple' | 'green' | 'blue' | 'red' | 'orange';
    marker?: 'dot' | 'check' | 'cross';
    className?: string;
    children?: ReactNode;
}) {
    const tones = {
        gold: 'bg-gold-50 text-gold-700',
        purple: 'bg-violet-50 text-violet-700',
        green: 'bg-verified-50 text-verified-700',
        blue: 'bg-controlled-50 text-controlled-700',
        red: 'bg-risk-50 text-risk-700',
        orange: 'bg-attested-50 text-attested-700',
    }[tone];
    const linkTone = {
        gold: 'text-gold-700',
        purple: 'text-violet-700',
        green: 'text-verified-700',
        blue: 'text-controlled-700',
        red: 'text-risk-700',
        orange: 'text-attested-700',
    }[tone];

    return (
        <article className={cn('flex flex-col rounded-[8px] border border-parchment-400 bg-white p-5', className)}>
            <div className="flex items-start gap-3">
                <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full', tones)}>
                    <AboutIcon name={icon} className="size-5" />
                </span>
                <h3 className="pt-2 text-[0.9375rem] leading-snug font-semibold text-ink-900">{title}</h3>
            </div>
            {body && <div className="mt-3 text-[0.8125rem] leading-relaxed text-ink-600">{body}</div>}
            {items && items.length > 0 && (
                <ul className="mt-3 space-y-1.5">
                    {items.map((item) => (
                        <li key={item} className="flex items-start gap-2 text-[0.8125rem] leading-snug text-ink-700">
                            {marker === 'dot' && <span className={cn('mt-1.5 size-1.5 shrink-0 rounded-full', tone === 'purple' ? 'bg-violet-500' : 'bg-gold-500')} aria-hidden="true" />}
                            {marker === 'check' && <span className="mt-0.5 text-verified-500" aria-hidden="true">✓</span>}
                            {marker === 'cross' && <span className="mt-0.5 text-risk-500" aria-hidden="true">✕</span>}
                            <span>{item}</span>
                        </li>
                    ))}
                </ul>
            )}
            {children}
            {link && (
                <Link href={link.href} className={cn('mt-auto inline-flex items-center gap-1.5 pt-4 text-[0.8125rem] font-semibold hover:underline', linkTone)}>
                    {link.label}
                    <ArrowRight className="size-3.5" aria-hidden="true" />
                </Link>
            )}
        </article>
    );
}

/** Full-width notice band ("Important Disclosure", "No material public corrections are hidden." ...). */
export function NoticeBand({
    icon = 'info',
    title,
    children,
    action,
    tone = 'gold',
    className,
}: {
    icon?: string;
    title?: ReactNode;
    children?: ReactNode;
    action?: ReactNode;
    tone?: 'gold' | 'blue' | 'purple' | 'green';
    className?: string;
}) {
    const tones = {
        gold: 'border-gold-300 bg-gold-50/60',
        blue: 'border-controlled-500/25 bg-controlled-50/60',
        purple: 'border-violet-200 bg-violet-50/60',
        green: 'border-verified-500/25 bg-verified-50/60',
    }[tone];
    const iconTone = { gold: 'bg-ink-900 text-gold-400', blue: 'bg-controlled-700 text-white', purple: 'bg-violet-700 text-white', green: 'bg-verified-700 text-white' }[tone];

    return (
        <div className={cn('flex flex-col gap-4 rounded-[8px] border p-5 md:flex-row md:items-center', tones, className)}>
            <span className={cn('inline-flex size-10 shrink-0 items-center justify-center rounded-full', iconTone)}>
                <AboutIcon name={icon} className="size-5" />
            </span>
            <div className="min-w-0 flex-1 text-[0.875rem] leading-relaxed text-ink-700">
                {title && <p className="font-semibold text-ink-900">{title}</p>}
                {children}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
