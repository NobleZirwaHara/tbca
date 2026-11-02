/*
 * Botswana drill-down map (prototype bwMap): district choropleth with a metric, gateway regions
 * (Voronoi catchments), towns sized by population and shaded by ranked leads, evidence hotspots,
 * border gateways, trade corridors, roads, rail, rivers, lakes, airports, coverage glow and labels.
 * Zoom with the wheel or buttons, drag to pan; click a district, town, hotspot or gateway to select.
 * Selection is controlled by the parent (`sel` / `onSelect`) and zooms the map to the target.
 */
import { Minus, Plus, RotateCcw } from 'lucide-react';
import { useEffect, useMemo, useRef, useState, type MouseEvent as RME, type PointerEvent as RPE, type ReactNode } from 'react';
import { N, useUsdM } from '@/Components/Industries/Kit';
import { SECTORS } from '@/Components/Aiim/ProtoExplore';

type Pos = [number, number];
interface Geom { type: string; coordinates: unknown }
export interface GeoF { p: Record<string, unknown>; g: Geom }
export interface MUnit { code: string; name: string; kind: string; pop: number; lat: number; lon: number; templates: number; tierA: number; envW: number; envE: number; places: number }
export interface MTown { id: string; name: string; unit: string; unitName: string; kind: string; lat: number; lon: number; pop: number; gw: number; km: number; rl: number; cov: number }
export interface MGate { i: number; name: string; short: string; lat: number; lon: number; places: number }
export interface MHot { i: number; name: string; place: string; placeId: string; unit: string; fact: string; status: string; match: string; lat: number | null; lon: number | null; leads: number; best: number; aplus: boolean; tierA: boolean }
export interface MCorr { id: string; name: string; gw: number; pts: Pos[]; to: string; dash: boolean }
export interface BwMapData {
    districts: GeoF[]; countries: GeoF[]; units: MUnit[]; towns: MTown[]; gateways: MGate[]; hotspots: MHot[]; corridors: MCorr[];
    roads?: GeoF[]; rail?: GeoF[]; rivers?: GeoF[]; lakes?: GeoF[]; airports?: { name: string; iata: string; lat: number; lon: number }[];
}
/** Map payload as sent by the server: geometry layers arrive as one JSON string. */
export type BwMapRaw = Omit<BwMapData, 'districts' | 'countries' | 'roads' | 'rail' | 'rivers' | 'lakes'> & { geo: string };
export function useMapData(raw: BwMapRaw): BwMapData {
    return useMemo(() => ({ ...raw, ...(JSON.parse(raw.geo) as Pick<BwMapData, 'districts' | 'countries'>) }), [raw]);
}
export function useFilters(raw: string | null | undefined): MapFilters | undefined {
    return useMemo(() => (raw ? (JSON.parse(raw) as MapFilters) : undefined), [raw]);
}
/** Ranked leads [town, unit, sector, tier, persona, citizen] and coverage [town, sector, tier, count]. */
export interface MapFilters { rl: [number, number, number, string, number, number][]; cov: [number, number, string, number][]; personas: string[] }
export interface MapF { sector: string; tier: string; persona: string; citizen: boolean }
export type Sel = { type: 'unit'; code: string } | { type: 'town'; id: string } | { type: 'hot'; i: number } | { type: 'gw'; i: number } | null;
export const LAYERS = ['dist', 'regions', 'towns', 'hot', 'heat', 'gw', 'corr', 'roads', 'rail', 'water', 'air', 'labels'] as const;
export type LayerKey = (typeof LAYERS)[number];
export type Layers = Record<LayerKey, boolean>;
export const DEFAULT_LAYERS: Layers = { dist: true, regions: false, towns: true, hot: true, heat: false, gw: true, corr: true, roads: true, rail: true, water: true, air: true, labels: true };
export const GWCOL = ['#d6a32e', '#4f8fca', '#b5476b', '#3f9c5a', '#7a4fa3', '#c96a12'];
export const UNITMETRICS: [string, string][] = [['pop', 'Population (Census 2022)'], ['templates', 'Templates'], ['tierA', 'Tier A'], ['envW', 'Envelope US$ m (weighted)'], ['envE', 'Envelope US$ m (equal)'], ['places', 'Places'], ['rlA', 'Tier A ranked leads'], ['cov', 'Coverage rows (filtered)']];
export const NO_FILTER: MapF = { sector: '', tier: '', persona: '', citizen: false };
const NE2U: Record<string, string> = { 'North-West': 'NW', Central: 'CE', 'North-East': 'NE', Kgatleng: 'KL', 'South-East': 'SE', Southern: 'SO', Kgalagadi: 'KG', Ghanzi: 'GH', Kweneng: 'KW', Gaborone: 'GA', Jwaneng: 'JW', Francistown: 'FR', Lobatse: 'LO', 'Selebi-Phikwe': 'SP', Sowa: 'ST' };
const SMALL = ['Gaborone', 'Lobatse', 'Jwaneng', 'Sowa', 'Selebi-Phikwe', 'Francistown'];
const NEIGH: [string, number, number][] = [['NAMIBIA', 19.35, -23.6], ['SOUTH AFRICA', 26.6, -26.4], ['ZIMBABWE', 29.0, -19.6], ['ZAMBIA', 26.6, -16.9], ['ANGOLA', 20.4, -17.05]];
const W = 1000;

/* ------------------------------------------------------------------ geometry helpers */
const merc = (lon: number, lat: number): Pos => [(lon * Math.PI) / 180, Math.log(Math.tan(Math.PI / 4 + (Math.max(-85, Math.min(85, lat)) * Math.PI) / 360))];
function polys(g: Geom): Pos[][][] { return g.type === 'Polygon' ? [g.coordinates as Pos[][]] : g.type === 'MultiPolygon' ? (g.coordinates as Pos[][][]) : []; }
function lines(g: Geom): Pos[][] { return g.type === 'LineString' ? [g.coordinates as Pos[]] : g.type === 'MultiLineString' ? (g.coordinates as Pos[][]) : []; }
function lerp(a: string, b: string, t: number) {
    const p = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
    const [x, y] = [p(a), p(b)];
    return `rgb(${x.map((v, i) => Math.round(v + (y[i] - v) * Math.max(0, Math.min(1, t)))).join(',')})`;
}
/** Voronoi cell of point i within the box, by clipping the box with each bisector half-plane. */
function cell(pts: Pos[], i: number, box: [number, number, number, number]): Pos[] {
    let poly: Pos[] = [[box[0], box[1]], [box[2], box[1]], [box[2], box[3]], [box[0], box[3]]];
    const [px, py] = pts[i];
    pts.forEach(([qx, qy], j) => {
        if (j === i) return;
        const nx = qx - px, ny = qy - py, c = (qx * qx + qy * qy - px * px - py * py) / 2;
        const inside = (p: Pos) => p[0] * nx + p[1] * ny <= c;
        const out: Pos[] = [];
        poly.forEach((a, k) => {
            const b = poly[(k + 1) % poly.length];
            const ia = inside(a), ib = inside(b);
            if (ia) out.push(a);
            if (ia !== ib) {
                const da = a[0] * nx + a[1] * ny - c, db = b[0] * nx + b[1] * ny - c;
                const t = da / (da - db);
                out.push([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]);
            }
        });
        poly = out;
    });
    return poly;
}
function smooth(p: Pos[]): string {
    if (p.length < 3) return p.map((q, i) => `${i ? 'L' : 'M'}${q[0]},${q[1]}`).join('');
    let d = `M${p[0][0]},${p[0][1]}`;
    for (let i = 0; i < p.length - 1; i++) {
        const p0 = p[Math.max(0, i - 1)], p1 = p[i], p2 = p[i + 1], p3 = p[Math.min(p.length - 1, i + 2)];
        d += `C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6} ${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6} ${p2[0]},${p2[1]}`;
    }
    return d;
}

export function filterRl(f: MapF, data: MapFilters) {
    const si = f.sector ? SECTORS.findIndex((s) => s.code === f.sector) : -1;
    const pi = f.persona ? data.personas.indexOf(f.persona) : -1;
    return (r: MapFilters['rl'][number]) => (si < 0 || r[2] === si) && tierPass(f.tier, r[3]) && (pi < 0 || r[4] === pi) && (!f.citizen || r[5] === 1);
}
export function filterCov(f: MapF) {
    const si = f.sector ? SECTORS.findIndex((s) => s.code === f.sector) : -1;
    return (r: MapFilters['cov'][number]) => (si < 0 || r[1] === si) && tierPass(f.tier, r[2]);
}
const tierPass = (want: string, t: string) => !want || (want === 'A+' ? t === 'A+' : want === 'A' ? t === 'A' || t === 'A+' : want === 'B' ? t === 'B' : true);

/* ------------------------------------------------------------------ component */
export default function BwMap({ data, filters, f = NO_FILTER, metric = 'pop', layers: layersIn, sel = null, onSelect, height = 760, legend = false, heat, townCount, overlay, label = 'Interactive map of Botswana' }: {
    data: BwMapData; filters?: MapFilters; f?: MapF; metric?: string; layers?: Partial<Layers>; sel?: Sel; onSelect?: (s: Sel) => void; height?: number; legend?: boolean;
    /** Coverage glow per town ID when no filter data is loaded (sector pages). */ heat?: Record<string, number>;
    /** Ranked leads per town ID when no filter data is loaded. */ townCount?: Record<string, number>;
    overlay?: ReactNode; label?: string;
}) {
    const H = height;
    const usdM = useUsdM();
    const layers: Layers = { ...DEFAULT_LAYERS, ...layersIn };
    const svgRef = useRef<SVGSVGElement>(null);
    const [t, setT] = useState({ k: 1, x: 0, y: 0 });
    const tRef = useRef(t);
    tRef.current = t;
    const anim = useRef<number | undefined>(undefined);
    const drag = useRef<{ x: number; y: number; tx: number; ty: number; moved: boolean } | null>(null);
    const [tip, setTip] = useState<{ x: number; y: number; html: ReactNode } | null>(null);

    /* projection fitted to Botswana */
    const proj = useMemo(() => {
        const bw = data.countries.find((c) => c.p.a3 === 'BWA');
        const pts = (bw ? polys(bw.g) : data.districts.flatMap((d) => polys(d.g))).flatMap((p) => p[0] ?? []).map(([x, y]) => merc(x, y));
        const x0 = Math.min(...pts.map((p) => p[0])), x1 = Math.max(...pts.map((p) => p[0])), y0 = Math.min(...pts.map((p) => p[1])), y1 = Math.max(...pts.map((p) => p[1]));
        const s = Math.min((W - 80) / (x1 - x0), (H - 80) / (y1 - y0));
        const ox = (W - s * (x1 - x0)) / 2, oy = (H - s * (y1 - y0)) / 2;
        return (lon: number, lat: number): Pos => { const [mx, my] = merc(lon, lat); return [+(ox + (mx - x0) * s).toFixed(1), +(oy + (y1 - my) * s).toFixed(1)]; };
    }, [data.countries, data.districts, H]);
    const polyD = (g: Geom) => polys(g).map((rings) => rings.map((r) => r.map(([x, y], i) => `${i ? 'L' : 'M'}${proj(x, y).join(' ')}`).join('') + 'Z').join('')).join('');
    const lineD = (g: Geom) => lines(g).map((l) => l.map(([x, y], i) => `${i ? 'L' : 'M'}${proj(x, y).join(' ')}`).join('')).join('');

    const geo = useMemo(() => {
        const bw = data.countries.find((c) => c.p.a3 === 'BWA');
        const dists = data.districts.map((d) => {
            const name = String(d.p.name);
            const ps = polys(d.g);
            let big = ps[0]?.[0] ?? [];
            ps.forEach((p) => { if ((p[0]?.length ?? 0) > big.length) big = p[0]; });
            const pp = big.map(([x, y]) => proj(x, y));
            const bx: [number, number, number, number] = [Math.min(...pp.map((p) => p[0])), Math.min(...pp.map((p) => p[1])), Math.max(...pp.map((p) => p[0])), Math.max(...pp.map((p) => p[1]))];
            const cx = pp.reduce((s, p) => s + p[0], 0) / (pp.length || 1), cy = pp.reduce((s, p) => s + p[1], 0) / (pp.length || 1);
            return { name, code: NE2U[name] ?? '', d: polyD(d.g), box: bx, c: [cx, cy] as Pos };
        });
        const gpts = data.gateways.map((g) => proj(g.lon, g.lat));
        return {
            bw: bw ? polyD(bw.g) : '', neigh: data.countries.filter((c) => c.p.a3 !== 'BWA').map((c) => polyD(c.g)), dists, gpts,
            cells: gpts.map((_, i) => cell(gpts, i, [0, 0, W, H])),
            roads: (data.roads ?? []).map((r) => ({ d: lineD(r.g), major: /Major/.test(String(r.p.type ?? '')) })),
            rail: (data.rail ?? []).map((r) => lineD(r.g)).join(''), rivers: (data.rivers ?? []).map((r) => ({ d: lineD(r.g), name: String(r.p.name ?? 'River') })),
            lakes: (data.lakes ?? []).map((r) => polyD(r.g)),
            towns: data.towns.map((tw) => ({ ...tw, p: proj(tw.lon, tw.lat) })),
            corr: data.corridors.map((c) => ({ ...c, d: smooth(c.pts.map(([x, y]) => proj(x, y))), end: proj(...c.pts[c.pts.length - 1]), prev: proj(...c.pts[c.pts.length - 2]) })),
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, proj, H]);

    /* values for the current filter */
    const vals = useMemo(() => {
        const townRl = new Map<string, number>();
        const unitRlA = new Map<string, number>();
        const townCov = new Map<string, number>();
        const unitCov = new Map<string, number>();
        if (filters) {
            const pr = filterRl(f, filters), pc = filterCov(f);
            filters.rl.forEach((r) => {
                if (!pr(r)) return;
                const tw = data.towns[r[0]];
                if (tw) townRl.set(tw.id, (townRl.get(tw.id) ?? 0) + 1);
                const u = data.units[r[1]];
                if (u && (r[3] === 'A' || r[3] === 'A+')) unitRlA.set(u.code, (unitRlA.get(u.code) ?? 0) + 1);
            });
            filters.cov.forEach((r) => {
                if (!pc(r)) return;
                const tw = data.towns[r[0]];
                if (!tw) return;
                townCov.set(tw.id, (townCov.get(tw.id) ?? 0) + r[3]);
                unitCov.set(tw.unit, (unitCov.get(tw.unit) ?? 0) + r[3]);
            });
        } else {
            data.towns.forEach((tw) => { townRl.set(tw.id, townCount ? townCount[tw.id] ?? 0 : tw.rl); townCov.set(tw.id, heat ? heat[tw.id] ?? 0 : tw.cov); unitCov.set(tw.unit, (unitCov.get(tw.unit) ?? 0) + (heat ? heat[tw.id] ?? 0 : tw.cov)); });
        }
        const unitVal = (u: MUnit) => metric === 'rlA' ? unitRlA.get(u.code) ?? 0 : metric === 'cov' ? unitCov.get(u.code) ?? 0 : Number((u as unknown as Record<string, number>)[metric] ?? 0);
        const umax = Math.max(1, ...data.units.map(unitVal));
        const tmax = Math.max(1, ...townRl.values());
        const hmax = Math.max(1, ...townCov.values());
        return { townRl, townCov, unitVal, umax, tmax, hmax };
    }, [filters, f, data, metric, heat, townCount]);

    const unitBy = useMemo(() => Object.fromEntries(data.units.map((u) => [u.code, u])), [data.units]);
    const metricLabel = UNITMETRICS.find((m) => m[0] === metric)?.[1] ?? metric;
    const fmtMetric = (v: number) => (metric.startsWith('env') ? usdM(v) : N(v));
    const ramp = (v: number) => lerp('#f6ecd0', '#a3741a', Math.sqrt(v / vals.umax));
    const townR = (pop: number) => 2 + Math.sqrt(pop || 0) / 62;
    const k = t.k;

    /* zoom and pan */
    const animate = (to: { k: number; x: number; y: number }, ms = 650) => {
        window.cancelAnimationFrame(anim.current ?? 0);
        const from = tRef.current;
        const t0 = performance.now();
        const step = (now: number) => {
            const p = Math.min(1, (now - t0) / ms);
            const e = p < 0.5 ? 2 * p * p : 1 - (-2 * p + 2) ** 2 / 2;
            setT({ k: from.k + (to.k - from.k) * e, x: from.x + (to.x - from.x) * e, y: from.y + (to.y - from.y) * e });
            if (p < 1) anim.current = window.requestAnimationFrame(step);
        };
        anim.current = window.requestAnimationFrame(step);
    };
    const zoomPt = (p: Pos, kk: number) => animate({ k: kk, x: W / 2 - kk * p[0], y: H / 2 - kk * p[1] });
    const zoomBox = (b: [number, number, number, number], maxK = 12) => { const kk = Math.min(maxK, 0.85 / Math.max((b[2] - b[0]) / W, (b[3] - b[1]) / H)); zoomPt([(b[0] + b[2]) / 2, (b[1] + b[3]) / 2], kk); };
    const scaleBy = (m: number, at: Pos = [W / 2, H / 2]) => {
        const c = tRef.current;
        const kk = Math.max(1, Math.min(48, c.k * m));
        const wx = (at[0] - c.x) / c.k, wy = (at[1] - c.y) / c.k;
        return { k: kk, x: at[0] - wx * kk, y: at[1] - wy * kk };
    };
    const svgPt = (cx: number, cy: number): Pos => { const r = svgRef.current!.getBoundingClientRect(); return [((cx - r.left) * W) / r.width, ((cy - r.top) * H) / r.height]; };

    useEffect(() => {
        const el = svgRef.current;
        if (!el) return;
        const wheel = (e: WheelEvent) => { e.preventDefault(); window.cancelAnimationFrame(anim.current ?? 0); setT(scaleBy(e.deltaY < 0 ? 1.25 : 0.8, svgPt(e.clientX, e.clientY))); };
        el.addEventListener('wheel', wheel, { passive: false });
        return () => { el.removeEventListener('wheel', wheel); window.cancelAnimationFrame(anim.current ?? 0); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    /* zoom to the selection */
    const selKey = sel ? JSON.stringify(sel) : '';
    useEffect(() => {
        if (!sel) { animate({ k: 1, x: 0, y: 0 }); return; }
        if (sel.type === 'unit') {
            const d = geo.dists.find((x) => x.code === sel.code);
            const u = unitBy[sel.code];
            if (d) zoomBox(d.box, SMALL.includes(d.name) ? 14 : 8);
            else if (u) zoomPt(proj(u.lon, u.lat), 5);
        } else if (sel.type === 'town') {
            const tw = geo.towns.find((x) => x.id === sel.id);
            if (tw) zoomPt(tw.p, Math.max(tRef.current.k, 7));
        } else if (sel.type === 'hot') {
            const h = data.hotspots[sel.i];
            if (h && h.lat !== null && h.lon !== null) zoomPt(proj(h.lon, h.lat), Math.max(tRef.current.k, 9));
        } else if (sel.type === 'gw') {
            const p = geo.gpts[sel.i];
            if (p) zoomBox([p[0] - 120, p[1] - 90, p[0] + 120, p[1] + 90], 6);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selKey]);

    const pick = (s: Sel) => (e: RME) => { e.stopPropagation(); onSelect?.(s); };
    const showTip = (html: ReactNode) => (e: RME) => {
        const r = svgRef.current?.parentElement?.getBoundingClientRect();
        if (r) setTip({ x: Math.min(e.clientX - r.left + 14, r.width - 270), y: e.clientY - r.top + 14, html });
    };
    const hide = () => setTip(null);

    const onDown = (e: RPE<SVGSVGElement>) => { drag.current = { x: e.clientX, y: e.clientY, tx: t.x, ty: t.y, moved: false }; };
    const onMove = (e: RPE<SVGSVGElement>) => {
        const d = drag.current;
        if (!d || !(e.buttons & 1)) return;
        const r = svgRef.current!.getBoundingClientRect();
        const dx = ((e.clientX - d.x) * W) / r.width, dy = ((e.clientY - d.y) * H) / r.height;
        if (Math.abs(dx) + Math.abs(dy) > 3) d.moved = true;
        if (d.moved) { window.cancelAnimationFrame(anim.current ?? 0); setT((c) => ({ ...c, x: d.tx + dx, y: d.ty + dy })); }
    };
    const onUp = () => { setTimeout(() => { drag.current = null; }, 0); };
    const bgClick = () => { if (drag.current?.moved) return; onSelect?.(null); };
    const guard = (fn: (e: RME) => void) => (e: RME) => { if (drag.current?.moved) { e.stopPropagation(); return; } fn(e); };

    /* selection marks */
    const selTown = sel?.type === 'town' ? geo.towns.find((x) => x.id === sel.id) : null;
    const selHot = sel?.type === 'hot' ? data.hotspots[sel.i] : null;
    const selUnit = sel?.type === 'unit' ? sel.code : null;
    const sk = Math.sqrt(k);
    const minPop = k < 1.6 ? 40000 : k < 3 ? 9000 : k < 6 ? 2500 : 0;
    const heatCol = f.sector ? SECTORS.find((s) => s.code === f.sector)?.color ?? '#d6a32e' : '#d6a32e';
    const vne = { vectorEffect: 'non-scaling-stroke' as const };
    const hotAt = (h: MHot, i: number): Pos | null => {
        if (h.lat === null || h.lon === null) return null;
        const p = proj(h.lon, h.lat);
        const dup = data.hotspots.filter((x) => x.placeId === h.placeId).length > 1;
        const ang = (((i * 137.5) % 360) * Math.PI) / 180;
        return dup ? [p[0] + 9 * Math.cos(ang), p[1] + 9 * Math.sin(ang)] : p;
    };
    const chP = unitBy.CH ? proj(unitBy.CH.lon, unitBy.CH.lat) : null;

    return (
        <div className="relative h-full w-full overflow-hidden bg-[#dfeaf2]">
            <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full touch-none select-none" role="img" aria-label={label}
                onPointerDown={onDown} onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={() => { hide(); onUp(); }} onClick={bgClick}>
                <defs>
                    <clipPath id="bwclip"><path d={geo.bw} /></clipPath>
                    <filter id="bwblur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={6} /></filter>
                    <marker id="bwarr" viewBox="0 0 10 10" refX={6} refY={5} markerWidth={6} markerHeight={6} orient="auto-start-reverse"><path d="M0,0L10,5L0,10z" fill="#d6a32e" /></marker>
                </defs>
                <g transform={`translate(${t.x},${t.y}) scale(${k})`}>
                    {geo.neigh.map((d, i) => <path key={i} d={d} fill="#efe9dd" stroke="#d5ccb9" strokeWidth={0.8} style={vne} />)}
                    {NEIGH.map(([n, lon, lat]) => { const p = proj(lon, lat); return <text key={n} x={p[0]} y={p[1]} textAnchor="middle" fill="#8a8a96" fontSize={12 / sk} fontWeight={600} letterSpacing=".25em" opacity={0.7} pointerEvents="none">{n}</text>; })}
                    <path d={geo.bw} fill="#fbf6ea" stroke="#8c7a55" strokeWidth={2} style={vne} />
                    {layers.regions && (
                        <g clipPath="url(#bwclip)">
                            {geo.cells.map((c, i) => <path key={i} d={`M${c.map((p) => p.join(',')).join('L')}Z`} fill={GWCOL[i]} fillOpacity={0.16} stroke={GWCOL[i]} strokeWidth={1.5} strokeDasharray="5 4" style={vne}
                                onMouseMove={showTip(<><b>{data.gateways[i]?.short} gateway region</b><br />{data.gateways[i]?.places} places nearest (haversine) · catchment shown as a Voronoi cell [COMPUTED]</>)} onMouseLeave={hide} />)}
                        </g>
                    )}
                    {geo.dists.map((d) => {
                        const u = unitBy[d.code];
                        const v = u ? vals.unitVal(u) : 0;
                        const on = selUnit === d.code;
                        return <path key={d.name} d={d.d} fill={layers.dist ? ramp(v) : '#fbf6ea'} fillOpacity={layers.dist ? (layers.regions ? 0.55 : 0.85) : 1} stroke={on ? '#d6a32e' : '#8c7a55'} strokeWidth={on ? 3 : 1} style={{ ...vne, cursor: 'pointer' }}
                            onMouseMove={showTip(<><b>{u?.name ?? d.name}</b> · {u?.kind}<br />{metricLabel}: <b>{fmtMetric(v)}</b>{d.code === 'NW' && <><br /><span className="opacity-80">Base polygon also contains Chobe (CH)</span></>}</>)} onMouseLeave={hide}
                            onClick={guard(pick({ type: 'unit', code: d.code }))} />;
                    })}
                    {chP && unitBy.CH && (
                        <circle cx={chP[0]} cy={chP[1]} r={34 / sk} fill={layers.dist ? ramp(vals.unitVal(unitBy.CH)) : '#4f8fca'} fillOpacity={layers.dist ? 0.7 : 0.12} stroke={selUnit === 'CH' ? '#d6a32e' : '#4f8fca'} strokeDasharray="4 3" strokeWidth={selUnit === 'CH' ? 3 : 1} style={{ ...vne, cursor: 'pointer' }}
                            onMouseMove={showTip(<><b>Chobe</b> · district<br />Boundary sits inside the North-West base polygon; shown as a district point</>)} onMouseLeave={hide} onClick={guard(pick({ type: 'unit', code: 'CH' }))} />
                    )}
                    {layers.water && (
                        <g>
                            {geo.lakes.map((d, i) => <path key={i} d={d} fill="#bcd7ee" stroke="#4f8fca" strokeWidth={0.6} style={vne} />)}
                            {geo.rivers.map((r, i) => <path key={i} d={r.d} fill="none" stroke="#4f8fca" strokeOpacity={0.75} strokeWidth={1.3} style={vne} onMouseMove={showTip(<b>{r.name}</b>)} onMouseLeave={hide} />)}
                        </g>
                    )}
                    {layers.roads && geo.roads.map((r, i) => <path key={i} d={r.d} fill="none" stroke="#8a8a96" strokeOpacity={0.55} strokeWidth={r.major ? 1.4 : 0.8} style={vne} pointerEvents="none" />)}
                    {layers.rail && <path d={geo.rail} fill="none" stroke="#3a3a44" strokeWidth={1.6} strokeDasharray="2 3" style={vne} pointerEvents="none" />}
                    {layers.corr && geo.corr.map((c) => (
                        <g key={c.id} style={{ cursor: 'pointer' }} onMouseMove={showTip(<><b>{c.name}</b><br />{c.to}<br /><span className="opacity-75">Schematic alignment</span></>)} onMouseLeave={hide}>
                            <path d={c.d} fill="none" stroke="#d6a32e" strokeOpacity={0.22} strokeWidth={9} style={vne} />
                            <path d={c.d} fill="none" stroke={c.dash ? '#7a4fa3' : '#d6a32e'} strokeWidth={2.4} strokeDasharray={c.dash ? '7 5' : undefined} markerEnd="url(#bwarr)" style={vne} />
                        </g>
                    ))}
                    {layers.heat && (
                        <g filter="url(#bwblur)" pointerEvents="none">
                            {geo.towns.map((tw) => { const n = vals.townCov.get(tw.id) ?? 0; return n ? <circle key={tw.id} cx={tw.p[0]} cy={tw.p[1]} r={(8 + 22 * Math.sqrt(n / vals.hmax)) / sk} fill={heatCol} opacity={0.55} /> : null; })}
                        </g>
                    )}
                    {layers.air && (data.airports ?? []).map((a) => { const p = proj(a.lon, a.lat); return (
                        <g key={a.iata + a.name} transform={`translate(${p[0]},${p[1]}) scale(${1 / sk})`} onMouseMove={showTip(<><b>{a.name}</b> ({a.iata})</>)} onMouseLeave={hide}>
                            <circle r={7} fill="#fff" stroke="#2f5fa8" /><text y={3.5} textAnchor="middle" fontSize={8} fontWeight={700} fill="#2f5fa8">✈</text>
                        </g>); })}
                    {layers.gw && data.gateways.map((g, i) => { const p = geo.gpts[i]; return (
                        <g key={g.i} transform={`translate(${p[0]},${p[1]}) scale(${1 / sk})`} style={{ cursor: 'pointer' }} onMouseMove={showTip(<><b>{g.name}</b><br />{g.places} places nearest</>)} onMouseLeave={hide} onClick={guard(pick({ type: 'gw', i }))}>
                            <circle r={11} fill={GWCOL[i]} opacity={0.35} className="animate-pulse" /><rect x={-6} y={-6} width={12} height={12} transform="rotate(45)" fill={GWCOL[i]} stroke="#fff" strokeWidth={1.5} />
                        </g>); })}
                    {layers.towns && geo.towns.map((tw) => {
                        const n = vals.townRl.get(tw.id) ?? 0;
                        return <circle key={tw.id} cx={tw.p[0]} cy={tw.p[1]} r={townR(tw.pop) / k} fill={n ? lerp('#4f8fca', '#16161b', Math.sqrt(n / vals.tmax)) : '#fff'} stroke={n ? '#fff' : '#8a8a96'} strokeWidth={1} style={{ ...vne, cursor: 'pointer' }}
                            onMouseMove={showTip(<><b>{tw.name}</b> · {tw.unitName}<br />Population {N(tw.pop)} · {data.gateways[tw.gw]?.short ?? ''} {N(tw.km)} km<br />{n} ranked leads · {vals.townCov.get(tw.id) ?? 0} coverage rows</>)} onMouseLeave={hide} onClick={guard(pick({ type: 'town', id: tw.id }))} />;
                    })}
                    {layers.hot && data.hotspots.map((h, i) => { const p = hotAt(h, i); if (!p) return null; return (
                        <g key={h.i} style={{ cursor: 'pointer' }} onMouseMove={showTip(<><b>{h.name}</b><br />{h.place} · {h.status}<br />{h.leads} hotspot leads · best lead score {h.best}</>)} onMouseLeave={hide} onClick={guard(pick({ type: 'hot', i: h.i }))}>
                            {h.aplus && <circle cx={p[0]} cy={p[1]} r={7 / sk} fill="#d6a32e" className="animate-pulse" />}
                            <circle cx={p[0]} cy={p[1]} r={5.5 / sk} fill={h.aplus ? '#d6a32e' : h.tierA ? '#1f7a4c' : '#4f8fca'} stroke="#16161b" strokeWidth={1.6} style={vne} />
                        </g>); })}
                    {layers.labels && (
                        <g pointerEvents="none">
                            {k < 3.2 && geo.dists.filter((d) => !SMALL.includes(d.name)).map((d) => <text key={d.name} x={d.c[0]} y={d.c[1]} textAnchor="middle" fontSize={13 / k} fontWeight={700} letterSpacing=".12em" fill="#3a3a44" opacity={0.55}>{d.name.toUpperCase()}</text>)}
                            {geo.towns.filter((tw) => tw.pop >= minPop).map((tw) => <text key={tw.id} x={tw.p[0] + townR(tw.pop) / k + 3 / k} y={tw.p[1] + 4 / k} fontSize={11.5 / k} fontWeight={600} fill="#16161b" paintOrder="stroke" stroke="#fbf6ea" strokeWidth={3 / k}>{tw.name.replace(' (council point)', '')}</text>)}
                            {layers.gw && data.gateways.map((g, i) => <text key={g.i} x={geo.gpts[i][0]} y={geo.gpts[i][1] - 14 / k} textAnchor="middle" fontSize={10.5 / k} fontWeight={700} fill={GWCOL[i]} paintOrder="stroke" stroke="#fbf6ea" strokeWidth={3 / k}>{g.short}</text>)}
                        </g>
                    )}
                    {selTown && (
                        <g pointerEvents="none">
                            {selTown.gw >= 0 && geo.gpts[selTown.gw] && (<>
                                <line x1={selTown.p[0]} y1={selTown.p[1]} x2={geo.gpts[selTown.gw][0]} y2={geo.gpts[selTown.gw][1]} stroke={GWCOL[selTown.gw]} strokeWidth={2} strokeDasharray="6 4" style={vne} />
                                <text x={(selTown.p[0] + geo.gpts[selTown.gw][0]) / 2} y={(selTown.p[1] + geo.gpts[selTown.gw][1]) / 2} fontSize={11 / k} fontWeight={700} fill={GWCOL[selTown.gw]} paintOrder="stroke" stroke="#fbf6ea" strokeWidth={3 / k}>{N(selTown.km)} km</text>
                            </>)}
                            <circle cx={selTown.p[0]} cy={selTown.p[1]} r={12 / k} fill="none" stroke="#d6a32e" strokeWidth={3} style={vne} />
                        </g>
                    )}
                    {selHot && (() => { const p = hotAt(selHot, selHot.i); return p ? <circle cx={p[0]} cy={p[1]} r={12 / k} fill="none" stroke="#d6a32e" strokeWidth={3} style={vne} pointerEvents="none" /> : null; })()}
                    {sel?.type === 'gw' && geo.gpts[sel.i] && <circle cx={geo.gpts[sel.i][0]} cy={geo.gpts[sel.i][1]} r={12 / k} fill="none" stroke={GWCOL[sel.i]} strokeWidth={3} style={vne} pointerEvents="none" />}
                </g>
            </svg>
            <div className="absolute top-3 right-3 grid gap-1.5">
                {[[<Plus key="p" className="size-4" />, 'Zoom in', () => animate(scaleBy(1.6), 300)], [<Minus key="m" className="size-4" />, 'Zoom out', () => animate(scaleBy(1 / 1.6), 300)], [<RotateCcw key="r" className="size-4" />, 'Reset view', () => onSelect ? onSelect(null) : animate({ k: 1, x: 0, y: 0 })]].map(([icon, l, fn]) => (
                    <button key={l as string} type="button" aria-label={l as string} title={l as string} onClick={(e) => { e.stopPropagation(); (fn as () => void)(); }} className="grid size-8 place-items-center rounded-[8px] border border-parchment-400 bg-white text-ink-800 shadow-sm hover:border-gold-500">{icon as ReactNode}</button>
                ))}
            </div>
            {legend && (
                <div className="absolute bottom-3 left-3 w-[250px] max-w-[60%] rounded-[10px] border border-parchment-400 bg-white/95 p-2.5 text-[0.7rem] text-ink-700 shadow-sm">
                    <b className="text-[0.72rem]">{metricLabel}{f.sector ? ` · ${f.sector}` : ''}</b>
                    <div className="my-1 h-2 rounded-full" style={{ background: 'linear-gradient(90deg,#f6ecd0,#a3741a)' }} />
                    <div className="flex justify-between"><span>0</span><span>{fmtMetric(vals.umax)}</span></div>
                    <div className="mt-1 flex flex-wrap gap-x-2.5 gap-y-0.5">
                        <span><i className="inline-block size-2 rounded-full bg-[#16161b]" /> town (leads)</span><span><i className="inline-block size-2 rounded-full bg-gold-500" /> A+ hotspot</span>
                        <span><i className="inline-block size-2 rotate-45 bg-gold-500" /> gateway</span><span className="text-gold-700">━ corridor</span><span>┅ rail</span>
                    </div>
                </div>
            )}
            {overlay}
            {tip && <div role="tooltip" className="pointer-events-none absolute z-10 max-w-[260px] rounded-[8px] bg-ink-950 px-2.5 py-1.5 text-[0.72rem] leading-snug text-parchment-100 shadow-lg" style={{ left: tip.x, top: tip.y }}>{tip.html}</div>}
        </div>
    );
}
