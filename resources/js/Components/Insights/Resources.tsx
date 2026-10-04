import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import { BarChart3, Bot, Clock, Coins, FileStack, FileText, Gauge, LayoutList, Lock, MessagesSquare, RefreshCw, ShieldCheck, Users, Hourglass } from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';
import type { ResourceCard as RC, WebinarCard } from '@/types/insights';
import { AccessChip, Chip, CurrentnessChip, DynIcon, TrustStrip, label, zar } from './Shared';

/** Light public frame for Resources pages with breadcrumb and trust strip. */
export function ResourceFrame({ title, crumbs, children, wide }: { title: string; crumbs: Crumb[]; children: ReactNode; wide?: boolean }) {
    return (
        <>
            <Head title={title} />
            <div className="bg-parchment-100">
                <div className={cn('container-tbca py-6 md:py-8', wide && 'max-w-none')}>
                    <Breadcrumbs items={crumbs} />
                    {children}
                </div>
            </div>
            <TrustStrip variant="resources" />
        </>
    );
}

export function PageTitle({ title, intro, children }: { title: string; intro?: ReactNode; children?: ReactNode }) {
    return (
        <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-2xl">
                <h1 className="font-serif text-3xl font-bold text-ink-900 sm:text-[2.25rem]">{title}</h1>
                {intro && <div className="mt-2 text-sm text-ink-600">{intro}</div>}
            </div>
            {children}
        </div>
    );
}

/** The three trust chips shown at the top of catalogue pages. */
export function TrustChips({ items }: { items?: [string, string][] }) {
    const list = items ?? [
        ['Source-controlled content', 'All items show source and review dates.'],
        ['Currentness managed', 'Items are regularly reviewed and updated.'],
        ['Human review where required', 'Qualified review for high-risk and professional content.'],
    ];
    const icons = [FileText, RefreshCw, Users];
    return (
        <ul className="grid gap-2 sm:grid-cols-3">
            {list.map(([t, s], i) => {
                const I = icons[i];
                return (
                    <li key={t} className="flex items-start gap-2 rounded-[8px] border border-gold-200 bg-white p-3">
                        <I className="mt-0.5 size-5 shrink-0 text-gold-700" />
                        <span><strong className="block text-xs text-ink-900">{t}</strong><span className="text-[0.6875rem] text-ink-500">{s}</span></span>
                    </li>
                );
            })}
        </ul>
    );
}

const TYPE_ICON: Record<string, string> = { guide: 'file', report: 'chart', template: 'layers', toolkit: 'package', checklist: 'clipboard-check', calculator: 'calculator', dashboard: 'pie-chart', scorecard: 'chart', 'sop-pack': 'layers', register: 'clipboard-check', playbook: 'route', insight: 'trending-up', commentary: 'megaphone', viewpoint: 'search', article: 'file', 'case-study': 'trending-up', reference: 'file' };

/** Price / access line under a card. */
export function PriceLine({ r }: { r: RC }) {
    if (r.access === 'paid') {
        return (
            <span className="text-xs font-semibold text-ink-900">
                {r.listPriceZar && <s className="mr-1 font-normal text-ink-400">{zar(r.listPriceZar)}</s>}
                {zar(r.priceZar)}
            </span>
        );
    }
    if (r.access === 'subscription') return <span className="text-xs font-semibold text-purple-700">Subscription</span>;
    if (r.access === 'restricted') return <span className="text-xs text-ink-500">Authorised users only</span>;
    return <span className="text-xs font-semibold text-verified-700">R0 {r.access === 'gated' ? 'Gated' : 'Free'}</span>;
}

export function ResourceCard({ r, cta = 'View Resource', compact }: { r: RC; cta?: string; compact?: boolean }) {
    return (
        <article className="flex h-full flex-col rounded-[8px] border border-gold-200 bg-white p-4 transition-colors hover:border-gold-400">
            <div className="flex flex-wrap items-center gap-1.5">
                <Chip tone="dark">{label(r.type)}</Chip>
                {r.access !== 'free' && <AccessChip label={r.accessLabel} />}
                <span className="ml-auto"><CurrentnessChip value={r.currentness} /></span>
            </div>
            <h3 className="mt-3 font-serif text-[1.0625rem] leading-snug font-semibold text-ink-900">
                <Link href={r.url} className="hover:text-gold-700">{r.title}</Link>
            </h3>
            <p className={cn('mt-1 text-xs text-ink-600', compact ? 'line-clamp-2' : 'line-clamp-3')}>{r.summary}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-[0.6875rem] text-ink-500">
                <span className="flex items-center gap-1"><DynIcon name={TYPE_ICON[r.type]} className="size-3.5" />{r.format}</span>
                {r.minutes && <span className="flex items-center gap-1"><Clock className="size-3.5" />{r.minutes} min{r.type === 'guide' || r.type === 'insight' ? ' read' : ''}</span>}
                {r.pages && <span>{r.pages} pages</span>}
                <PriceLine r={r} />
            </div>
            {!compact && (
                <p className="mt-2 text-[0.6875rem] text-ink-500">
                    Source: {r.source}
                    <br />
                    {r.currentness === 'review_due' ? `Next Review: ${r.nextReviewAt}` : r.access === 'restricted' ? 'Access: Authorised users only' : `Reviewed: ${r.reviewedAt}`}
                </p>
            )}
            <Link href={r.url} className="mt-auto block rounded-[4px] border border-gold-400 py-1.5 text-center text-xs font-semibold text-gold-800 hover:bg-gold-50" style={{ marginTop: '0.75rem' }}>
                {cta} →
            </Link>
        </article>
    );
}

export function WebinarArt({ w, className }: { w: WebinarCard; className?: string }) {
    return (
        <div className={cn('flex flex-col justify-between rounded-[6px] bg-ink-950 p-3 text-parchment-100', className)}>
            <div className="flex items-start justify-between gap-2">
                <Chip tone={w.upcoming ? 'green' : 'blue'}>{w.upcoming ? 'Upcoming Live' : 'On-Demand'}</Chip>
            </div>
            <div className="mt-2 flex items-center gap-3">
                <DynIcon name={w.icon} className="size-10 shrink-0 text-gold-400" />
                <div><p className="font-serif text-base leading-tight font-semibold">{w.title}</p><p className="text-[0.6875rem] text-ink-300">{w.tagline}</p></div>
            </div>
            <p className="mt-2 text-[0.6875rem] text-ink-200">{w.upcoming ? `${w.date} · ${w.time}` : `${w.durationMinutes} min`}</p>
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* Admin shell                                                         */
/* ------------------------------------------------------------------ */
const NAV: ConsoleNavGroup[] = [
    { title: 'Admin Console', items: [{ label: 'Overview', href: '/admin/insights/resources', icon: Gauge }] },
    {
        title: 'Content Governance',
        items: [
            { label: 'Content Record Manager', href: '/admin/insights/resources/records', icon: FileStack },
            { label: 'Lifecycle Console', href: '/admin/insights/resources/lifecycle', icon: LayoutList },
            { label: 'Decay & Review Dashboard', href: '/admin/insights/resources/decay', icon: Hourglass },
            { label: 'Protected Catalogue', href: '/admin/insights/resources/protected', icon: Lock },
        ],
    },
    {
        title: 'Privacy, AI & Performance',
        items: [
            { label: 'Consent Register', href: '/admin/insights/resources/consents', icon: ShieldCheck },
            { label: 'ROI Dashboard', href: '/admin/insights/resources/roi', icon: Coins },
            { label: 'AI Output Register', href: '/admin/insights/resources/ai-outputs', icon: Bot },
            { label: 'WhatsApp Delivery', href: '/admin/insights/resources/whatsapp', icon: MessagesSquare },
        ],
    },
    { title: 'Industries Console', items: [{ label: 'Industries Governance', href: '/admin/insights/industries', icon: BarChart3 }] },
];

export function ResourceAdmin({ title, badge, description, actions, children }: { title: string; badge?: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
    return (
        <ConsoleLayout
            area="Resources Governance"
            areaIcon={FileStack}
            groups={NAV}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin' }, { label: 'Resources', href: '/admin/insights/resources' }, { label: title }]}
            title={title}
            badge={badge ? <span className="rounded-full border border-verified-500/30 bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">{badge}</span> : undefined}
            description={description}
            actions={actions}
        >
            <Head title={`${title} | Resources Admin`} />
            {children}
        </ConsoleLayout>
    );
}

/** Small nav for signed-in resource account pages. */
export function AccountNav({ active }: { active: 'library' | 'subscription' | 'handoff' | 'preferences' }) {
    const items = [['library', 'My Entitlement Library', '/resources/account/library'], ['subscription', 'Subscription', '/resources/account/subscription'], ['handoff', 'Service Handoff', '/resources/account/handoff'], ['preferences', 'Preferences & Consent', '/resources/preferences']] as const;
    return (
        <nav aria-label="Resource account" className="mb-5 flex gap-2 overflow-x-auto">
            {items.map(([k, l, h]) => <Link key={k} href={h} className={cn('rounded-full border px-3 py-1 text-xs whitespace-nowrap', active === k ? 'border-gold-500 bg-gold-50 font-semibold text-gold-800' : 'border-parchment-500 bg-white text-ink-600')}>{l}</Link>)}
        </nav>
    );
}
