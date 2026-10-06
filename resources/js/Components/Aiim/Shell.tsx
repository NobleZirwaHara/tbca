import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowRight, Award, BadgeCheck, ChevronRight, Coins, Globe2, ShieldCheck, Sparkles } from 'lucide-react';
import type { ReactNode } from 'react';
import { ButtonLink } from '@/Components/ui/Button';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { AiimPageProps } from '@/types/aiim';
import { SyntheticNotice } from './Chips';

export const AIIM_NAV: [string, string][] = [
    ['Map View', '/aiim#explore-africa'], ['Opportunities', '/aiim/opportunities'], ['Projects', '/aiim/projects'],
    ['Investors', '/aiim/investors'], ['Funders', '/aiim/funders'], ['Trade Corridors', '/aiim/corridors'],
    ['Risk & Outlook', '/aiim/risk'], ['Sources & Evidence', '/aiim/sources/IMF-WEO-2025-04'], ['Premium Briefs', '/aiim/store'], ['My Workspace', '/aiim/workspace'],
];

export function SubNav() {
    const { url } = usePage<SharedProps>().props;
    const path = url.path;
    const active = (href: string) => {
        if (href === '/aiim#explore-africa') return path.startsWith('/aiim/country') || path.startsWith('/aiim/province') || path.startsWith('/aiim/sector');
        if (href.startsWith('/aiim/sources')) return path.startsWith('/aiim/sources');
        if (href === '/aiim/workspace') return path.startsWith('/aiim/workspace') || path.startsWith('/aiim/wallet') || path.startsWith('/aiim/fees') || path.startsWith('/aiim/checkout');
        return path.startsWith(href);
    };
    return (
        <nav aria-label="AIIM sections" className="border-b border-ink-800 bg-ink-950">
            <div className="container-tbca flex gap-1 overflow-x-auto">
                {AIIM_NAV.map(([label, href]) => (
                    <Link key={href} href={href} className={cn('shrink-0 border-b-2 px-3 py-2.5 text-[0.8125rem] font-medium whitespace-nowrap transition-colors', active(href) ? 'border-gold-500 text-gold-400' : 'border-transparent text-ink-300 hover:text-parchment-100')}>
                        {label}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

export function Ribbon() {
    const chips: [ReactNode, string][] = [
        [<span key="za" className="text-xs">🌍</span>, 'Africa Market (Active)'],
        [<Globe2 key="g" className="size-3.5" />, '54 African Country Cockpits'],
        [<Sparkles key="s" className="size-3.5" />, 'AI & Human Reviewed Intelligence'],
        [<BadgeCheck key="b" className="size-3.5" />, 'Source Verified & Confidence Rated'],
        [<Coins key="c" className="size-3.5" />, 'ZAR (USD) Pricing'],
        [<Award key="a" className="size-3.5" />, 'ISO 27001 Aligned'],
        [<ShieldCheck key="p" className="size-3.5" />, 'POPIA Compliant'],
    ];
    return (
        <div className="border-t border-ink-800 bg-ink-950 py-3">
            <ul className="container-tbca flex flex-wrap gap-2">
                {chips.map(([icon, label]) => (
                    <li key={label} className="inline-flex items-center gap-1.5 rounded-full border border-ink-700 px-3 py-1 text-[0.6875rem] text-ink-200">
                        <span className="text-gold-500">{icon}</span>
                        {label}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function RailBox({ title, children, action }: { title: string; children: ReactNode; action?: ReactNode }) {
    return (
        <section className="rounded-[8px] border border-gold-700/40 bg-ink-900 p-4 text-parchment-100">
            <header className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{title}</h2>
                {action}
            </header>
            {children}
        </section>
    );
}

export function SelectionBox() {
    const { selection } = usePage<AiimPageProps>().props;
    if (!selection) return null;
    const rows: [string, string | null][] = [['Country', selection.country], ['Province', selection.province], ['Sector', selection.sector], ['Item', selection.item], ['Context', selection.context]];
    return (
        <RailBox
            title="Your Selection"
            action={
                <button type="button" onClick={() => router.post('/aiim/selection/clear', {}, { preserveScroll: true })} className="text-xs text-gold-400 underline hover:text-gold-300">
                    Clear All
                </button>
            }
        >
            <dl className="space-y-2 text-xs">
                {rows.map(([k, v]) => (
                    <div key={k}>
                        <dt className="text-ink-400">{k}</dt>
                        <dd className="font-medium text-parchment-100">{v ?? '—'}</dd>
                    </div>
                ))}
            </dl>
        </RailBox>
    );
}

export function DeeperBox({ title = 'Need Deeper Intelligence?', text = 'Upgrade to Premium to unlock detailed reports, financial models, due diligence data and expert insights.' }: { title?: string; text?: string }) {
    return (
        <RailBox title={title}>
            <p className="mb-3 text-xs text-ink-300">{text}</p>
            <div className="space-y-2">
                <ButtonLink href="/aiim/store" size="sm" className="w-full">Upgrade to Premium</ButtonLink>
                <ButtonLink href="/aiim/workspace/advisor-request" size="sm" variant="outline-light" className="w-full" trailingIcon="arrow-right">Speak to an Advisor</ButtonLink>
            </div>
        </RailBox>
    );
}

export interface Crumb {
    label: string;
    href?: string;
}

/**
 * Body of every public AIIM page: sub-navigation, breadcrumbs and title, the
 * page content with the dark right rail, and the trust ribbon.
 */
export default function AiimPage({
    title,
    heading,
    crumbs = [],
    subtitle,
    description,
    actions,
    rail,
    quick,
    children,
    notice = true,
    accent = 'gold',
    badge,
    tone = 'light',
}: {
    title: string;
    heading?: ReactNode;
    crumbs?: Crumb[];
    subtitle?: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
    rail?: ReactNode | false;
    quick?: ReactNode;
    children: ReactNode;
    notice?: boolean | ReactNode;
    accent?: 'gold' | 'purple' | 'green';
    badge?: ReactNode;
    tone?: 'light' | 'dark';
}) {
    const accentClass = { gold: 'text-gold-700', purple: 'text-referenced-700', green: 'text-verified-700' }[accent];
    const dark = tone === 'dark';
    return (
        <>
            <Head title={`${title} | AIIM`} />
            <SubNav />
            <div className={cn(dark ? 'bg-ink-950 text-parchment-100' : 'bg-parchment-100')}>
                <div className={cn('container-tbca grid gap-6 py-6', rail !== false && 'xl:grid-cols-[minmax(0,1fr)_17rem]')}>
                    <div className="min-w-0">
                        <nav aria-label="Breadcrumb" className="mb-2">
                            <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-400">
                                {[{ label: 'AIIM', href: '/aiim' }, ...crumbs].map((c, i, all) => (
                                    <li key={`${c.label}-${i}`} className="flex items-center gap-1">
                                        {c.href && i < all.length - 1 ? <Link href={c.href} className="hover:text-gold-600">{c.label}</Link> : <span className={i === all.length - 1 ? 'text-risk-500' : ''}>{c.label}</span>}
                                        {i < all.length - 1 && <ChevronRight className="size-3" aria-hidden="true" />}
                                    </li>
                                ))}
                            </ol>
                        </nav>
                        <header className="mb-5 flex flex-wrap items-start justify-between gap-4">
                            <div className="min-w-0 max-w-3xl">
                                <h1 className={cn('flex flex-wrap items-center gap-2 text-[1.75rem] leading-tight font-bold tracking-tight sm:text-[2.125rem]', dark ? 'text-parchment-100' : 'text-ink-900')}>{heading ?? title}</h1>
                                {subtitle && <p className={cn('mt-1 text-[0.9375rem] font-semibold', dark ? 'text-gold-400' : accentClass)}>{subtitle}</p>}
                                {description && <p className={cn('mt-1 text-sm', dark ? 'text-ink-200' : 'text-ink-600')}>{description}</p>}
                            </div>
                            <div className="flex flex-wrap items-start gap-3">
                                {actions}
                                {badge}
                                {notice === true ? <SyntheticNotice className="max-w-xs" /> : notice || null}
                            </div>
                        </header>
                        {children}
                    </div>
                    {rail !== false && (
                        <aside className="space-y-4" aria-label="AIIM side panel">
                            {rail ?? (
                                <>
                                    <SelectionBox />
                                    {quick && <RailBox title="Quick Actions"><div className="space-y-0.5">{quick}</div></RailBox>}
                                    <DeeperBox />
                                </>
                            )}
                        </aside>
                    )}
                </div>
            </div>
            <Ribbon />
        </>
    );
}

export function CtaBand({ title, text, primary = { label: 'Speak to an Advisor', href: '/aiim/workspace/advisor-request' }, secondary = { label: 'Book Discovery Call', href: '/aiim/workspace/advisor-request' } }: { title: string; text: string; primary?: { label: string; href: string }; secondary?: { label: string; href: string } }) {
    return (
        <section className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-gold-700/40 bg-ink-900 px-6 py-5">
            <div>
                <h2 className="text-lg font-semibold text-parchment-100">{title}</h2>
                <p className="text-sm text-ink-300">{text}</p>
            </div>
            <div className="flex flex-wrap gap-3">
                <ButtonLink href={primary.href} trailingIcon="arrow-right">{primary.label}</ButtonLink>
                <ButtonLink href={secondary.href} variant="outline-light">{secondary.label}</ButtonLink>
            </div>
        </section>
    );
}

export function SectionCard({ title, children, action, className, dark = false, number }: { title?: ReactNode; children: ReactNode; action?: ReactNode; className?: string; dark?: boolean; number?: number }) {
    return (
        <section className={cn('rounded-[8px] border p-4', dark ? 'border-ink-700 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white', className)}>
            {(title || action) && (
                <header className="mb-3 flex items-center justify-between gap-2">
                    <h2 className={cn('text-sm font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>
                        {number !== undefined && <span className="mr-1 text-gold-600">{number}.</span>}
                        {title}
                    </h2>
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function MoreLink({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:text-gold-600">
            {children} <ArrowRight className="size-3.5" />
        </Link>
    );
}
