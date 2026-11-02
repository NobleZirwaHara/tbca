/*
 * Building blocks for the search and object pages rebuilt from the client's "TBCA AIIM Botswana"
 * prototype (opportunities, projects, investors, funders, trade corridors, leads, HS code mapper,
 * investor and trader information types). Visual primitives come from ProtoExplore so every AIIM
 * Botswana page looks the same; this file adds the country filter, the fact drawer, register tables
 * paged on the server, the embedded-service rail with the fee manifest, object actions and the
 * Botswana corridor map.
 */
import { Link, router, usePage } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useCallback, useMemo, useRef, useState, type MouseEvent, type ReactNode } from 'react';
import { CompareButton, ListToggle } from '@/Components/Aiim/Actions';
import { linePath, makeView, polygonPath, type BBox } from '@/Components/Aiim/Explorer/geo';
import type { Geometry, PolygonCoords, Position } from '@/Components/Aiim/Explorer/types';
import {
    autoFmt, btn, Chip, Dl, FactCtx, FactLink, Frame, Freshness, GradePill, P, Panel, Rich, StatusPill, TierPill, YnPill, type PCrumb,
} from '@/Components/Aiim/ProtoExplore';
import { DataTable, Modal, N, useMoney, type Col } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

/* ------------------------------------------------------------------ types */
export type Cell = string | number | null | boolean;
export type Row = Record<string, Cell>;
export interface Fact { 'Fact ID': string; Sector: string; 'Sector name': string; Fact: string; Value: string; Source: string; Date: string; URL: string; Grade: number | string }
export interface SvcP { code: string; name: string; et: string | null; db: string | null; a0: number | null; price: number | null; inApp: boolean }
export interface RailP { title: string; items: SvcP[] }
export interface BriefP { title: string; sub: string; code: string; label: string; svc: SvcP | null }
export interface PageT<T = Row> {
    p: string; cols: string[]; filters: string[]; rows: T[]; total: number; count: number; page: number; pages: number; size: number;
    q: string; f: Record<string, string>; sort: number | null; dir: number; options: Record<string, string[]>;
}
export interface CountryOpt { slug: string; name: string }
export interface SearchBase { facts: Record<string, Fact>; saved: string[]; country: string; countryName: string; countries: CountryOpt[] }
export interface IntelBase { facts: Record<string, Fact>; saved: string[]; bw: boolean; c: { slug: string; name: string; iso3: string; iso2: string | null } }

export const lnk = 'text-controlled-700 underline decoration-dotted underline-offset-2 hover:text-gold-700';
export const BW = 'botswana';
export const cHref = (slug: string, path: string) => `/aiim/country/${slug}/${path}`;
/** HS product page; a slash in a product name is encoded twice so the route segment keeps it. */
export const hsHref = (slug: string, name: string) => cHref(slug, `hs/${encodeURIComponent(name).replace(/%2F/g, '%252F')}`);

/* ------------------------------------------------------------------ frame with the fact drawer */
export function BwFrame({ title, crumbs, facts, children }: { title: string; crumbs?: PCrumb[]; facts?: Record<string, Fact>; children: ReactNode }) {
    const [open, setOpen] = useState<string | null>(null);
    const seen = useRef<Record<string, Fact>>({});
    seen.current = { ...seen.current, ...(facts ?? {}) };
    const f = open ? seen.current[open] : null;
    const show = useCallback((id: string) => setOpen(id), []);
    return (
        <FactCtx.Provider value={show}>
            <Frame title={title} crumbs={crumbs}>{children}</Frame>
            <Modal title={open ?? 'Fact'} open={open !== null} onClose={() => setOpen(null)}>
                {f ? (
                    <div className="grid gap-3 text-[0.88rem]">
                        <div className="flex flex-wrap gap-1.5"><GradePill g={f.Grade} /><Chip>{f['Sector name'] || f.Sector}</Chip><Chip><L.Clock className="size-3" /> {f.Date}</Chip></div>
                        <h2 className="text-[1.15rem] font-bold text-ink-900">{f.Fact}</h2>
                        <p className="text-[0.95rem]"><Rich t={f.Value} /></p>
                        <Dl rows={[
                            ['Source', f.Source], ['Date', f.Date],
                            ['URL', String(f.URL ?? '').startsWith('http') ? <a href={f.URL} target="_blank" rel="noopener" className={cn(lnk, 'break-all')}>{f.URL}</a> : f.URL],
                            ['Grade', `${f.Grade}${String(f.Grade) === '3' ? ' — official source' : ''}`], ['Freshness', <Freshness d={f.Date} />],
                        ]} />
                        <Link href={P.fact(f['Fact ID'])} className={btn('ghost')}>Open on the evidence page</Link>
                    </div>
                ) : (
                    <div className="grid gap-3 text-[0.88rem]">
                        <p className="text-ink-500">This reference is cited in the pack. Open it on the evidence page for its source, date and grade.</p>
                        {open && <Link href={P.fact(open)} className={btn('ghost')}>Open on the evidence page</Link>}
                    </div>
                )}
            </Modal>
        </FactCtx.Provider>
    );
}

/* ------------------------------------------------------------------ country filter */
/** Country filter for the global search pages: Botswana shows the prototype records, other countries the app's own records. */
export function CountryBar({ path, country, countries, note }: { path: string; country: string; countries: CountryOpt[]; note?: ReactNode }) {
    return (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-[10px] border border-parchment-400 bg-white px-4 py-2.5">
            <label className="flex items-center gap-2 text-[0.84rem] font-semibold text-ink-800">
                <L.Globe2 className="size-4 text-gold-600" aria-hidden="true" /> Country
                <select value={country} onChange={(e) => router.get(path, { country: e.target.value })} className="h-8 rounded-[6px] border border-parchment-500 bg-white px-2 text-[0.84rem] font-normal">
                    <option value="all">All countries</option>
                    {countries.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
            </label>
            <span className="text-[0.78rem] text-ink-500">{note ?? (country === BW ? 'Botswana shows the BW-1.0 country pack. Choose another country for its records.' : 'Records held in the app for this country.')}</span>
        </div>
    );
}

/* ------------------------------------------------------------------ object actions */
/** Save, Watch and Compare for a catalogue object (signed-in workspace; guests sign in first). */
export function ObjActions({ type, itemKey, saved, compare = true }: { type: string; itemKey: string; saved: string[]; compare?: boolean }) {
    return (
        <>
            <ListToggle list="saved" type={type} itemKey={itemKey} saved={saved} dark />
            <ListToggle list="watchlist" type={type} itemKey={itemKey} saved={saved} dark />
            {compare && <CompareButton type={type} itemKey={itemKey} dark />}
        </>
    );
}

/* ------------------------------------------------------------------ embedded services and the fee manifest */
/** Add an embedded service to the AIIM fee manifest (prototype data-buy). */
export function addFee(code: string, ctx?: string) {
    router.post('/aiim/fees/items', { type: 'service', key: code, ctx: ctx ?? null }, { preserveScroll: true });
}

export function Price({ s }: { s: SvcP | null | undefined }) {
    const money = useMoney();
    if (!s || s.price === null) return <span className="text-[0.75rem] font-normal text-ink-400">Not in the app catalogue yet</span>;
    return <>from {money(s.price)}</>;
}

/** Header button that adds a service to the fee manifest, or opens the service when the app does not sell it yet. */
export function BuyBtn({ s, ctx, children, tone = 'dark' }: { s: SvcP | null | undefined; ctx?: string; children: ReactNode; tone?: 'gold' | 'dark' | 'ghost' }) {
    if (!s) return null;
    if (s.price === null) return <Link href={P.svc(s.code)} className={btn(tone)}>{children}</Link>;
    return <button type="button" className={btn(tone)} onClick={() => addFee(s.code, ctx)}>{children}</button>;
}

export function SvcRail({ rail, ctx }: { rail: RailP | null | undefined; ctx?: string }) {
    if (!rail || !rail.items.length) return null;
    return (
        <Panel title={rail.title} right={<Link href={P.services} className={cn(btn('ghost'), 'h-7 px-2.5 text-[0.72rem]')}>All 581</Link>}>
            <div className="grid gap-2.5">
                {rail.items.map((s) => (
                    <div key={s.code} className="rounded-[8px] border border-parchment-400 p-3">
                        <div className="flex items-start justify-between gap-3">
                            <Link href={P.svc(s.code)} className="min-w-0 text-[0.84rem] leading-snug font-semibold text-ink-900 hover:text-gold-700">{s.name}</Link>
                            <div className="shrink-0 text-right font-mono text-[0.8rem] font-semibold text-ink-900"><Price s={s} />{s.price !== null && <div className="text-[0.66rem] font-normal text-ink-400">excl. VAT</div>}</div>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.7rem] text-ink-500">
                            <span className="font-mono">{s.code}</span>{s.et && <span>{s.et} tier</span>}
                            {s.db && <span className="inline-flex items-center gap-1"><L.Clock className="size-3" />{s.db}</span>}
                            <span>AAI {s.a0 !== null ? `${Math.round(s.a0 * 100)}%` : '—'}</span>
                        </div>
                        {s.price !== null && <div className="mt-2 text-right"><button type="button" onClick={() => addFee(s.code, ctx)} className={cn(btn('gold'), 'h-7 px-3 text-[0.72rem]')}>Add</button></div>}
                    </div>
                ))}
            </div>
        </Panel>
    );
}

/** "Brief available" call to action (prototype briefCTA). */
export function BriefCta({ b }: { b: BriefP | null | undefined }) {
    if (!b) return null;
    return (
        <div className="grid gap-3 rounded-[12px] border border-gold-300 bg-gold-50 p-4">
            <div className="grid gap-1">
                <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold tracking-[0.14em] text-gold-700 uppercase"><L.Briefcase className="size-3" /> Brief available</span>
                <b className="text-ink-900">{b.title}</b>
                <span className="text-[0.82rem] text-ink-600">{b.sub}{b.svc && <> · <b className="font-mono"><Price s={b.svc} /></b>{b.svc.price !== null && <> excl. VAT · {b.svc.db}</>}</>}</span>
            </div>
            <div className="flex flex-wrap gap-2">
                <BuyBtn s={b.svc} ctx={b.title} tone="gold"><L.Briefcase className="size-3.5" /> {b.label}</BuyBtn>
                <Link href={P.advisor} className={btn('ghost')}>Ask an advisor</Link>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ cells */
/** Free text in a table cell: short values stay on one line, long values get a readable width. */
function Text({ v }: { v: Cell }) {
    const s = String(v ?? '');
    if (s.length <= 24) return <span className="whitespace-nowrap"><Rich t={s} /></span>;
    return <div className={s.length > 60 ? 'min-w-[16rem] max-w-[28rem]' : 'min-w-[10rem]'}><Rich t={s} /></div>;
}

const isNumCol = (rows: Row[], k: string) => rows.length > 0 && rows.every((r) => r[k] === null || r[k] === '' || typeof r[k] === 'number');

/** Cell renderer by column name (prototype cellFmt plus the ID links of each register). */
export function cellFor(k: string, slug = BW): ((v: Cell, r: Row) => ReactNode) {
    const auto = autoFmt(k);
    if (k === 'Opp ID' || k === 'Template') return (v) => (v ? <Link href={P.opp(String(v))} className={cn(lnk, 'font-mono whitespace-nowrap')}>{String(v)}</Link> : null);
    if (k === 'Lead ID') return (v) => (v ? <Link href={cHref(slug, `leads/${v}`)} className={cn(lnk, 'font-mono whitespace-nowrap')}>{String(v)}</Link> : null);
    if (k === 'Sector') return (v) => (/^[A-Z]{3}$/.test(String(v ?? '')) ? <Link href={P.sector(String(v))} className={lnk}>{String(v)}</Link> : <Text v={v} />);
    if (k === 'Place') return (v, r) => (r['Place ID'] ? <Link href={P.town(String(r['Place ID']))} className={lnk}>{String(v)}</Link> : <Rich t={v} />);
    if (k === 'Unit code') return (v) => (v ? <Link href={P.unit(String(v))} className={lnk}>{String(v)}</Link> : null);
    if (k === 'Product' || k === 'Commodity') return (v) => (v ? <Link href={hsHref(slug, String(v))} className={lnk}>{String(v)}</Link> : null);
    if (k === 'Citizen-reserved') return (v) => (String(v ?? '').toLowerCase().startsWith('y') || String(v ?? '').toLowerCase() === 'no' ? <YnPill v={v} yes="Reserved" /> : <Rich t={v} />);
    if (k === 'FX earner') return (v) => (/^(y|no)/i.test(String(v ?? '')) ? <YnPill v={v} yes="FX" ok /> : <Rich t={v} />);
    if (/^tier|downturn tier/i.test(k)) return (v) => (/^(A|B|C)/.test(String(v ?? '')) ? <TierPill t={v} /> : <Rich t={v} />);
    if (k === 'E' || k === 'Grade') return (v) => (/^[123]$/.test(String(v ?? '').trim()) ? <GradePill g={v} /> : <Rich t={v} />);
    if (auto) return (v, r) => auto(v, r as never);
    return (v) => (typeof v === 'number' ? N(v) : <Text v={v} />);
}

export function cols(keys: string[], rows: Row[], slug = BW, over: Record<string, (v: Cell, r: Row) => ReactNode> = {}, labels: Record<string, string> = {}): Col<Row>[] {
    return keys.map((k) => {
        const f = over[k] ?? cellFor(k, slug);
        return { k, l: labels[k] ?? k, num: isNumCol(rows, k), r: (r: Row) => f(r[k], r) };
    });
}

/** Register rows filtered, sorted and paged in the browser (prototype dataTable). */
export function CTable({ rows, keys, filters = [], size = 15, name, slug = BW, over, labels }: { rows: Row[]; keys?: string[]; filters?: string[]; size?: number; name: string; slug?: string; over?: Record<string, (v: Cell, r: Row) => ReactNode>; labels?: Record<string, string> }) {
    const ks = keys ?? (rows[0] ? Object.keys(rows[0]) : []);
    return <DataTable<Row> name={name} cols={cols(ks, rows, slug, over, labels)} rows={rows} filters={filters} size={size} compact />;
}

/** Small table with no search bar (prototype dataTable bare). */
export function BareTable({ rows, keys, slug = BW, over, labels }: { rows: Row[]; keys?: string[]; slug?: string; over?: Record<string, (v: Cell, r: Row) => ReactNode>; labels?: Record<string, string> }) {
    const ks = keys ?? (rows[0] ? Object.keys(rows[0]) : []);
    const cs = cols(ks, rows, slug, over, labels);
    return (
        <div className="max-w-full overflow-x-auto rounded-[8px] border border-parchment-400 bg-white">
            <table className="w-full border-collapse text-[0.78rem]">
                <thead className="bg-parchment-200 text-left"><tr>{cs.map((c) => <th key={c.l} className={cn('border-b border-parchment-400 px-2.5 py-2 font-semibold whitespace-nowrap text-ink-600', c.num && 'text-right')}>{c.l}</th>)}</tr></thead>
                <tbody>
                    {rows.length ? rows.map((r, i) => <tr key={i} className="border-b border-parchment-300 last:border-0 hover:bg-parchment-100">{cs.map((c) => <td key={c.l} className={cn('px-2.5 py-1.5 align-top', c.num && 'text-right whitespace-nowrap tabular-nums')}>{c.r?.(r)}</td>)}</tr>)
                        : <tr><td colSpan={cs.length} className="px-3 py-5 text-center text-ink-400">No rows.</td></tr>}
                </tbody>
            </table>
        </div>
    );
}

/**
 * Register table paged on the server. Each table on a page reads its own prefixed query parameters
 * ({p}q, {p}f[...], {p}sort, {p}dir, {p}page, {p}size) and reloads only its own prop.
 */
export function PTable({ t, prop, slug = BW, over, labels, name }: { t: PageT; prop: string; slug?: string; over?: Record<string, (v: Cell, r: Row) => ReactNode>; labels?: Record<string, string>; name?: string }) {
    const { url } = usePage<SharedProps>();
    const timer = useRef<number | undefined>(undefined);
    const p = t.p;
    const go = (patch: Partial<{ q: string; f: Record<string, string>; sort: number | null; dir: number; page: number; size: number }>) => {
        const s = { q: t.q, f: t.f, sort: t.sort, dir: t.dir, page: t.page, size: t.size, ...patch };
        const [path, qs] = url.split('?');
        const params: Record<string, unknown> = {};
        new URLSearchParams(qs ?? '').forEach((v, k) => { if (!k.startsWith(p)) params[k] = v; });
        if (s.q) params[`${p}q`] = s.q;
        const f = Object.fromEntries(Object.entries(s.f ?? {}).filter(([, v]) => v));
        if (Object.keys(f).length) params[`${p}f`] = f;
        if (s.sort !== null && s.sort !== undefined) { params[`${p}sort`] = s.sort; params[`${p}dir`] = s.dir; }
        if (s.page) params[`${p}page`] = s.page;
        if (s.size !== t.size || params[`${p}size`]) params[`${p}size`] = s.size;
        router.get(path, params as never, { preserveState: true, preserveScroll: true, replace: true, only: [prop, 'facts'] });
    };
    const cs = cols(t.cols, t.rows, slug, over, labels);
    return (
        <div className="min-w-0" aria-label={name}>
            <div className="mb-2 flex flex-wrap items-center gap-2">
                <input type="search" aria-label="Search table" placeholder="Search these rows…" defaultValue={t.q}
                    onChange={(e) => { const v = e.target.value; window.clearTimeout(timer.current); timer.current = window.setTimeout(() => go({ q: v, page: 0 }), 350); }}
                    className="h-8 w-full max-w-[220px] rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.78rem]" />
                {t.filters.map((k) => (
                    <select key={k} aria-label={`Filter ${k}`} value={t.f[k] ?? ''} onChange={(e) => go({ f: { ...t.f, [k]: e.target.value }, page: 0 })}
                        className="h-8 max-w-[180px] rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.75rem]">
                        <option value="">{k}: all</option>
                        {(t.options[k] ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                ))}
                <span className="text-[0.75rem] text-ink-400">{N(t.count)} of {N(t.total)} rows</span>
            </div>
            <div className="max-w-full overflow-x-auto rounded-[6px] border border-parchment-400 bg-white">
                <table className="w-full border-collapse text-[0.78rem]">
                    <thead className="bg-parchment-200">
                        <tr>{cs.map((c, i) => (
                            <th key={c.l} className={cn('border-b border-parchment-400 px-2.5 py-2 font-semibold whitespace-nowrap text-ink-600', c.num ? 'text-right' : 'text-left')}>
                                <button type="button" className="inline-flex items-center gap-1" onClick={() => go({ sort: i, dir: t.sort === i ? -t.dir : 1, page: 0 })}>
                                    {c.l}<span className="text-[0.6rem] text-gold-700" aria-hidden="true">{t.sort === i ? (t.dir > 0 ? '▲' : '▼') : ''}</span>
                                </button>
                            </th>
                        ))}</tr>
                    </thead>
                    <tbody>
                        {t.rows.length ? t.rows.map((r, i) => (
                            <tr key={i} className="border-b border-parchment-300 last:border-0 hover:bg-parchment-100">
                                {cs.map((c) => <td key={c.l} className={cn('px-2.5 py-1.5 align-top', c.num && 'text-right whitespace-nowrap tabular-nums')}>{c.r?.(r)}</td>)}
                            </tr>
                        )) : <tr><td colSpan={cs.length} className="px-3 py-5 text-center text-ink-400">No rows match.</td></tr>}
                    </tbody>
                </table>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[0.75rem] text-ink-500">
                <button type="button" className={btn('ghost')} disabled={t.page === 0} onClick={() => go({ page: t.page - 1 })}>Prev</button>
                <span>Page {N(t.page + 1)} of {N(t.pages)}</span>
                <button type="button" className={btn('ghost')} disabled={t.page >= t.pages - 1} onClick={() => go({ page: t.page + 1 })}>Next</button>
                <select aria-label="Rows per page" value={t.size} onChange={(e) => go({ size: Number(e.target.value), page: 0 })} className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1">
                    {[...new Set([10, 15, 20, 25, 50, 100, t.size])].sort((a, b) => a - b).map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>
        </div>
    );
}

/* ------------------------------------------------------------------ tabs */
/** In-page tabs (prototype tabs()); all panels stay mounted so server tables keep their state. */
export function TabBox({ tabs, children, initial = 0 }: { tabs: string[]; children: ReactNode[]; initial?: number }) {
    const [on, setOn] = useState(initial);
    return (
        <div>
            <div className="flex gap-1 overflow-x-auto border-b border-parchment-400" role="tablist">
                {tabs.map((t, i) => (
                    <button key={t} type="button" role="tab" aria-selected={i === on} onClick={() => setOn(i)}
                        className={cn('-mb-px border-b-2 px-3 py-2.5 text-[0.84rem] font-semibold whitespace-nowrap', i === on ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500 hover:text-ink-800')}>{t}</button>
                ))}
            </div>
            {children.map((c, i) => <div key={i} role="tabpanel" hidden={i !== on} className="pt-4">{c}</div>)}
        </div>
    );
}

/* ------------------------------------------------------------------ question cards */
export interface QRow { Code: string; Question: string; 'Information types': string; Tag: string; 'Map behaviour': string; [k: string]: Cell }

/** Investor or trader chain question cards (prototype chainCards). */
export function ChainCards({ rows, anchorKey, anchorLabel = 'Botswana' }: { rows: QRow[]; anchorKey: string; anchorLabel?: string }) {
    return (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rows.map((r) => (
                <div key={r.Code} className="grid content-start gap-2 rounded-[10px] border border-parchment-400 bg-white p-4">
                    <div className="flex items-center gap-2">
                        <span className="rounded-[4px] bg-ink-950 px-1.5 py-0.5 font-mono text-[0.72rem] text-gold-400">{r.Code}</span>
                        <span className={cn('ml-auto rounded-full px-2 py-0.5 text-[0.68rem] font-bold', String(r.Tag).includes('MAP') ? 'bg-controlled-50 text-controlled-700' : 'bg-parchment-300 text-ink-600')}>{r.Tag}</span>
                    </div>
                    <div className="font-semibold text-ink-900">{r.Question}</div>
                    <div className="text-[0.82rem]"><Rich t={r['Information types']} /></div>
                    <div className="text-[0.75rem] text-ink-500"><L.Map className="inline size-3" /> {r['Map behaviour']}</div>
                    <div className="border-t border-dashed border-parchment-400 pt-2 text-[0.78rem]"><b>{anchorLabel}:</b> <Rich t={r[anchorKey]} /></div>
                </div>
            ))}
        </div>
    );
}

/* ------------------------------------------------------------------ Botswana map */
interface Feature { properties: Record<string, unknown>; geometry: Geometry }
export interface MapGeo { districts: Feature[]; countries?: Feature[]; rivers?: Feature[]; lakes?: Feature[]; rail?: Feature[]; roads?: Feature[] }
export interface MapTown { ID: string; Place: string; Unit: string; Lat: number; Lon: number; 'Population used': number; Kind: string; gw: number }
export interface MapGw { i: number; name: string; short: string; col: string; Lat: number; Lon: number }
export interface MapHot { i: number; Hotspot: string; Status: string; Fact: string; lat: number | null; lon: number | null }
export interface MapCorr { id: string; name: string; gw: number; pts: [number, number][]; col: string; dash: boolean }
export interface MapData { geo: MapGeo; towns: MapTown[]; gateways: MapGw[]; hot?: MapHot[] }

const polys = (g: Geometry): PolygonCoords[] => (g.type === 'Polygon' ? [g.coordinates as PolygonCoords] : g.type === 'MultiPolygon' ? (g.coordinates as PolygonCoords[]) : []);
const lines = (g: Geometry): Position[][] => (g.type === 'LineString' ? [g.coordinates as Position[]] : g.type === 'MultiLineString' ? (g.coordinates as Position[][]) : []);

/**
 * Botswana map (prototype bwMap): districts, neighbours, rivers, lakes, rail and roads, towns
 * (optionally only a highlighted set in gold), evidence hotspots, the six border gateways and the
 * schematic trade corridors. Click a town for its place page, a corridor for its detail page.
 */
export function BwMap({ data, highlight, selectedGw, selectedHot, corridors = [], region = false, label }: {
    data: MapData; highlight?: string[]; selectedGw?: number; selectedHot?: number; corridors?: MapCorr[]; region?: boolean; label?: string;
}) {
    const [tip, setTip] = useState<{ t: string; x: number; y: number } | null>(null);
    const { geo, towns, gateways, hot = [] } = data;
    const view = useMemo(() => {
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
        const add = (x: number, y: number) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); };
        geo.districts.forEach((f) => polys(f.geometry).forEach((p) => p[0]?.forEach(([x, y]) => add(x, y))));
        if (region) corridors.forEach((c) => c.pts.forEach(([x, y]) => add(x, y)));
        return makeView([x0, y0, x1, y1] as BBox, region ? 0.03 : 0.04, 1.0);
    }, [geo, corridors, region]);
    const hi = highlight ? new Set(highlight) : null;
    const pt = (lat: number, lon: number) => view.project(lon, lat);
    const track = (t: string) => (e: MouseEvent<SVGElement>) => {
        const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (box) setTip({ t, x: e.clientX - box.left, y: e.clientY - box.top });
    };
    const go = (href: string) => (e: MouseEvent) => { e.preventDefault(); router.visit(href); };
    const centroid = (f: Feature) => {
        const ring = polys(f.geometry).map((p) => p[0] ?? []).sort((a, b) => b.length - a.length)[0] ?? [];
        if (!ring.length) return null;
        const [sx, sy] = ring.reduce(([a, b], [x, y]) => [a + x, b + y], [0, 0]);
        return view.project(sx / ring.length, sy / ring.length);
    };
    return (
        <div className="relative">
            <svg viewBox={`0 0 1000 ${Math.round(view.height)}`} className="h-auto w-full rounded-[10px] bg-[#eef2f3]" role="img" aria-label={label ?? 'Map of Botswana'} onMouseLeave={() => setTip(null)}>
                {(geo.countries ?? []).filter((f) => f.properties.a3 !== 'BWA').map((f, i) => <path key={`c${i}`} d={polygonPath(polys(f.geometry), view)} fill="#ebe6dc" stroke="#fff" strokeWidth={1} />)}
                {geo.districts.map((f, i) => <path key={`d${i}`} d={polygonPath(polys(f.geometry), view)} fill="#f3e8cc" stroke="#b49a63" strokeWidth={0.9} />)}
                {geo.districts.map((f, i) => { const c = centroid(f); return c ? <text key={`n${i}`} x={c[0]} y={c[1]} textAnchor="middle" fontSize={11} letterSpacing={2} fill="#8a7a5a" pointerEvents="none">{String(f.properties.name ?? '').toUpperCase()}</text> : null; })}
                {(geo.lakes ?? []).map((f, i) => <path key={`l${i}`} d={polygonPath(polys(f.geometry), view)} fill="#bcd7ee" stroke="#5a9bd4" strokeWidth={0.6} />)}
                {geo.roads && <path d={linePath(geo.roads.flatMap((f) => lines(f.geometry)), view)} fill="none" stroke="#b5a27a" strokeWidth={0.7} strokeOpacity={0.6} pointerEvents="none" />}
                {geo.rail && <path d={linePath(geo.rail.flatMap((f) => lines(f.geometry)), view)} fill="none" stroke="#333" strokeWidth={1.1} strokeDasharray="2 3" pointerEvents="none" />}
                <path d={linePath((geo.rivers ?? []).flatMap((f) => lines(f.geometry)), view)} fill="none" stroke="#5a9bd4" strokeWidth={1.2} pointerEvents="none" />
                {corridors.map((c) => {
                    const pts = c.pts.map(([lon, lat]) => pt(lat, lon));
                    const d = `M${pts.map((p) => p.join(',')).join('L')}`;
                    const end = pts[pts.length - 1];
                    return (
                        <a key={c.id} href={P.corridor(c.id)} onClick={go(P.corridor(c.id))} aria-label={c.name}>
                            <path d={d} fill="none" stroke={c.col} strokeOpacity={0.25} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
                            <path d={d} fill="none" stroke={c.col} strokeWidth={3} strokeDasharray={c.dash ? '7 5' : undefined} strokeLinecap="round" strokeLinejoin="round" onMouseMove={track(c.name)} />
                            <circle cx={end[0]} cy={end[1]} r={5} fill={c.col} />
                        </a>
                    );
                })}
                {towns.map((t) => {
                    const [x, y] = pt(t.Lat, t.Lon);
                    const on = hi ? hi.has(t.ID) : true;
                    const r = Math.max(3, Math.sqrt(Number(t['Population used']) || 1) / 28);
                    return (
                        <a key={t.ID} href={P.town(t.ID)} onClick={go(P.town(t.ID))} aria-label={`${t.Place}, ${t.Unit}`}>
                            <circle cx={x} cy={y} r={hi && on ? r + 1.5 : r} fill={hi ? (on ? '#d6a32e' : '#fff') : '#16161b'} fillOpacity={hi && !on ? 0.35 : 0.85} stroke={hi && on ? '#5a3d07' : '#fff'} strokeWidth={0.9}
                                onMouseMove={track(`${t.Place} · ${t.Unit} · population ${N(t['Population used'])}`)} />
                        </a>
                    );
                })}
                {hot.filter((h) => h.lat !== null && h.lon !== null).map((h) => {
                    const [x, y] = pt(h.lat as number, h.lon as number);
                    const sel = selectedHot === h.i;
                    const r = sel ? 12 : 7;
                    return (
                        <a key={`h${h.i}`} href={P.project(`H${h.i}`)} onClick={go(P.project(`H${h.i}`))} aria-label={h.Hotspot}>
                            {sel && <circle cx={x} cy={y} r={22} fill="#d6a32e" fillOpacity={0.2} stroke="#d6a32e" />}
                            <path d={`M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`} fill="#d6a32e" stroke="#5a3d07" strokeWidth={1} onMouseMove={track(`${h.Hotspot} · ${h.Status}`)} />
                        </a>
                    );
                })}
                {gateways.map((g) => {
                    const [x, y] = pt(g.Lat, g.Lon);
                    const sel = selectedGw === g.i;
                    const r = sel ? 11 : 7;
                    return (
                        <g key={`g${g.i}`} onMouseMove={track(g.name)}>
                            {sel && <circle cx={x} cy={y} r={26} fill={g.col} fillOpacity={0.18} stroke={g.col} />}
                            <path d={`M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`} fill={g.col} stroke="#fff" strokeWidth={1.2} />
                            <text x={x + r + 3} y={y - r} fontSize={11} fontWeight={600} fill={g.col}>{g.short}</text>
                        </g>
                    );
                })}
            </svg>
            {tip && <span role="tooltip" className="pointer-events-none absolute z-10 w-max max-w-[260px] -translate-x-1/2 -translate-y-full rounded bg-ink-900 px-2 py-1 text-[0.72rem] text-parchment-100 shadow" style={{ left: tip.x, top: tip.y - 10 }}>{tip.t}</span>}
            <div className="mt-2 flex flex-wrap gap-3 text-[0.72rem] text-ink-500">
                <span>● town (size = population){hi ? ' · gold = ranked place' : ''}</span>
                {hot.length > 0 && <span className="text-gold-700">◆ evidence hotspot</span>}
                <span>◆ border gateway</span>
                <span>- - rail · <span className="text-[#5a9bd4]">blue</span> river</span>
                {corridors.length > 0 && <span>schematic corridor alignments</span>}
            </div>
        </div>
    );
}
