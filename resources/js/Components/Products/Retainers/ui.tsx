import type { ReactNode } from 'react';
import { Link, router } from '@inertiajs/react';
import {
    Ban,
    BarChart3,
    Box,
    Briefcase,
    Building2,
    Calculator,
    ChartLine,
    ChevronLeft,
    ChevronRight,
    Clipboard,
    Clock,
    Cloud,
    Compass,
    Database,
    Gavel,
    Globe,
    Handshake,
    Kanban,
    Leaf,
    Lock,
    Megaphone,
    Scale,
    Search,
    Settings,
    Shield,
    ShoppingCart,
    Shuffle,
    SlidersHorizontal,
    Target,
    Truck,
    User,
    UserCog,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';

/* ==========================================================================
   Retainers-specific building blocks (charts, icons, formatting, footers).
   ========================================================================== */

const ICONS: Record<string, LucideIcon> = {
    'user-tie': Briefcase,
    cart: ShoppingCart,
    shield: Shield,
    chart: ChartLine,
    cloud: Cloud,
    sliders: SlidersHorizontal,
    compass: Compass,
    users: Users,
    user: User,
    building: Building2,
    truck: Truck,
    search: Search,
    kanban: Kanban,
    settings: Settings,
    clipboard: Clipboard,
    calculator: Calculator,
    handshake: Handshake,
    leaf: Leaf,
    scale: Scale,
    megaphone: Megaphone,
    database: Database,
    gavel: Gavel,
    'user-cog': UserCog,
    clock: Clock,
    globe: Globe,
    ban: Ban,
    target: Target,
    lock: Lock,
    box: Box,
    shuffle: Shuffle,
    briefcase: Briefcase,
    bar: BarChart3,
};

export function retIcon(name?: string | null): LucideIcon {
    return (name && ICONS[name]) || Briefcase;
}

export function hrs(n: number | null | undefined, digits = 1): string {
    return `${Number(n ?? 0).toFixed(digits)}`;
}

export function fmtDate(iso?: string | null, opts: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short', year: 'numeric' }): string {
    if (!iso) return '—';
    const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso.replace(' ', 'T'));
    return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('en-ZA', opts);
}

export function fmtDateTime(iso?: string | null): string {
    if (!iso) return '—';
    const d = new Date(iso.replace(' ', 'T'));
    return `${d.toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' })}, ${d.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`;
}

export function zar(n: number): string {
    return `ZAR ${Math.round(n).toLocaleString('en-ZA').replace(/ /g, ',').replace(/ /g, ',')}`;
}

/** Icon tile with label, value and caption — the mockups' KPI style. */
export function StatTile({ icon: Icon, label, value, unit, caption, tone = 'gold', highlight }: { icon: LucideIcon; label: ReactNode; value: ReactNode; unit?: ReactNode; caption?: ReactNode; tone?: 'gold' | 'good' | 'bad' | 'info' | 'purple'; highlight?: boolean }) {
    const tones = {
        gold: 'bg-gold-50 text-gold-700',
        good: 'bg-verified-50 text-verified-700',
        bad: 'bg-risk-50 text-risk-700',
        info: 'bg-controlled-50 text-controlled-700',
        purple: 'bg-referenced-50 text-referenced-700',
    }[tone];
    return (
        <div className={cn('flex items-start gap-3 rounded-[8px] border bg-white p-4', highlight ? 'border-verified-500 ring-1 ring-verified-500/40' : 'border-parchment-400')}>
            <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-full', tones)}>
                <Icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0">
                <p className="text-xs font-medium text-ink-500">{label}</p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-ink-900">
                    {value}
                    {unit && <span className="ml-1 text-xs font-semibold text-ink-500">{unit}</span>}
                </p>
                {caption && <p className="mt-0.5 text-xs text-ink-400">{caption}</p>}
            </div>
        </div>
    );
}

/** SVG donut with segments; centre label optional. */
export function Donut({ segments, size = 150, stroke = 22, centre, sub }: { segments: { value: number; color: string; label?: string }[]; size?: number; stroke?: number; centre?: ReactNode; sub?: ReactNode }) {
    const r = (size - stroke) / 2;
    const c = 2 * Math.PI * r;
    const total = segments.reduce((s, x) => s + Math.max(0, x.value), 0) || 1;
    let offset = 0;
    return (
        <div className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="Distribution chart" className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-parchment-300)" strokeWidth={stroke} />
                {segments.map((s, i) => {
                    const len = (Math.max(0, s.value) / total) * c;
                    const el = <circle key={i} cx={size / 2} cy={size / 2} r={r} fill="none" stroke={s.color} strokeWidth={stroke} strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-offset} />;
                    offset += len;
                    return el;
                })}
            </svg>
            {(centre || sub) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    {centre && <span className="text-lg leading-tight font-bold text-ink-900">{centre}</span>}
                    {sub && <span className="text-[0.6875rem] text-ink-500">{sub}</span>}
                </div>
            )}
        </div>
    );
}

export function Legend({ items }: { items: { color: string; label: ReactNode; value?: ReactNode }[] }) {
    return (
        <ul className="space-y-2 text-xs">
            {items.map((it, i) => (
                <li key={i} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2 text-ink-700">
                        <span className="size-2.5 shrink-0 rounded-full" style={{ background: it.color }} />
                        {it.label}
                    </span>
                    {it.value !== undefined && <span className="font-semibold text-ink-900 tabular-nums">{it.value}</span>}
                </li>
            ))}
        </ul>
    );
}

export const C = {
    gold: 'var(--color-gold-500)',
    green: 'var(--color-verified-500)',
    red: 'var(--color-risk-500)',
    amber: 'var(--color-attested-500)',
    blue: 'var(--color-controlled-500)',
    purple: 'var(--color-referenced-500)',
    grey: 'var(--color-parchment-500)',
};

/** Simple line chart with optional dashed reference line and point labels. */
export function LineChart({ points, max = 100, suffix = '', reference, height = 180, color = C.gold, labels = true }: { points: { label: string; value: number }[]; max?: number; suffix?: string; reference?: { value: number; label: string }; height?: number; color?: string; labels?: boolean }) {
    const w = 520;
    const pad = 28;
    const h = height;
    const n = Math.max(1, points.length - 1);
    const x = (i: number) => pad + (i / n) * (w - pad * 2);
    const y = (v: number) => h - pad - (Math.min(v, max) / max) * (h - pad * 2);
    const d = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(p.value)}`).join(' ');
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Trend chart">
            {[0, 0.25, 0.5, 0.75, 1].map((t) => (
                <g key={t}>
                    <line x1={pad} x2={w - pad} y1={y(max * t)} y2={y(max * t)} stroke="var(--color-parchment-300)" strokeWidth="1" />
                    <text x={4} y={y(max * t) + 3} fontSize="9" fill="var(--color-ink-400)">
                        {Math.round(max * t)}
                        {suffix}
                    </text>
                </g>
            ))}
            {reference && <line x1={pad} x2={w - pad} y1={y(reference.value)} y2={y(reference.value)} stroke="var(--color-ink-400)" strokeDasharray="4 4" />}
            {points.length > 1 && <path d={`${d} L${x(points.length - 1)},${h - pad} L${x(0)},${h - pad} Z`} fill={color} opacity="0.08" />}
            <path d={d} fill="none" stroke={color} strokeWidth="2.5" />
            {points.map((p, i) => (
                <g key={i}>
                    <circle cx={x(i)} cy={y(p.value)} r="3.5" fill={color} />
                    {labels && (
                        <text x={x(i)} y={y(p.value) - 8} fontSize="9.5" textAnchor="middle" fill="var(--color-ink-700)" fontWeight="600">
                            {p.value}
                            {suffix}
                        </text>
                    )}
                    <text x={x(i)} y={h - 8} fontSize="9.5" textAnchor="middle" fill="var(--color-ink-500)">
                        {p.label}
                    </text>
                </g>
            ))}
        </svg>
    );
}

/** Semi-circular gauge for allowance used. */
export function Gauge({ pct, label, sub }: { pct: number; label: ReactNode; sub?: ReactNode }) {
    const r = 80;
    const c = Math.PI * r;
    const used = (Math.min(100, Math.max(0, pct)) / 100) * c;
    const tone = pct >= 100 ? C.red : pct >= 75 ? C.amber : C.green;
    return (
        <div className="relative mx-auto w-full max-w-[240px]">
            <svg viewBox="0 0 200 115" className="w-full" role="img" aria-label={`${pct}% used`}>
                <path d="M20,100 A80,80 0 0 1 180,100" fill="none" stroke="var(--color-parchment-400)" strokeWidth="22" />
                <path d="M20,100 A80,80 0 0 1 180,100" fill="none" stroke={tone} strokeWidth="22" strokeDasharray={`${used} ${c}`} />
            </svg>
            <div className="absolute inset-x-0 bottom-0 text-center">
                <p className="text-3xl font-bold text-ink-900">{Math.round(pct)}%</p>
                <p className="text-sm font-semibold text-ink-700">{label}</p>
                {sub && <p className="text-xs text-ink-500">{sub}</p>}
            </div>
        </div>
    );
}

/** Sticky footer action bar used by journey and workspace screens. */
export function FooterBar({ children, note }: { children: ReactNode; note?: ReactNode }) {
    return (
        <div className="sticky bottom-0 z-20 mt-6 border-t border-parchment-400 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-3">{children}</div>
            {note && <p className="mt-1.5 text-right text-[0.6875rem] text-ink-400">{note}</p>}
        </div>
    );
}

/** GET filter helper: merges params into the current URL query. */
export function applyFilters(path: string, params: Record<string, string | number | undefined | null>) {
    const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== '' && v !== undefined && v !== null));
    router.get(path, clean, { preserveScroll: true, preserveState: true, replace: true });
}

export function Pagination({ page, per, total, path, params }: { page: number; per: number; total: number; path: string; params: Record<string, string | number> }) {
    const pages = Math.max(1, Math.ceil(total / per));
    const from = total === 0 ? 0 : (page - 1) * per + 1;
    const to = Math.min(total, page * per);
    const href = (p: number) => `${path}?${new URLSearchParams(Object.entries({ ...params, page: p }).filter(([, v]) => String(v) !== '').map(([k, v]) => [k, String(v)])).toString()}`;
    return (
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 text-xs text-ink-500">
            <span>
                Showing {from} to {to} of {total} entries
            </span>
            <nav className="flex items-center gap-1" aria-label="Pagination">
                <Link href={href(Math.max(1, page - 1))} preserveScroll className="rounded border border-parchment-400 p-1.5 hover:border-gold-500" aria-label="Previous page">
                    <ChevronLeft className="size-3.5" />
                </Link>
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={href(p)} preserveScroll aria-current={p === page ? 'page' : undefined} className={cn('min-w-7 rounded border px-2 py-1 text-center', p === page ? 'border-gold-500 bg-gold-500 font-semibold text-ink-900' : 'border-parchment-400 hover:border-gold-500')}>
                        {p}
                    </Link>
                ))}
                <Link href={href(Math.min(pages, page + 1))} preserveScroll className="rounded border border-parchment-400 p-1.5 hover:border-gold-500" aria-label="Next page">
                    <ChevronRight className="size-3.5" />
                </Link>
            </nav>
        </div>
    );
}

/** Small native select used in filter bars. */
export function MiniSelect({ label, value, onChange, options, className }: { label: string; value: string; onChange: (v: string) => void; options: { value: string; label: string }[]; className?: string }) {
    return (
        <label className={cn('flex min-w-0 flex-col gap-1 text-[0.6875rem] font-medium text-ink-500', className)}>
            {label}
            <select value={value} onChange={(e) => onChange(e.target.value)} className="h-9 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem] text-ink-800 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none">
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

/** Labelled horizontal stacked bar (used / overage / remaining). */
export function StackedBar({ parts }: { parts: { value: number; color: string; label: string }[] }) {
    const total = parts.reduce((s, p) => s + p.value, 0) || 1;
    return (
        <div>
            <div className="flex h-3 w-full overflow-hidden rounded-full bg-parchment-300">
                {parts.map((p, i) => (
                    <span key={i} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
                ))}
            </div>
            <ul className="mt-2 flex flex-wrap gap-4 text-xs text-ink-600">
                {parts.map((p, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                        <span className="size-2.5 rounded-full" style={{ background: p.color }} />
                        {p.label}
                    </li>
                ))}
            </ul>
        </div>
    );
}
