import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useMemo, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import * as L from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/cn';
import { formatMoney, useCurrency } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { ServerTableData } from '@/types/industries';

/* ------------------------------------------------------------------ icons (prototype names) */
const ICONS: Record<string, LucideIcon> = {
    leaf: L.Leaf, pick: L.Pickaxe, factory: L.Factory, bolt: L.Zap, building: L.Building2, cart: L.ShoppingCart, truck: L.Truck, cpu: L.Cpu, bank: L.Landmark,
    brief: L.Briefcase, heart: L.HeartPulse, cap: L.GraduationCap, plane: L.Plane, film: L.Film, bridge: L.Construction, gov: L.Building, hand: L.HandHeart,
    gauge: L.Gauge, scale: L.Scale, cog: L.Settings, search: L.Search, back: L.ArrowLeft, home: L.House, refresh: L.RefreshCw, globe: L.Globe, shield: L.ShieldCheck,
    layers: L.Layers, swap: L.ArrowLeftRight, db: L.Database, clock: L.Clock, tag: L.Tag, check: L.Check, alert: L.TriangleAlert, file: L.FileText, users: L.Users,
    cash: L.Banknote, chart: L.ChartLine, map: L.Map, pin: L.MapPin, bell: L.Bell, user: L.User, msg: L.MessageCircle, lock: L.Lock, star: L.Star, ship: L.Ship,
    flame: L.Flame, book: L.BookOpen, spark: L.Sparkles, ext: L.ExternalLink,
};

export const IICON: Record<string, string> = {
    AGR: 'leaf', MIN: 'pick', MFG: 'factory', ENE: 'bolt', PRC: 'building', RET: 'cart', TRN: 'truck', ICT: 'cpu', FIN: 'bank', PRO: 'brief', HLT: 'heart',
    EDU: 'cap', TOU: 'plane', CRE: 'film', INF: 'bridge', GOV: 'gov', NGO: 'hand',
};

export function Ic({ n, className }: { n: string; className?: string }) {
    const C = ICONS[n] ?? L.Circle;
    return <C className={cn('size-4 shrink-0', className)} aria-hidden="true" />;
}

/* ------------------------------------------------------------------ numbers */
const nf = new Intl.NumberFormat('en-US');

export function N(x: unknown, d?: number): string {
    if (x === '' || x === null || x === undefined || Number.isNaN(Number(x))) return String(x ?? '');
    const v = Number(x);
    return d !== undefined ? v.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d }) : nf.format(v);
}

/** US$ m with the prototype's precision (fmtM). */
export function fmtM(v: number): string {
    return v >= 1000 ? `${N(v / 1000, 1)} bn` : v >= 10 ? N(v, 0) : v >= 1 ? N(v, 1) : v > 0 ? N(v, 2) : '0';
}

export const sum = (a: number[]) => a.reduce((s, x) => s + (Number(x) || 0), 0);
export const pct = (a: number, b: number) => (b ? Math.round((100 * a) / b) : 0);

/** Money in the visitor's display currency (amounts are whole ZAR from the app's Sprint records). */
export function useMoney() {
    const { format } = useCurrency();
    return (zar: number | null | undefined) => (zar === null || zar === undefined || Number.isNaN(Number(zar)) ? '—' : format(Number(zar)));
}

/** Modelled US$ millions shown in the display currency (prototype usdM), converted with the app's FX rates. */
export function useUsdM() {
    const { currency, rates } = useCurrency();
    return (v: number | null | undefined) => {
        if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
        const x = Number(v);
        if (currency === 'USD') return `US$ ${N(x, x < 10 ? 1 : 0)} m`;
        const usd = rates.USD || 0.06;
        return `${formatMoney((x * 1_000_000) / usd / 1_000_000, currency, rates)} m`;
    };
}

/* ------------------------------------------------------------------ chips and tags */
export type Tone = 'ok' | 'warn' | 'bad' | 'info' | 'grey' | 'gold';
const TONE: Record<Tone, string> = {
    ok: 'text-verified-700 bg-verified-50 border-verified-500/30',
    warn: 'text-attested-700 bg-attested-50 border-attested-500/30',
    bad: 'text-risk-700 bg-risk-50 border-risk-500/30',
    info: 'text-controlled-700 bg-controlled-50 border-controlled-500/30',
    grey: 'text-ink-500 bg-ink-50 border-ink-100',
    gold: 'text-gold-800 bg-gold-100 border-gold-200',
};
const DOT: Record<Tone, string> = { ok: 'bg-verified-500', warn: 'bg-attested-500', bad: 'bg-risk-500', info: 'bg-controlled-500', grey: 'bg-ink-300', gold: 'bg-gold-500' };

export function Chip({ t, tone = 'grey', className }: { t: ReactNode; tone?: Tone; className?: string }) {
    return (
        <span className={cn('inline-flex max-w-full items-center gap-1.5 rounded-full border px-2 py-0.5 text-[0.72rem] leading-normal font-semibold', TONE[tone], className)}>
            <i className={cn('inline-block size-1.5 shrink-0 rounded-full', DOT[tone])} aria-hidden="true" />
            {t}
        </span>
    );
}

export function statusTone(s: unknown): Tone {
    const l = String(s ?? '').toLowerCase();
    if (/complete|pass|confirmed|current|ready|active|in force|approved|signed|operating|verified|closed|available|yes|resolved|permitted|compliant/.test(l)) return 'ok';
    if (/progress|review|partly|pending|limited|due|under|quote|conditional|planned|proposed|medium/.test(l)) return 'warn';
    if (/block|fail|expired|not|suspend|restrict|no\b|missing|open|high/.test(l)) return 'bad';
    return 'grey';
}
export const StatusChip = ({ s }: { s: unknown }) => <Chip t={String(s ?? '')} tone={statusTone(s)} />;
export const GradeChip = ({ g }: { g: unknown }) => {
    const v = String(g ?? '');
    return v === '3' ? <Chip t="Grade 3" tone="ok" /> : v === '2' ? <Chip t="Grade 2" tone="info" /> : v === '1' ? <Chip t="Grade 1" tone="warn" /> : <Chip t={`Grade ${v || '—'}`} />;
};
export const CxChip = ({ n, name }: { n: number; name: string }) => <Chip t={name} tone={n >= 4 ? 'bad' : n === 3 ? 'warn' : 'ok'} />;
export const CatChip = ({ cat }: { cat: string }) => (
    <Chip t={`${cat} catalogue`} tone={cat === 'Deep' ? 'ok' : cat === 'Standard' ? 'info' : cat === 'Thin' ? 'warn' : 'bad'} />
);
export const RegChip = ({ reg }: { reg: string }) => <Chip t={reg} tone={/highly/i.test(reg) ? 'bad' : /mixed|rules|procure/i.test(reg) ? 'warn' : 'ok'} />;
export const ActChip = () => <Chip t="Industry Mode: Active" tone="ok" />;

const TAG = 'inline-block rounded-[3px] px-1.5 py-px align-middle text-[0.66rem] font-bold tracking-wide uppercase';
export const TagM = () => <span className={cn(TAG, 'bg-referenced-50 text-referenced-700')} title="Computed or modelled in this prototype">Modelled</span>;
export const TagR = () => <span className={cn(TAG, 'bg-controlled-50 text-controlled-700')} title="General reference knowledge — verify before reliance">Reference</span>;
export const TagP = () => <span className={cn(TAG, 'bg-attested-50 text-gold-700')} title="Awaiting country pack / live data">Placeholder</span>;
export const TagS = ({ s }: { s?: string }) => <span className={cn(TAG, 'bg-verified-50 text-verified-700 normal-case')} title="Sourced from the Botswana data set">{s ?? 'Sourced'}</span>;
export const SrcTag = ({ src }: { src: string }) => (src === 'Placeholder' ? <TagP /> : src === 'Reference' ? <TagR /> : <TagS s={src} />);

/* ------------------------------------------------------------------ layout blocks */
export function Card({ title, icon, sub, act, tone, children, className, id, pad = true }: {
    title?: ReactNode; icon?: string; sub?: ReactNode; act?: ReactNode; tone?: 'gold' | 'dark'; children: ReactNode; className?: string; id?: string; pad?: boolean;
}) {
    return (
        <section id={id} className={cn('min-w-0 rounded-[6px] border shadow-[0_1px_2px_rgba(8,8,11,.06)]', tone === 'gold' ? 'border-gold-300 bg-gold-50' : tone === 'dark' ? 'border-ink-700 bg-ink-900 text-parchment-200' : 'border-parchment-400 bg-white', className)}>
            {title && (
                <div className={cn('flex flex-wrap items-center gap-2.5 border-b px-4 py-3', tone === 'dark' ? 'border-ink-700' : 'border-parchment-300')}>
                    {icon && <Ic n={icon} className="text-gold-600" />}
                    <div className="min-w-0 flex-1">
                        <h3 className={cn('text-[0.95rem] leading-snug font-semibold', tone === 'dark' ? 'text-white' : 'text-ink-900')}>{title}</h3>
                        {sub && <div className="mt-0.5 text-[0.72rem] text-ink-400">{sub}</div>}
                    </div>
                    {act && <div className="flex flex-wrap gap-1.5">{act}</div>}
                </div>
            )}
            <div className={cn(pad && 'p-4')}>{children}</div>
        </section>
    );
}

export function Kpis({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-3', className)}>{children}</div>;
}

export function Kpi({ l, v, s, icon = 'chart', dark }: { l: ReactNode; v: ReactNode; s?: ReactNode; icon?: string; dark?: boolean }) {
    return (
        <div className={cn('flex min-w-0 items-start gap-2.5 rounded-[6px] border p-3', dark ? 'border-ink-700 bg-ink-900' : 'border-parchment-400 bg-white')}>
            <span className={cn('grid grid-cols-[minmax(0,1fr)] size-7 shrink-0 place-items-center rounded-[6px]', dark ? 'bg-ink-800 text-gold-400' : 'bg-gold-50 text-gold-700')}><Ic n={icon} /></span>
            <div className="min-w-0">
                <div className={cn('text-[0.72rem] font-semibold', dark ? 'text-ink-300' : 'text-ink-400')}>{l}</div>
                <div className={cn('text-[1.2rem] leading-tight font-bold break-words', dark ? 'text-white' : 'text-ink-900')}>{v}</div>
                {s && <div className={cn('text-[0.72rem]', dark ? 'text-ink-300' : 'text-ink-400')}>{s}</div>}
            </div>
        </div>
    );
}

export function Dl({ rows, className }: { rows: [ReactNode, ReactNode][]; className?: string }) {
    return (
        <dl className={cn('grid grid-cols-[fit-content(45%)_minmax(0,1fr)] gap-x-4 gap-y-1.5 text-[0.8rem]', className)}>
            {rows.map(([a, b], i) => (
                <div key={i} className="contents">
                    <dt className="text-ink-400">{a}</dt>
                    <dd className="min-w-0 break-words text-ink-800">{b}</dd>
                </div>
            ))}
        </dl>
    );
}

export interface BarRow { label: string; value: number; text?: ReactNode; tone?: 'bad' | 'warn' | ''; href?: string }
export function Bars({ rows }: { rows: BarRow[] }) {
    const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
    return (
        <div className="space-y-1">
            {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)_auto] items-center gap-2 text-[0.78rem] max-sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)_auto]">
                    <span className="truncate" title={r.label}>{r.href ? <Link href={r.href} className="text-controlled-700 hover:underline">{r.label}</Link> : r.label}</span>
                    <span className="h-3.5 overflow-hidden rounded-[3px] bg-parchment-300" aria-hidden="true">
                        <i className={cn('block h-full', r.tone === 'bad' ? 'bg-risk-500' : r.tone === 'warn' ? 'bg-attested-500' : 'bg-gold-500')} style={{ width: `${(100 * (Number(r.value) || 0)) / max}%` }} />
                    </span>
                    <span className="text-right font-semibold whitespace-nowrap">{r.text ?? N(r.value)}</span>
                </div>
            ))}
        </div>
    );
}

export function Donut({ p, label, size = 110 }: { p: number; label?: string; size?: number }) {
    const r = 42;
    const c = 2 * Math.PI * r;
    const v = Math.max(0, Math.min(100, p));
    return (
        <svg width={size} height={size} viewBox="0 0 100 100" role="img" aria-label={`${v}% ${label ?? ''}`}>
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-parchment-300)" strokeWidth="10" />
            <circle cx="50" cy="50" r={r} fill="none" stroke="var(--color-gold-500)" strokeWidth="10" strokeDasharray={`${(c * v) / 100} ${c}`} transform="rotate(-90 50 50)" strokeLinecap="round" />
            <text x="50" y="52" textAnchor="middle" fontSize="20" fontWeight="700" fill="var(--color-ink-900)">{v}%</text>
            {label && <text x="50" y="67" textAnchor="middle" fontSize="8.5" fill="var(--color-ink-400)">{label}</text>}
        </svg>
    );
}

export function Meter({ p, tone }: { p: number; tone?: 'ok' | 'warn' | 'bad' }) {
    return (
        <div className="h-2 min-w-[60px] overflow-hidden rounded-full bg-parchment-300" role="meter" aria-valuenow={p} aria-valuemin={0} aria-valuemax={100}>
            <i className={cn('block h-full rounded-full', tone === 'ok' ? 'bg-verified-500' : tone === 'warn' ? 'bg-attested-500' : tone === 'bad' ? 'bg-risk-500' : 'bg-gold-500')} style={{ width: `${Math.max(0, Math.min(100, p))}%` }} />
        </div>
    );
}

export function Note({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('rounded-r-[4px] border-l-[3px] border-gold-500 bg-gold-50 px-3 py-2.5 text-[0.82rem] text-ink-600', className)}>{children}</div>;
}

export function Ticks({ items, className }: { items: ReactNode[]; className?: string }) {
    return (
        <ul className={cn('space-y-1 text-[0.85rem]', className)}>
            {items.map((x, i) => (
                <li key={i} className="flex gap-2"><span className="font-bold text-verified-700" aria-hidden="true">✓</span><span className="min-w-0">{x}</span></li>
            ))}
        </ul>
    );
}

export function Bullets({ items, className }: { items: ReactNode[]; className?: string }) {
    return <ul className={cn('list-disc space-y-1 ps-5 text-[0.82rem]', className)}>{items.map((x, i) => <li key={i}>{x}</li>)}</ul>;
}

export function Method({ items, on }: { items: string[]; on?: number }) {
    return (
        <div className="flex flex-wrap items-center gap-1.5">
            {items.map((s, i) => (
                <span key={s} className="contents">
                    {i > 0 && <i className="text-gold-600 not-italic" aria-hidden="true">→</i>}
                    <span className={cn('rounded-[4px] px-2.5 py-1.5 text-[0.72rem] font-bold tracking-wide', on === i ? 'bg-gold-500 text-ink-900' : 'bg-ink-900 text-gold-300')}>{s}</span>
                </span>
            ))}
        </div>
    );
}

export function Steps({ items }: { items: { label: string; state?: 'on' | 'done' | ''; step?: string; href?: string; onClick?: () => void }[] }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((s, i) => {
                const cls = cn('min-w-[110px] flex-1 rounded-[4px] border px-2.5 py-2 text-left text-[0.72rem]', s.state === 'on' ? 'border-gold-400 bg-gold-100 text-ink-900' : s.state === 'done' ? 'border-verified-500/30 bg-verified-50 text-ink-700' : 'border-parchment-400 bg-white text-ink-500');
                const body = (<>{s.step && <span className="block">{s.step}</span>}<b className="block text-[0.78rem] text-ink-900">{s.label}</b></>);
                return s.onClick ? <button key={i} type="button" className={cls} onClick={s.onClick} aria-current={s.state === 'on' ? 'step' : undefined}>{body}</button> : <div key={i} className={cls}>{body}</div>;
            })}
        </div>
    );
}

/* ------------------------------------------------------------------ buttons */
type BtnVariant = 'default' | 'pri' | 'yellow' | 'dark' | 'danger';
const BTN: Record<BtnVariant, string> = {
    default: 'border-parchment-500 bg-white text-ink-800 hover:border-gold-500',
    pri: 'border-gold-500 bg-gold-500 text-ink-900 hover:bg-gold-400',
    yellow: 'border-[#e6b800] bg-[#ffd21f] text-[#111] font-bold shadow-[0_2px_0_#c79c00] hover:bg-[#ffdb4d]',
    dark: 'border-ink-600 bg-ink-800 text-parchment-100 hover:border-gold-500',
    danger: 'border-risk-500 bg-white text-risk-700 hover:bg-risk-50',
};
export function btnClass(v: BtnVariant = 'default', sm = false, block = false) {
    return cn('inline-flex items-center justify-center gap-1.5 rounded-[4px] border font-semibold whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50',
        sm ? 'min-h-[30px] px-2.5 text-[0.75rem]' : 'min-h-[36px] px-3.5 text-[0.8rem]', block && 'w-full', BTN[v]);
}
export function A({ href, v, sm, block, children, className, disabled, ...rest }: { href: string; v?: BtnVariant; sm?: boolean; block?: boolean; children: ReactNode; className?: string; disabled?: boolean; preserveScroll?: boolean }) {
    if (/^https?:/.test(href)) return <a href={href} target="_blank" rel="noopener" className={cn(btnClass(v, sm, block), className)}>{children}</a>;
    return <Link href={href} className={cn(btnClass(v, sm, block), 'whitespace-normal text-center', className)} aria-disabled={disabled || undefined} tabIndex={disabled ? -1 : undefined} {...rest}>{children}</Link>;
}
export function B({ v, sm, block, children, className, ...rest }: { v?: BtnVariant; sm?: boolean; block?: boolean; children: ReactNode; className?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
    return <button type="button" className={cn(btnClass(v, sm, block), className)} {...rest}>{children}</button>;
}

/* ------------------------------------------------------------------ tiles */
export function Tile({ href, on, children, onClick, className, as }: { href?: string; on?: boolean; children: ReactNode; onClick?: () => void; className?: string; as?: 'div' }) {
    const cls = cn('flex min-h-[110px] min-w-0 flex-col gap-1.5 rounded-[6px] border bg-white p-3.5 text-left text-ink-800 transition-shadow', on ? 'border-gold-500 shadow-[0_0_0_2px_var(--color-gold-100)]' : 'border-parchment-400 hover:border-gold-400 hover:shadow-[0_1px_8px_rgba(8,8,11,.06)]', className);
    if (as === 'div') return <div className={cls}>{children}</div>;
    if (href) return <Link href={href} className={cls} onClick={onClick}>{children}</Link>;
    return <button type="button" className={cls} onClick={onClick} aria-pressed={on}>{children}</button>;
}
export function TileGrid({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('grid grid-cols-[repeat(auto-fill,minmax(min(100%,190px),1fr))] gap-2.5', className)}>{children}</div>;
}
export function Cols({ n = 2, children, className }: { n?: 2 | 3 | 4; children: ReactNode; className?: string }) {
    return <div className={cn('grid grid-cols-[minmax(0,1fr)] min-w-0 gap-4', n === 2 ? 'md:grid-cols-2' : n === 3 ? 'md:grid-cols-3' : 'sm:grid-cols-2 lg:grid-cols-4', className)}>{children}</div>;
}

/* ------------------------------------------------------------------ tabs (link based, keeps scroll) */
export function Tabs({ items, active, hrefFor }: { items: [string, string][]; active: string; hrefFor: (k: string) => string }) {
    return (
        <div className="-mb-px flex gap-1 overflow-x-auto border-b border-parchment-400" role="tablist">
            {items.map(([k, l]) => (
                <Link key={k} href={hrefFor(k)} preserveScroll role="tab" aria-selected={k === active}
                    className={cn('border-b-2 px-3 py-2.5 text-[0.82rem] font-semibold whitespace-nowrap', k === active ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800')}>
                    {l}
                </Link>
            ))}
        </div>
    );
}

export function PillNav({ items }: { items: { label: string; href: string; on?: boolean }[] }) {
    return (
        <div className="flex flex-wrap gap-1.5">
            {items.map((x) => (
                <Link key={x.href + x.label} href={x.href} preserveScroll className={cn('rounded-full border px-2.5 py-1 text-[0.74rem]', x.on ? 'border-ink-900 bg-ink-900 text-gold-300' : 'border-parchment-400 bg-white text-ink-600 hover:border-gold-400')}>{x.label}</Link>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ tables */
export function STable({ head, rows, compact }: { head: ReactNode[]; rows: ReactNode[][]; compact?: boolean }) {
    return (
        <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400">
            <table className="w-full border-collapse text-[0.78rem]">
                <thead className="bg-parchment-200 text-left">
                    <tr>{head.map((h, i) => <th key={i} className="border-b border-parchment-400 px-2.5 py-2 font-semibold whitespace-nowrap text-ink-600">{h}</th>)}</tr>
                </thead>
                <tbody>
                    {rows.map((r, i) => (
                        <tr key={i} className="border-b border-parchment-300 last:border-0 hover:bg-parchment-100">
                            {r.map((c, j) => <td key={j} className={cn('px-2.5 align-top', compact ? 'py-1.5' : 'py-2')}>{c}</td>)}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export interface Col<T> {
    k?: string;
    l: string;
    r?: (row: T) => ReactNode;
    v?: (row: T) => string | number | null | undefined;
    num?: boolean;
    clip?: boolean;
}

function cellValue<T>(c: Col<T>, row: T): string | number | null | undefined {
    if (c.v) return c.v(row);
    const v = c.k ? (row as Record<string, unknown>)[c.k] : '';
    return v === null || v === undefined ? '' : typeof v === 'number' ? v : String(v);
}

function toCsv<T>(cols: Col<T>[], rows: T[]) {
    const q = (v: unknown) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    return [cols.map((c) => q(c.l)).join(','), ...rows.map((r) => cols.map((c) => q(cellValue(c, r))).join(','))].join('\n');
}

/**
 * Data table with search, column filters, sortable headers, pager, rows per page and CSV
 * (prototype table()). Client mode filters `rows` in the browser; server mode (`server`) asks the
 * page for one page at a time through query parameters q, f[...], sort, dir, page and size.
 */
export function DataTable<T extends object>({ cols, rows, name, filters = [], size = 15, rowHref, sort = null, dir = 1, compact, server, only, csvHref }: {
    cols: Col<T>[]; rows?: T[]; name: string; filters?: string[]; size?: number; rowHref?: (r: T) => string; sort?: number | null; dir?: number; compact?: boolean;
    server?: ServerTableData<T>; only?: string[]; csvHref?: string;
}) {
    const [st, setSt] = useState({ q: '', sort: sort as number | null, dir, page: 0, size, f: {} as Record<string, string> });
    const [copied, setCopied] = useState(false);
    const all = useMemo(() => rows ?? [], [rows]);
    const timer = useRef<number | undefined>(undefined);
    const { url } = usePage<SharedProps>();

    const filtered = useMemo(() => {
        if (server) return server.rows;
        let r = all;
        if (st.q) { const q = st.q.toLowerCase(); r = r.filter((x) => cols.some((c) => String(cellValue(c, x) ?? '').toLowerCase().includes(q))); }
        for (const k of Object.keys(st.f)) if (st.f[k]) r = r.filter((x) => String((x as Record<string, unknown>)[k] ?? '') === st.f[k]);
        if (st.sort !== null && cols[st.sort]) {
            const c = cols[st.sort];
            r = [...r].sort((a, b) => {
                const A = cellValue(c, a), Bv = cellValue(c, b);
                const na = Number(A), nb = Number(Bv);
                if (A !== '' && Bv !== '' && !Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * st.dir;
                return String(A ?? '').localeCompare(String(Bv ?? '')) * st.dir;
            });
        }
        return r;
    }, [all, st, cols, server]);

    const go = (patch: Record<string, unknown>) => {
        if (!server) return;
        const base = { q: server.q, f: server.f, sort: server.sort, dir: server.dir, page: server.page, size: server.size, ...patch };
        const params: Record<string, unknown> = {};
        const path = url.split('?')[0];
        const keep = new URLSearchParams(url.split('?')[1] ?? '');
        keep.forEach((v, k) => { if (!/^(q|f\[.*\]|sort|dir|page|size)$/.test(k)) params[k] = v; });
        Object.entries(base).forEach(([k, v]) => { if (v !== '' && v !== null && v !== undefined && !(k === 'page' && v === 0)) params[k] = v; });
        router.get(path, params as never, { preserveState: true, preserveScroll: true, replace: true, only });
    };

    const page = server ? server.page : st.page;
    const pageSize = server ? server.size : st.size;
    const count = server ? server.count : filtered.length;
    const total = server ? server.total : all.length;
    const pages = Math.max(1, Math.ceil(count / pageSize));
    const curPage = Math.min(page, pages - 1);
    const slice = server ? server.rows : filtered.slice(curPage * pageSize, (curPage + 1) * pageSize);
    const sortCol = server ? server.sort : st.sort;
    const sortDir = server ? server.dir : st.dir;
    const fval = (k: string) => (server ? server.f[k] ?? '' : st.f[k] ?? '');
    const options = (k: string) => (server ? server.options[k] ?? [] : [...new Set(all.map((x) => (x as Record<string, unknown>)[k]).filter((v) => v !== '' && v !== null && v !== undefined).map(String))].sort());

    useEffect(() => () => window.clearTimeout(timer.current), []);

    const setPage = (p: number) => (server ? go({ page: p }) : setSt({ ...st, page: p }));
    const onSort = (i: number) => {
        const d = sortCol === i ? -sortDir : 1;
        if (server) go({ sort: i, dir: d, page: 0 }); else setSt({ ...st, sort: i, dir: d });
    };

    const copy = () => {
        const text = toCsv(cols, filtered);
        const done = () => { setCopied(true); window.setTimeout(() => setCopied(false), 2500); };
        try { void navigator.clipboard.writeText(text).then(done, () => download(text)); } catch { download(text); }
    };
    const download = (text: string) => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([text], { type: 'text/csv' }));
        a.download = `${name}.csv`;
        a.click();
    };

    return (
        <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <input type="search" aria-label="Search table" placeholder="Search this table…" defaultValue={server ? server.q : st.q}
                    onChange={(e) => { const v = e.target.value; if (server) { window.clearTimeout(timer.current); timer.current = window.setTimeout(() => go({ q: v, page: 0 }), 350); } else setSt({ ...st, q: v, page: 0 }); }}
                    className="h-8 w-full max-w-[220px] rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.78rem]" />
                {filters.map((k) => (
                    <select key={k} aria-label={`Filter ${k}`} value={fval(k)} className="h-8 max-w-[180px] rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.75rem]"
                        onChange={(e) => (server ? go({ f: { ...server.f, [k]: e.target.value }, page: 0 }) : setSt({ ...st, f: { ...st.f, [k]: e.target.value }, page: 0 }))}>
                        <option value="">All {k}</option>
                        {options(k).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                ))}
                <span className="text-[0.75rem] text-ink-400">{N(count)} of {N(total)} rows</span>
                {server ? (
                    csvHref && <a className={btnClass('default', true)} href={csvHref}><Ic n="file" /> Download CSV</a>
                ) : (
                    <B sm onClick={copy}><Ic n="file" /> {copied ? 'CSV copied' : 'Copy CSV'}</B>
                )}
            </div>
            <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400">
                <table className="w-full border-collapse text-[0.78rem]">
                    <thead className="bg-parchment-200">
                        <tr>
                            {cols.map((c, i) => (
                                <th key={i} className={cn('border-b border-parchment-400 px-2.5 py-2 font-semibold whitespace-nowrap text-ink-600', c.num ? 'text-right' : 'text-left')}>
                                    <button type="button" className="inline-flex items-center gap-1" onClick={() => onSort(i)}>
                                        {c.l}<span className="text-[0.6rem] text-gold-700" aria-hidden="true">{sortCol === i ? (sortDir > 0 ? '▲' : '▼') : ''}</span>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {slice.length ? slice.map((x, i) => (
                            <tr key={i} className={cn('border-b border-parchment-300 last:border-0 hover:bg-parchment-100', rowHref && 'cursor-pointer')}
                                onClick={rowHref ? (e) => { if (!(e.target as HTMLElement).closest('a,button,input,label')) router.visit(rowHref(x)); } : undefined}>
                                {cols.map((c, j) => {
                                    const v = c.r ? c.r(x) : String(cellValue(c, x) ?? '');
                                    return (
                                        <td key={j} className={cn('px-2.5 align-top', compact ? 'py-1.5' : 'py-2', c.num && 'text-right whitespace-nowrap')}>
                                            {c.clip ? <div className="line-clamp-2 max-w-[22rem] min-w-[10rem]">{v}</div> : v}
                                        </td>
                                    );
                                })}
                            </tr>
                        )) : (
                            <tr><td colSpan={cols.length} className="px-3 py-5 text-center text-ink-400">No rows match.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-ink-500">
                <B sm disabled={curPage === 0} onClick={() => setPage(0)} aria-label="First page">«</B>
                <B sm disabled={curPage === 0} onClick={() => setPage(curPage - 1)}>‹ Prev</B>
                <span>Page {curPage + 1} of {pages}</span>
                <B sm disabled={curPage >= pages - 1} onClick={() => setPage(curPage + 1)}>Next ›</B>
                <B sm disabled={curPage >= pages - 1} onClick={() => setPage(pages - 1)} aria-label="Last page">»</B>
                <select aria-label="Rows per page" value={pageSize} className="h-[30px] rounded-[4px] border border-parchment-500 bg-white px-1"
                    onChange={(e) => (server ? go({ size: Number(e.target.value), page: 0 }) : setSt({ ...st, size: Number(e.target.value), page: 0 }))}>
                    {[10, 15, 25, 50, 100].map((n) => <option key={n}>{n}</option>)}
                </select>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ misc */
export function Flag({ iso2, className }: { iso2: string; className?: string }) {
    const code = (iso2 || '').toUpperCase();
    const emoji = /^[A-Z]{2}$/.test(code) ? String.fromCodePoint(...[...code].map((c) => 127397 + c.charCodeAt(0))) : '🏳';
    return <span role="img" aria-label={`${code} flag`} className={cn('inline-block leading-none', className)}>{emoji}</span>;
}

export function Check({ checked, onChange, children, disabled, className }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; disabled?: boolean; className?: string }) {
    return (
        <label className={cn('flex items-start gap-2 text-[0.85rem]', disabled && 'opacity-60', className)}>
            <input type="checkbox" className="mt-0.5 size-4 accent-gold-600" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
            <span className="min-w-0">{children}</span>
        </label>
    );
}

export function Field({ label, children, className }: { label: ReactNode; children: ReactNode; className?: string }) {
    return <label className={cn('flex min-w-0 flex-col gap-1 text-[0.78rem] font-semibold text-ink-600', className)}>{label}{children}</label>;
}
export const inputCls = 'h-9 w-full min-w-0 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.85rem] font-normal text-ink-800';

/** Short-lived status message (prototype toast). */
export function useToast() {
    const [msg, setMsg] = useState<string | null>(null);
    const t = useRef<number | undefined>(undefined);
    useEffect(() => () => window.clearTimeout(t.current), []);
    const show = (m: string) => { setMsg(m); window.clearTimeout(t.current); t.current = window.setTimeout(() => setMsg(null), 3800); };
    const node = msg ? (
        <div role="status" aria-live="polite" className="fixed bottom-24 left-1/2 z-[70] w-[min(92vw,460px)] -translate-x-1/2 rounded-[6px] bg-ink-900 px-4 py-3 text-[0.85rem] text-parchment-100 shadow-lg">{msg}</div>
    ) : null;
    return { show, node };
}

export function Modal({ title, open, onClose, children }: { title: string; open: boolean; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        if (!open) return;
        const k = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', k);
        return () => window.removeEventListener('keydown', k);
    }, [open, onClose]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[75] flex items-center justify-center bg-ink-950/60 p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
            <div role="dialog" aria-modal="true" aria-label={title} className="max-h-[90vh] w-full max-w-[560px] overflow-auto rounded-[8px] bg-white shadow-xl">
                <div className="flex items-center justify-between border-b border-parchment-300 px-4 py-3">
                    <h3 className="text-[1rem] font-semibold text-ink-900">{title}</h3>
                    <button type="button" onClick={onClose} aria-label="Close" className="text-xl leading-none text-ink-500 hover:text-ink-900">×</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}

/** Persist a small piece of visitor state (account when signed in, else session) without a page visit. */
export function saveState(key: string, value: unknown): Promise<unknown> {
    const token = document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';
    return fetch('/industries/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'X-CSRF-TOKEN': token, 'X-Requested-With': 'XMLHttpRequest' },
        credentials: 'same-origin',
        body: JSON.stringify({ key, value }),
    }).catch(() => undefined);
}

const pending: Record<string, number> = {};
/** saveState, debounced per key (typing in forms). */
export function saveStateSoon(key: string, value: unknown, ms = 500): void {
    window.clearTimeout(pending[key]);
    pending[key] = window.setTimeout(() => { void saveState(key, value); }, ms);
}
