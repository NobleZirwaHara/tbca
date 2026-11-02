/* Map View, L0 to L5 drill-down (prototype #map, no mock-up number): districts, towns, hotspots, hotspot leads, gateways and corridors. */
import { router } from '@inertiajs/react';
import { Layers } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { CountryCard, GwCard, HotCard, TownCard, UnitCard, type GwCardData, type HotCardData, type TownCardData, type UnitCardData } from '@/Components/Aiim/Explorer/BwCards';
import BwMap, { DEFAULT_LAYERS, LAYERS, NO_FILTER, UNITMETRICS, useFilters, useMapData, type BwMapRaw, type LayerKey, type Layers as LayerState, type MapF, type Sel } from '@/Components/Aiim/Explorer/BwMap';
import CountryExplorer from '@/Components/Aiim/Explorer/CountryExplorer';
import type { CountryActivation, CountryIntel } from '@/Components/Aiim/Explorer/types';
import { BuyBtn, CtaBand, Eyebrow, Frame, P, PackLoading, Btn, Section, SECTORS, SheetTable, SvcRail, type Row, type Sheet, type Svc } from '@/Components/Aiim/ProtoExplore';
import { cn } from '@/lib/cn';
import type { AiimPageProps } from '@/types/aiim';

interface BwMapPage {
    map: BwMapRaw; filters: string; summary: Record<string, string | number>; towns: { id: string; name: string }[];
    ticker: { reg: Row[]; gaps: Row[] }; mapstack: Sheet; layers: Sheet;
    brief: Svc | null; custom: Svc | null; geojson: Svc | null; rail: Svc[];
}
type Card = ({ type: 'unit' } & UnitCardData) | ({ type: 'town' } & TownCardData) | ({ type: 'hot' } & HotCardData) | ({ type: 'gw' } & GwCardData);
interface Props extends AiimPageProps {
    country: { slug: string; name: string; flag: string };
    bw: BwMapPage | null;
    intel: CountryIntel | null;
    activation: CountryActivation;
    focus?: string;
    sel?: string;
    card?: Card | null;
}

const LAYER_LABELS: Record<LayerKey, [string, string]> = {
    dist: ['District choropleth', '#c99a3a'], regions: ['Gateway regions', '#7a4fa3'], towns: ['Towns (83)', '#16161b'], hot: ['Hotspots (42)', '#d6a32e'], heat: ['Coverage glow', '#e4b443'],
    gw: ['Border gateways (6)', '#4f8fca'], corr: ['Trade corridors (7)', '#d6a32e'], roads: ['Roads', '#9a9aa5'], rail: ['Rail', '#3a3a44'], water: ['Rivers & lakes', '#4f8fca'], air: ['Airports', '#2f5fa8'], labels: ['Labels', '#6b6b78'],
};
const LEVELS: [string, string][] = [['L0', 'Country'], ['R', 'Gateway region'], ['L1', 'District / city / town council'], ['L2', 'Sub-district (DG-13, not loaded)'], ['L3', 'Town or place'], ['L4', 'Site / hotspot'], ['L5', 'Lead / asset']];
const selKey = (s: Sel) => (!s ? '' : s.type === 'unit' ? `unit:${s.code}` : s.type === 'town' ? `town:${s.id}` : `${s.type}:${s.i}`);
const parseSel = (k: string | undefined): Sel => {
    const [t, v] = (k ?? '').split(':');
    return t === 'unit' && v ? { type: 'unit', code: v } : t === 'town' && v ? { type: 'town', id: v } : (t === 'hot' || t === 'gw') && v !== undefined && v !== '' ? { type: t, i: Number(v) } : null;
};
const ctl = 'w-full rounded-[8px] border border-parchment-500 bg-white px-2.5 py-1.5 text-[0.82rem]';

export default function MapView(props: Props) {
    if (props.bw) return <BotswanaMapView {...props} bw={props.bw} />;
    const c = props.country;
    return (
        <Frame title={`${c.name} Map View`} crumbs={[{ label: c.name, href: `/aiim/country/${c.slug}` }, { label: 'Map View' }]}>
            <Eyebrow>Map View · drill-down</Eyebrow>
            <h1 className="mt-1 text-[2rem] font-bold text-ink-900">{c.name} Opportunity Map</h1>
            <p className="mb-4 text-ink-500">Areas, towns, project briefs and opportunity records loaded for {c.name}. Click an area to drill down.</p>
            {props.intel ? (
                <div className="rounded-[16px] bg-ink-950 p-4 text-parchment-100">
                    <CountryExplorer intel={props.intel} countryName={c.name} activation={props.activation} initialTab="map" initialUnit={null} hideOverview />
                </div>
            ) : <PackLoading country={c.name} what="The drill-down map with districts, towns, hotspots, gateways and corridors"><Btn href={`${P.custom}?country=${c.slug}`} tone="gold">Request regional intelligence</Btn></PackLoading>}
            <CtaBand title="Need a site verified on the ground?" text="TBCA scouts confirm listings with a P1 point, land-tenure and citizen-rule checks before a Verified badge is issued." />
        </Frame>
    );
}

function BotswanaMapView({ bw, focus, sel: selIn, card }: Props & { bw: BwMapPage }) {
    const data = useMapData(bw.map);
    const filters = useFilters(bw.filters);
    const isSector = Boolean(focus && SECTORS.some((s) => s.code === focus));
    const [sel, setSel] = useState<Sel>(() => parseSel(selIn) ?? (focus && data.units.some((u) => u.code === focus) ? { type: 'unit', code: focus } : focus && data.towns.some((t) => t.id === focus) ? { type: 'town', id: focus } : null));
    const [metric, setMetric] = useState('pop');
    const [f, setF] = useState<MapF>(isSector ? { ...NO_FILTER, sector: focus! } : NO_FILTER);
    const [layers, setLayers] = useState<LayerState>({ ...DEFAULT_LAYERS, heat: isSector });
    const [q, setQ] = useState('');
    const [miss, setMiss] = useState('');

    const load = (s: Sel) => {
        const url = new URL(window.location.href);
        const k = selKey(s);
        if (k) url.searchParams.set('sel', k); else url.searchParams.delete('sel');
        url.searchParams.delete('focus');
        router.get(url.pathname + url.search, {}, { only: ['card', 'sel'], preserveState: true, preserveScroll: true, replace: true });
    };
    const select = (s: Sel) => { setSel(s); load(s); };
    useEffect(() => { if (sel && selKey(sel) !== selIn) load(sel); /* first card for a ?focus= unit or town */ }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const level = !sel ? 'L0' : sel.type === 'unit' ? 'L1' : sel.type === 'town' ? 'L3' : sel.type === 'hot' ? 'L4' : 'R';
    const cardOk = card && sel && selKey(sel) === selIn;
    const S = bw.summary;

    const crumbs = useMemo(() => {
        const out: [string, Sel][] = [['Botswana', null]];
        if (sel?.type === 'unit') out.push([data.units.find((u) => u.code === sel.code)?.name ?? sel.code, sel]);
        if (sel?.type === 'town') {
            const t = data.towns.find((x) => x.id === sel.id);
            if (t) { if (t.gw >= 0) out.push([data.gateways[t.gw].short, { type: 'gw', i: t.gw }]); out.push([t.unitName, { type: 'unit', code: t.unit }], [t.name, sel]); }
        }
        if (sel?.type === 'hot') {
            const h = data.hotspots[sel.i];
            if (h) out.push([data.units.find((u) => u.code === h.unit)?.name ?? h.unit, { type: 'unit', code: h.unit }], [h.place, { type: 'town', id: h.placeId }], [h.name, sel]);
        }
        if (sel?.type === 'gw') out.push([`${data.gateways[sel.i]?.short} region`, sel]);
        return out;
    }, [sel, data]);

    const find = (raw?: string) => {
        const s = (raw ?? q).toLowerCase().trim();
        if (!s) return;
        const t = data.towns.find((x) => x.name.toLowerCase() === s) ?? data.towns.find((x) => x.name.toLowerCase().includes(s));
        const u = data.units.find((x) => x.name.toLowerCase().includes(s));
        const h = data.hotspots.find((x) => x.name.toLowerCase().includes(s));
        setMiss('');
        if (u && u.name.toLowerCase() === s) select({ type: 'unit', code: u.code });
        else if (t) select({ type: 'town', id: t.id });
        else if (h) select({ type: 'hot', i: h.i });
        else if (u) select({ type: 'unit', code: u.code });
        else setMiss(`No place matches “${raw ?? q}”.`);
    };
    const setFilter = (patch: Partial<MapF>) => {
        const nf = { ...f, ...patch };
        setF(nf);
        if (patch.sector) setLayers((l) => ({ ...l, heat: true }));
    };
    const tick = [
        ...bw.ticker.reg.map((r) => `${r.ID} ${r.Change} — ${r.Instrument} · ${r.Status} · impact ${r.Impact}`),
        'FX P13.84/US$ · R1.207/P · crawl −2.76 % p.a.',
        ...bw.ticker.gaps.map((g) => `${g.ID} open gap: ${g['Missing data']}`),
    ];

    return (
        <Frame title="Botswana Opportunity Map" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Map View' }]}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div className="min-w-0 max-w-4xl">
                    <Eyebrow className="text-ink-500">Map View · L0 → L5 drill-down</Eyebrow>
                    <h1 className="mt-1 text-[2rem] leading-tight font-bold text-ink-900 sm:text-[2.3rem]">Botswana Opportunity Map</h1>
                    <p className="text-[0.9rem] text-ink-500">16 units, 83 places, 42 hotspots, {Number(S['Hotspot leads'] ?? 126).toLocaleString('en-US')} hotspot leads, {Number(S['Ranked leads'] ?? 0).toLocaleString('en-US')} ranked leads, {Number(S['Coverage rows'] ?? 0).toLocaleString('en-US')} coverage rows, 6 gateways and 7 corridors. Click a district, town, hotspot or gateway.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <BuyBtn svc={bw.custom} ctx="Custom investor map — Botswana" tone="gold"><Layers className="size-3.5" /> Custom investor map</BuyBtn>
                    <BuyBtn svc={bw.geojson} ctx="Botswana GeoJSON export" tone="ghost">Export GeoJSON</BuyBtn>
                </div>
            </div>

            <div className="grid overflow-hidden rounded-[14px] border border-parchment-400 bg-white xl:grid-cols-[250px_minmax(0,1fr)_360px]">
                <div className="grid content-start gap-4 border-b border-parchment-400 p-4 xl:border-r xl:border-b-0">
                    <div className="grid gap-1.5">
                        <Eyebrow className="text-ink-500">Find a place</Eyebrow>
                        <input type="search" list="bw-places" value={q} placeholder="Town, unit or hotspot" className={ctl} onChange={(e) => { setQ(e.target.value); const v = e.target.value.toLowerCase(); if (data.towns.some((t) => t.name.toLowerCase() === v) || data.units.some((u) => u.name.toLowerCase() === v)) find(v); }} onKeyDown={(e) => { if (e.key === 'Enter') find(); }} aria-label="Find a place" />
                        <datalist id="bw-places">{data.towns.map((t) => <option key={t.id} value={t.name} />)}{data.units.map((u) => <option key={u.code} value={u.name} />)}</datalist>
                        {miss && <p className="text-[0.75rem] text-risk-700" role="status">{miss}</p>}
                    </div>
                    <label className="grid gap-1.5"><Eyebrow className="text-ink-500">Unit colour (L1)</Eyebrow>
                        <select className={ctl} value={metric} onChange={(e) => setMetric(e.target.value)}>{UNITMETRICS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                    </label>
                    <div className="grid gap-1.5">
                        <Eyebrow className="text-ink-500">Filters</Eyebrow>
                        <select className={ctl} aria-label="Sector" value={f.sector} onChange={(e) => setFilter({ sector: e.target.value })}><option value="">All 18 sectors</option>{SECTORS.map((s) => <option key={s.code} value={s.code}>{s.code} · {s.name}</option>)}</select>
                        <select className={ctl} aria-label="Tier" value={f.tier} onChange={(e) => setFilter({ tier: e.target.value })}><option value="">All tiers</option><option value="A+">Tier A+ only</option><option value="A">Tier A and A+</option><option value="B">Tier B</option></select>
                        <select className={ctl} aria-label="Persona" value={f.persona} onChange={(e) => setFilter({ persona: e.target.value })}><option value="">All personas</option>{(filters?.personas ?? []).map((p) => <option key={p}>{p}</option>)}</select>
                        <label className="flex items-center gap-2 text-[0.82rem]"><input type="checkbox" className="accent-gold-600" checked={f.citizen} onChange={(e) => setFilter({ citizen: e.target.checked })} /> Citizen-reserved only</label>
                    </div>
                    <div className="grid gap-1">
                        <Eyebrow className="text-ink-500">Layers</Eyebrow>
                        {LAYERS.map((k) => (
                            <label key={k} className="flex items-center gap-2 text-[0.82rem]">
                                <input type="checkbox" className="accent-gold-600" checked={layers[k]} onChange={(e) => setLayers((l) => ({ ...l, [k]: e.target.checked }))} />
                                <i className="inline-block size-2.5 rounded-[2px]" style={{ background: LAYER_LABELS[k][1] }} />{LAYER_LABELS[k][0]}
                            </label>
                        ))}
                    </div>
                    <div className="grid gap-1">
                        <Eyebrow className="text-ink-500">Drill levels</Eyebrow>
                        {LEVELS.map(([a, b]) => <div key={a} className={cn('grid grid-cols-[2rem_minmax(0,1fr)] gap-1 rounded-[6px] px-2 py-1 text-[0.78rem]', a === level ? 'bg-gold-100 text-ink-900' : 'text-ink-500')}><b className="font-mono">{a}</b>{b}</div>)}
                    </div>
                </div>

                <div className="relative min-w-0 border-b border-parchment-400 xl:border-b-0">
                    <BwMap data={data} filters={filters} f={f} metric={metric} layers={layers} sel={sel} onSelect={select} height={820} legend
                        overlay={(
                            <>
                                <nav aria-label="Map level" className="absolute top-3 left-3 flex max-w-[70%] flex-wrap items-center gap-1 rounded-full border border-parchment-400 bg-white/95 px-3 py-1 text-[0.78rem] shadow-sm">
                                    {crumbs.map(([l, s], i) => (
                                        <span key={i} className="flex items-center gap-1">
                                            {i > 0 && <span className="text-ink-400">›</span>}
                                            {i < crumbs.length - 1 ? <button type="button" className="font-semibold text-controlled-700 hover:underline" onClick={() => select(s)}>{l}</button> : <span className="font-semibold text-ink-900">{l}</span>}
                                        </span>
                                    ))}
                                </nav>
                            </>
                        )} />
                    <div className="flex items-center overflow-hidden bg-ink-950 text-[0.75rem] text-parchment-200">
                        <span className="shrink-0 bg-risk-700 px-3 py-1.5 font-bold tracking-wider text-white">ALERTS</span>
                        <div className="min-w-0 flex-1 overflow-hidden"><div className="flex w-max animate-[marquee_80s_linear_infinite] gap-8 px-4 py-1.5 whitespace-nowrap hover:[animation-play-state:paused]">{[...tick, ...tick].map((t, i) => <span key={i}><Rich2 t={t} /></span>)}</div></div>
                    </div>
                    <style>{'@keyframes marquee{from{transform:translateX(0)}to{transform:translateX(-50%)}}'}</style>
                </div>

                <div className="min-w-0 p-4">
                    {!sel ? <CountryCard summary={S} gateways={data.gateways} onGateway={(i) => select({ type: 'gw', i })} brief={bw.brief} />
                        : !cardOk ? <p className="text-[0.85rem] text-ink-500" role="status">Loading…</p>
                            : card.type === 'unit' ? <UnitCard u={card} compact /> : card.type === 'town' ? <TownCard t={card} compact /> : card.type === 'hot' ? <HotCard h={card} /> : <GwCard g={card} />}
                </div>
            </div>

            <Section title="Sector map stacks" sub="What each sector shows at each level (BW_MapStack, 90 layers). Select a sector filter to light the map with that sector’s coverage.">
                <SheetTable sheet={bw.mapstack} filters={['Sector name', 'Levels', 'Geometry']} />
            </Section>
            <Section title="Issue 2.0 map layers" sub="175 layer definitions carried over (I2_Map_Layers) with geometry, levels and security class.">
                <SheetTable sheet={bw.layers} size={10} filters={['Sector', 'Levels', 'Security class']} />
            </Section>
            <SvcRail items={bw.rail} title="Geospatial services" />
            <CtaBand title="Need a site verified on the ground?" text="TBCA scouts confirm listings with a P1 point, land-tenure and citizen-rule checks before a Verified badge is issued." />
        </Frame>
    );
}

/** Ticker text: the leading ID in bold. */
function Rich2({ t }: { t: string }) {
    const i = t.indexOf(' ');
    return <><b className="text-gold-400">{t.slice(0, i)}</b>{t.slice(i)}</>;
}
