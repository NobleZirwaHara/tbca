/*
 * Shared pieces for the desk and dashboard pages rebuilt from the client's "TBCA AIIM Botswana"
 * prototype (mock-ups 72 to 82): embedded-service rail and cards (prices from the app's Sprint
 * records, "Add" puts the Sprint in the site basket), register and pack tables, text links and the
 * vertical bar chart.
 */
import { Link, router } from '@inertiajs/react';
import { Fragment, type ReactNode } from 'react';
import { A, B, Card, Chip, DataTable, Ic, N, STable, StatusChip, useMoney } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';

export const BW_SLUG = 'botswana';
export const bwHref = (path: string) => `/aiim/country/${BW_SLUG}/${path}`;
export const svcHref = (code: string) => `/aiim/services/${encodeURIComponent(code)}`;
export const sheetHref = (sheet: string) => bwHref(`registers/${sheet}`);
export const leadHref = (id: string) => bwHref(`leads/${encodeURIComponent(id)}`);
/** Botswana unit profile: the Countries tab unit page (the AIIM province page holds South African provinces). */
export const unitHref = (code: string) => `/countries/${BW_SLUG}/geo/unit/${code}`;
export const ADVISOR_HREF = '/aiim/workspace/advisor-request';

export interface ProtoSvc { code: string; name: string; cat: string | null; et: string | null; db: string | null; a0: number | null; ep: number | null; inApp: boolean }
export interface SvcRail { title: string; items: ProtoSvc[]; total: number }
export type Cell = string | number | null;
export interface Sheet { name: string; h: string[]; rows: Record<string, Cell>[]; filters: string[] }

/** Add an embedded service to the AIIM fee manifest (priced at its app Sprint entry price). */
export function addService(s: ProtoSvc, context?: string) {
    if (!s.inApp || s.ep === null) return;
    router.post('/aiim/fees/items', { type: 'service', key: s.code, ctx: context ?? null }, { preserveScroll: true });
}

export function SvcPrice({ s, className }: { s: ProtoSvc; className?: string }) {
    const money = useMoney();
    return s.inApp && s.ep !== null
        ? <span className={cn('font-mono font-semibold whitespace-nowrap', className)}>from {money(s.ep)}</span>
        : <span className={cn('text-[0.75rem] text-ink-400', className)}>Not in the app catalogue yet</span>;
}

export function AddBtn({ s, context }: { s: ProtoSvc; context?: string }) {
    if (!s.inApp || s.ep === null) return null;
    return <B v="pri" sm onClick={() => addService(s, context)} aria-label={`Add ${s.name} to basket`}>Add</B>;
}

/** Service rail (prototype svcRail). */
export function ServiceRail({ rail, context }: { rail: SvcRail; context?: string }) {
    if (!rail.items.length) return null;
    return (
        <Card title={rail.title} act={<A sm href="/aiim/services">All {N(rail.total)}</A>}>
            <div className="space-y-2.5">
                {rail.items.map((s) => (
                    <div key={s.code} className="rounded-[6px] border border-parchment-400 p-3">
                        <Link href={svcHref(s.code)} className="text-[0.82rem] leading-snug font-semibold text-ink-900 hover:text-gold-700">{s.name}</Link>
                        <div className="mt-1 flex flex-wrap gap-x-2 text-[0.7rem] text-ink-400">
                            <span className="font-mono">{s.code}</span>
                            {s.et && <span>{s.et} tier</span>}
                            {s.db && <span className="inline-flex items-center gap-0.5"><Ic n="clock" className="size-3" /> {s.db}</span>}
                            <span>AAI {s.a0 !== null ? `${Math.round(s.a0 * 100)}%` : '—'}</span>
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2 text-[0.8rem]">
                            <span><SvcPrice s={s} />{s.inApp && <span className="ml-1 text-[0.66rem] text-ink-400">excl. VAT</span>}</span>
                            <AddBtn s={s} context={rail.title} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

/** Service card (prototype Enterprise Desk cards). */
export function ServiceCard({ s }: { s: ProtoSvc }) {
    return (
        <div className="flex min-w-0 flex-col rounded-[6px] border border-parchment-400 bg-white p-4">
            <span className="font-mono text-[0.7rem] text-ink-400">{s.code}</span>
            <h3 className="mt-1 text-[1rem] font-semibold text-ink-900"><Link href={svcHref(s.code)} className="hover:text-gold-700">{s.name}</Link></h3>
            <div className="mt-3 flex items-center justify-between gap-2 border-t border-parchment-300 pt-3 text-[0.85rem]">
                <SvcPrice s={s} />
                <AddBtn s={s} context="Enterprise Desk" />
            </div>
        </div>
    );
}

/** Banner (prototype .banner). */
export function Banner({ children }: { children: ReactNode }) {
    return <div className="flex items-start gap-2 rounded-[6px] border border-gold-300 bg-gold-50 px-3 py-2.5 text-[0.8rem] text-ink-700"><Ic n="shield" className="mt-0.5 text-gold-700" />{children}</div>;
}

/* ------------------------------------------------------------------ text links (prototype rich) */
const RICH = /\b(BW-[A-Z]{3}-[SA]\d{2}(?:-O\d{2})?|BW-HL-\d{4}|BW-PB-\d{2}|UE-\d{2}|DG-\d{2}|(?:BW-)?(?:MAC|ENR|OGS|MIN|AGR|BLU|FOR|MFG|WSW|TRN|ICT|CRE|TOU|HLT|EDU|FIN|TRD|GRN|CSP)-F\d+)\b/g;

function richHref(id: string): string {
    if (/^BW-HL-/.test(id)) return leadHref(id);
    if (/^BW-PB-/.test(id)) return '/aiim/store';
    if (/^UE-/.test(id)) return bwHref('economics');
    if (/^DG-/.test(id)) return '/aiim/risk';
    if (/^BW-[A-Z]{3}-[SA]\d{2}/.test(id)) return `/aiim/opportunities/${id}`;
    const fact = id.startsWith('BW-') ? id : `BW-${id}`;
    return `${sheetHref('BW_Facts')}?q=${encodeURIComponent(fact)}`;
}

/** Register or pack text with its IDs linked (opportunities, leads, briefs, unit economics, data gaps, facts). */
export function Rich({ v }: { v: unknown }) {
    const s = v === null || v === undefined ? '' : String(v);
    const parts = s.split(RICH);
    if (parts.length === 1) return <>{s}</>;
    return <>{parts.map((p, i) => (i % 2 ? <Link key={i} href={richHref(p)} className="font-semibold text-controlled-700 hover:underline">{p}</Link> : <Fragment key={i}>{p}</Fragment>))}</>;
}

/* ------------------------------------------------------------------ tables */
function TierChip({ t }: { t: unknown }) {
    const s = String(t ?? '');
    const short = s.length > 16 ? s.slice(0, s.indexOf(' ') > 0 ? s.indexOf(' ') : 16) : s;
    return <Chip t={short} tone={s.startsWith('A+') ? 'gold' : s.startsWith('A') ? 'ok' : s.startsWith('B') ? 'info' : 'grey'} />;
}

/** Pack table cell (prototype cellFmt): tier and status chips, otherwise linked text. */
function docCell(h: string, v: string): ReactNode {
    const k = h.toLowerCase();
    if (/^tier|downturn tier|^tier a|tier \(/.test(k) && /^(A|B|C)/.test(v)) return <TierChip t={v} />;
    if (k === 'status' || k === 'result') return <StatusChip s={v} />;
    return <Rich v={v} />;
}

/** Country pack table (prototype docTableHTML): first row is the header. */
export function DocTable({ rows }: { rows: string[][] }) {
    if (!rows.length) return <p className="text-[0.82rem] text-ink-400">No table.</p>;
    const h = rows[0];
    return <STable compact head={h} rows={rows.slice(1).map((r) => r.map((c, i) => <span key={i} className={cn(/^[\d,.\-−+ %]+$/.test(c) && c.length < 14 && 'block text-right')}>{docCell(h[i] ?? '', c)}</span>))} />;
}

/** Register table with every column (prototype sheetTable). `bare` drops the search bar and pager. */
export function SheetTable({ s, bare, size = 25, fmt }: { s: Sheet; bare?: boolean; size?: number; fmt?: Record<string, (v: Cell, r: Record<string, Cell>) => ReactNode> }) {
    const cell = (k: string, r: Record<string, Cell>) => (fmt?.[k] ? fmt[k](r[k], r) : <Rich v={r[k]} />);
    if (bare && s.rows.length <= size) {
        return <STable compact head={s.h} rows={s.rows.map((r) => s.h.map((k) => cell(k, r)))} />;
    }
    return <DataTable compact name={s.name} size={size} filters={s.filters} rows={s.rows} cols={s.h.map((k) => ({ k, l: k, r: (r: Record<string, Cell>) => cell(k, r) }))} />;
}

/* ------------------------------------------------------------------ charts */
function niceMax(m: number) {
    if (m <= 0) return 1;
    const p = 10 ** Math.floor(Math.log10(m));
    const f = m / p;
    return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p;
}

/** Vertical bar chart (prototype vbars). */
export function VBars({ items, h = 200, fmt = (v: number) => N(v), label = 'Bar chart' }: { items: { n: string; v: number; href?: string }[]; h?: number; fmt?: (v: number) => string; label?: string }) {
    const W = Math.max(320, items.length * 44);
    const P = { l: 44, r: 10, t: 16, b: 52 };
    const mx = niceMax(Math.max(...items.map((i) => i.v), 0) || 1);
    const ih = h - P.t - P.b;
    const bw = (W - P.l - P.r) / Math.max(items.length, 1);
    const y = (v: number) => P.t + (ih * (mx - v)) / mx;
    return (
        <div className="max-w-full overflow-x-auto">
            <svg viewBox={`0 0 ${W} ${h}`} className="w-full" style={{ minWidth: Math.min(W, 600) }} role="img" aria-label={label}>
                <g className="text-ink-300" fontSize="10" fill="var(--color-ink-400)">
                    {[0, 1, 2, 3, 4].map((k) => {
                        const v = (mx * k) / 4;
                        return <g key={k}><line x1={P.l} x2={W - P.r} y1={y(v)} y2={y(v)} stroke="var(--color-parchment-300)" /><text x={P.l - 6} y={y(v) + 4} textAnchor="end">{fmt(v)}</text></g>;
                    })}
                </g>
                {items.map((it, i) => {
                    const x = P.l + i * bw + bw * 0.18;
                    const y0 = y(Math.max(it.v, 0));
                    const cx = x + bw * 0.32;
                    return (
                        <g key={i}>
                            <rect x={x} y={y0} width={bw * 0.64} height={Math.max(0, y(0) - y0)} rx="3" fill="var(--color-gold-500)"><title>{`${it.n}: ${fmt(it.v)}`}</title></rect>
                            <text x={cx} y={y0 - 4} textAnchor="middle" fontSize="10" fontWeight="600" fill="var(--color-ink-700)">{fmt(it.v)}</text>
                            <text x={cx} y={P.t + ih + 14} textAnchor="end" fontSize="10" fill="var(--color-ink-500)" transform={`rotate(-35 ${cx} ${P.t + ih + 14})`}>{it.n.slice(0, 14)}</text>
                        </g>
                    );
                })}
            </svg>
        </div>
    );
}

/** Quick links list (prototype .qa). */
export function QuickLinks({ items }: { items: [string, string, string][] }) {
    return (
        <Card>
            <div className="grid gap-1">
                {items.map(([href, icon, label]) => (
                    <Link key={href} href={href} className="flex items-center gap-2 rounded-[4px] px-2 py-2 text-[0.85rem] font-semibold text-ink-800 hover:bg-parchment-200"><Ic n={icon} className="text-gold-700" /> {label}</Link>
                ))}
            </div>
        </Card>
    );
}

/** Main column plus side column (prototype .split) for pages without the AIIM right rail. */
export function Split({ side, children }: { side?: ReactNode; children: ReactNode }) {
    return (
        <div className={cn('grid gap-4', side && 'xl:grid-cols-[minmax(0,1fr)_20rem]')}>
            <div className="grid min-w-0 content-start gap-4">{children}</div>
            {side && <div className="grid min-w-0 content-start gap-4">{side}</div>}
        </div>
    );
}
