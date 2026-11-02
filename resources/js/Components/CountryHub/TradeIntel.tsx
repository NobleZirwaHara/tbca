/*
 * Shared pieces for the Countries Import & Export pages (prototype pages-trade.js) and the first half
 * of the Intelligence pages (prototype pages-intel.js): bars with the dark "alt" fill and links, the
 * trade basis note, tier chips, country pack text blocks, fact citations and the benchmark card.
 */
import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import { Card, Chip, GradeChip, Ic, N, Note, STable, TagM, TagS } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { HubCountry, Row } from '@/types/countryHub';

/* ------------------------------------------------------------------ trade */
export interface TradeView { t: string; s: string; who: 'import' | 'export'; partner: boolean }
export const VIEWS: Record<number, TradeView> = {
    1: { t: 'Imports vs Whole-Africa Exports', s: 'What {C} buys from each African country, set against everything Africa exports to {C}.', who: 'import', partner: false },
    2: { t: 'Imports vs One Partner’s Exports', s: 'What {C} buys from {P}, against what {P} exports to {C} and to the rest of Africa — where is the headroom?', who: 'import', partner: true },
    3: { t: 'Exports vs Whole-Africa Imports', s: 'What {C} sells to each African country, set against everything Africa imports from {C}.', who: 'export', partner: false },
    4: { t: 'Exports vs One Partner’s Imports', s: 'What {C} sells to {P}, against what {P} imports from {C} and from the rest of Africa — your share and the gap.', who: 'export', partner: true },
};
export const short = (g: string) => g.replace(/\s*\(HS[^)]*\)/, '');
export interface TradeAnchors { bw_imp_from_za: number; bw_exp_to_za: number }
export type TC = { iso3: string; iso2: string; slug: string; name: string };

/** Prototype tradeNote(). */
export function TradeNote({ basis, anchors }: { basis: string; anchors: TradeAnchors }) {
    return (
        <Note className="text-[0.78rem]">
            <b><TagM /> Basis.</b> {basis} Values are US$ m (display currency converts at the platform's daily rates). Botswana anchors: imports from South Africa US$ {N(anchors.bw_imp_from_za)} m; exports to South Africa US$ {N(anchors.bw_exp_to_za)} m.
        </Note>
    );
}

/** Heat legend (prototype .legend swatches). */
export function HeatLegend({ items }: { items: [string | null, ReactNode][] }) {
    return (
        <div className="mt-2 flex flex-wrap gap-3 text-[0.72rem] text-ink-500">
            {items.map(([col, l], i) => (
                <span key={i} className="inline-flex items-center gap-1.5">{col && <i className="inline-block h-3 w-3 rounded-[2px] border border-black/20" style={{ background: col }} />}{l}</span>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ bars (prototype bars(), with the "alt" fill) */
export interface HBar { label: string; value: number; text?: ReactNode; alt?: boolean; href?: string }
export function HBars({ rows }: { rows: HBar[] }) {
    const max = Math.max(...rows.map((r) => Number(r.value) || 0), 1);
    return (
        <div className="space-y-1">
            {rows.map((r, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,10.5rem)_minmax(0,1fr)_auto] items-center gap-2 text-[0.78rem] max-sm:grid-cols-[minmax(0,7rem)_minmax(0,1fr)_auto]">
                    <span className="truncate" title={r.label}>{r.href ? <Link href={r.href} className="text-controlled-700 hover:underline">{r.label}</Link> : r.label}</span>
                    <span className="h-3.5 overflow-hidden rounded-[3px] bg-parchment-300" aria-hidden="true">
                        <i className={cn('block h-full', r.alt ? 'bg-ink-700' : 'bg-gold-500')} style={{ width: `${(100 * (Number(r.value) || 0)) / max}%` }} />
                    </span>
                    <span className="text-right font-semibold whitespace-nowrap">{r.text ?? N(r.value)}</span>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ intelligence */
/** Prototype tierChip(). */
export function TierChip({ t }: { t: unknown }) {
    const s = String(t ?? '');
    return s === 'A+' || s === 'A' ? <Chip t={s} tone="ok" /> : s === 'B' ? <Chip t="B" tone="info" /> : s === 'C' ? <Chip t="C" tone="grey" /> : <Chip t={s || '—'} tone="grey" />;
}
export const bandShort = (b: unknown) => String(b ?? '').split(' ')[0];
export const slug = (s: string) => String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const s = (v: unknown) => (v === null || v === undefined ? '' : String(v));

/** Prototype factCite(). */
export function FactCite({ r }: { r: Row }) {
    return <><span className="text-[0.7rem] text-ink-400">{s(r['Fact ID'])} · {s(r.Source)} · {s(r.Date)}</span> <GradeChip g={r.Grade} /></>;
}

export interface DocBlock { t: 'p' | 'tbl'; s?: string; x?: string; rows?: string[][] }
/** Country pack text blocks (prototype renderBlocks). */
export function DocBlocks({ blocks }: { blocks: DocBlock[] }) {
    return (
        <div className="text-[0.86rem] leading-relaxed">
            {blocks.map((b, i) => {
                if (b.t === 'tbl') {
                    const r = b.rows ?? [];
                    return r.length ? <div key={i} className="my-2.5"><STable compact head={r[0]} rows={r.slice(1)} /></div> : null;
                }
                const x = b.x ?? '';
                switch (b.s) {
                    case 'Title': return <h1 key={i} className="text-[1.6rem] font-bold">{x}</h1>;
                    case 'Subtitle': return <p key={i} className="text-ink-400">{x}</p>;
                    case 'Heading 1': return <h2 key={i} id={`h-${slug(x)}`} className="mt-5 mb-2 border-t-2 border-gold-200 pt-3 text-[1.25rem] font-bold first:mt-0">{x}</h2>;
                    case 'Heading 2': return <h3 key={i} id={`h-${slug(x)}`} className="mt-4 mb-1.5 text-[1.02rem] font-semibold text-gold-800">{x}</h3>;
                    case 'Block Text': return <Note key={i} className="my-2">{x}</Note>;
                    default: return <p key={i} className="my-1.5">{x}</p>;
                }
            })}
        </div>
    );
}

/** Prototype benchCard(). */
export function BenchCard({ c, rows }: { c: HubCountry; rows: [string, string][] }) {
    return (
        <Card title={`${c.name} at a glance — AIIM benchmark`} icon="chart" sub={<>From BW_Benchmark (eight AIIM packs, dated) <TagS s="BW_Benchmark" /></>}>
            <STable compact head={['Metric', 'Value']} rows={rows.map((r) => [r[0], <b key="v">{r[1]}</b>])} />
        </Card>
    );
}

/** External source link icon used in fact tables. */
export function ExtLink({ href, children }: { href: unknown; children?: ReactNode }) {
    return href ? <a href={String(href)} target="_blank" rel="noopener" className="text-controlled-700 hover:underline" aria-label="Open source">{children ?? <Ic n="ext" />}</a> : null;
}

/** Inline text link (prototype plain <a> in table cells). */
export function TLink({ href, children, mono }: { href: string; children: ReactNode; mono?: boolean }) {
    return <Link href={href} className={cn('text-controlled-700 hover:underline', mono && 'font-mono')}>{children}</Link>;
}
