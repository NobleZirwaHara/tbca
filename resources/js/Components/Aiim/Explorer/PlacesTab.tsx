import { Link } from '@inertiajs/react';
import { ChevronRight, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { buildTree, num, Panel, Pending, unitKind } from './shared';
import { label, type AdminUnitNode, type CountryIntel } from './types';

const LEVEL_NAMES = ['Country', 'Regions', 'Districts', 'Cities', 'Municipalities', 'Towns'];

export default function PlacesTab({ intel, countryName, lang, onOpen }: { intel: CountryIntel; countryName: string; lang: string; onOpen: (unitId: number) => void }) {
    const tree = useMemo(() => buildTree(intel.units), [intel.units]);
    const [q, setQ] = useState('');
    const levels = [1, 2, 3, 4, 5].map((l) => intel.units.filter((u) => u.level === l).length);

    if (!intel.units.length) {
        return (
            <Pending title={`Administrative areas for ${countryName} are not loaded yet`}>
                The drill-down from country to regions, districts, cities, municipalities and towns fills in when the country pack or project briefs for {countryName} are loaded. No areas are invented in the meantime.
            </Pending>
        );
    }

    const matches = q ? intel.units.filter((u) => `${u.name} ${Object.values(u.labels ?? {}).join(' ')}`.toLowerCase().includes(q.toLowerCase())) : [];

    const row = (u: AdminUnitNode, depth: number) => (
        <li key={u.id}>
            <div className="flex flex-wrap items-center gap-2 rounded px-1 py-1 text-xs hover:bg-ink-800" style={{ paddingLeft: depth * 16 + 4 }}>
                <button type="button" onClick={() => onOpen(u.id)} className="font-medium text-parchment-100 hover:text-gold-400">{label(u, lang)}</button>
                {lang !== 'en' && u.labels?.[lang] && <span className="text-ink-500">({u.name})</span>}
                <span className="text-[0.65rem] text-ink-400">{unitKind(u)}</span>
                {u.placeholder && <span className="text-[0.65rem] text-attested-500">to be confirmed</span>}
                {u.lat !== null && <MapPin className="size-3 text-ink-500" aria-label="Mapped" />}
                <span className="ml-auto flex gap-3 text-[0.65rem] text-ink-300">
                    {u.population ? <span>{num(u.population)} people</span> : null}
                    {u.projects > 0 && <span className="text-gold-400">{u.projects} projects</span>}
                    {u.opportunities > 0 && <span>{u.opportunities} leads</span>}
                    {u.provinceSlug && <Link href={`/aiim/province/${u.provinceSlug}`} className="text-gold-400 hover:underline">Province profile</Link>}
                </span>
            </div>
            {(tree.children.get(u.id) ?? []).length > 0 && <ul>{(tree.children.get(u.id) ?? []).map((c) => row(c, depth + 1))}</ul>}
        </li>
    );

    return (
        <div className="grid gap-4 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <div className="space-y-3">
                <Panel title="Areas loaded">
                    <ul className="space-y-1 text-xs">
                        {levels.map((n, i) => (
                            <li key={i} className="flex justify-between"><span className="text-ink-300">{LEVEL_NAMES[i + 1]}</span><span className={n ? 'font-semibold' : 'text-ink-500'}>{n || 'Pending'}</span></li>
                        ))}
                    </ul>
                    <p className="mt-2 text-[0.65rem] text-ink-400">Levels a country does not use are skipped. Botswana towns, for example, sit directly under their district or council.</p>
                </Panel>
                <label className="relative block">
                    <Search className="pointer-events-none absolute top-2 left-2 size-4 text-ink-400" />
                    <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a place" aria-label="Find a place" className="h-8 w-full rounded border border-ink-600 bg-ink-950 pr-2 pl-8 text-xs text-parchment-100" />
                </label>
                {q && (
                    <Panel title={`Matches (${matches.length})`}>
                        <ul className="space-y-1 text-xs">
                            {matches.slice(0, 30).map((u) => (
                                <li key={u.id}>
                                    <button type="button" onClick={() => onOpen(u.id)} className="text-left hover:text-gold-400">
                                        {tree.ancestors(u.id).map((a, i, all) => <span key={a.id}>{label(a, lang)}{i < all.length - 1 && <ChevronRight className="inline size-3 text-ink-500" />}</span>)}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </Panel>
                )}
            </div>
            <Panel title={`${countryName}: regions, districts, cities, municipalities and towns`}>
                <ul>{(tree.children.get(null) ?? []).map((u) => row(u, 0))}</ul>
                <p className="mt-3 text-[0.65rem] text-ink-400">Select a place to open it on the map. Sources are shown when you select an area on the map.</p>
            </Panel>
        </div>
    );
}
