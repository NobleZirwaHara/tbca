import { useState, type ReactNode } from 'react';
import { Link, router } from '@inertiajs/react';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import type { Option } from '@/types/shop';

export const fmtZar = (v: number | null | undefined) => (v === null || v === undefined ? '-' : formatZar(v).replace('R', 'ZAR '));
export const fmtDate = (iso?: string | null, time = false) =>
    iso ? new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}) }) : '-';
export const pct = (n: number, d: number) => (d > 0 ? `${((100 * n) / d).toFixed(2)}%` : '0%');

/** KPI tile with an icon square, matching the console mockups. */
export function Kpi({ icon, label, value, caption, tone = 'neutral' }: { icon?: ReactNode; label: ReactNode; value: ReactNode; caption?: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' | 'info' }) {
    const toneClass = { neutral: 'text-ink-900', good: 'text-verified-700', warn: 'text-attested-700', bad: 'text-risk-700', info: 'text-controlled-700' }[tone];
    const iconTone = { neutral: 'bg-parchment-200 text-ink-600', good: 'bg-verified-50 text-verified-700', warn: 'bg-attested-50 text-attested-700', bad: 'bg-risk-50 text-risk-700', info: 'bg-controlled-50 text-controlled-700' }[tone];
    return (
        <div className="flex items-start gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
            {icon && <span className={cn('flex size-10 shrink-0 items-center justify-center rounded-[8px]', iconTone)}>{icon}</span>}
            <div className="min-w-0">
                <p className="text-xs font-medium text-ink-500">{label}</p>
                <p className={cn('text-xl font-bold tracking-tight', toneClass)}>{value}</p>
                {caption && <p className="text-[0.6875rem] text-ink-400">{caption}</p>}
            </div>
        </div>
    );
}

export function KpiGrid({ children, cols = 6 }: { children: ReactNode; cols?: number }) {
    return <div className={cn('grid gap-3 sm:grid-cols-2', cols >= 6 ? 'xl:grid-cols-6' : cols === 5 ? 'xl:grid-cols-5' : 'xl:grid-cols-4')}>{children}</div>;
}

const DONUT_COLORS = ['#1f7a4c', '#d6a32e', '#b5372a', '#2f5fa8', '#7a4fa3', '#9a9aa5'];

/** SVG donut with legend. */
export function Donut({ title, segments, centre, caption }: { title: string; segments: { label: string; value: number; color?: string }[]; centre?: ReactNode; caption?: ReactNode }) {
    const total = segments.reduce((s, x) => s + x.value, 0);
    let offset = 0;
    const r = 15.9155;
    return (
        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="mb-3 text-sm font-semibold text-ink-900">{title}</h2>
            <div className="flex items-center gap-4">
                <div className="relative size-28 shrink-0">
                    <svg viewBox="0 0 36 36" className="size-28 -rotate-90" role="img" aria-label={`${title}: ${segments.map((s) => `${s.label} ${s.value}`).join(', ')}`}>
                        <circle cx="18" cy="18" r={r} fill="none" stroke="#f4ede1" strokeWidth="4" />
                        {total > 0 &&
                            segments.map((s, i) => {
                                const len = (100 * s.value) / total;
                                const el = <circle key={s.label} cx="18" cy="18" r={r} fill="none" stroke={s.color ?? DONUT_COLORS[i % DONUT_COLORS.length]} strokeWidth="4" strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-offset} />;
                                offset += len;
                                return el;
                            })}
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span className="text-lg font-bold text-ink-900">{centre ?? total}</span>
                        <span className="text-[0.625rem] text-ink-500">{caption ?? 'Total'}</span>
                    </div>
                </div>
                <ul className="min-w-0 flex-1 space-y-1.5 text-xs">
                    {segments.map((s, i) => (
                        <li key={s.label} className="flex items-center gap-2">
                            <span className="size-2.5 shrink-0 rounded-full" style={{ background: s.color ?? DONUT_COLORS[i % DONUT_COLORS.length] }} />
                            <span className="flex-1 truncate text-ink-700">{s.label}</span>
                            <span className="font-semibold text-ink-900">{s.value}</span>
                            <span className="w-14 text-right text-ink-400">{pct(s.value, total)}</span>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

/** GET filter bar: changes reload the console with query params (server-side filtering). */
export function FilterBar({ path, filters, selects, search = true }: { path: string; filters: Record<string, unknown>; selects: { name: string; label: string; options: (Option | string)[] }[]; search?: boolean }) {
    const [q, setQ] = useState(String(filters.q ?? ''));
    const apply = (patch: Record<string, string>) => {
        const next = Object.fromEntries(Object.entries({ ...filters, ...patch }).filter(([, v]) => v !== '' && v !== null && v !== undefined));
        router.get(path, next as Record<string, string>, { preserveState: true, preserveScroll: true, replace: true });
    };
    return (
        <form
            className="flex flex-wrap items-end gap-3 rounded-[8px] border border-parchment-400 bg-white p-3"
            onSubmit={(e) => {
                e.preventDefault();
                apply({ q });
            }}
        >
            {selects.map((s) => (
                <label key={s.name} className="text-xs font-medium text-ink-600">
                    {s.label}
                    <select
                        className="mt-1 block h-9 min-w-36 rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.8125rem] text-ink-900"
                        value={String(filters[s.name] ?? '')}
                        onChange={(e) => apply({ [s.name]: e.target.value })}
                    >
                        <option value="">All</option>
                        {s.options.map((o) => {
                            const opt = typeof o === 'string' ? { value: o, label: o } : o;
                            return <option key={opt.value} value={opt.value}>{opt.label}</option>;
                        })}
                    </select>
                </label>
            ))}
            {search && (
                <label className="min-w-48 flex-1 text-xs font-medium text-ink-600">
                    Search code / name
                    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search..." className="mt-1 block h-9 w-full rounded-[4px] border border-parchment-500 px-2 text-[0.8125rem]" />
                </label>
            )}
            <button type="submit" className="h-9 rounded-[4px] border border-parchment-500 px-3 text-xs font-semibold text-ink-700 hover:border-gold-500">Apply</button>
            <Link href={path} className="h-9 px-2 text-xs leading-9 text-ink-500 hover:text-ink-900">Reset</Link>
        </form>
    );
}

/** Small POST action button for console rows (state-changing admin actions). */
export function ActionButton({
    href,
    data = {},
    children,
    tone = 'neutral',
    confirm: confirmText,
    method = 'post',
    disabled,
}: {
    href: string;
    data?: Record<string, unknown>;
    children: ReactNode;
    tone?: 'neutral' | 'good' | 'bad' | 'primary';
    confirm?: string;
    method?: 'post' | 'patch';
    disabled?: boolean;
}) {
    const cls = {
        neutral: 'border-parchment-500 text-ink-700 hover:border-gold-500',
        good: 'border-verified-500 text-verified-700 hover:bg-verified-50',
        bad: 'border-risk-500/60 text-risk-700 hover:bg-risk-50',
        primary: 'border-verified-700 bg-verified-700 text-white hover:bg-verified-500',
    }[tone];
    return (
        <button
            type="button"
            disabled={disabled}
            onClick={() => {
                if (confirmText && !window.confirm(confirmText)) return;
                router[method](href, data as never, { preserveScroll: true });
            }}
            className={cn('inline-flex h-8 items-center gap-1.5 rounded-[4px] border px-2.5 text-xs font-semibold whitespace-nowrap disabled:opacity-40', cls)}
        >
            {children}
        </button>
    );
}

export function Pager({ links }: { links: { url: string | null; label: string; active: boolean }[] }) {
    if (links.length <= 3) return null;
    return (
        <nav className="flex flex-wrap gap-1" aria-label="Pagination">
            {links.map((l, i) =>
                l.url ? (
                    <Link key={i} href={l.url} preserveScroll className={cn('min-w-8 rounded-[4px] border px-2 py-1 text-center text-xs', l.active ? 'border-verified-700 bg-verified-700 text-white' : 'border-parchment-500 bg-white text-ink-700')}>
                        <span dangerouslySetInnerHTML={{ __html: l.label }} />
                    </Link>
                ) : (
                    <span key={i} className="min-w-8 px-2 py-1 text-center text-xs text-ink-300" dangerouslySetInnerHTML={{ __html: l.label }} />
                ),
            )}
        </nav>
    );
}

export function Card({ title, action, children, className }: { title?: ReactNode; action?: ReactNode; children: ReactNode; className?: string }) {
    return (
        <section className={cn('rounded-[8px] border border-parchment-400 bg-white p-4', className)}>
            {(title || action) && (
                <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    {title && <h2 className="text-sm font-semibold text-ink-900">{title}</h2>}
                    {action}
                </header>
            )}
            {children}
        </section>
    );
}

export function GateIcon({ state }: { state: string }) {
    const map: Record<string, [string, string]> = {
        pass: ['✓', 'bg-verified-500 text-white'],
        warn: ['!', 'bg-attested-500 text-white'],
        pending: ['…', 'bg-attested-500 text-white'],
        fail: ['×', 'bg-risk-500 text-white'],
    };
    const [glyph, cls] = map[state] ?? ['–', 'bg-parchment-400 text-ink-600'];
    return (
        <span className={cn('inline-flex size-5 items-center justify-center rounded-full text-[0.6875rem] font-bold', cls)} title={state} aria-label={state}>
            {glyph}
        </span>
    );
}

/** Bar list: label, value and a proportional bar. */
export function BarList({ rows, format = (v: number) => String(v) }: { rows: { label: string; value: number }[]; format?: (v: number) => string }) {
    const max = Math.max(1, ...rows.map((r) => Math.abs(r.value)));
    return (
        <ul className="space-y-2">
            {rows.map((r) => (
                <li key={r.label} className="text-xs">
                    <div className="flex justify-between gap-2"><span className="text-ink-700">{r.label}</span><span className="font-semibold text-ink-900">{format(r.value)}</span></div>
                    <div className="mt-1 h-1.5 rounded-full bg-parchment-300"><div className="h-full rounded-full bg-verified-700" style={{ width: `${(100 * Math.abs(r.value)) / max}%` }} /></div>
                </li>
            ))}
        </ul>
    );
}
