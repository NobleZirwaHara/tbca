import { useMemo, useState, type ReactNode } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    Activity, AlertTriangle, BarChart3, Ban, Calendar, ChevronDown, ClipboardCheck, Copy, FileCheck2, FileText, Gauge, GitBranch, Handshake, Headphones,
    LayoutDashboard, Layers, ListChecks, Lock, MessageCircle, MessagesSquare, PenLine, Phone, Receipt, Scale, Search, ShieldAlert, ShieldCheck, SplitSquareHorizontal, UserCheck, Users, X,
} from 'lucide-react';
import ConsoleLayout, { type ConsoleNavGroup } from '@/Layouts/ConsoleLayout';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { Modal } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';
import type { EngagementContext, IndustryContextValue, IndustryOption, WorkspaceBase } from '@/types/insights';
import { Box, DynIcon, TrustStrip } from './Shared';

/* ------------------------------------------------------------------ */
/* Public sub-navigation                                               */
/* ------------------------------------------------------------------ */
export function IndustriesSubNav() {
    const { url } = usePage<SharedProps>().props;
    const p = url.path;
    const items = [
        ['Industries Home', '/industries', p === '/industries'],
        ['Industry Selection', '/industries/select', p.startsWith('/industries/select')],
        ['Diagnostics', '/industries/diagnostics', p.endsWith('/diagnostic')],
        ['Sector Intelligence', '/industries/sector-intelligence', p.startsWith('/industries/sector-intelligence')],
        ['Benchmarks', '/industries/benchmarks', p.endsWith('/benchmarks')],
        ['Partners', '/industries/partners', p.endsWith('/partners')],
        ['Client Workspace', '/industries/workspace', p.startsWith('/industries/workspace')],
    ] as const;
    return (
        <nav aria-label="Industries" className="border-b border-ink-800 bg-ink-950">
            <ul className="container-tbca flex gap-1 overflow-x-auto">
                {items.map(([l, href, active]) => (
                    <li key={href}>
                        <Link href={href} className={cn('block border-b-2 px-3 py-2.5 text-[0.8125rem] whitespace-nowrap', active ? 'border-gold-500 text-gold-400' : 'border-transparent text-ink-200 hover:text-parchment-100')}>
                            {l}
                        </Link>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

/** Public Industries page frame: sub-nav, light body with optional right sidebar, trust strip. */
export function IndustryFrame({ title, crumbs, sidebar, children }: { title: string; crumbs: Crumb[]; sidebar?: ReactNode; children: ReactNode }) {
    return (
        <>
            <Head title={title} />
            <IndustriesSubNav />
            <div className="bg-parchment-100">
                <div className="container-tbca grid gap-6 py-6 lg:grid-cols-[1fr_300px]">
                    <div className="min-w-0">
                        <Breadcrumbs items={crumbs} />
                        {children}
                    </div>
                    {sidebar && <aside className="space-y-4">{sidebar}</aside>}
                </div>
            </div>
            <TrustStrip variant="industries" />
        </>
    );
}

/** Row of status chips (Industry Mode, Catalogue State, Complexity Class ...). */
export function StatusChips({ items, whatsapp = true }: { items: { label: string; value: ReactNode; icon?: ReactNode }[]; whatsapp?: boolean }) {
    return (
        <div className="flex flex-wrap items-stretch gap-2 rounded-[8px] border border-parchment-400 bg-white p-2.5">
            {items.map((i) => (
                <div key={i.label} className="flex min-w-[7rem] items-center gap-2 px-2">
                    {i.icon && <span className="text-ink-500">{i.icon}</span>}
                    <span>
                        <span className="block text-[0.6875rem] font-semibold text-ink-800">{i.label}</span>
                        <span className="block text-[0.6875rem] text-ink-500">{i.value}</span>
                    </span>
                </div>
            ))}
            {whatsapp && (
                <a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="ml-auto flex items-center gap-1.5 self-center rounded-[4px] border border-verified-500/40 px-3 py-1.5 text-xs font-semibold text-verified-700 hover:bg-verified-50">
                    <MessageCircle className="size-4" aria-hidden="true" /> WhatsApp Support
                </a>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/* IndustrySelector (IN-SCR-011): controlled taxonomy combobox pair    */
/* ------------------------------------------------------------------ */
export interface SelectorValue {
    industry: string | null; // slug
    subIndustry: string | null; // code
}

function Combo({ label, placeholder, options, value, onChange, disabled, multi }: { label: string; placeholder: string; options: { value: string; label: string; icon?: string | null }[]; value: string | null; onChange: (v: string | null) => void; disabled?: boolean; multi?: boolean }) {
    const [open, setOpen] = useState(false);
    const [q, setQ] = useState('');
    const filtered = options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
    const current = options.find((o) => o.value === value);
    return (
        <div className="relative">
            <span className="mb-1 block text-[0.8125rem] font-medium text-ink-800">{label}</span>
            <button
                type="button"
                disabled={disabled}
                aria-haspopup="listbox"
                aria-expanded={open}
                onClick={() => setOpen((o) => !o)}
                className="flex h-10 w-full items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-3 text-left text-sm disabled:bg-parchment-200 disabled:text-ink-400"
            >
                {current?.icon && <DynIcon name={current.icon} className="size-4 text-gold-700" />}
                <span className={cn('flex-1 truncate', !current && 'text-ink-400')}>{current?.label ?? placeholder}</span>
                {current && !disabled && (
                    <span role="button" tabIndex={0} aria-label={`Clear ${label}`} onClick={(e) => { e.stopPropagation(); onChange(null); }} onKeyDown={(e) => e.key === 'Enter' && onChange(null)}>
                        <X className="size-4 text-ink-400" />
                    </span>
                )}
                <ChevronDown className="size-4 text-ink-400" />
            </button>
            {open && !disabled && (
                <div className="absolute z-30 mt-1 w-full rounded-[6px] border border-parchment-400 bg-white p-2 shadow-raised">
                    <label className="relative block">
                        <span className="sr-only">Search {label}</span>
                        <Search className="absolute top-2.5 left-2.5 size-4 text-ink-400" />
                        <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={`Search ${label.toLowerCase()}...`} className="h-9 w-full rounded-[4px] border border-parchment-500 pr-2 pl-8 text-sm focus:border-gold-500 focus:outline-none" />
                    </label>
                    <ul role="listbox" className="mt-1 max-h-56 overflow-y-auto">
                        {filtered.map((o) => (
                            <li key={o.value}>
                                <button
                                    type="button"
                                    role="option"
                                    aria-selected={o.value === value}
                                    onClick={() => { onChange(o.value); setOpen(false); setQ(''); }}
                                    className={cn('flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-parchment-200', o.value === value && 'bg-gold-50 font-semibold')}
                                >
                                    {multi ? <span className={cn('size-4 rounded-[3px] border', o.value === value ? 'border-gold-600 bg-gold-500' : 'border-parchment-500')} /> : o.icon && <DynIcon name={o.icon} className="size-4 text-gold-700" />}
                                    {o.label}
                                </button>
                            </li>
                        ))}
                        {filtered.length === 0 && <li className="px-2 py-2 text-xs text-ink-400">No match in the controlled taxonomy.</li>}
                    </ul>
                </div>
            )}
        </div>
    );
}

export function IndustrySelector({ industries, value, onChange, country = 'ZA', disabled, showJson }: { industries: IndustryOption[]; value: SelectorValue; onChange: (v: SelectorValue) => void; country?: string; disabled?: boolean; showJson?: boolean }) {
    const industry = industries.find((i) => i.slug === value.industry) ?? null;
    const sub = industry?.subIndustries.find((s) => s.code === value.subIndustry) ?? null;
    const json = JSON.stringify({ industryCode: industry?.shortCode ?? null, industryName: industry?.name ?? null, subIndustryCode: sub?.code ?? null, subIndustryName: sub?.name ?? null, country });
    return (
        <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
                <Combo label="Industry" placeholder="Select industry" disabled={disabled} value={value.industry} onChange={(v) => onChange({ industry: v, subIndustry: null })} options={industries.map((i) => ({ value: i.slug, label: i.name, icon: i.icon }))} />
                <Combo label="Sub-Industry (Optional)" placeholder="Select a sub-industry" multi disabled={disabled || !industry} value={value.subIndustry} onChange={(v) => onChange({ ...value, subIndustry: v })} options={(industry?.subIndustries ?? []).map((s) => ({ value: s.code, label: s.name }))} />
            </div>
            {(industry || sub) && (
                <div className="flex flex-wrap items-center gap-2 rounded-[6px] border border-parchment-400 bg-parchment-100 p-2 text-xs">
                    <span className="font-semibold text-verified-700">Selection Summary</span>
                    {industry && <span className="rounded-full bg-white px-2 py-0.5">Industry: {industry.name}</span>}
                    {sub && <span className="rounded-full bg-white px-2 py-0.5">Sub-Industry: {sub.name}</span>}
                    <button type="button" className="ml-auto text-gold-700 underline" onClick={() => onChange({ industry: null, subIndustry: null })}>Clear all</button>
                </div>
            )}
            {showJson && (
                <div className="flex items-start gap-2 rounded-[6px] bg-ink-950 p-3 font-mono text-[0.6875rem] text-gold-300">
                    <code className="flex-1 break-all">{json}</code>
                    <button type="button" onClick={() => void navigator.clipboard?.writeText(json)} className="flex items-center gap-1 rounded border border-gold-700 px-2 py-1 text-gold-400" aria-label="Copy IndustryContext JSON">
                        <Copy className="size-3.5" /> Copy JSON
                    </button>
                </div>
            )}
        </div>
    );
}

/** Modal that edits the session IndustryContext using the selector. */
export function ContextEditor({ open, onClose, industries, context, redirect }: { open: boolean; onClose: () => void; industries: IndustryOption[]; context: IndustryContextValue; redirect?: string }) {
    const [value, setValue] = useState<SelectorValue>({ industry: context.industrySlug, subIndustry: context.subIndustryCode });
    const [country, setCountry] = useState(context.country ?? 'ZA');
    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Edit your industry context"
            size="lg"
            footer={
                <>
                    <button type="button" onClick={onClose} className="rounded-[4px] border border-parchment-500 px-4 py-2 text-sm">Cancel</button>
                    <button
                        type="button"
                        disabled={!value.industry}
                        onClick={() => router.post('/industries/context', { industry: value.industry, sub_industry: value.subIndustry, country, redirect: redirect ?? `/industries/${value.industry}` }, { onSuccess: onClose })}
                        className="rounded-[4px] bg-gold-500 px-4 py-2 text-sm font-semibold text-ink-900 disabled:opacity-50"
                    >
                        Save context
                    </button>
                </>
            }
        >
            <IndustrySelector industries={industries} value={value} onChange={setValue} country={country} showJson />
            <label className="mt-3 block text-[0.8125rem] font-medium text-ink-800">
                Country
                <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 h-10 w-full rounded-[4px] border border-parchment-500 px-2 text-sm">
                    <option value="ZA">South Africa</option>
                    <option value="EG">Egypt</option>
                    <option value="KE">Kenya</option>
                    <option value="NG">Nigeria</option>
                </select>
            </label>
            <p className="mt-2 text-xs text-ink-500">Selections come from the controlled taxonomy. No free text.</p>
        </Modal>
    );
}

/** Dark "Your Context" sidebar card. */
export function ContextCard({ context, industries, title = 'Your Context', rows = [], redirect }: { context: IndustryContextValue; industries?: IndustryOption[]; title?: string; rows?: [string, ReactNode][]; redirect?: string }) {
    const [open, setOpen] = useState(false);
    return (
        <Box tone="dark" title={title} action={industries ? <button type="button" onClick={() => setOpen(true)} className="text-xs font-semibold text-parchment-100 underline">Edit</button> : undefined}>
            <dl className="space-y-2 text-xs">
                {[
                    ['Primary Industry', context.industryName ?? 'Not selected'],
                    ['Sub-Industry', context.subIndustryName ?? 'Not selected'],
                    ['Country', context.countryName ?? 'South Africa'],
                    ['Market', 'Africa (Active)'],
                    ...rows,
                ].map(([k, v]) => (
                    <div key={k as string} className="flex justify-between gap-3">
                        <dt className="text-ink-300">{k}</dt>
                        <dd className="text-right font-medium text-parchment-100">{v}</dd>
                    </div>
                ))}
            </dl>
            {industries && <ContextEditor open={open} onClose={() => setOpen(false)} industries={industries} context={context} redirect={redirect} />}
        </Box>
    );
}

export function NextSteps({ title = 'Next Steps', items, cta }: { title?: string; items: string[]; cta?: { label: string; href: string } }) {
    return (
        <Box tone="dark" title={title}>
            <ul className="space-y-2 text-xs text-parchment-100">
                {items.map((i) => (
                    <li key={i} className="flex gap-2"><ClipboardCheck className="size-4 shrink-0 text-gold-400" aria-hidden="true" />{i}</li>
                ))}
            </ul>
            {cta && <Link href={cta.href} className="mt-4 block rounded-[4px] bg-gold-500 px-3 py-2 text-center text-xs font-bold text-ink-900 uppercase hover:bg-gold-400">{cta.label} →</Link>}
        </Box>
    );
}

export function AdvisorCard({ title = 'Need Guidance?', text = 'Speak to a TBCA Advisor for tailored industry advice.', label = 'Book Discovery Call' }: { title?: string; text?: string; label?: string }) {
    return (
        <Box tone="dark" title={title}>
            <p className="text-xs text-ink-200">{text}</p>
            <Link href="/contact?topic=industries" className="mt-3 flex items-center justify-center gap-2 rounded-[4px] border border-parchment-200 px-3 py-2 text-xs font-bold text-parchment-100 uppercase hover:border-gold-500">
                <Headphones className="size-4" aria-hidden="true" /> {label}
            </Link>
        </Box>
    );
}

export function TrustCard() {
    return (
        <Box title="Trust & Transparency">
            <ul className="space-y-2 text-[0.8125rem] text-ink-700">
                {['Four-ledger model', 'No hidden fees', 'Professional boundaries', 'Scope & limitations upfront'].map((t) => (
                    <li key={t} className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold-600" aria-hidden="true" />{t}</li>
                ))}
            </ul>
        </Box>
    );
}

/* ------------------------------------------------------------------ */
/* Workspace shell (signed-in engagement pages)                        */
/* ------------------------------------------------------------------ */
export function WorkspaceShell({ base, title, badge, description, actions, children, wide, right }: { base: WorkspaceBase; title: string; badge?: ReactNode; description?: ReactNode; actions?: ReactNode; children: ReactNode; wide?: boolean; right?: ReactNode }) {
    const { url } = usePage<SharedProps>().props;
    const e: EngagementContext = base.engagement;
    const root = `/industries/workspace/${e.reference}`;
    const nav: [string, string, ReactNode, number?][] = [
        ['Workspace Overview', root, <LayoutDashboard key="a" className="size-4" />],
        ['Industry Verification', `${root}/verification`, <ShieldCheck key="b" className="size-4" />, base.counts.evidence],
        ['Re-Classification Notices', `${root}/reclassification`, <AlertTriangle key="c" className="size-4" />, base.counts.notices],
        ['Fee Transparency Ledger', `${root}/ledger`, <Receipt key="d" className="size-4" />, base.counts.ledger],
        ['Engagement Letter', `${root}/engagement-letter`, <PenLine key="e" className="size-4" />],
        ['Gate Status', `${root}/gates`, <Lock key="f" className="size-4" />],
        ['Split Checkout', `${root}/split-checkout`, <SplitSquareHorizontal key="g" className="size-4" />],
        ['Abort Ladder', `${root}/abort-ladder`, <Ban key="h" className="size-4" />],
        ['Partner Route', `${root}/partner-route`, <Handshake key="i" className="size-4" />],
        ['Specialist Review', `${root}/specialist-review`, <UserCheck key="j" className="size-4" />],
        ['Sector Compliance Calendar', `${root}/compliance-calendar`, <Calendar key="k" className="size-4" />],
        ['Benchmark Contribution', `${root}/benchmark-contribution`, <BarChart3 key="l" className="size-4" />],
    ];
    return (
        <>
            <Head title={`${title} – ${e.reference}`} />
            <IndustriesSubNav />
            <div className="bg-parchment-100">
                <div className="container-tbca py-6">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Industries', href: '/industries' }, { label: e.industry ?? 'Industry', href: e.industrySlug ? `/industries/${e.industrySlug}` : undefined }, { label: `${e.title} (${e.country})`, href: root }, { label: title }]} />
                    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                        <div>
                            <div className="flex flex-wrap items-center gap-2.5">
                                <h1 className="font-serif text-2xl font-bold text-ink-900 sm:text-[1.75rem]">{title}</h1>
                                {badge}
                            </div>
                            {description && <p className="mt-1 text-sm text-ink-600">{description}</p>}
                        </div>
                        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
                    </div>
                    <div className={cn('grid gap-5', right ? 'lg:grid-cols-[240px_1fr_280px]' : 'lg:grid-cols-[240px_1fr]')}>
                        <aside className="space-y-4">
                            <Box title="Your Engagement">
                                <dl className="space-y-2 text-xs">
                                    {[['Industry', e.industry], ['Sub-Industry', e.subIndustry ?? '—'], ['Country', e.country], ['Engagement', e.title], ['Reference', e.reference], ['Stage', e.stageLabel]].map(([k, v]) => (
                                        <div key={k as string}>
                                            <dt className="text-ink-400">{k}</dt>
                                            <dd className="font-semibold text-ink-800">{v}</dd>
                                        </div>
                                    ))}
                                    <div><dt className="text-ink-400">Status</dt><dd><span className={cn('rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold', e.status === 'active' ? 'bg-verified-50 text-verified-700' : 'bg-risk-50 text-risk-700')}>{e.status}</span></dd></div>
                                </dl>
                            </Box>
                            <nav aria-label="Workspace" className="rounded-[8px] border border-parchment-400 bg-white p-2">
                                <ul className="flex gap-1 overflow-x-auto lg:flex-col">
                                    {nav.map(([l, href, icon, badgeN]) => {
                                        const active = url.path === href;
                                        return (
                                            <li key={href} className="shrink-0">
                                                <Link href={href} className={cn('flex items-center gap-2 rounded-[6px] px-2.5 py-2 text-[0.8125rem] whitespace-nowrap', active ? 'bg-gold-50 font-semibold text-gold-800' : 'text-ink-700 hover:bg-parchment-200')}>
                                                    {icon}
                                                    <span className="flex-1">{l}</span>
                                                    {!!badgeN && <span className="rounded-full bg-gold-500 px-1.5 text-[0.625rem] font-bold text-ink-900">{badgeN}</span>}
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </nav>
                            <Box title="Need Help?">
                                <p className="text-xs text-ink-600">Speak to a TBCA Advisor for guidance on this engagement.</p>
                                <button type="button" onClick={() => openAskQuestion({ subject: `Engagement ${e.reference}`, section: 'industries' })} className="mt-3 flex w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 px-3 py-2 text-xs font-semibold text-gold-800">
                                    <Phone className="size-4" aria-hidden="true" /> Book Advisor Call
                                </button>
                            </Box>
                        </aside>
                        <main className={cn('min-w-0 space-y-5', wide && 'lg:col-span-1')}>{children}</main>
                        {right && <aside className="space-y-4">{right}</aside>}
                    </div>
                </div>
            </div>
            <TrustStrip variant="industries" />
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Admin console shell                                                 */
/* ------------------------------------------------------------------ */
const ADMIN_NAV: ConsoleNavGroup[] = [
    { title: 'Admin Console', items: [{ label: 'Overview', href: '/admin/insights/industries', icon: Gauge }] },
    {
        title: 'Industries Governance',
        items: [
            { label: 'Sector Taxonomy Manager', href: '/admin/insights/industries/taxonomy', icon: Layers },
            { label: 'Sprint Classification Console', href: '/admin/insights/industries/classification', icon: GitBranch },
            { label: 'Complexity & Margin Console', href: '/admin/insights/industries/margin', icon: Scale },
            { label: 'Blocked-SKU Register', href: '/admin/insights/industries/blocked', icon: Ban },
            { label: 'Sector Regulator Register', href: '/admin/insights/industries/regulators', icon: FileCheck2 },
            { label: 'Misdeclaration Queue', href: '/admin/insights/industries/misdeclarations', icon: ShieldAlert },
            { label: 'Benchmark Governance', href: '/admin/insights/industries/benchmarks', icon: BarChart3 },
        ],
    },
    {
        title: 'Activation & Performance',
        items: [
            { label: 'Industry Activation Pipeline', href: '/admin/insights/industries/activation', icon: Activity },
            { label: 'Sector WhatsApp Flow Set', href: '/admin/insights/industries/whatsapp', icon: MessagesSquare },
        ],
    },
    { title: 'Resources Console', items: [{ label: 'Content Governance', href: '/admin/insights/resources', icon: FileText }] },
];

export function IndustryAdmin({ title, badge, description, actions, children }: { title: string; badge?: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
    return (
        <ConsoleLayout
            area="Industries Governance"
            areaIcon={ListChecks}
            groups={ADMIN_NAV}
            crumbs={[{ label: 'Home', href: '/' }, { label: 'Admin', href: '/admin' }, { label: 'Industries', href: '/admin/insights/industries' }, { label: title }]}
            title={title}
            badge={badge ? <span className="rounded-full border border-verified-500/30 bg-verified-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-verified-700">{badge}</span> : undefined}
            description={description}
            actions={actions}
        >
            <Head title={`${title} | Industries Admin`} />
            {children}
        </ConsoleLayout>
    );
}

/** Lightweight query-string filter state for consoles. */
export function useFilters<T extends Record<string, unknown>>(initial: T, path: string) {
    const [f, setF] = useState<T>(initial);
    const apply = (next?: Partial<T>) => {
        const merged = { ...f, ...(next ?? {}) };
        setF(merged);
        const query = Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== "" && v !== null && v !== undefined && !(Array.isArray(v) && v.length === 0))) as Record<string, string>;
        router.get(path, query, { preserveState: true, preserveScroll: true, replace: true });
    };
    return { f, setF, apply };
}

export function useIndex<T>(list: T[], key: (t: T) => string) {
    return useMemo(() => new Map(list.map((i) => [key(i), i])), [list, key]);
}

export { Users };
