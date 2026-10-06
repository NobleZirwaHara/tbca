import type { ReactElement } from 'react';
import { cn } from '@/lib/cn';

/**
 * Institution wordmarks as clean typography (no downloaded or hotlinked trademark artwork):
 * one consistent treatment, each name set in its own weight, case and brand tint. Approved
 * logo assets can replace these later without touching the pages that use them.
 *
 *   <Wordmark id="dbsa" label="DBSA" />                 inline mark
 *   <li className={wordmarkTile}><Wordmark … /></li>    the shared tile (Home strip, About pages)
 */

type Mark = (size: 'md' | 'lg') => ReactElement;

const t = (size: 'md' | 'lg', md: string, lg: string) => (size === 'lg' ? lg : md);

const MARKS: Record<string, Mark> = {
    'standard-bank': (s) => (
        <span className="inline-flex items-center gap-1.5 text-[#0033a1]">
            <span className={cn('rounded-[2px] bg-[#0033a1]', t(s, 'size-3', 'size-4'))} />
            <span className={cn('leading-none font-semibold tracking-[-0.01em]', t(s, 'text-[0.8125rem]', 'text-[1.125rem]'))}>Standard Bank</span>
        </span>
    ),
    absa: (s) => <span className={cn('leading-none font-bold tracking-[-0.04em] text-[#dc0032]', t(s, 'text-[1.0625rem]', 'text-[1.5rem]'))}>absa</span>,
    fnb: (s) => <span className={cn('leading-none font-black tracking-[0.12em] text-[#009aa6]', t(s, 'text-[1rem]', 'text-[1.375rem]'))}>FNB</span>,
    nedbank: (s) => <span className={cn('leading-none font-semibold tracking-[-0.01em] text-[#006341]', t(s, 'text-[0.9375rem]', 'text-[1.3125rem]'))}>Nedbank</span>,
    mtn: (s) => (
        <span className={cn('inline-flex items-center rounded-[50%] bg-[#ffcb05] leading-none font-black tracking-[0.04em] text-ink-950', t(s, 'h-6 px-2.5 text-[0.75rem]', 'h-8 px-3.5 text-[1rem]'))}>MTN</span>
    ),
    sage: (s) => <span className={cn('leading-none font-bold tracking-[-0.03em] text-[#00a12f]', t(s, 'text-[1.0625rem]', 'text-[1.5rem]'))}>sage</span>,
    aws: (s) => (
        <span className="inline-flex flex-col items-center leading-none text-[#232f3e]">
            <span className={cn('font-bold tracking-[-0.02em]', t(s, 'text-[1rem]', 'text-[1.375rem]'))}>aws</span>
            <svg viewBox="0 0 30 6" className={cn('-mt-0.5 text-[#ff9900]', t(s, 'h-1.5 w-7', 'h-2 w-9'))}>
                <path d="M1 1.5Q15 7 28 1.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
        </span>
    ),
    dbsa: (s) => (
        <span className="inline-flex flex-col items-start leading-none text-[#0f766e]">
            <span className={cn('font-extrabold tracking-[0.06em]', t(s, 'text-[1.0625rem]', 'text-[1.5rem]'))}>DBSA</span>
            <span className={cn('mt-0.5 rounded-full bg-[#d6a32e]', t(s, 'h-[3px] w-6', 'h-1 w-9'))} />
        </span>
    ),
    afdb: (s) => (
        <span className={cn('leading-none tracking-[-0.01em] text-[#15803d]', t(s, 'text-[1.125rem]', 'text-[1.5625rem]'))}>
            <span className="font-medium">Af</span>
            <span className="font-extrabold">DB</span>
        </span>
    ),
    ifc: (s) => (
        <span className="inline-flex items-baseline gap-1.5 leading-none text-[#1d4ed8]">
            <span className={cn('font-black tracking-[0.08em]', t(s, 'text-[1.0625rem]', 'text-[1.5rem]'))}>IFC</span>
            <span className={cn('font-medium tracking-wide text-[#1d4ed8]/70 uppercase', t(s, 'text-[0.5rem]', 'text-[0.625rem]'))}>Intl. Finance</span>
        </span>
    ),
    idc: (s) => <span className={cn('leading-none font-extrabold tracking-[-0.02em] text-[#1d4ed8]', t(s, 'text-[1.125rem]', 'text-[1.5625rem]'))}>idc</span>,
    'african-union': (s) => (
        <span className={cn('inline-flex items-center gap-1.5 leading-none font-semibold tracking-[0.14em] text-[#a16207] uppercase', t(s, 'text-[0.6875rem]', 'text-[0.9375rem]'))}>
            <span className={cn('rounded-full border-2 border-[#15803d]', t(s, 'size-3.5', 'size-5'))} />
            African Union
        </span>
    ),
    giz: (s) => <span className={cn('leading-none font-bold tracking-[-0.02em] text-[#b91c1c]', t(s, 'text-[1.125rem]', 'text-[1.5625rem]'))}>giz</span>,
    usaid: (s) => <span className={cn('leading-none font-extrabold tracking-[0.1em] text-[#1e3a8a]', t(s, 'text-[0.9375rem]', 'text-[1.3125rem]'))}>USAID</span>,
    eib: (s) => (
        <span className={cn('inline-flex items-center gap-1 leading-none font-bold tracking-[0.06em] text-[#1e40af]', t(s, 'text-[1.0625rem]', 'text-[1.5rem]'))}>
            <span className={cn('rounded-full bg-[#facc15]', t(s, 'size-1.5', 'size-2'))} />
            EIB
        </span>
    ),
    undp: (s) => (
        <span className={cn('inline-flex items-center rounded-[2px] bg-[#0369a1] leading-none font-bold tracking-[0.08em] text-white', t(s, 'h-6 px-1.5 text-[0.75rem]', 'h-8 px-2 text-[1rem]'))}>UNDP</span>
    ),
};

/** Consistent tile used for every wordmark strip (Home ecosystem, About testimonials / institutions). */
export const wordmarkTile =
    'flex h-12 items-center justify-center rounded-[6px] border border-parchment-400 bg-parchment-100 px-2 opacity-80 grayscale-[35%] transition hover:opacity-100 hover:grayscale-0';

function slugify(value: string): string {
    return value
        .toLowerCase()
        .replace(/\(.*?\)/g, '')
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

export default function Wordmark({
    id,
    label,
    color,
    size = 'md',
    className,
}: {
    /** Registry key (slug, e.g. "dbsa", "standard-bank"); falls back to a slug of `label`. */
    id?: string;
    /** Text shown by the generic treatment when no tailored mark exists (acronym or short name). */
    label: string;
    /** Brand tint for the generic treatment. */
    color?: string | null;
    size?: 'md' | 'lg';
    className?: string;
}) {
    const mark = MARKS[id ?? ''] ?? MARKS[slugify(label)];

    return (
        <span className={cn('inline-flex items-center', className)} aria-hidden="true">
            {mark ? (
                mark(size)
            ) : (
                <span className="inline-flex items-center gap-1.5 leading-none" style={{ color: color ?? '#23232a' }}>
                    <span className={cn('rounded-full', size === 'lg' ? 'size-2.5' : 'size-2')} style={{ backgroundColor: color ?? '#d6a32e' }} />
                    <span className={cn('font-extrabold tracking-[0.04em]', size === 'lg' ? 'text-[1.375rem]' : 'text-[1rem]')}>{label}</span>
                </span>
            )}
        </span>
    );
}
