import { Link, router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import * as L from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { Bucket } from '@/types/countries';

/* ------------------------------------------------------------------ icons */
const ICONS: Record<string, LucideIcon> = {
    landmark: L.Landmark, percent: L.Percent, briefcase: L.Briefcase, 'shield-check': L.ShieldCheck, shield: L.Shield, wallet: L.Wallet,
    'badge-check': L.BadgeCheck, 'message-circle': L.MessageCircle, globe: L.Globe, languages: L.Languages, users: L.Users,
    'triangle-alert': L.TriangleAlert, 'calendar-days': L.CalendarDays, scale: L.Scale, 'clipboard-list': L.ClipboardList, database: L.Database,
    lock: L.Lock, layers: L.Layers, receipt: L.Receipt, cpu: L.Cpu, sparkles: L.Sparkles, coins: L.Coins, link: L.Link2, refresh: L.RefreshCw,
    'file-text': L.FileText, 'trending-up': L.TrendingUp, map: L.Map, gauge: L.Gauge,
};

export function Ico({ name, className }: { name: string; className?: string }) {
    const C = ICONS[name] ?? L.Circle;
    return <C className={cn('size-5', className)} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ tones */
export type Tone = 'good' | 'warn' | 'bad' | 'info' | 'neutral' | 'gold' | 'purple';

const toneClass: Record<Tone, string> = {
    good: 'bg-verified-50 text-verified-700 border-verified-500/30',
    warn: 'bg-attested-50 text-attested-700 border-attested-500/30',
    bad: 'bg-risk-50 text-risk-700 border-risk-500/30',
    info: 'bg-controlled-50 text-controlled-700 border-controlled-500/30',
    neutral: 'bg-parchment-300 text-ink-600 border-parchment-500',
    gold: 'bg-gold-50 text-gold-800 border-gold-400/50',
    purple: 'bg-referenced-50 text-referenced-700 border-referenced-500/30',
};

export function toneOf(value: string | null | undefined): Tone {
    const s = (value ?? '').toLowerCase();
    if (/(^|\b)(activated|active|available|current|verified|valid|resolved|ready|approved|compliant|complete|completed|cleared|passed|released|excellent|healthy|permitted|good|yes|signed|accounted|recorded|met|paid|low)\b/.test(s)) return 'good';
    if (/(blocked|restricted|not permitted|expired|out of date|rejected|declined|critical|suspended|failed|at risk|not provided|poor|high|missing|unavailable|no\b|bad|retracted)/.test(s)) return 'bad';
    if (/(shell|quote|partner|limited|conditional|in progress|in review|review|pending|due soon|waiting|planned|partial|medium|fair|stable|degraded|awaiting|open|draft|needs)/.test(s)) return 'warn';
    if (/(service-by-service|info|model|evidence available|route)/.test(s)) return 'info';
    return 'neutral';
}

export function Chip({ children, tone, className }: { children: ReactNode; tone?: Tone; className?: string }) {
    const t = tone ?? toneOf(typeof children === 'string' ? children : '');
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', toneClass[t], className)}>
            {children}
        </span>
    );
}

const bucketMeta: Record<Bucket, { label: string; icon: LucideIcon; tone: Tone; dot: string }> = {
    activated: { label: 'Activated', icon: L.CircleCheck, tone: 'good', dot: 'bg-verified-500' },
    shell: { label: 'Shell', icon: L.CircleDashed, tone: 'neutral', dot: 'bg-ink-300' },
    degraded: { label: 'Degraded', icon: L.CircleAlert, tone: 'warn', dot: 'bg-attested-500' },
    suspended: { label: 'Suspended', icon: L.CirclePause, tone: 'bad', dot: 'bg-risk-500' },
    restricted: { label: 'Restricted', icon: L.Ban, tone: 'bad', dot: 'bg-risk-700' },
};

/** State is always text + icon; colour is never the sole signifier. */
export function StateBadge({ bucket, label, className }: { bucket: Bucket; label?: string; className?: string }) {
    const m = bucketMeta[bucket];
    const Icon = m.icon;
    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold whitespace-nowrap', toneClass[m.tone], className)}>
            <Icon className="size-3" aria-hidden="true" />
            {label ?? m.label}
        </span>
    );
}

export function bucketDot(bucket: Bucket) {
    return bucketMeta[bucket].dot;
}

export const BUCKETS: { key: Bucket; label: string; body: string }[] = [
    { key: 'activated', label: 'Activated', body: 'Commercially active with full resolver and services' },
    { key: 'shell', label: 'Shell', body: 'Country object created, not yet activated' },
    { key: 'degraded', label: 'Degraded', body: 'Limited availability or partial restrictions' },
    { key: 'suspended', label: 'Suspended', body: 'Temporarily suspended services' },
    { key: 'restricted', label: 'Restricted', body: 'Restricted or prohibited access / services' },
];

export function Flag({ iso, className }: { iso: string; className?: string }) {
    const code = iso.toUpperCase();
    const emoji = /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 0x1f1a5 + c.charCodeAt(0))) : '🏳';
    return (
        <span role="img" aria-label={`${code} flag`} className={cn('inline-block leading-none', className)}>
            {emoji}
        </span>
    );
}

/* ------------------------------------------------------------------ panels */
export function Card({ title, action, children, className, intro }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string; intro?: ReactNode }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-4 sm:p-5', className)}>
            {(title || action) && (
                <header className="mb-3 flex flex-wrap items-start justify-between gap-2">
                    <div>
                        {title && <h2 className="text-[0.9375rem] font-semibold text-ink-900">{title}</h2>}
                        {intro && <p className="mt-0.5 text-xs text-ink-500">{intro}</p>}
                    </div>
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function Kpi({ label, value, caption, icon, tone, className }: { label: ReactNode; value: ReactNode; caption?: ReactNode; icon?: string; tone?: Tone; className?: string }) {
    const color = tone === 'good' ? 'text-verified-700' : tone === 'bad' ? 'text-risk-700' : tone === 'warn' ? 'text-attested-700' : tone === 'gold' ? 'text-gold-700' : 'text-ink-900';
    return (
        <div className={cn('flex items-start gap-3 rounded-[8px] border border-parchment-400 bg-white p-3.5', className)}>
            {icon && <Ico name={icon} className="mt-0.5 shrink-0 text-gold-600" />}
            <div className="min-w-0">
                <p className="text-[0.6875rem] font-medium text-ink-500">{label}</p>
                <p className={cn('mt-0.5 text-lg leading-tight font-bold break-words', color)}>{value}</p>
                {caption && <p className="mt-0.5 text-[0.6875rem] text-ink-400">{caption}</p>}
            </div>
        </div>
    );
}

export function KV({ rows, className }: { rows: [ReactNode, ReactNode, (string | null)?][]; className?: string }) {
    return (
        <dl className={cn('divide-y divide-parchment-300 text-[0.8125rem]', className)}>
            {rows.map(([k, v, mark], i) => (
                <div key={i} className="flex items-start justify-between gap-4 py-1.5">
                    <dt className="text-ink-500">{k}</dt>
                    <dd className="flex items-center gap-1.5 text-right font-medium text-ink-900">
                        {v}
                        {mark === 'ok' && <L.CircleCheck className="size-3.5 text-verified-500" aria-label="confirmed" />}
                        {mark === 'warn' && <L.CircleAlert className="size-3.5 text-attested-500" aria-label="qualified" />}
                        {mark === 'no' && <L.CircleMinus className="size-3.5 text-ink-300" aria-label="not applicable" />}
                    </dd>
                </div>
            ))}
        </dl>
    );
}

export function Checklist({ items, mark = 'ok' }: { items: (string | [string, string])[]; mark?: string }) {
    return (
        <ul className="space-y-1.5 text-[0.8125rem] text-ink-700">
            {items.map((it, i) => {
                const [m, text] = Array.isArray(it) ? it : [mark, it];
                const Icon = m === 'bad' ? L.CircleX : m === 'warn' ? L.TriangleAlert : L.CircleCheck;
                const color = m === 'bad' ? 'text-risk-500' : m === 'warn' ? 'text-attested-500' : 'text-verified-500';
                return (
                    <li key={i} className="flex items-start gap-2">
                        <Icon className={cn('mt-0.5 size-4 shrink-0', color)} aria-hidden="true" />
                        <span>{text}</span>
                    </li>
                );
            })}
        </ul>
    );
}

export function Note({ children, tone = 'info', title }: { children: ReactNode; tone?: 'info' | 'warn' | 'good' | 'bad'; title?: ReactNode }) {
    const cls = { info: 'border-controlled-500/30 bg-controlled-50 text-controlled-700', warn: 'border-attested-500/40 bg-attested-50 text-attested-700', good: 'border-verified-500/30 bg-verified-50 text-verified-700', bad: 'border-risk-500/30 bg-risk-50 text-risk-700' }[tone];
    const Icon = tone === 'warn' ? L.TriangleAlert : tone === 'good' ? L.ShieldCheck : tone === 'bad' ? L.OctagonAlert : L.Info;
    return (
        <div className={cn('flex gap-2.5 rounded-[6px] border p-3 text-[0.8125rem]', cls)}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <div>
                {title && <p className="font-semibold">{title}</p>}
                <div className="text-[0.8125rem] leading-relaxed">{children}</div>
            </div>
        </div>
    );
}

export function NoResolution({ text = 'Country search does not imply commercial permission.' }: { text?: string }) {
    return (
        <div className="rounded-[8px] border border-attested-500/40 bg-attested-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-attested-700">
                <L.TriangleAlert className="size-4" aria-hidden="true" /> {text}
            </p>
            <p className="mt-1 pl-6 text-sm font-bold text-ink-900">No Resolution, No Price.</p>
        </div>
    );
}

export function Bar({ value, tone }: { value: number; tone?: 'good' | 'warn' | 'bad' | 'gold' | 'info' }) {
    const t = tone ?? (value >= 75 ? 'good' : value >= 50 ? 'warn' : 'bad');
    const c = { good: 'bg-verified-500', warn: 'bg-attested-500', bad: 'bg-risk-500', gold: 'bg-gold-500', info: 'bg-controlled-500' }[t];
    return (
        <div className="h-2 w-full overflow-hidden rounded-full bg-parchment-300" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
            <div className={cn('h-full rounded-full', c)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
        </div>
    );
}

export function BarList({ rows, suffix = '%', max }: { rows: [string, number, string?][]; suffix?: string; max?: number }) {
    const top = max ?? Math.max(100, ...rows.map((r) => r[1]));
    return (
        <ul className="space-y-2">
            {rows.map(([label, v, note]) => (
                <li key={label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] items-center gap-3 text-[0.8125rem]">
                    <span className="truncate text-ink-700">{label}</span>
                    <Bar value={(v / top) * 100} tone={suffix === '%' ? undefined : 'gold'} />
                    <span className="w-16 text-right font-semibold text-ink-900">
                        {v.toLocaleString()}
                        {suffix}
                        {note && <span className="block text-[0.6875rem] font-normal text-ink-400">{note}</span>}
                    </span>
                </li>
            ))}
        </ul>
    );
}

/** Semi-circular gauge with red→green bands. */
export function Gauge({ value, label, caption }: { value: number; label?: string; caption?: string }) {
    const v = Math.max(0, Math.min(100, value));
    const angle = Math.PI * (1 - v / 100);
    const x = 60 + 46 * Math.cos(angle);
    const y = 60 - 46 * Math.sin(angle);
    const arc = (from: number, to: number) => {
        const a1 = Math.PI * (1 - from / 100);
        const a2 = Math.PI * (1 - to / 100);
        return `M ${60 + 46 * Math.cos(a1)} ${60 - 46 * Math.sin(a1)} A 46 46 0 0 1 ${60 + 46 * Math.cos(a2)} ${60 - 46 * Math.sin(a2)}`;
    };
    return (
        <div className="text-center">
            <svg viewBox="0 0 120 70" className="mx-auto w-44" role="img" aria-label={`${Math.round(v)} percent`}>
                <path d={arc(0, 50)} stroke="var(--color-risk-500)" strokeWidth="10" fill="none" />
                <path d={arc(50, 75)} stroke="var(--color-attested-500)" strokeWidth="10" fill="none" />
                <path d={arc(75, 100)} stroke="var(--color-verified-500)" strokeWidth="10" fill="none" />
                <circle cx={x} cy={y} r="5" fill="var(--color-ink-900)" stroke="white" strokeWidth="2" />
            </svg>
            <p className="-mt-6 text-3xl font-bold text-ink-900">{Math.round(v)}%</p>
            {label && <p className={cn('text-sm font-semibold', v >= 75 ? 'text-verified-700' : v >= 50 ? 'text-attested-700' : 'text-risk-700')}>{label}</p>}
            {caption && <p className="mt-1 text-xs text-ink-500">{caption}</p>}
        </div>
    );
}

const DONUT_COLORS = ['var(--color-verified-500)', 'var(--color-attested-500)', 'var(--color-controlled-500)', 'var(--color-ink-300)', 'var(--color-risk-500)', 'var(--color-referenced-500)', 'var(--color-gold-500)'];

export function Donut({ data, center, sub, size = 120 }: { data: [string, number][]; center?: ReactNode; sub?: string; size?: number }) {
    const total = data.reduce((s, d) => s + d[1], 0) || 1;
    let acc = 0;
    const r = 40;
    const c = 2 * Math.PI * r;
    return (
        <div className="flex flex-wrap items-center gap-4">
            <div className="relative shrink-0" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" className="size-full -rotate-90" aria-hidden="true">
                    <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-parchment-300)" strokeWidth="14" />
                    {data.map(([label, v], i) => {
                        const len = (v / total) * c;
                        const el = <circle key={label} cx="50" cy="50" r={r} fill="none" stroke={DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth="14" strokeDasharray={`${len} ${c - len}`} strokeDashoffset={-acc} />;
                        acc += len;
                        return el;
                    })}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-lg leading-none font-bold text-ink-900">{center ?? total}</span>
                    {sub && <span className="mt-0.5 text-[0.625rem] text-ink-500">{sub}</span>}
                </div>
            </div>
            <ul className="min-w-0 flex-1 space-y-1 text-xs">
                {data.map(([label, v], i) => (
                    <li key={label} className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-1.5 text-ink-600">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            {label}
                        </span>
                        <span className="font-semibold text-ink-900">
                            {v.toLocaleString()} <span className="font-normal text-ink-400">({Math.round((v / total) * 100)}%)</span>
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export function Spark({ values, className }: { values: number[]; className?: string }) {
    if (values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const pts = values.map((v, i) => `${(i / (values.length - 1)) * 100},${30 - ((v - min) / (max - min || 1)) * 26}`).join(' ');
    return (
        <svg viewBox="0 0 100 32" className={cn('h-8 w-full', className)} aria-hidden="true" preserveAspectRatio="none">
            <polyline points={pts} fill="none" stroke="var(--color-gold-500)" strokeWidth="2" />
        </svg>
    );
}

/* ------------------------------------------------------------------ table */
export function Table({ columns, rows, empty = 'No records.', dense }: { columns: ReactNode[]; rows: ReactNode[][]; empty?: ReactNode; dense?: boolean }) {
    return (
        <div className="overflow-x-auto rounded-[6px] border border-parchment-400">
            <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                <thead className="bg-parchment-200 text-[0.6875rem] font-semibold tracking-wide text-ink-600 uppercase">
                    <tr>
                        {columns.map((c, i) => (
                            <th key={i} scope="col" className="px-3 py-2 whitespace-nowrap">
                                {c}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-parchment-300 bg-white">
                    {rows.length === 0 && (
                        <tr>
                            <td colSpan={columns.length} className="px-3 py-6 text-center text-ink-400">
                                {empty}
                            </td>
                        </tr>
                    )}
                    {rows.map((r, i) => (
                        <tr key={i} className="hover:bg-parchment-100">
                            {r.map((cell, j) => (
                                <td key={j} className={cn('px-3 align-top text-ink-700', dense ? 'py-1.5' : 'py-2')}>
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function Pager({ page, total, perPage, path, query }: { page: number; total: number; perPage: number; path: string; query: Record<string, any> }) {
    const pages = Math.max(1, Math.ceil(total / perPage));
    if (pages <= 1) return <p className="mt-3 text-xs text-ink-500">Showing {total} of {total}</p>;
    const href = (p: number) => {
        const q = new URLSearchParams(Object.entries({ ...query, page: String(p) }).filter(([, v]) => v !== undefined && v !== null && v !== '') as [string, string][]);
        return `${path}?${q.toString()}`;
    };
    return (
        <nav className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500" aria-label="Pagination">
            <span>
                Showing {(page - 1) * perPage + 1} to {Math.min(total, page * perPage)} of {total}
            </span>
            <div className="flex gap-1">
                {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                    <Link key={p} href={href(p)} preserveScroll className={cn('flex size-8 items-center justify-center rounded-[4px] border', p === page ? 'border-gold-500 bg-gold-500 font-semibold text-ink-900' : 'border-parchment-400 bg-white hover:border-gold-500')} aria-current={p === page ? 'page' : undefined}>
                        {p}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

/** A select that navigates by updating one query parameter (server-side filtering). */
export function FilterSelect({ label, name, value, options, path, query, className }: { label: string; name: string; value?: string; options: { value: string; label: string }[]; path: string; query: Record<string, any>; className?: string }) {
    return (
        <label className={cn('block text-[0.6875rem] font-medium text-ink-500', className)}>
            {label}
            <select
                className="mt-1 h-9 w-full rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem] text-ink-900 focus:border-gold-500 focus:ring-2 focus:ring-gold-500/20 focus:outline-none"
                value={value ?? ''}
                onChange={(e) => router.get(path, { ...query, [name]: e.target.value || undefined, page: undefined }, { preserveScroll: true, preserveState: true })}
            >
                <option value="">All</option>
                {options.map((o) => (
                    <option key={o.value} value={o.value}>
                        {o.label}
                    </option>
                ))}
            </select>
        </label>
    );
}

/* ------------------------------------------------------------------ actions */
export function ActionButton({ label, href, onClick, primary, icon: Icon = L.ArrowRight, download, method }: { label: string; href?: string; onClick?: () => void; primary?: boolean; icon?: LucideIcon; download?: boolean; method?: 'post' }) {
    const cls = cn(
        'flex w-full items-center justify-center gap-2 rounded-[4px] border px-3 py-2 text-[0.8125rem] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-gold-500/40 focus-visible:outline-none',
        primary ? 'border-gold-500 bg-gold-500 text-ink-900 hover:bg-gold-400' : 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500',
    );
    const inner = (
        <>
            {label} <Icon className="size-3.5" aria-hidden="true" />
        </>
    );
    if (href && download) return <a href={href} className={cls}>{inner}</a>;
    if (href) return <Link href={href} method={method} as={method ? 'button' : undefined} className={cls}>{inner}</Link>;
    return (
        <button type="button" onClick={onClick ?? (() => openAskQuestion({ subject: label, section: 'Countries' }))} className={cls}>
            {inner}
        </button>
    );
}

export function Advisor({ title = 'Need Expert Guidance?', body = 'Speak to a TBCA Advisor for tailored support.', cta = 'Speak to an Advisor' }: { title?: string; body?: string; cta?: string }) {
    return (
        <div className="rounded-[8px] border border-verified-500/20 bg-verified-50 p-4">
            <p className="flex items-center gap-2 text-sm font-semibold text-verified-700">
                <L.UserRound className="size-4" aria-hidden="true" /> {title}
            </p>
            <p className="mt-1 text-xs text-ink-600">{body}</p>
            <button type="button" onClick={() => openAskQuestion({ subject: title, section: 'Countries' })} className="mt-3 w-full rounded-[4px] border border-parchment-500 bg-white px-3 py-2 text-[0.8125rem] font-semibold text-ink-800 hover:border-gold-500">
                {cta} →
            </button>
        </div>
    );
}

export const DEFAULT_TRUST: [string, string][] = [
    ['Evidence First', 'All claims are evidence-backed with verified sources.'],
    ['Secure & Compliant', 'POPIA & ISO 27001 aligned. Enterprise-grade controls.'],
    ['Human-Reviewed', 'All critical content reviewed by subject matter experts.'],
    ['Always Current', 'Real-time updates and continuous monitoring.'],
];

export function TrustStrip({ items = DEFAULT_TRUST }: { items?: [string, string][] }) {
    const icons = [L.FileCheck, L.ShieldCheck, L.UserCheck, L.RefreshCw, L.ClipboardCheck, L.Globe];
    return (
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {items.map(([t, b], i) => {
                const Icon = icons[i % icons.length];
                return (
                    <li key={t} className="flex items-start gap-2.5 rounded-[8px] border border-parchment-400 bg-white p-3">
                        <Icon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                        <div>
                            <p className="text-[0.8125rem] font-semibold text-ink-900">{t}</p>
                            <p className="text-[0.6875rem] text-ink-500">{b}</p>
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export function FooterBar({ updated = '15 Aug 2026 10:24 SAST' }: { updated?: string }) {
    return (
        <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-parchment-400 pt-3 text-[0.6875rem] text-ink-500">
            <span>Last updated: {updated}</span>
            <span>All times shown in SAST (UTC+2)</span>
            <span>Information only. Not legal or tax advice.</span>
        </div>
    );
}

export function money(n: number | null | undefined, currency = 'ZAR') {
    if (n === null || n === undefined) return '—';
    const s = Number(n).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    return currency === 'ZAR' ? `R ${s}` : `${s} ${currency}`;
}

export function rands(n: number) {
    if (n >= 1_000_000_000) return `R${(n / 1_000_000_000).toFixed(2)}B`;
    if (n >= 1_000_000) return `R${(n / 1_000_000).toFixed(1)}M`;
    return `R${Math.round(n).toLocaleString('en-ZA')}`;
}
