import { Link } from '@inertiajs/react';
import { ArrowRight, ChevronRight, Layers, MapPin, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { cn } from '@/lib/cn';
import AiimIcon from '../AiimIcon';
import { Chip } from '../Chips';
import CountryMap, { type MapArea, type MapLine, type MapPoint, type PointShape } from './CountryMap';
import { bboxOfPositions, ensureSpan, outerPositions, polygonsOf, type BBox } from './geo';
import { useCompactPrice } from './money';
import { buildTree, num, Panel, Pending, PlaceholderNote, pct, StatusChip, unitKind } from './shared';
import { STATUS_COLORS } from './Treemap';
import { label, LANGUAGE_NAMES, type CountryIntel, type Position } from './types';

const AFRICA: BBox = [-18, -35, 52, 38];

const SHAPES: Record<string, PointShape> = {
    projects: 'diamond', opportunities: 'circle', places: 'dot', 'admin-units': 'ring',
    gateways: 'triangle', hotspots: 'circle', institutions: 'square', airports: 'square',
};

/** Layer presets from the Decision and Information Tree Booklet (A1 layer rail). */
const PRESETS: Record<string, { label: string; layers: string[] }> = {
    investor: { label: 'Investor view', layers: ['projects', 'opportunities', 'admin-units', 'hotspots', 'institutions'] },
    trader: { label: 'Trader view', layers: ['admin-units', 'places', 'gateways', 'roads', 'rail', 'airports', 'hotspots'] },
    all: { label: 'All layers', layers: ['projects', 'opportunities', 'admin-units', 'places', 'gateways', 'hotspots', 'institutions', 'airports', 'roads', 'rail', 'rivers'] },
};

type Selected = { kind: 'point'; point: MapPoint } | null;

export default function MapTab({
    intel,
    countryName,
    unitId,
    setUnitId,
    sector,
    setSector,
    lang,
    setLang,
}: {
    intel: CountryIntel;
    countryName: string;
    unitId: number | null;
    setUnitId: (id: number | null) => void;
    sector: string | null;
    setSector: (code: string | null) => void;
    lang: string;
    setLang: (l: string) => void;
}) {
    const compact = useCompactPrice();
    const tree = useMemo(() => buildTree(intel.units), [intel.units]);
    const [active, setActive] = useState<Set<string>>(new Set(PRESETS.investor.layers));
    const [depth, setDepth] = useState(unitId ? Math.min(5, (tree.byId.get(unitId)?.level ?? 0) + 1) : 1);
    const [selected, setSelected] = useState<Selected>(null);
    const [openSector, setOpenSector] = useState<string | null>(sector);
    const layerMeta = new Map(intel.map.layers.core.map((l) => [l.key, l]));
    const sectorName = (code: string | null) => intel.sectorCodes.find((s) => s.code === code)?.name ?? code ?? '';

    const scope = unitId ? tree.descendants(unitId) : null;
    const inScope = (id: number | null) => !scope || (id !== null && scope.has(id));
    const crumbs = tree.ancestors(unitId);
    const children = tree.children.get(unitId) ?? [];

    const chooseUnit = (id: number | null) => {
        setUnitId(id);
        setSelected(null);
        const u = id ? tree.byId.get(id) : null;
        if (u) setDepth((d) => Math.max(d, Math.min(5, u.level + 1)));
    };

    // ---- Focus box: selected unit polygon, else its mapped points, else the country.
    const countryBox = useMemo(() => bboxOfPositions(outerPositions(intel.map.outline)) ?? AFRICA, [intel.map.outline]);
    const focus = useMemo<BBox>(() => {
        if (!unitId) return countryBox;
        const area = intel.map.areas.find((a) => a.unitId === unitId);
        if (area) return bboxOfPositions(outerPositions(polygonsOf(area.geometry))) ?? countryBox;
        const ids = tree.descendants(unitId);
        const pts: Position[] = [
            ...intel.units.filter((u) => ids.has(u.id) && u.lat !== null && u.lon !== null).map((u) => [u.lon!, u.lat!] as Position),
            ...intel.projects.filter((p) => p.unitId && ids.has(p.unitId) && p.lat !== null).map((p) => [p.lon!, p.lat!] as Position),
            ...intel.opportunities.filter((o) => o.unitId && ids.has(o.unitId) && o.lat).map((o) => [o.lon!, o.lat!] as Position),
        ];
        const b = bboxOfPositions(pts);
        return b ? ensureSpan(b, 0.5) : countryBox;
    }, [unitId, countryBox, intel, tree]);

    // ---- Points per active layer.
    const points = useMemo<MapPoint[]>(() => {
        const out: MapPoint[] = [];
        const dimFor = (code: string | null | undefined) => Boolean(sector) && code !== sector;
        const color = (key: string) => layerMeta.get(key)?.color ?? '#9a9aa5';

        if (active.has('projects')) {
            for (const p of intel.projects) {
                if (p.lat === null || p.lon === null) continue;
                out.push({
                    id: `project-${p.code}`, layer: 'projects', lat: p.lat, lon: p.lon, name: p.name,
                    sub: `${p.statusLabel} · ${compact(p.capexZar)}${p.placeholder ? ' · approximate location' : ''}`,
                    color: STATUS_COLORS[p.status] ?? color('projects'), shape: 'diamond', size: 7, placeholder: p.placeholder,
                    dim: dimFor(p.sectorCode) || !inScope(p.unitId),
                });
            }
        }
        if (active.has('opportunities')) {
            const groups = new Map<string, typeof intel.opportunities>();
            for (const o of intel.opportunities) {
                if (!o.lat || !o.lon) continue;
                if (sector && o.sectorCode !== sector) continue;
                const k = `${o.lat},${o.lon}`;
                groups.set(k, [...(groups.get(k) ?? []), o]);
            }
            for (const [k, list] of groups) {
                const [lat, lon] = k.split(',').map(Number);
                out.push({
                    id: `opps-${k}`, layer: 'opportunities', lat, lon, name: list[0].place ?? 'Opportunity leads',
                    sub: `${list.length} opportunity lead${list.length > 1 ? 's' : ''}${sector ? ` in ${sectorName(sector)}` : ''}`,
                    color: color('opportunities'), shape: 'circle', size: 5 + Math.sqrt(list.length) * 1.8, count: list.length,
                    dim: !inScope(list[0].unitId),
                });
            }
        }
        if (active.has('admin-units') && !intel.map.areas.length) {
            for (const u of intel.units) {
                if (u.level >= 5 || u.lat === null || u.lon === null || u.level > depth) continue;
                out.push({ id: `unit-${u.id}`, layer: 'admin-units', lat: u.lat, lon: u.lon, name: label(u, lang), sub: unitKind(u), color: color('admin-units'), shape: 'ring', size: 6, showLabel: true, placeholder: u.placeholder });
            }
        }
        if (active.has('admin-units') && intel.map.areas.length && depth >= 1) {
            for (const u of intel.units) {
                if (u.level !== 1 || u.lat === null || u.lon === null) continue;
                out.push({ id: `unit-${u.id}`, layer: 'admin-units', lat: u.lat, lon: u.lon, name: label(u, lang), sub: `${unitKind(u)}${u.population ? ` · population ${num(u.population)}` : ''}`, color: color('admin-units'), shape: 'ring', size: 4, showLabel: depth <= 2 });
            }
        }
        if (active.has('places') && depth >= 3) {
            for (const u of intel.units) {
                if (u.level !== 5 || u.lat === null || u.lon === null) continue;
                out.push({
                    id: `unit-${u.id}`, layer: 'places', lat: u.lat, lon: u.lon, name: label(u, lang),
                    sub: `${unitKind(u)}${u.population ? ` · population ${num(u.population)}` : ''}`,
                    color: color('places'), shape: 'dot', size: u.population && u.population > 30000 ? 7 : 5,
                    showLabel: depth >= 5 && inScope(u.id) && (Boolean(unitId) || (u.population ?? 0) > 20000), dim: !inScope(u.id),
                });
            }
        }
        for (const f of intel.map.features) {
            if (!active.has(f.layer)) continue;
            out.push({
                id: f.id, layer: f.layer, lat: f.lat, lon: f.lon, name: label(f, lang), sub: [f.status, f.place].filter(Boolean).join(' · '),
                color: color(f.layer), shape: SHAPES[f.layer] ?? 'circle', size: f.layer === 'hotspots' ? 5 : 6, placeholder: f.placeholder,
                dim: (f.layer === 'hotspots' || f.layer === 'institutions') && dimFor(f.sectorCode),
                showLabel: f.layer === 'gateways' && depth >= 2,
            });
        }
        return out;
    }, [active, intel, depth, sector, lang, unitId]); // eslint-disable-line react-hooks/exhaustive-deps

    const areas: MapArea[] = intel.map.areas.map((a) => ({
        key: String(a.unitId ?? a.code),
        name: a.name,
        polygons: polygonsOf(a.geometry),
        selected: a.unitId !== null && crumbs.some((c) => c.id === a.unitId),
        muted: !active.has('admin-units'),
    }));
    const lines: MapLine[] = [
        active.has('rivers') && { key: 'rivers', geometries: intel.map.lines.rivers, color: '#4f8fca', width: 1.1 },
        active.has('roads') && { key: 'roads', geometries: intel.map.lines.roads, color: '#a8915c', width: 1 },
        active.has('rail') && { key: 'rail', geometries: intel.map.lines.rail, color: '#c9c9cf', width: 1.2, dash: '5 3' },
    ].filter(Boolean) as MapLine[];

    const toggle = (key: string) => setActive((s) => {
        const n = new Set(s);
        if (n.has(key)) n.delete(key);
        else n.add(key);
        return n;
    });

    const pick = (p: MapPoint) => {
        if (p.id.startsWith('unit-')) {
            const id = Number(p.id.slice(5));
            const u = tree.byId.get(id);
            if (u && u.level < 5) {
                chooseUnit(id);
                return;
            }
        }
        setSelected({ kind: 'point', point: p });
    };

    // Records in the current scope for the linked results list.
    const scopedProjects = intel.projects.filter((p) => p.status !== 'NOT QUALIFIED' && inScope(p.unitId) && (!sector || p.sectorCode === sector));
    const tierRank = (t?: string | null) => ({ 'A+': 0, A: 1, B: 2, C: 3 })[t ?? ''] ?? 4;
    const scopedOpps = intel.opportunities
        .filter((o) => (scope ? inScope(o.unitId) : true) && (!sector || o.sectorCode === sector))
        .sort((a, b) => Number(!a.place) - Number(!b.place) || tierRank(a.tier) - tierRank(b.tier) || (b.score ?? 0) - (a.score ?? 0));
    const hasMapData = intel.units.length > 0 || intel.projects.some((p) => p.lat !== null) || intel.map.features.length > 0;

    return (
        <div className="grid gap-4 xl:grid-cols-[15rem_minmax(0,1fr)_17rem]">
            {/* A1: layer and filter rail */}
            <div className="space-y-3">
                <Panel title={<span className="flex items-center gap-2"><Layers className="size-4 text-gold-500" />Map layers</span>}>
                    <div className="mb-3 flex flex-wrap gap-1">
                        {Object.entries(PRESETS).map(([key, p]) => (
                            <button key={key} type="button" onClick={() => setActive(new Set(p.layers))} className="rounded border border-ink-600 px-2 py-1 text-[0.6875rem] text-parchment-200 hover:border-gold-500">{p.label}</button>
                        ))}
                    </div>
                    <ul className="space-y-1">
                        {intel.map.layers.core.map((l) => (
                            <li key={l.key}>
                                <label className={cn('flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-xs hover:bg-ink-800', l.count === 0 && 'opacity-50')}>
                                    <input type="checkbox" className="accent-gold-500" checked={active.has(l.key)} onChange={() => toggle(l.key)} />
                                    <span className="inline-block size-2.5 shrink-0 rounded-sm" style={{ background: l.color }} aria-hidden="true" />
                                    <span className="flex-1">{label(l, lang)}</span>
                                    <span className="text-ink-400">{l.count || 'None'}</span>
                                </label>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel title="Map detail">
                    <input type="range" min={0} max={5} step={1} value={depth} onChange={(e) => setDepth(Number(e.target.value))} className="w-full accent-gold-500" aria-label="Map detail level" />
                    <p className="mt-1 text-xs text-gold-400">{intel.map.depths[depth]?.label}</p>
                    <p className="mt-1 text-[0.65rem] text-ink-400">Country, regions, districts, cities, municipalities, then towns and sites. Labels and place markers appear as you go deeper.</p>
                </Panel>

                {intel.map.labelLanguages.length > 1 && (
                    <Panel title="Label language">
                        <div className="flex gap-1">
                            {intel.map.labelLanguages.map((l) => (
                                <button key={l} type="button" onClick={() => setLang(l)} className={cn('rounded border px-2 py-1 text-xs', lang === l ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-ink-600 text-parchment-200')}>{LANGUAGE_NAMES[l] ?? l}</button>
                            ))}
                        </div>
                        <p className="mt-1 text-[0.65rem] text-ink-400">Local names come from the country pack and are still being validated. English shows where no local name exists.</p>
                    </Panel>
                )}

                <Panel title="Sector layers">
                    <p className="mb-2 text-[0.65rem] text-ink-400">From the AIIM layer register. Choose a sector to filter the map and see its layers.</p>
                    {sector && <button type="button" onClick={() => setSector(null)} className="mb-2 inline-flex items-center gap-1 text-xs text-gold-400 hover:underline"><X className="size-3" />Clear sector filter</button>}
                    <ul className="max-h-96 space-y-0.5 overflow-y-auto pr-1">
                        {intel.map.layers.sectors.map((g) => (
                            <li key={g.code}>
                                <button
                                    type="button"
                                    onClick={() => { setSector(sector === g.code ? null : g.code); setOpenSector(openSector === g.code ? null : g.code); }}
                                    className={cn('flex w-full items-center gap-2 rounded px-1 py-1 text-left text-xs hover:bg-ink-800', sector === g.code && 'bg-ink-800 text-gold-400')}
                                >
                                    <span className="text-gold-500" style={{ color: g.color }}><AiimIcon name={g.icon} className="size-3.5" /></span>
                                    <span className="flex-1">{g.name}</span>
                                    <span className="text-ink-400">{g.records}</span>
                                </button>
                                {openSector === g.code && (
                                    <ul className="mt-1 mb-2 ml-6 space-y-1 border-l border-ink-700 pl-2">
                                        {g.layers.map((l) => (
                                            <li key={l.key} className="text-[0.6875rem] text-ink-300">
                                                <span className="text-parchment-200">{label(l, lang)}</span>
                                                <span className="block text-ink-400">{l.geometry} · {l.levels.replace(' (zoom-dependent)', '')}{l.security !== 'S0' ? ` · restricted (${l.security})` : ''}</span>
                                            </li>
                                        ))}
                                        <li className="text-[0.65rem] text-attested-500">Features for these layers are not loaded for {countryName} yet.</li>
                                    </ul>
                                )}
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            {/* A0: map canvas with drill-down breadcrumb */}
            <div className="min-w-0 space-y-3">
                <nav aria-label="Map area" className="flex flex-wrap items-center gap-1 text-xs">
                    <button type="button" onClick={() => chooseUnit(null)} className={cn('hover:text-gold-400', !unitId ? 'font-semibold text-gold-400' : 'text-ink-300')}>{countryName}</button>
                    {crumbs.map((c) => (
                        <span key={c.id} className="flex items-center gap-1">
                            <ChevronRight className="size-3 text-ink-500" />
                            <button type="button" onClick={() => chooseUnit(c.id)} className={cn('hover:text-gold-400', c.id === unitId ? 'font-semibold text-gold-400' : 'text-ink-300')}>{label(c, lang)}</button>
                            <span className="text-ink-500">({unitKind(c)})</span>
                        </span>
                    ))}
                    {sector && <Chip tone="dark" className="ml-2">Sector: {sectorName(sector)}</Chip>}
                </nav>
                {intel.map.outline.length ? (
                    <CountryMap
                        outline={intel.map.outline}
                        areas={areas}
                        lines={lines}
                        points={points}
                        focus={focus}
                        selectedId={selected?.point.id}
                        onPointClick={pick}
                        onAreaClick={(key) => key && !Number.isNaN(Number(key)) && chooseUnit(Number(key))}
                        ariaLabel={`Map of ${countryName} with investment layers`}
                    />
                ) : (
                    <Pending title="Boundary not available">The country outline has not been loaded.</Pending>
                )}
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-ink-300">
                    <span className="flex items-center gap-1"><span className="inline-block size-2.5 rotate-45" style={{ background: STATUS_COLORS.QUALIFIED }} />Qualified project</span>
                    <span className="flex items-center gap-1"><span className="inline-block size-2.5 rotate-45" style={{ background: STATUS_COLORS.WATCHLIST }} />Watchlist project</span>
                    <span className="flex items-center gap-1"><span className="inline-block size-2.5 rotate-45 border border-dashed border-attested-500" />Approximate site (placeholder coordinates)</span>
                    <span className="flex items-center gap-1"><span className="inline-block size-2.5 rounded-full bg-[#2f8a5f]" />Opportunity leads (number = leads at that place)</span>
                </div>
                {!hasMapData && (
                    <Pending title={`Map data pending for ${countryName}`}>
                        No administrative areas, project briefs or mapped places are loaded for {countryName} yet. The outline is shown; layers fill in as the country pack and project briefs arrive.
                    </Pending>
                )}

                {/* A4: linked results */}
                <Panel title={`Records in ${unitId ? label(tree.byId.get(unitId)!, lang) : countryName}${sector ? `, ${sectorName(sector)}` : ''}`}>
                    {scopedProjects.length === 0 && scopedOpps.length === 0 ? (
                        <p className="text-xs text-ink-400">No project briefs or opportunity records are linked to this area{sector ? ' and sector' : ''} yet.</p>
                    ) : (
                        <div className="max-h-80 overflow-y-auto">
                            <table className="w-full text-left text-xs">
                                <thead className="sticky top-0 bg-ink-900 text-ink-400"><tr><th className="py-1 pr-2 font-medium">Record</th><th className="py-1 pr-2 font-medium">Type</th><th className="py-1 pr-2 font-medium">Place</th><th className="py-1 font-medium">Size</th></tr></thead>
                                <tbody className="divide-y divide-ink-800">
                                    {scopedProjects.map((p) => (
                                        <tr key={p.code}>
                                            <td className="py-1.5 pr-2"><button type="button" className="text-left hover:text-gold-400" onClick={() => { const pt = points.find((x) => x.id === `project-${p.code}`); if (pt) setSelected({ kind: 'point', point: pt }); }}>{p.name}</button></td>
                                            <td className="py-1.5 pr-2"><StatusChip project={p} /></td>
                                            <td className="py-1.5 pr-2 text-ink-300">{p.location}</td>
                                            <td className="py-1.5">{compact(p.capexZar)}</td>
                                        </tr>
                                    ))}
                                    {scopedOpps.slice(0, 60).map((o) => (
                                        <tr key={o.code}>
                                            <td className="py-1.5 pr-2">{o.title}</td>
                                            <td className="py-1.5 pr-2 text-ink-300">{o.kind === 'sweep' ? 'Opportunity lead' : o.kind === 'anchor' ? 'Anchor opportunity' : 'Opportunity template'}{o.tier ? ` · Tier ${o.tier}` : ''}</td>
                                            <td className="py-1.5 pr-2 text-ink-300">{o.place ?? o.placement ?? 'Not placed'}</td>
                                            <td className="py-1.5 text-ink-300">{o.band ?? ''}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {scopedOpps.length > 60 && <p className="mt-2 text-[0.65rem] text-ink-400">Showing 60 of {scopedOpps.length} opportunity records. The Opportunities tab lists them all.</p>}
                        </div>
                    )}
                </Panel>
            </div>

            {/* A3: selected object or area drawer */}
            <div className="space-y-3">
                {selected ? (
                    <SelectedPoint point={selected.point} intel={intel} onClose={() => setSelected(null)} compact={compact} />
                ) : null}
                <Panel title={unitId ? `${label(tree.byId.get(unitId)!, lang)}` : `Areas in ${countryName}`}>
                    {unitId && <UnitFacts id={unitId} intel={intel} />}
                    {children.length ? (
                        <>
                            <p className="mb-1 text-[0.65rem] tracking-wide text-ink-400 uppercase">{unitId ? 'Areas within' : 'First level'}</p>
                            <ul className="max-h-[28rem] space-y-0.5 overflow-y-auto pr-1">
                                {children.map((c) => (
                                    <li key={c.id}>
                                        <button type="button" onClick={() => (c.level < 5 || (tree.children.get(c.id)?.length ?? 0) > 0 ? chooseUnit(c.id) : setSelected(c.lat !== null ? { kind: 'point', point: points.find((p) => p.id === `unit-${c.id}`) ?? { id: `unit-${c.id}`, layer: 'places', lat: c.lat, lon: c.lon!, name: c.name, color: '#9a9aa5', shape: 'dot' } } : null))} className="flex w-full items-start justify-between gap-2 rounded px-1.5 py-1 text-left text-xs hover:bg-ink-800">
                                            <span>
                                                <span className="font-medium text-parchment-100">{label(c, lang)}</span>
                                                <span className="block text-[0.65rem] text-ink-400">{unitKind(c)}{c.population ? ` · ${num(c.population)} people` : ''}{c.placeholder ? ' · to be confirmed' : ''}</span>
                                            </span>
                                            <span className="shrink-0 text-right text-[0.65rem] text-ink-300">
                                                {c.projects > 0 && <span className="block text-gold-400">{c.projects} project{c.projects > 1 ? 's' : ''}</span>}
                                                {c.opportunities > 0 && <span className="block">{c.opportunities} leads</span>}
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </>
                    ) : (
                        <p className="text-xs text-ink-400">{intel.units.length ? 'No lower-level areas are loaded for this area.' : `Administrative areas for ${countryName} are not loaded yet. Data pending.`}</p>
                    )}
                </Panel>
            </div>
        </div>
    );
}

function UnitFacts({ id, intel }: { id: number; intel: CountryIntel }) {
    const u = intel.units.find((x) => x.id === id);
    if (!u) return null;
    return (
        <dl className="mb-3 grid grid-cols-2 gap-2 border-b border-ink-800 pb-3 text-xs">
            <div><dt className="text-ink-400">Type</dt><dd>{unitKind(u)}</dd></div>
            <div><dt className="text-ink-400">Population</dt><dd>{u.population ? num(u.population) : 'Not loaded'}</dd></div>
            <div><dt className="text-ink-400">Project briefs</dt><dd>{u.projects}</dd></div>
            <div><dt className="text-ink-400">Opportunity leads</dt><dd>{u.opportunities}</dd></div>
            {u.tags && <div className="col-span-2"><dt className="text-ink-400">Economic tags</dt><dd className="text-[0.65rem]">{u.tags.toLowerCase().replace(/_/g, ' ')}</dd></div>}
            {u.provinceSlug && <div className="col-span-2"><Link href={`/aiim/province/${u.provinceSlug}`} className="inline-flex items-center gap-1 text-gold-400 hover:underline">Open province profile<ArrowRight className="size-3" /></Link></div>}
            {u.source && <div className="col-span-2 text-[0.6rem] text-ink-400">Source: {u.source}{u.populationSource ? `; population: ${u.populationSource}` : ''}</div>}
        </dl>
    );
}

function SelectedPoint({ point, intel, onClose, compact }: { point: MapPoint; intel: CountryIntel; onClose: () => void; compact: (z: number | null | undefined) => string }) {
    const project = point.layer === 'projects' ? intel.projects.find((p) => `project-${p.code}` === point.id) : null;
    const feature = intel.map.features.find((f) => f.id === point.id);
    const opps = point.layer === 'opportunities' ? intel.opportunities.filter((o) => `opps-${o.lat},${o.lon}` === point.id) : [];
    const unit = point.id.startsWith('unit-') ? intel.units.find((u) => `unit-${u.id}` === point.id) : null;

    return (
        <Panel title={<span className="flex items-center gap-2"><MapPin className="size-4 text-gold-500" />Selected on map</span>} action={<button type="button" onClick={onClose} aria-label="Close" className="text-ink-400 hover:text-parchment-100"><X className="size-4" /></button>}>
            <p className="text-sm font-semibold">{point.name}</p>
            {project && (
                <div className="mt-2 space-y-2 text-xs">
                    <div className="flex flex-wrap gap-1"><StatusChip project={project} />{project.placeholder && <PlaceholderNote />}</div>
                    <p className="text-ink-300">{project.sector} · {project.location}</p>
                    <dl className="grid grid-cols-2 gap-2">
                        <div><dt className="text-ink-400">Capital cost</dt><dd className="font-semibold">{compact(project.capexZar)}</dd></div>
                        <div><dt className="text-ink-400">Project IRR</dt><dd className="font-semibold">{pct(project.projectIrr)}</dd></div>
                        <div><dt className="text-ink-400">ROI</dt><dd>{pct(project.roi)}</dd></div>
                        <div><dt className="text-ink-400">EBITDA margin, year 5</dt><dd>{pct(project.ebitdaMarginY5)}</dd></div>
                    </dl>
                    {project.href && <Link href={project.href} className="inline-flex items-center gap-1 font-semibold text-gold-400 hover:underline">Open project brief<ArrowRight className="size-3" /></Link>}
                </div>
            )}
            {opps.length > 0 && (
                <div className="mt-2 text-xs">
                    <p className="text-ink-300">{opps.length} opportunity lead{opps.length > 1 ? 's' : ''} ranked best at this place.</p>
                    <ul className="mt-2 max-h-64 space-y-1.5 overflow-y-auto pr-1">
                        {opps.map((o) => <li key={o.code}><span className="text-parchment-100">{o.title}</span><span className="block text-[0.65rem] text-ink-400">{o.code} · {o.band}{o.tier ? ` · Tier ${o.tier}` : ''}</span></li>)}
                    </ul>
                </div>
            )}
            {feature && (
                <div className="mt-2 space-y-1 text-xs text-ink-300">
                    {feature.status && <p>Status: {feature.status}</p>}
                    {feature.place && <p>Place: {feature.place}</p>}
                    {feature.note && <p>{feature.layer === 'hotspots' ? 'Institution to call: ' : ''}{feature.note}</p>}
                    {feature.placeholder && <PlaceholderNote />}
                    {feature.source && <p className="text-[0.6rem] text-ink-400">Source: {feature.source}</p>}
                </div>
            )}
            {unit && (
                <p className="mt-1 text-xs text-ink-300">{unitKind(unit)}{unit.population ? ` · ${num(unit.population)} people` : ''}{unit.source ? ` · ${unit.source}` : ''}</p>
            )}
        </Panel>
    );
}
