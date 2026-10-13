import type { ReactNode } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Banknote, BarChart3, Bot, Briefcase, Building, Building2, Calculator, Calendar, Check, CheckCircle2, ChevronLeft, ChevronRight, CircleDollarSign,
    Clapperboard, ClipboardCheck, Clock, Coins, Cpu, Eye, Factory, FileText, FlaskConical, Globe, GraduationCap, HandHeart, Headphones, Info, Landmark,
    Layers, Leaf, Link2, Lock, Luggage, Megaphone, MessageCircle, Monitor, Package, Percent, Pickaxe, PieChart, Route, Scale, Search, Settings, Shield,
    ShieldCheck, ShoppingCart, Sprout, Stethoscope, TrendingUp, Truck, Umbrella, User, Users, Wheat, Zap, AlertTriangle, XCircle, type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/cn';
import type { Currentness } from '@/types/insights';
import { displayCurrency, displayMoney } from '@/lib/money';

/* ------------------------------------------------------------------ */
/* Icon registry: server registers store icon names as strings.        */
/* ------------------------------------------------------------------ */
const ICONS: Record<string, LucideIcon> = {
    wheat: Wheat, 'shopping-cart': ShoppingCart, factory: Factory, truck: Truck, pickaxe: Pickaxe, zap: Zap, landmark: Landmark, building: Building2,
    luggage: Luggage, briefcase: Briefcase, cpu: Cpu, 'hand-heart': HandHeart, 'graduation-cap': GraduationCap, stethoscope: Stethoscope,
    clapperboard: Clapperboard, banknote: Banknote, globe: Globe, link: Link2, 'trending-up': TrendingUp, 'circle-dollar-sign': CircleDollarSign,
    leaf: Leaf, settings: Settings, search: Search, 'clipboard-check': ClipboardCheck, users: Users, package: Package, shield: Shield, scale: Scale,
    calculator: Calculator, percent: Percent, sprout: Sprout, 'shield-check': ShieldCheck, umbrella: Umbrella, 'flask-conical': FlaskConical,
    monitor: Monitor, 'pie-chart': PieChart, layers: Layers, user: User, chart: BarChart3, coins: Coins, route: Route, megaphone: Megaphone,
    file: FileText, calendar: Calendar, bot: Bot, office: Building,
};

export function DynIcon({ name, className }: { name?: string | null; className?: string }) {
    const Icon = (name && ICONS[name]) || Briefcase;
    return <Icon className={className ?? 'size-5'} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ */
/* Formatting                                                          */
/* ------------------------------------------------------------------ */
export const zar = (n: number | null | undefined, decimals = 0) =>
    n === null || n === undefined ? '—' : decimals === 0 && displayCurrency() !== 'ZAR' ? displayMoney(n) : `R${n.toLocaleString('en-ZA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }).replace(/ /g, ',')}`;
export const num = (n: number | null | undefined) => (n === null || n === undefined ? '—' : n.toLocaleString('en-ZA').replace(/ /g, ','));
export const label = (s: string | null | undefined) => (s ?? '').replace(/[_-]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

/* ------------------------------------------------------------------ */
/* Chips, tags and status                                             */
/* ------------------------------------------------------------------ */
const TONE = {
    green: 'border-verified-500/30 bg-verified-50 text-verified-700',
    amber: 'border-attested-500/30 bg-attested-50 text-attested-700',
    red: 'border-risk-500/30 bg-risk-50 text-risk-700',
    blue: 'border-controlled-500/30 bg-controlled-50 text-controlled-700',
    gold: 'border-gold-400/60 bg-gold-50 text-gold-800',
    dark: 'border-ink-900 bg-ink-900 text-parchment-100',
    grey: 'border-parchment-500 bg-parchment-200 text-ink-600',
    purple: 'border-purple-300 bg-purple-50 text-purple-700',
} as const;
export type Tone = keyof typeof TONE;

export function Chip({ children, tone = 'grey', className }: { children: ReactNode; tone?: Tone; className?: string }) {
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-[4px] border px-2 py-0.5 text-[0.6875rem] font-semibold tracking-wide uppercase', TONE[tone], className)}>
            {children}
        </span>
    );
}

export const CURRENTNESS: Record<Currentness, { label: string; tone: Tone }> = {
    current: { label: 'Current', tone: 'green' },
    review_due: { label: 'Review Due', tone: 'amber' },
    overdue: { label: 'Overdue', tone: 'red' },
    restricted: { label: 'Restricted', tone: 'grey' },
    retired: { label: 'Retired', tone: 'red' },
};

export function CurrentnessChip({ value }: { value: Currentness }) {
    const c = CURRENTNESS[value];
    return <Chip tone={c.tone}>{c.label}</Chip>;
}

export function AccessChip({ label: text }: { label: string }) {
    const tone: Tone = text.startsWith('R0') ? 'green' : text === 'Reduced' ? 'amber' : text === 'Restricted' ? 'grey' : text === 'Subscription' ? 'purple' : 'dark';
    return <Chip tone={tone}>{text}</Chip>;
}

/** Generic status tone mapping for registers. */
export function toneFor(status: string): Tone {
    const s = status.toLowerCase();
    if (/(complete|approved|active|eligible|paid|passed|signed|live|current|granted|compliant|delivered|resolved|available|verified|yes|on_track|above)/.test(s)) return 'green';
    if (/(pending|review|due|progress|requested|draft|awaiting|estimated|information|at_risk|at floor|at_floor|invoiced|verifying|processing|conditional|medium|thin)/.test(s)) return 'amber';
    if (/(blocked|rejected|overdue|expired|withdrawn|failed|suppressed|below|high|critical|cancelled|aborted|declined|no$)/.test(s)) return 'red';
    if (/(locked|inactive|archived|not|retired|low|disbursed|restricted)/.test(s)) return 'grey';
    return 'blue';
}

export function Status({ value, className }: { value: string; className?: string }) {
    return (
        <span className={cn('inline-flex items-center rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', TONE[toneFor(value)], className)}>
            {label(value)}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Layout pieces                                                      */
/* ------------------------------------------------------------------ */
export function Box({ title, action, children, className, tone = 'light', id }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; tone?: 'light' | 'dark' | 'gold' | 'amber' | 'blue' | 'red'; id?: string }) {
    const tones = {
        light: 'border-parchment-400 bg-white',
        dark: 'border-gold-700/50 bg-ink-950 text-parchment-100',
        gold: 'border-gold-300 bg-gold-50',
        amber: 'border-attested-500/30 bg-attested-50',
        blue: 'border-controlled-500/30 bg-controlled-50',
        red: 'border-risk-500/30 bg-risk-50',
    };
    return (
        <section id={id} className={cn('rounded-[8px] border p-4 sm:p-5', tones[tone], className)}>
            {(title || action) && (
                <header className="mb-3 flex items-center justify-between gap-3">
                    {title && <h2 className={cn('text-[0.9375rem] font-semibold', tone === 'dark' ? 'text-gold-400' : 'text-ink-900')}>{title}</h2>}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function CheckList({ items, tone = 'green', className }: { items: ReactNode[]; tone?: 'green' | 'gold' | 'red' | 'amber'; className?: string }) {
    const icon = {
        green: <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />,
        gold: <Check className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />,
        red: <XCircle className="mt-0.5 size-4 shrink-0 text-risk-500" aria-hidden="true" />,
        amber: <AlertTriangle className="mt-0.5 size-4 shrink-0 text-attested-500" aria-hidden="true" />,
    }[tone];
    return (
        <ul className={cn('space-y-2 text-[0.8125rem]', className)}>
            {items.map((item, i) => (
                <li key={i} className="flex gap-2">
                    {icon}
                    <span>{item}</span>
                </li>
            ))}
        </ul>
    );
}

export function Notice({ tone = 'blue', title, children, action, className }: { tone?: 'blue' | 'amber' | 'red' | 'green'; title?: ReactNode; children?: ReactNode; action?: ReactNode; className?: string }) {
    const t = { blue: 'border-controlled-500/30 bg-controlled-50 text-controlled-700', amber: 'border-attested-500/30 bg-attested-50 text-attested-700', red: 'border-risk-500/30 bg-risk-50 text-risk-700', green: 'border-verified-500/30 bg-verified-50 text-verified-700' }[tone];
    const Icon = tone === 'red' || tone === 'amber' ? AlertTriangle : tone === 'green' ? CheckCircle2 : Info;
    return (
        <div className={cn('flex flex-col gap-3 rounded-[8px] border p-4 sm:flex-row sm:items-center', t, className)}>
            <Icon className="size-5 shrink-0" aria-hidden="true" />
            <div className="flex-1 text-[0.8125rem]">
                {title && <p className="font-semibold">{title}</p>}
                {children && <div className="text-ink-700">{children}</div>}
            </div>
            {action}
        </div>
    );
}

/** Dark KPI band (Opportunity Score, Active Projects ...). */
export function DarkKpis({ items }: { items: { label: string; value: ReactNode; caption?: ReactNode; icon?: string; accent?: boolean }[] }) {
    return (
        <div className="grid grid-cols-2 overflow-hidden rounded-[8px] border border-ink-800 bg-ink-950 sm:grid-cols-3 lg:grid-cols-6">
            {items.map((k) => (
                <div key={k.label} className="flex items-start justify-between gap-2 border-r border-b border-ink-800 p-4 last:border-r-0">
                    <div>
                        <p className="text-[0.6875rem] text-ink-300">{k.label}</p>
                        <p className={cn('mt-1 text-xl font-bold', k.accent ? 'text-verified-500' : 'text-parchment-100')}>{k.value}</p>
                        {k.caption && <p className="text-[0.6875rem] text-ink-300">{k.caption}</p>}
                    </div>
                    {k.icon && <DynIcon name={k.icon} className="size-6 shrink-0 text-gold-400" />}
                </div>
            ))}
        </div>
    );
}

export function Stat({ label: l, value, caption, icon, tone }: { label: string; value: ReactNode; caption?: ReactNode; icon?: ReactNode; tone?: 'red' | 'amber' | 'green' | 'gold' }) {
    const col = tone ? { red: 'text-risk-500', amber: 'text-attested-700', green: 'text-verified-700', gold: 'text-gold-700' }[tone] : 'text-ink-900';
    return (
        <div className="flex items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
            {icon && <span className="flex size-10 shrink-0 items-center justify-center rounded-[8px] bg-parchment-200 text-gold-700">{icon}</span>}
            <div className="min-w-0">
                <p className="text-xs text-ink-500">{l}</p>
                <p className={cn('text-xl font-bold', col)}>{value}</p>
                {caption && <p className="text-[0.6875rem] text-ink-400">{caption}</p>}
            </div>
        </div>
    );
}

/** SVG donut for health / share charts. */
export function Donut({ value, label: l, sub, size = 120, segments }: { value?: number; label?: ReactNode; sub?: ReactNode; size?: number; segments?: { value: number; color: string }[] }) {
    const r = 42;
    const c = 2 * Math.PI * r;
    const segs = segments ?? [{ value: value ?? 0, color: '#2f9e5b' }, { value: 100 - (value ?? 0), color: '#e8e1d2' }];
    const total = segs.reduce((a, s) => a + s.value, 0) || 1;
    let offset = 0;
    return (
        <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
            <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
                {segs.map((s, i) => {
                    const len = (s.value / total) * c;
                    const el = <circle key={i} cx="50" cy="50" r={r} fill="none" stroke={s.color} strokeWidth="12" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
                    offset += len;
                    return el;
                })}
            </svg>
            <div className="absolute text-center">
                <p className="text-xl font-bold text-ink-900">{l}</p>
                {sub && <p className="text-[0.625rem] text-ink-500">{sub}</p>}
            </div>
        </div>
    );
}

export const PALETTE = ['#2f9e5b', '#d6a32e', '#d64545', '#3b6fd8', '#8b5cf6', '#9aa0a6'];

export function Bars({ items, max, format = (v: number) => num(v) }: { items: { label: string; value: number; color?: string }[]; max?: number; format?: (v: number) => ReactNode }) {
    const m = max ?? Math.max(1, ...items.map((i) => i.value));
    return (
        <ul className="space-y-2.5">
            {items.map((i, idx) => (
                <li key={i.label} className="grid grid-cols-[7.5rem_1fr_auto] items-center gap-2 text-xs sm:grid-cols-[9rem_1fr_auto]">
                    <span className="truncate text-ink-600">{i.label}</span>
                    <span className="h-2.5 overflow-hidden rounded-full bg-parchment-300">
                        <span className="block h-full rounded-full" style={{ width: `${(i.value / m) * 100}%`, background: i.color ?? PALETTE[idx % PALETTE.length] }} />
                    </span>
                    <span className="font-semibold text-ink-800">{format(i.value)}</span>
                </li>
            ))}
        </ul>
    );
}

/** Legend list paired with a donut. */
export function Legend({ items }: { items: { label: string; value: ReactNode; color: string }[] }) {
    return (
        <ul className="space-y-1.5 text-xs">
            {items.map((i) => (
                <li key={i.label} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-ink-600">
                        <span className="size-2.5 rounded-full" style={{ background: i.color }} />
                        {i.label}
                    </span>
                    <span className="font-semibold text-ink-800">{i.value}</span>
                </li>
            ))}
        </ul>
    );
}

/** Numbered page links that keep the current query string. */
export function Pager({ page, lastPage, query = {}, path }: { page: number; lastPage: number; query?: Record<string, unknown>; path?: string }) {
    if (lastPage <= 1) return null;
    const go = (p: number) => router.get(path ?? window.location.pathname, { ...query, page: p }, { preserveScroll: true, preserveState: true });
    const pages = Array.from({ length: lastPage }, (_, i) => i + 1).filter((p) => p === 1 || p === lastPage || Math.abs(p - page) <= 2);
    return (
        <nav className="flex items-center justify-center gap-1.5" aria-label="Pagination">
            <button type="button" disabled={page <= 1} onClick={() => go(page - 1)} className="rounded border border-parchment-400 bg-white p-1.5 disabled:opacity-40" aria-label="Previous page">
                <ChevronLeft className="size-4" />
            </button>
            {pages.map((p, i) => (
                <span key={p} className="flex items-center gap-1.5">
                    {i > 0 && pages[i - 1] !== p - 1 && <span className="text-ink-400">…</span>}
                    <button type="button" onClick={() => go(p)} aria-current={p === page ? 'page' : undefined} className={cn('min-w-8 rounded border px-2 py-1 text-xs font-semibold', p === page ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-parchment-400 bg-white text-ink-700')}>
                        {p}
                    </button>
                </span>
            ))}
            <button type="button" disabled={page >= lastPage} onClick={() => go(page + 1)} className="rounded border border-parchment-400 bg-white p-1.5 disabled:opacity-40" aria-label="Next page">
                <ChevronRight className="size-4" />
            </button>
        </nav>
    );
}

/** Responsive data table. */
export function Table({ head, rows, empty = 'Nothing to show.', className }: { head: ReactNode[]; rows: ReactNode[][]; empty?: ReactNode; className?: string }) {
    return (
        <div className={cn('overflow-x-auto rounded-[8px] border border-parchment-400 bg-white', className)}>
            <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                <thead className="bg-parchment-200 text-xs font-semibold text-ink-600">
                    <tr>{head.map((h, i) => <th key={i} scope="col" className="px-3 py-2.5 whitespace-nowrap">{h}</th>)}</tr>
                </thead>
                <tbody className="divide-y divide-parchment-300">
                    {rows.length === 0 && <tr><td colSpan={head.length} className="px-3 py-8 text-center text-ink-400">{empty}</td></tr>}
                    {rows.map((r, i) => (
                        <tr key={i} className="align-top hover:bg-parchment-100">
                            {r.map((c, j) => <td key={j} className="px-3 py-2.5 text-ink-700">{c}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function SmallLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
    return (
        <Link href={href} className={cn('inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:text-gold-800', className)}>
            {children} <ChevronRight className="size-3.5" aria-hidden="true" />
        </Link>
    );
}

/** Bottom trust strip — variant per sub-section. */
export function TrustStrip({ variant }: { variant: 'industries' | 'resources' }) {
    const items =
        variant === 'industries'
            ? [
                  ['Taxonomy', 'Proposed (17)', Layers], ['Market', 'Africa (Active)', Globe], ['Human Gate', 'Mandatory', Users], ['Visible Fees', 'T / P / X / S', Scale],
                  ['AIIM', 'Intelligence Layer', BarChart3], ['Support', 'Always Available', Headphones], ['Source & Confidence', 'Evidence Tracked', ShieldCheck], ['Industry Activation', 'Evidence Required', CheckCircle2],
              ]
            : [
                  ['Source-controlled content', 'Every item has a source and review record', FileText], ['Privacy by design', 'Your choices. Your control.', Lock],
                  ['Human review where required', 'Expert oversight for quality and accuracy', Eye], ['Currentness monitoring', 'We review and refresh regularly', Clock],
                  ['AI-assisted, human-approved', 'AI drafting with human oversight', Bot],
              ];
    return (
        <div className="border-t border-ink-800 bg-ink-950">
            <ul className={cn('container-tbca grid grid-cols-2 gap-4 py-5 sm:grid-cols-4', variant === 'industries' ? 'lg:grid-cols-8' : 'lg:grid-cols-5')}>
                {items.map(([t, s, Icon]) => {
                    const I = Icon as LucideIcon;
                    return (
                        <li key={t as string} className="flex items-start gap-2">
                            <I className="mt-0.5 size-5 shrink-0 text-gold-400" aria-hidden="true" />
                            <span>
                                <span className="block text-xs font-semibold text-parchment-100">{t as string}</span>
                                <span className="block text-[0.6875rem] text-ink-300">{s as string}</span>
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/** "Need something specific?" card shared by resource pages. */
export function NeedSomething({ items }: { items?: string[] }) {
    return (
        <Box title="Need something specific?">
            <p className="text-[0.8125rem] text-ink-600">Can't find what you're looking for? Our team can create a custom resource tailored to your needs.</p>
            {items && <CheckList className="mt-3" tone="gold" items={items} />}
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    router.post('/forms/custom-resource-request', { section: 'resources', subject: 'Custom resource request', redirect: window.location.pathname }, { preserveScroll: true });
                }}
            >
                <button type="submit" className="mt-4 w-full rounded-[4px] border border-gold-500 px-3 py-2 text-[0.8125rem] font-semibold text-gold-800 hover:bg-gold-50">
                    Request a Custom Resource →
                </button>
            </form>
        </Box>
    );
}

export { MessageCircle };
