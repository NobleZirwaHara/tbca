import type { ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { BookOpenCheck, ClipboardList, GitCompareArrows, LayoutDashboard, Ruler, ShieldCheck } from 'lucide-react';
import type { ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { cn } from '@/lib/cn';

export const DELIVERABLES_NAV: ConsoleNavGroup[] = [
    { title: 'Platform', items: [{ label: 'Admin Hub', href: '/admin', icon: LayoutDashboard }] },
    {
        title: 'Registry of Deliverables',
        items: [
            { label: 'Register', href: '/admin/deliverables', icon: ClipboardList },
            { label: 'Sprint crosswalk', href: '/admin/deliverables/crosswalk', icon: GitCompareArrows },
            { label: 'Safeguards and loops', href: '/admin/deliverables/automation', icon: ShieldCheck },
            { label: 'Standards and countries', href: '/admin/deliverables/standards', icon: Ruler },
        ],
    },
];

export const DeliverablesIcon = BookOpenCheck;

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    from: number | null;
    to: number | null;
    prev_page_url: string | null;
    next_page_url: string | null;
}

/** Previous / next pager for Laravel paginators. */
export function Pager({ page, label = 'results' }: { page: Paginated<unknown>; label?: string }) {
    if (page.total === 0) return null;
    const btn = 'rounded-[4px] border border-parchment-500 bg-white px-3 py-1.5 text-[0.8125rem] font-semibold text-ink-800 hover:border-gold-500';
    return (
        <nav aria-label="Pages" className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.8125rem] text-ink-600">
            <span>
                {page.from}–{page.to} of {page.total.toLocaleString('en-ZA')} {label}
            </span>
            <span className="flex items-center gap-2">
                {page.prev_page_url ? (
                    <Link href={page.prev_page_url} preserveScroll className={btn}>
                        Previous
                    </Link>
                ) : (
                    <span className={cn(btn, 'opacity-40')}>Previous</span>
                )}
                <span>
                    Page {page.current_page} of {page.last_page}
                </span>
                {page.next_page_url ? (
                    <Link href={page.next_page_url} preserveScroll className={btn}>
                        Next
                    </Link>
                ) : (
                    <span className={cn(btn, 'opacity-40')}>Next</span>
                )}
            </span>
        </nav>
    );
}

/** Label and value pairs in two columns. */
export function Facts({ rows }: { rows: [ReactNode, ReactNode][] }) {
    return (
        <dl className="grid gap-x-4 gap-y-2 text-[0.8125rem] sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
            {rows.map(([k, v], i) => (
                <div key={i} className="contents">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="text-ink-800 [overflow-wrap:anywhere]">{v ?? <span className="text-ink-400">Not stated</span>}</dd>
                </div>
            ))}
        </dl>
    );
}

export const fmt = (n: number) => n.toLocaleString('en-ZA');
export const pct = (n: number, d: number) => (d === 0 ? '0%' : `${Math.round((n / d) * 1000) / 10}%`);
