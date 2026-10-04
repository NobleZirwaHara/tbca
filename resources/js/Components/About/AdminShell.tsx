import type { ReactNode } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    Activity,
    Award,
    Briefcase,
    ClipboardCheck,
    FileClock,
    FileWarning,
    Inbox,
    LayoutDashboard,
    MessageSquareQuote,
    ShieldCheck,
} from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import { cn } from '@/lib/cn';

export const ABOUT_ADMIN_NAV: ConsoleNavGroup[] = [
    { title: 'About TBCA', items: [{ label: 'Overview', href: '/admin/about', icon: LayoutDashboard }] },
    {
        title: 'Trust registers',
        items: [
            { label: 'Claim Register', href: '/admin/about/claims', icon: ClipboardCheck },
            { label: 'Evidence & Expiry Monitor', href: '/admin/about/evidence', icon: FileClock },
            { label: 'Certification & Trade Mark Manager', href: '/admin/about/certifications', icon: Award },
            { label: 'Testimonial Manager', href: '/admin/about/testimonials', icon: MessageSquareQuote },
            { label: 'Correction Workflow', href: '/admin/about/corrections', icon: FileWarning },
        ],
    },
    {
        title: 'Operations',
        items: [
            { label: 'Careers & Applications', href: '/admin/about/careers', icon: Briefcase },
            { label: 'Cases & Whistleblowing', href: '/admin/about/cases', icon: Inbox },
            { label: 'System Status', href: '/admin/about/status', icon: Activity },
        ],
    },
];

export default function AdminShell({
    title,
    lead,
    description,
    actions,
    crumb,
    children,
}: {
    title: string;
    lead?: string;
    description?: string;
    actions?: ReactNode;
    crumb: string;
    children: ReactNode;
}) {
    return (
        <ConsoleLayout
            area="About TBCA"
            areaIcon={ShieldCheck}
            groups={ABOUT_ADMIN_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'About TBCA', href: '/admin/about' }, { label: crumb }]}
            title={<span className="font-serif">{title}</span>}
            description={
                <>
                    {lead && <span className="block font-serif text-gold-700">{lead}</span>}
                    {description}
                </>
            }
            actions={actions}
        >
            <Head title={title} />
            {children}
        </ConsoleLayout>
    );
}

/** Donut chart for status overviews (pure SVG). */
export function Donut({ segments, total, label = 'Total' }: { segments: { label: string; value: number; color: string }[]; total: number; label?: string }) {
    const sum = segments.reduce((a, s) => a + s.value, 0) || 1;
    let acc = 0;
    const r = 15.9155;

    return (
        <div className="flex items-center gap-4">
            <div className="relative size-28 shrink-0">
                <svg viewBox="0 0 42 42" className="size-full -rotate-90" aria-hidden="true">
                    <circle cx="21" cy="21" r={r} fill="none" stroke="#ece6d8" strokeWidth="6" />
                    {segments.map((s) => {
                        const pct = (s.value / sum) * 100;
                        const el = <circle key={s.label} cx="21" cy="21" r={r} fill="none" stroke={s.color} strokeWidth="6" strokeDasharray={`${pct} ${100 - pct}`} strokeDashoffset={-acc} />;
                        acc += pct;
                        return el;
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-xl font-bold text-ink-900">{total}</span>
                    <span className="text-[0.625rem] text-ink-500">{label}</span>
                </div>
            </div>
            <ul className="space-y-1 text-xs">
                {segments.map((s) => (
                    <li key={s.label} className="flex items-center gap-2">
                        <span className="size-2.5 rounded-full" style={{ background: s.color }} aria-hidden="true" />
                        <span className="text-ink-700">
                            {s.label} ({Math.round((s.value / sum) * 1000) / 10}%)
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    links: { url: string | null; label: string; active: boolean }[];
}

export function Pager<T>({ page, noun }: { page: Paginated<T>; noun: string }) {
    if (page.total === 0) return null;
    return (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-500">
            <span>
                Showing {page.from} to {page.to} of {page.total} {noun}
            </span>
            {page.last_page > 1 && (
                <nav className="flex gap-1" aria-label="Pagination">
                    {page.links.map((l, i) => (
                        <button
                            key={i}
                            type="button"
                            disabled={!l.url}
                            onClick={() => l.url && router.get(l.url, {}, { preserveScroll: true, preserveState: true })}
                            className={cn('min-w-8 rounded border px-2 py-1', l.active ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-400 bg-white text-ink-600 disabled:opacity-40')}
                            dangerouslySetInnerHTML={{ __html: l.label }}
                        />
                    ))}
                </nav>
            )}
        </div>
    );
}

/** Filter helper: GET the current console with merged query params. */
export function useFilters(path: string, filters: Record<string, string | undefined>) {
    return (patch: Record<string, string | undefined>) => router.get(path, { ...filters, ...patch }, { preserveState: true, preserveScroll: true, replace: true });
}

export function ExportLink({ href, label = 'Export Register' }: { href: string; label?: string }) {
    return (
        <a href={href} className="inline-flex h-9 items-center gap-2 rounded-[4px] border border-gold-500 bg-white px-3.5 text-[0.8125rem] font-semibold text-gold-800 hover:bg-gold-50">
            {label} ↓
        </a>
    );
}

export function SmallLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="text-xs font-semibold text-gold-700 hover:underline">
            {children}
        </Link>
    );
}
