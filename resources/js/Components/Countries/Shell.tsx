import { Head, Link, router, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as L from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { Country, CountryBrief } from '@/types/countries';
import { Flag, Kpi, StateBadge } from './ui';

export const PLANNERS: [string, string][] = [
    ['readiness', 'Market Entry Readiness'],
    ['landing', 'Country Landing Plan'],
    ['localisation', 'Localisation Planner'],
    ['payments', 'Payment Localisation Planner'],
    ['language-pack', 'Language Pack Builder'],
    ['compliance', 'Country Compliance Planner'],
    ['launch', 'Country Launch Readiness'],
    ['evidence-audit', 'Country Evidence Audit'],
    ['exit', 'Country Exit and Deregistration'],
    ['diaspora', 'Diaspora & Inbound Capital'],
];

function profileLinks(slug: string): [string, string, L.LucideIcon][] {
    return [
        ['Overview', `/countries/${slug}`, L.LayoutDashboard],
        ['Availability', `/countries/${slug}/availability`, L.CircleCheck],
        ['Evidence Panel', `/countries/${slug}/evidence`, L.ShieldCheck],
        ['Context Resolver', `/countries/${slug}/resolver`, L.Gauge],
        ['Tax & Statutory', `/countries/${slug}/tax`, L.Receipt],
        ['Payments', `/countries/${slug}/payments`, L.Wallet],
        ['Languages', `/countries/${slug}/languages`, L.Languages],
        ['Partners', `/countries/${slug}/partners`, L.Users],
        ['Legal & Regulatory', `/countries/${slug}/legal`, L.Scale],
        ['Privacy & Data', `/countries/${slug}/privacy`, L.Lock],
        ['Limitations', `/countries/${slug}/limitations`, L.CircleAlert],
        ['Change History', `/countries/${slug}/registers/history`, L.History],
    ];
}

function NavList({ title, links }: { title: string; links: [string, string, L.LucideIcon?][] }) {
    const { url } = usePage<SharedProps>().props as unknown as { url: { path: string } };
    return (
        <div>
            <p className="mb-2 text-[0.6875rem] font-bold tracking-wide text-ink-500 uppercase">{title}</p>
            <ul className="space-y-0.5">
                {links.map(([label, href, Icon]) => {
                    const active = url?.path === href;
                    const I = Icon ?? L.ChevronRight;
                    return (
                        <li key={href}>
                            <Link href={href} className={cn('flex items-center gap-2 rounded-[4px] px-2 py-1.5 text-[0.8125rem]', active ? 'bg-gold-50 font-semibold text-gold-800 ring-1 ring-gold-400/50' : 'text-ink-600 hover:bg-parchment-200 hover:text-ink-900')} aria-current={active ? 'page' : undefined}>
                                <I className="size-4 shrink-0" aria-hidden="true" />
                                {label}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export function CountrySidebar({ country, mode = 'profile', engagement }: { country: Pick<Country, 'slug' | 'name' | 'iso2' | 'bucket' | 'state_label' | 'programme_status'>; mode?: 'profile' | 'planning' | 'workspace'; engagement?: string }) {
    const slug = country.slug;
    return (
        <nav className="space-y-6" aria-label="Country navigation">
            {mode !== 'workspace' && <NavList title="Country Profile & Evidence" links={profileLinks(slug)} />}
            {mode !== 'profile' && (
                <NavList
                    title={mode === 'workspace' ? 'Country Journey' : 'Market Entry Journey'}
                    links={[...PLANNERS.map(([k, l]) => [l, `/countries/${slug}/plan/${k}`] as [string, string]), ['Country Quote Request', `/countries/${slug}/quote`], ['Waitlist & Unmet Demand', `/countries/${slug}/waitlist`]]}
                />
            )}
            {mode === 'workspace' && engagement && (
                <NavList
                    title="My Workspace"
                    links={[
                        ['Client Workspace', `/countries/workspace/${engagement}`, L.LayoutDashboard],
                        ['Engagement Letter', `/countries/workspace/${engagement}/letter`, L.FileText],
                        ['Deliverables & Evidence', `/countries/workspace/${engagement}/deliverables`, L.FolderCheck],
                        ['Change & Re-resolution', `/countries/workspace/${engagement}/change`, L.GitPullRequest],
                        ['Closure & Next Route', `/countries/workspace/${engagement}/closure`, L.Flag],
                    ]}
                />
            )}
            <div className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-3">
                <p className="text-[0.6875rem] font-bold tracking-wide text-ink-500 uppercase">Country State</p>
                <div className="mt-2">
                    <StateBadge bucket={country.bucket} label={country.state_label} />
                </div>
                <p className="mt-2 text-xs text-ink-500">{country.bucket === 'activated' ? 'Commercial objects with valid resolver and permission scope.' : 'Country object exists; no transaction until activation.'}</p>
                <Link href={`/countries/${slug}/registers/history`} className="mt-2 inline-block text-xs font-semibold text-gold-700 hover:underline">
                    View Audit Log →
                </Link>
            </div>
            <div className="space-y-2 text-xs">
                <Link href="/countries/south-africa" className="flex items-center gap-2 rounded-[6px] border border-parchment-400 bg-white p-2.5 hover:border-gold-500">
                    <Flag iso="ZA" className="text-lg" /> <span><b>Africa Market (Active)</b><br />South Africa: controlled environment</span>
                </Link>
                <Link href="/countries/explorer" className="flex items-center gap-2 rounded-[6px] border border-parchment-400 bg-white p-2.5 hover:border-gold-500">
                    <L.Globe className="size-5 text-ink-500" /> <span><b>54 African Countries</b><br />53 shell objects (not active)</span>
                </Link>
            </div>
        </nav>
    );
}

/**
 * Countries page frame: dark canvas with a light work surface, optional left
 * country sidebar and right rail (as in the CT mockups).
 */
export function Frame({
    title,
    lead,
    crumbs,
    chip,
    actions,
    sidebar,
    right,
    children,
    headTitle,
}: {
    title: ReactNode;
    lead?: ReactNode;
    crumbs?: Crumb[];
    chip?: ReactNode;
    actions?: ReactNode;
    sidebar?: ReactNode;
    right?: ReactNode;
    children: ReactNode;
    headTitle?: string;
}) {
    return (
        <div className="bg-ink-950 px-2 py-4 sm:px-4 sm:py-6">
            <Head title={headTitle ?? (typeof title === 'string' ? title : 'Countries')} />
            <div className="mx-auto max-w-[1500px] rounded-[12px] bg-parchment-100 p-4 sm:p-6">
                <div className={cn('grid gap-6', sidebar && right ? 'xl:grid-cols-[220px_minmax(0,1fr)_300px]' : sidebar ? 'lg:grid-cols-[220px_minmax(0,1fr)]' : right ? 'xl:grid-cols-[minmax(0,1fr)_300px]' : '')}>
                    {sidebar && <aside className="hidden lg:block">{sidebar}</aside>}
                    <div className="min-w-0 space-y-5">
                        <div>
                            {crumbs && <Breadcrumbs items={crumbs} />}
                            <div className="-mt-3 flex flex-wrap items-start justify-between gap-3">
                                <div className="min-w-0">
                                    <h1 className="flex flex-wrap items-center gap-3 text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
                                        {title} {chip}
                                    </h1>
                                    {lead && <p className="mt-1 max-w-3xl text-sm text-ink-600">{lead}</p>}
                                </div>
                                {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                            </div>
                        </div>
                        {children}
                    </div>
                    {right && <aside className="space-y-4">{right}</aside>}
                </div>
            </div>
        </div>
    );
}

export function CountryHeader({ country, kpis, compact }: { country: Country; kpis?: { label: string; value: ReactNode; caption?: ReactNode; icon?: string; tone?: 'good' | 'warn' | 'bad' | 'gold' }[]; compact?: boolean }) {
    return (
        <div className={cn('grid gap-3', kpis && kpis.length ? 'md:grid-cols-[minmax(0,1.3fr)_minmax(0,3fr)]' : '')}>
            <div className="flex items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-3.5">
                <Flag iso={country.iso2} className={compact ? 'text-3xl' : 'text-4xl'} />
                <div className="min-w-0">
                    <p className="text-lg font-bold text-ink-900">{country.name}</p>
                    <p className="text-xs text-ink-500">{country.programme_status}</p>
                    <StateBadge bucket={country.bucket} label={country.state_label} className="mt-1" />
                </div>
            </div>
            {kpis && kpis.length > 0 && (
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    {kpis.map((k) => (
                        <Kpi key={k.label} {...k} />
                    ))}
                </div>
            )}
        </div>
    );
}

/** Sets the platform country context (shared ContextController) and opens the country hub. */
export function CountrySelector({ countries, current, dark }: { countries: CountryBrief[]; current?: string; dark?: boolean }) {
    const { context } = usePage<SharedProps>().props;
    const selected = current ?? context.country;
    return (
        <label className={cn('block text-xs font-medium', dark ? 'text-ink-300' : 'text-ink-500')}>
            Platform country context
            <select
                className={cn('mt-1 h-10 w-full rounded-[4px] border px-2 text-sm focus:ring-2 focus:ring-gold-500/30 focus:outline-none', dark ? 'border-ink-600 bg-ink-900 text-parchment-100' : 'border-parchment-500 bg-white text-ink-900')}
                value={selected}
                onChange={(e) => {
                    const c = countries.find((x) => x.iso2 === e.target.value);
                    if (!c) return;
                    router.post('/context', { country: c.iso2 }, { preserveScroll: true, onSuccess: () => router.visit(`/countries/${c.slug}`) });
                }}
            >
                {countries.map((c) => (
                    <option key={c.iso2} value={c.iso2}>
                        {c.name} — {c.state_label}
                    </option>
                ))}
            </select>
        </label>
    );
}

/* ------------------------------------------------------------------ admin */
export const ADMIN_NAV: ConsoleNavGroup[] = [
    { title: 'Administration', items: [
        { label: 'Control Tower', href: '/admin/countries', icon: L.LayoutGrid },
        { label: 'Country Object Manager', href: '/admin/countries/objects', icon: L.Globe },
        { label: 'Resolver Console', href: '/admin/countries/resolver', icon: L.Gauge },
        { label: 'Availability State Manager', href: '/admin/countries/states', icon: L.ToggleRight },
        { label: 'Engagements & Letters', href: '/admin/countries/engagements', icon: L.FileText },
    ] },
    { title: 'Rules & Registers', items: [
        { label: 'Tax & Statutory', href: '/admin/countries/metrics/tax', icon: L.Receipt },
        { label: 'Payment & Liquidity', href: '/admin/countries/metrics/payments', icon: L.Wallet },
        { label: 'Licence & Permission', href: '/admin/countries/metrics/licences', icon: L.FileBadge },
        { label: 'Partner Capacity', href: '/admin/countries/metrics/partners', icon: L.Users },
    ] },
    { title: 'Decisions', items: [
        { label: 'Unmet Demand & Bias', href: '/admin/countries/demand', icon: L.Scale },
        { label: 'Activation Investment', href: '/admin/countries/investment', icon: L.TrendingUp },
        { label: 'Corridor Object Manager', href: '/admin/countries/corridors', icon: L.Route },
        { label: 'Corridor Pair Resolver', href: '/admin/countries/pairs', icon: L.ArrowLeftRight },
        { label: 'Corridor Economics', href: '/admin/countries/economics', icon: L.Calculator },
    ] },
    { title: 'Layer 9 & Evidence', items: [
        { label: 'Observation Intake', href: '/admin/countries/observations', icon: L.Inbox },
        { label: 'Promotion & Anonymity', href: '/admin/countries/promotion', icon: L.ShieldCheck },
        { label: 'Retraction & Cascade', href: '/admin/countries/retractions', icon: L.Undo2 },
    ] },
    { title: 'AI Agents & Release', items: [
        { label: 'Country Analyst Agent', href: '/admin/countries/agents/country', icon: L.Bot },
        { label: 'Corridor Agent', href: '/admin/countries/agents/corridor', icon: L.Bot },
        { label: 'Honest Absence Agent', href: '/admin/countries/agents/absence', icon: L.Bot },
        { label: 'Release & UAT Tower', href: '/admin/countries/releases', icon: L.Rocket },
        { label: 'View Public Experience', href: '/countries', icon: L.ExternalLink },
    ] },
];

export function AdminShell({ title, description, badge, actions, children }: { title: string; description?: string; badge?: ReactNode; actions?: ReactNode; children: ReactNode }) {
    return (
        <ConsoleLayout area="Countries Administration" areaIcon={L.Globe} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Countries', href: '/admin/countries' }, { label: title }]} title={title} badge={badge} description={description} actions={actions}>
            <Head title={title} />
            <div className="space-y-5">
                <p className="text-xs text-ink-500">Data as at: {new Date().toLocaleString('en-ZA', { dateStyle: 'medium', timeStyle: 'short' })} SAST</p>
                {children}
            </div>
        </ConsoleLayout>
    );
}
