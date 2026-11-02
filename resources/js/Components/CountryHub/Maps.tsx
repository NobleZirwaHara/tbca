/*
 * Countries tab maps (prototype maps.js):
 *  - HubAfricaMap: the 54 country objects, coloured by availability state or by a value, with optional
 *    corridor arcs (lines) and markers (dots), on the site's shared Africa map.
 *  - BotswanaMap: Botswana districts shaded by population, investment envelope or Tier A leads, with
 *    neighbouring countries, roads, rail, rivers, the 83 pinned towns, the 42 evidence hotspots and the
 *    6 border gateways. Click a district for its unit profile, a town for its place profile.
 */
import { router } from '@inertiajs/react';
import { useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import AfricaCountryMap, { type AfricaCountryShape } from '@/Components/Map/AfricaCountryMap';
import { linePath, makeView, polygonPath, type BBox } from '@/Components/Aiim/Explorer/geo';
import type { Geometry, PolygonCoords, Position } from '@/Components/Aiim/Explorer/types';
import { N } from '@/Components/Industries/Kit';
import type { CountryOption } from '@/types/countryHub';

/* ------------------------------------------------------------------ Africa */
export const STATECOL = { Activated: '#2fa35a', Pack: '#17663a', Full: '#d6a32e' };

/** Default fill by availability state (prototype actFill). */
export const actFill = (c: { iso3: string; pack?: string | null }) => (c.iso3 === 'BWA' ? STATECOL.Full : c.pack ? STATECOL.Pack : STATECOL.Activated);

/** [from ISO3, to ISO3, stroke width, colour] */
export type MapLine = [string, string, number?, string?];

export function HubAfricaMap({ countries, fill, tip, href, highlight = [], dark = true, label = 'Map of Africa', lines = [], dots = [], className }: {
    /** The 54 country objects (any shape with iso3, iso2, slug, name). */
    countries: (CountryOption & { pack?: string | null })[];
    fill?: (iso3: string) => string | undefined;
    tip?: (iso3: string, name: string) => string;
    /** Country link; null to leave a country unlinked. Default: the country profile. */
    href?: ((c: CountryOption) => string | null) | null;
    highlight?: string[];
    dark?: boolean;
    label?: string;
    lines?: MapLine[];
    dots?: string[];
    className?: string;
}) {
    const by = useMemo(() => Object.fromEntries(countries.map((c) => [c.iso3, c])), [countries]);
    const hl = new Set(highlight);
    const go = href === undefined ? (c: CountryOption) => `/countries/${c.slug}` : href;
    return (
        <AfricaCountryMap
            tone={dark ? 'dark' : 'light'}
            label={label}
            className={className}
            highlighted={highlight.map((i) => by[i]?.iso2 ?? '')}
            colorFor={(c: AfricaCountryShape) => (by[c.iso3] ? (fill ? fill(c.iso3) : actFill(by[c.iso3])) : undefined)}
            hrefFor={go ? (_slug, c) => (by[c.iso3] ? go(by[c.iso3]) : null) : null}
            tipFor={(c) => (by[c.iso3] ? (tip ? tip(c.iso3, by[c.iso3].name) : `${by[c.iso3].name}\nActivated · RCS 100%`) : `${c.name}\nNot one of the 54 AU country objects`)}
            overlay={(pt) => (
                <>
                    {[...hl].map((iso) => { const p = pt(iso); return p ? <circle key={`h${iso}`} cx={p[0]} cy={p[1]} r={7} fill="none" stroke="#ffd21f" strokeWidth={2.5} /> : null; })}
                    {lines.map(([a, b, w, col], i) => {
                        const p1 = pt(a), p2 = pt(b);
                        if (!p1 || !p2) return null;
                        const mx = (p1[0] + p2[0]) / 2, my = (p1[1] + p2[1]) / 2 - Math.hypot(p2[0] - p1[0], p2[1] - p1[1]) * 0.18;
                        return <path key={i} d={`M${p1[0]},${p1[1]}Q${mx},${my} ${p2[0]},${p2[1]}`} fill="none" stroke={col ?? '#ffd21f'} strokeWidth={(w ?? 1.5) * 1.6} strokeOpacity={0.85} strokeLinecap="round" />;
                    })}
                    {dots.map((iso) => { const p = pt(iso); return p ? <circle key={`d${iso}`} cx={p[0]} cy={p[1]} r={5.5} fill="#ffd21f" stroke="#000" /> : null; })}
                </>
            )}
        />
    );
}

/** Legend row: colour swatches with labels (colour is never used alone; labels always shown). */
export function MapLegend({ items, dark }: { items: [string, ReactNode][]; dark?: boolean }) {
    return (
        <div className={`mt-2 flex flex-wrap gap-3 text-[0.72rem] ${dark ? 'text-parchment-300' : 'text-ink-500'}`}>
            {items.map(([col, l], i) => <span key={i} className="inline-flex items-center gap-1.5"><i className="inline-block size-3 rounded-[2px] border border-black/20" style={{ background: col }} />{l}</span>)}
        </div>
    );
}

/* ------------------------------------------------------------------ Botswana */
interface GeoFeature { properties: Record<string, unknown>; geometry: Geometry }
export interface BwGeo { districts: GeoFeature[]; countries?: GeoFeature[]; roads?: GeoFeature[]; rail?: GeoFeature[]; rivers?: GeoFeature[]; lakes?: GeoFeature[] }
type Reg = Record<string, string | number | null>;

export type BwMetric = 'pop' | 'env' | 'tierA';

const polys = (g: Geometry): PolygonCoords[] => (g.type === 'Polygon' ? [g.coordinates as PolygonCoords] : g.type === 'MultiPolygon' ? (g.coordinates as PolygonCoords[]) : []);
const lines = (g: Geometry): Position[][] => (g.type === 'LineString' ? [g.coordinates as Position[]] : g.type === 'MultiLineString' ? (g.coordinates as Position[][]) : []);
function lerp(a: string, b: string, t: number) {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t)))).join(',')})`;
}
/** District name → BW_Units row (prototype matching rule). */
function unitOf(units: Reg[], name: string): Reg | undefined {
    return units.find((u) => { const n = String(u.Unit); return name && (n === name || name.startsWith(n) || n.startsWith(name.split(' ')[0])); });
}

export function BotswanaMap({ geo, units, towns, gateways, hotspots, metric = 'pop', showTowns = true, showHotspots = true, showRoads = true, unitHref, townHref, label }: {
    geo: BwGeo; units: Reg[]; towns: Reg[]; gateways: Reg[]; hotspots: Reg[]; metric?: BwMetric;
    showTowns?: boolean; showHotspots?: boolean; showRoads?: boolean;
    unitHref?: (code: string) => string; townHref?: (id: string) => string; label?: string;
}) {
    const [tip, setTip] = useState<{ html: ReactNode; x: number; y: number } | null>(null);
    const bbox = useMemo<BBox>(() => {
        let x0 = 180, y0 = 90, x1 = -180, y1 = -90;
        geo.districts.forEach((f) => polys(f.geometry).forEach((p) => p[0]?.forEach(([x, y]) => { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); })));
        return [x0, y0, x1, y1];
    }, [geo]);
    const view = useMemo(() => makeView(bbox, 0.02, 1.0), [bbox]);
    const val = (name: string) => {
        const u = unitOf(units, name);
        if (!u) return null;
        return metric === 'env' ? Number(u['Envelope US$ m (weighted)']) : metric === 'tierA' ? Number(u['Tier A']) : Number(u['Population (Census 2022)']);
    };
    const max = Math.max(1, ...geo.districts.map((f) => val(String(f.properties.name ?? '')) ?? 0));
    const sc = (v: number | null) => (v === null || Number.isNaN(v) ? '#efe7d4' : lerp('#fbf3dc', '#9a6d19', v / max));
    const pt = (lat: unknown, lon: unknown) => view.project(Number(lon), Number(lat));
    const track = (html: ReactNode) => (e: MouseEvent<SVGElement>) => {
        const box = e.currentTarget.ownerSVGElement?.getBoundingClientRect();
        if (box) setTip({ html, x: e.clientX - box.left, y: e.clientY - box.top });
    };
    const metricText = (v: number | null) => (metric === 'env' ? `Envelope (weighted) US$ ${N(v, 2)} m` : metric === 'tierA' ? `Tier A ranked leads ${N(v)}` : `Population (Census 2022) ${N(v)}`);
    const townById = Object.fromEntries(towns.map((t) => [String(t.ID), t]));
    const hs = hotspots.map((h) => {
        const id = String(h['Place ID'] ?? '');
        const t = townById[id] ?? units.find((u) => `U${u.Code}` === id);
        return t ? { h, t } : null;
    }).filter(Boolean) as { h: Reg; t: Reg }[];

    return (
        <div className="relative">
            <svg viewBox={`0 0 1000 ${Math.round(view.height)}`} className="h-auto w-full rounded-[4px] bg-[#f4f6f7]" role="img" aria-label={label ?? 'Map of Botswana with districts, towns and border gateways'} onMouseLeave={() => setTip(null)}>
                {(geo.countries ?? []).map((f, i) => <path key={`c${i}`} d={polygonPath(polys(f.geometry), view)} fill="#e3e7ea" stroke="#fff" strokeWidth={1} />)}
                {geo.districts.map((f, i) => {
                    const name = String(f.properties.name ?? '');
                    const u = unitOf(units, name);
                    const v = val(name);
                    const d = polygonPath(polys(f.geometry), view);
                    const shape = <path d={d} fill={sc(v)} stroke="#fff" strokeWidth={1.2} onMouseMove={track(<><b>{name}</b><br />{metricText(v)}<br /><span className="text-[0.66rem] opacity-80">Click for unit profile</span></>)} />;
                    return u && unitHref ? <a key={`d${i}`} href={unitHref(String(u.Code))} onClick={(e) => { e.preventDefault(); router.visit(unitHref(String(u.Code))); }} aria-label={`${name}: ${metricText(v)}`}>{shape}</a> : <g key={`d${i}`}>{shape}</g>;
                })}
                {(geo.lakes ?? []).map((f, i) => <path key={`l${i}`} d={polygonPath(polys(f.geometry), view)} fill="#bcd7ee" stroke="#5a9bd4" strokeWidth={0.6} />)}
                {showRoads && <path d={linePath((geo.roads ?? []).flatMap((f) => lines(f.geometry)), view)} fill="none" stroke="#b5a27a" strokeWidth={0.8} strokeOpacity={0.6} pointerEvents="none" />}
                <path d={linePath((geo.rail ?? []).flatMap((f) => lines(f.geometry)), view)} fill="none" stroke="#444" strokeWidth={1.3} strokeDasharray="4 3" pointerEvents="none" />
                <path d={linePath((geo.rivers ?? []).flatMap((f) => lines(f.geometry)), view)} fill="none" stroke="#5a9bd4" strokeWidth={1.3} pointerEvents="none" />
                {showTowns && towns.map((t) => {
                    const [x, y] = pt(t.Lat, t.Lon);
                    const r = Math.max(3, Math.sqrt(Number(t['Population used']) || 1) / 30);
                    const c = <circle cx={x} cy={y} r={r} fill="#16161b" fillOpacity={0.75} stroke="#fff" strokeWidth={0.8}
                        onMouseMove={track(<><b>{t.Place}</b> · {t.Unit}<br />Population {N(t['Population used'])}<br />Nearest gateway: {t['Nearest gateway']} ({N(t['Gateway km'])} km)</>)} />;
                    return townHref ? <a key={String(t.ID)} href={townHref(String(t.ID))} onClick={(e) => { e.preventDefault(); router.visit(townHref(String(t.ID))); }} aria-label={`${t.Place}, ${t.Unit}`}>{c}</a> : <g key={String(t.ID)}>{c}</g>;
                })}
                {showHotspots && hs.map(({ h, t }, i) => {
                    const [x, y] = pt(t.Lat, t.Lon);
                    const r = 9;
                    return <path key={`h${i}`} d={`M${x} ${y - r}L${x + r} ${y}L${x} ${y + r}L${x - r} ${y}Z`} fill="#d6a32e" stroke="#5a3d07" strokeWidth={1}
                        onMouseMove={track(<><b>{h.Hotspot}</b><br />{h.Status} · fact {h.Fact}</>)} />;
                })}
                {gateways.map((g, i) => {
                    const [x, y] = pt(g.Lat, g.Lon);
                    const r = 10;
                    return <path key={`g${i}`} d={`M${x} ${y - r * 1.15}L${x + r} ${y + r * 0.75}L${x - r} ${y + r * 0.75}Z`} fill="#c0392b" stroke="#fff" strokeWidth={1}
                        onMouseMove={track(<><b>{g['Gateway (proxy)']}</b><br />Border gateway · nearest for {N(g['Places nearest'])} places</>)} />;
                })}
            </svg>
            {tip && (
                <span role="tooltip" className="pointer-events-none absolute z-10 w-max max-w-[260px] -translate-x-1/2 -translate-y-full rounded bg-ink-900 px-2 py-1 text-[0.72rem] text-parchment-100 shadow" style={{ left: tip.x, top: tip.y - 10 }}>
                    {tip.html}
                </span>
            )}
            <div className="mt-2 flex flex-wrap gap-3 text-[0.72rem] text-ink-500">
                <span className="inline-flex items-center gap-1.5"><i className="inline-block size-3 rounded-[2px]" style={{ background: '#9a6d19' }} />District shade = {metric === 'env' ? 'investment envelope' : metric === 'tierA' ? 'Tier A leads' : 'population'}</span>
                <span>● town (size = population)</span><span className="text-gold-700">◆ hotspot</span><span className="text-risk-700">▲ border gateway</span><span>— road · - - rail · <span className="text-[#5a9bd4]">blue</span> river</span>
            </div>
        </div>
    );
}
