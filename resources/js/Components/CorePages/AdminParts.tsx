import { router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Globe, LayoutDashboard, Network, Radar } from 'lucide-react';
import type { ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { cn } from '@/lib/cn';
import type { Paginated } from '@/types/core-pages';

export const COUNTRY_ADMIN_NAV: ConsoleNavGroup[] = [
    {
        title: 'Administration',
        items: [
            { label: 'Control Tower', href: '/admin', icon: LayoutDashboard },
            { label: 'Corridor Object Manager', href: '/admin/core-pages/corridors', icon: Network },
            { label: 'Layer 9 Observation Intake', href: '/admin/core-pages/observations', icon: Radar },
        ],
    },
    { title: 'Public', items: [{ label: 'View Public Experience', href: '/find-the-right-service/countries', icon: Globe }] },
];

export function Pager<T>({ page }: { page: Paginated<T> }) {
    return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[0.75rem] text-ink-500">
            <span>Showing {page.from ?? 0} to {page.to ?? 0} of {page.total}</span>
            <span className="flex items-center gap-1">
                {page.links.map((l, i) => {
                    const label = l.label.includes('Previous') ? <ChevronLeft className="size-3.5" /> : l.label.includes('Next') ? <ChevronRight className="size-3.5" /> : l.label;
                    return (
                        <button key={i} type="button" disabled={!l.url} onClick={() => l.url && router.get(l.url, {}, { preserveState: true, preserveScroll: true })} aria-current={l.active ? 'page' : undefined} aria-label={typeof label === 'string' ? `Page ${label}` : l.label.includes('Previous') ? 'Previous page' : 'Next page'} className={cn('min-w-7 rounded-[4px] border px-1.5 py-1 disabled:opacity-40', l.active ? 'border-controlled-500 bg-controlled-500 text-white' : 'border-parchment-400 bg-white')}>
                            {label}
                        </button>
                    );
                })}
            </span>
        </div>
    );
}
