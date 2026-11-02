/* P02 Country Explorer (prototype pages-landing.js #/countries/explorer). */
import { Link } from '@inertiajs/react';
import { useMemo, useState } from 'react';
import { A, Card, Flag, Ic, inputCls, Meter, N, StatusChip } from '@/Components/Industries/Kit';
import { BW, cHref, HubPage, StateChip } from '@/Components/CountryHub/Layout';
import { HubAfricaMap, MapLegend, STATECOL } from '@/Components/CountryHub/Maps';
import type { CountryOption } from '@/types/countryHub';

interface ExRow extends CountryOption { pack: string | null; rcs: number; state: string; wave: string | null; ev: string; upd: string }
interface Props { rows: ExRow[]; sellable: number }

const DK = 'border-ink-700 bg-ink-900 text-parchment-200';

export default function Explorer({ rows, sellable }: Props) {
    const [q, setQ] = useState('');
    const [reg, setReg] = useState('');
    const [st, setSt] = useState('');
    const regions = useMemo(() => [...new Set(rows.map((c) => c.region))], [rows]);
    const shown = rows.filter((c) => (!reg || c.region === reg) && (!st || c.state === st) && (!q || c.name.toLowerCase().includes(q.toLowerCase())));
    const packs = rows.filter((c) => c.pack).length;
    const kpis: [string, string, string, string][] = [
        ['African Country Objects', '54', 'Complete geographic coverage', 'globe'], ['Activated', String(rows.length), 'Commercially active with full resolver and services', 'check'],
        ['Country packs issued', String(packs), 'Wave 0 packs (CPDS-1.2); Botswana fully loaded', 'book'], ['Shells', '0', 'No country left inactive', 'layers'],
        ['Sellable Directional Corridors', N(sellable), 'Pairs with corridor evidence', 'swap'],
    ];
    const tiles: [string, string, string, string][] = [
        ['Activation Ledger', 'View public activation status for all countries', cHref(BW, 'gov/activation'), 'layers'], ['Unmet Demand', 'Explore captured demand and market gaps', cHref(BW, 'waitlist'), 'users'],
        ['Corridors', 'Explore directional corridors and pair permissions', '/countries/corridors', 'swap'], ['Import & Export', 'Heat maps of intra-African trade', cHref(BW, 'trade'), 'flame'],
        ['Sovereign Clients', 'View sovereign client engagements', cHref(BW, 'gov/sovereign'), 'shield'], ['Country Admin', 'Administrator control and management', cHref(BW, 'gov/tower'), 'db'],
    ];
    return (
        <HubPage title="Country Explorer · Countries | The Business Clinic.Africa" crumbs={[['Countries', '/countries'], ['Country Explorer']]} dark>
            <div className="flex flex-wrap items-end gap-4">
                <div className="min-w-0 flex-1 basis-[22rem]"><h1 className="text-[1.85rem] font-bold text-white">Country Explorer</h1><p className="text-[0.9rem] text-parchment-400">Explore and compare African country objects with resolver state, evidence quality and availability at a glance.</p></div>
                <div className="flex flex-wrap gap-2">
                    <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type country name…" aria-label="Search countries" className={`${inputCls} w-52`} />
                    <select value={reg} onChange={(e) => setReg(e.target.value)} aria-label="Region" className={`${inputCls} w-40`}><option value="">All Regions</option>{regions.map((r) => <option key={r}>{r}</option>)}</select>
                    <select value={st} onChange={(e) => setSt(e.target.value)} aria-label="Availability state" className={`${inputCls} w-36`}><option value="">All States</option><option>Activated</option></select>
                </div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
                {kpis.map(([l, v, s, i]) => (
                    <div key={l} className={`flex gap-3 rounded-[6px] border p-3 ${DK}`}><span className="grid size-9 shrink-0 place-items-center rounded-[6px] bg-ink-800 text-gold-400"><Ic n={i} /></span><div><div className="text-[0.72rem] text-parchment-400">{l}</div><div className="text-[1.35rem] font-bold text-white">{v}</div><div className="text-[0.7rem] text-parchment-400">{s}</div></div></div>
                ))}
            </div>
            <div className="grid grid-cols-[minmax(0,1fr)] gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                <Card tone="dark" title="African Country Objects Map" icon="map">
                    <HubAfricaMap countries={rows} highlight={shown.length < rows.length ? shown.map((c) => c.iso3) : []}
                        tip={(iso, name) => { const c = rows.find((x) => x.iso3 === iso); return `${name}\nActivated · RCS ${c?.rcs ?? 100}%\n${c?.region} Africa${c?.pack ? ` · pack ${c.pack}` : ''}`; }} />
                    <MapLegend dark items={[[STATECOL.Activated, `Activated (${rows.length})`], [STATECOL.Pack, `+ pack issued (${packs})`], [STATECOL.Full, 'Full pack loaded (Botswana)'], ['#c0392b', 'Degraded / Suspended / Restricted (0)']]} />
                </Card>
                <Card title={`All African Country Objects (${rows.length})`} icon="db">
                    <div className="max-h-[560px] overflow-auto">
                        <table className="w-full text-left text-[0.8rem]">
                            <thead className="sticky top-0 bg-parchment-100 text-[0.72rem] text-ink-500"><tr>{['Country', 'Region', 'State', 'RCS', 'Evidence', 'Wave', 'Last updated', ''].map((h) => <th key={h} className="px-2 py-1.5">{h}</th>)}</tr></thead>
                            <tbody>
                                {shown.map((c) => (
                                    <tr key={c.iso3} className="border-t border-parchment-300">
                                        <td className="px-2 py-1.5 whitespace-nowrap"><Flag iso2={c.iso2} /> <Link href={cHref(c)} className="font-medium text-ink-900 hover:underline">{c.name}</Link></td>
                                        <td className="px-2 py-1.5">{c.region}</td>
                                        <td className="px-2 py-1.5"><StateChip c={c} /></td>
                                        <td className="min-w-[90px] px-2 py-1.5"><div className="flex items-center gap-1.5"><span className="text-[0.72rem]">{c.rcs}%</span><Meter p={c.rcs} tone={c.rcs >= 100 ? 'ok' : 'warn'} /></div></td>
                                        <td className="px-2 py-1.5"><StatusChip s={c.ev} /></td>
                                        <td className="px-2 py-1.5 text-[0.72rem]">{c.wave}</td>
                                        <td className="px-2 py-1.5 text-[0.72rem]">{c.upd}</td>
                                        <td className="px-2 py-1.5"><A sm href={cHref(c)}>View Profile</A></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.72rem] text-ink-400">Resolver Completeness (RCS) measures completeness of all required fields; 100 % required for price resolution. All 54 countries are resolver-complete.</p>
                </Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <div className={`rounded-[6px] border p-3 text-[0.85rem] ${DK}`}><b className="text-white">All 54 countries are activated.</b> Every country is transaction-permitted with service-by-service Country Resolver permission. Sprint prices show in every country; corridor (cross-border) pairs still need pair-specific evidence. <b className="text-white">No bypass. No override.</b></div>
                <div className={`rounded-[6px] border p-3 text-[0.85rem] ${DK}`}><b className="text-white">Evidence First.</b> All commercial actions are evidence-backed. Currentness and confidence matter: the Botswana pack shows grade, date and source on every figure.</div>
            </div>
            <div className="grid grid-cols-[repeat(auto-fit,minmax(160px,1fr))] gap-3">
                {tiles.map(([t, s, h, i]) => (
                    <Link key={t} href={h} className={`rounded-[6px] border p-3 hover:border-gold-500 ${DK}`}><div className="flex items-center gap-2"><Ic n={i} className="text-gold-400" /><b className="text-gold-400">{t}</b></div><div className="mt-1 text-[0.78rem] text-parchment-400">{s}</div></Link>
                ))}
            </div>
        </HubPage>
    );
}
