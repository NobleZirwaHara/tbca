import { Link } from '@inertiajs/react';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useCurrency } from '@/lib/money';
import { Chip } from '../Chips';
import { compactIn, useCompactPrice } from './money';
import { num, Panel, Pending, PlaceholderNote, pct, StatusChip } from './shared';
import type { CountryIntel, OpportunityRecord, ScreenedProject } from './types';

const PAGE = 25;

const KIND_LABEL: Record<string, string> = { sweep: 'Opportunity lead', anchor: 'Anchor opportunity', template: 'Opportunity template', instance: 'Country instance' };

export default function OpportunitiesTab({ intel, countryName, onShowOnMap }: { intel: CountryIntel; countryName: string; onShowOnMap: (unitId: number | null) => void }) {
    const briefs = intel.projects.filter((p) => p.status !== 'NOT QUALIFIED');
    const screenedOut = intel.projects.filter((p) => p.status === 'NOT QUALIFIED');
    const { isConverted } = useCurrency();

    return (
        <div className="space-y-5">
            <Panel
                title={`Screened project briefs in ${countryName} (${briefs.length})`}
                action={briefs.length > 0 && <span className="text-[0.65rem] text-ink-400">Hurdles: {intel.hurdles.map((h) => `${h.key} ${h.threshold}`).join(' · ')}</span>}
            >
                {briefs.length === 0 ? (
                    <Pending title={`No project briefs loaded for ${countryName} yet`}>
                        Project briefs are added when TBCA screens a project from this country. The 26 current briefs cover South Africa, Malawi and Madagascar.
                    </Pending>
                ) : (
                    <>
                        <div className="grid gap-3 lg:grid-cols-2">
                            {briefs.map((p) => <BriefCard key={p.code} p={p} onShowOnMap={onShowOnMap} />)}
                        </div>
                        <p className="mt-3 text-[0.65rem] text-ink-400">
                            Amounts are held in rand and shown in your selected currency.{' '}
                            {briefs.some((p) => p.currency !== 'ZAR') && `Briefs priced in US dollars were converted to rand at R${intel.fxZarPerUsd} per US$, the screening register's own rate. `}
                            {isConverted && 'Converted figures use the daily exchange rate. '}
                            Each card also shows the amount in the brief's own currency.
                        </p>
                    </>
                )}
            </Panel>

            {screenedOut.length > 0 && (
                <Panel title={`Screened but not qualified (${screenedOut.length})`}>
                    <p className="mb-2 text-xs text-ink-300">These opportunities were screened and failed the hurdles structurally. They have no brief and no fixed site, so they are not on the map.</p>
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[40rem] text-left text-xs">
                            <thead className="text-ink-400"><tr>{['Code', 'Project', 'Sector', 'Capital cost', 'Project IRR', 'Fails'].map((h) => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-ink-800">
                                {screenedOut.map((p) => <ScreenedRow key={p.code} p={p} />)}
                            </tbody>
                        </table>
                    </div>
                </Panel>
            )}

            <OpportunityRegister items={intel.opportunities} intel={intel} countryName={countryName} />
        </div>
    );
}

function ScreenedRow({ p }: { p: ScreenedProject }) {
    const compact = useCompactPrice();
    return (
        <tr>
            <td className="py-1.5 pr-3 font-mono text-[0.65rem] text-ink-400">{p.code}</td>
            <td className="py-1.5 pr-3">{p.name}</td>
            <td className="py-1.5 pr-3 text-ink-300">{p.sector}</td>
            <td className="py-1.5 pr-3">{compact(p.capexZar)}</td>
            <td className="py-1.5 pr-3">{pct(p.projectIrr)}</td>
            <td className="py-1.5 text-risk-500">{p.failedTests.join(', ')}</td>
        </tr>
    );
}

function BriefCard({ p, onShowOnMap }: { p: ScreenedProject; onShowOnMap: (unitId: number | null) => void }) {
    const compact = useCompactPrice();
    const source = p.capexM !== null ? compactIn(p.capexM * 1e6, p.currency) : null;
    const loc = p.locationFields ?? {};
    return (
        <article className="rounded-[8px] border border-ink-700 bg-ink-950 p-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                    <p className="font-mono text-[0.65rem] text-ink-400">{p.code}</p>
                    <h4 className="text-sm font-semibold">{p.href ? <Link href={p.href} className="hover:text-gold-400">{p.name}</Link> : p.name}</h4>
                    <p className="text-xs text-ink-300">{p.sector}</p>
                </div>
                <StatusChip project={p} />
            </div>
            <dl className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div><dt className="text-ink-400">Capital cost</dt><dd className="font-semibold">{compact(p.capexZar)}</dd>{source && p.currency !== 'ZAR' && <dd className="text-[0.6rem] text-ink-400">Source: {source}</dd>}</div>
                <div><dt className="text-ink-400">NPV</dt><dd className="font-semibold">{compact(p.npvZar)}</dd></div>
                <div><dt className="text-ink-400">Payback</dt><dd className="font-semibold">{p.paybackYrs ? `${p.paybackYrs} years` : 'Not stated'}</dd></div>
                <div><dt className="text-ink-400">Project IRR</dt><dd className={p.projectIrr !== null && p.projectIrr > 18 ? 'font-semibold text-verified-500' : 'font-semibold text-attested-500'}>{pct(p.projectIrr)}</dd></div>
                <div><dt className="text-ink-400">ROI</dt><dd className={p.roi !== null && p.roi > 22 ? 'text-verified-500' : 'text-attested-500'}>{pct(p.roi)}</dd></div>
                <div><dt className="text-ink-400">EBITDA, year 5</dt><dd className={p.ebitdaMarginY5 !== null && p.ebitdaMarginY5 > 25 ? 'text-verified-500' : 'text-attested-500'}>{pct(p.ebitdaMarginY5)}</dd></div>
            </dl>
            {p.failedTests.length > 0 && (
                <p className="mt-2 text-xs text-attested-500">
                    Fails {p.failedTests.join(', ')}.{p.priceUplift ? ` Qualifies with a ${p.priceUplift}% price uplift` : ''}{p.priceUplift && p.capexCut ? ' or' : ''}{p.capexCut ? `${p.priceUplift ? '' : ' Qualifies with'} a ${p.capexCut}% capex cut` : ''}{p.priceUplift || p.capexCut ? '.' : ''}
                </p>
            )}
            <p className="mt-2 flex flex-wrap items-center gap-1 text-[0.6875rem] text-ink-300">
                <MapPin className="size-3 text-gold-500" />
                {[loc.town, loc.city, loc.municipality, loc.district, loc.region].filter(Boolean).join(' · ') || p.location}
                {p.placeholder && <PlaceholderNote />}
            </p>
            <div className="mt-2 flex flex-wrap gap-3 text-xs">
                <button type="button" onClick={() => onShowOnMap(p.unitId)} className="inline-flex items-center gap-1 text-gold-400 hover:underline"><MapPin className="size-3" />Show on map</button>
                {p.href && <Link href={p.href} className="inline-flex items-center gap-1 text-gold-400 hover:underline">Open brief<ArrowRight className="size-3" /></Link>}
            </div>
            {p.sourceDocument && <p className="mt-2 text-[0.6rem] text-ink-500">Source document: {p.sourceDocument}{p.sourceEnvelope ? ` (envelope ${p.sourceEnvelope})` : ''}</p>}
        </article>
    );
}

function OpportunityRegister({ items, intel, countryName }: { items: OpportunityRecord[]; intel: CountryIntel; countryName: string }) {
    const [q, setQ] = useState('');
    const [sector, setSector] = useState('');
    const [kind, setKind] = useState('');
    const [tier, setTier] = useState('');
    const [page, setPage] = useState(1);
    const sectorName = (c: string) => intel.sectorCodes.find((s) => s.code === c)?.name ?? c;

    const filtered = useMemo(() => items.filter((o) =>
        (!sector || o.sectorCode === sector) && (!kind || o.kind === kind) && (!tier || o.tier === tier)
        && (!q || `${o.title} ${o.placement ?? ''} ${o.place ?? ''} ${o.asset ?? ''}`.toLowerCase().includes(q.toLowerCase())),
    ), [items, q, sector, kind, tier]);
    const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
    const rows = filtered.slice((page - 1) * PAGE, page * PAGE);
    const kinds = [...new Set(items.map((o) => o.kind))];
    const tiers = [...new Set(items.map((o) => o.tier).filter(Boolean))] as string[];
    const sectors = [...new Set(items.map((o) => o.sectorCode))];

    if (!items.length) {
        return (
            <Panel title="Opportunity register">
                <Pending title={`No country opportunity register loaded for ${countryName} yet`}>
                    {num(intel.coverage.africaTemplates)} Africa-wide opportunity templates from the AIIM Deep Registers apply wherever the evidence exists. They become country records when a country pack is loaded.
                </Pending>
            </Panel>
        );
    }

    const select = 'h-8 rounded border border-ink-600 bg-ink-950 px-2 text-xs text-parchment-100';
    return (
        <Panel title={`Opportunity register for ${countryName} (${items.length})`}>
            <div className="mb-3 flex flex-wrap gap-2">
                <label className="relative flex-1 basis-56">
                    <Search className="pointer-events-none absolute top-2 left-2 size-4 text-ink-400" />
                    <input value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} placeholder="Search opportunities, places or products" aria-label="Search opportunities" className="h-8 w-full rounded border border-ink-600 bg-ink-950 pr-2 pl-8 text-xs text-parchment-100" />
                </label>
                <select value={sector} onChange={(e) => { setSector(e.target.value); setPage(1); }} className={select} aria-label="Sector">
                    <option value="">All sectors</option>
                    {sectors.map((s) => <option key={s} value={s}>{sectorName(s)}</option>)}
                </select>
                {kinds.length > 1 && (
                    <select value={kind} onChange={(e) => { setKind(e.target.value); setPage(1); }} className={select} aria-label="Record type">
                        <option value="">All record types</option>
                        {kinds.map((k) => <option key={k} value={k}>{KIND_LABEL[k] ?? k}</option>)}
                    </select>
                )}
                {tiers.length > 0 && (
                    <select value={tier} onChange={(e) => { setTier(e.target.value); setPage(1); }} className={select} aria-label="Tier">
                        <option value="">All tiers</option>
                        {tiers.sort().map((t) => <option key={t} value={t}>Tier {t}</option>)}
                    </select>
                )}
            </div>
            <div className="overflow-x-auto">
                <table className="w-full min-w-[52rem] text-left text-xs">
                    <thead className="text-ink-400"><tr>{['Opportunity', 'Sector', 'Where', 'Model', 'Ticket band', 'Tier', 'Investor type'].map((h) => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-ink-800">
                        {rows.map((o) => (
                            <tr key={o.code} className="align-top">
                                <td className="py-1.5 pr-3">
                                    <span className="text-parchment-100">{o.title}</span>
                                    <span className="block font-mono text-[0.6rem] text-ink-500">{o.code} · {KIND_LABEL[o.kind] ?? o.kind}{o.citizenReserved === 'Yes' ? ' · citizen-reserved' : ''}{o.fxEarner === 'Yes' ? ' · foreign-currency earner' : ''}</span>
                                </td>
                                <td className="py-1.5 pr-3 text-ink-300">{sectorName(o.sectorCode)}</td>
                                <td className="py-1.5 pr-3 text-ink-300">{o.place ? <span className="text-parchment-200">{o.place}</span> : o.placement}</td>
                                <td className="py-1.5 pr-3 text-ink-300">{o.model}</td>
                                <td className="py-1.5 pr-3 text-ink-300">{o.band}</td>
                                <td className="py-1.5 pr-3">{o.tier ? <Chip tone={o.tier.startsWith('A') ? 'good' : o.tier === 'B' ? 'warn' : 'dark'}>{o.tier}</Chip> : ''}</td>
                                <td className="py-1.5 text-ink-300">{o.persona}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-ink-300">
                <span>{filtered.length} records</span>
                <span className="flex items-center gap-2">
                    <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border border-ink-600 px-2 py-1 disabled:opacity-40">Previous</button>
                    Page {page} of {pages}
                    <button type="button" disabled={page >= pages} onClick={() => setPage(page + 1)} className="rounded border border-ink-600 px-2 py-1 disabled:opacity-40">Next</button>
                </span>
            </div>
            <p className="mt-2 text-[0.65rem] text-ink-400">Tiers, ticket bands and investor types come from the country pack scoring. Opportunity leads are placed at their top-ranked town.</p>
        </Panel>
    );
}
