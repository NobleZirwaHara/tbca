import { ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Chip } from '../Chips';
import { Panel, Pending } from './shared';
import type { CountryActivation, CountryIntel } from './types';

export default function PackTab({ intel, countryName, activation, lang }: { intel: CountryIntel; countryName: string; activation: CountryActivation; lang: string }) {
    const pack = intel.pack;
    const [open, setOpen] = useState<string | null>(pack?.sectors[0]?.code ?? null);
    const [group, setGroup] = useState('');

    if (!pack) {
        return (
            <Pending title={`No country pack loaded for ${countryName}`}>
                <p>Pack status: {activation.packStatus ?? 'Not recorded'}{activation.packCode ? ` (${activation.packCode})` : ''}. Roll-out wave: {activation.wave ?? 'not set'}.</p>
                <p className="mt-1">A country pack adds the full geography, sector worked examples, product names in local languages, institutions and a scored opportunity sweep. Botswana (BW-1.0) is the first pack loaded.</p>
            </Pending>
        );
    }

    const groups = [...new Set(pack.products.map((p) => p.group))];
    const sectorName = (c: string) => intel.sectorCodes.find((s) => s.code === c)?.name ?? c;

    return (
        <div className="space-y-4">
            <Panel title={pack.title} action={<Chip tone="dark">Issued {pack.issued}</Chip>}>
                <dl className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                    {pack.summary.filter((s) => typeof s.value === 'number').slice(0, 12).map((s) => (
                        <div key={s.measure} className="rounded border border-ink-700 p-2"><dt className="text-ink-400">{s.measure}</dt><dd className="text-base font-bold">{Number(s.value).toLocaleString('en-US')}</dd></div>
                    ))}
                </dl>
                {pack.fxNote && <p className="mt-2 text-[0.65rem] text-ink-400">Exchange rates used in the pack: {pack.fxNote}</p>}
            </Panel>

            <Panel title="Macro facts with sources">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[44rem] text-left text-xs">
                        <thead className="text-ink-400"><tr>{['Item', 'Value', 'Source', 'Date', 'Grade'].map((h) => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-ink-800">
                            {pack.macro.map((m) => (
                                <tr key={m.id} className="align-top">
                                    <td className="py-1.5 pr-3 text-parchment-100">{m.item}</td>
                                    <td className="py-1.5 pr-3 text-ink-200">{m.value}</td>
                                    <td className="py-1.5 pr-3 text-ink-300">{m.url ? <a href={m.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gold-400">{m.source}<ExternalLink className="size-3" /></a> : m.source}</td>
                                    <td className="py-1.5 pr-3 text-ink-400">{m.date}</td>
                                    <td className="py-1.5">{m.grade}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <p className="mt-2 text-[0.65rem] text-ink-400">Grade 3: official source. Grade 2: credible secondary source. Grade 1: headline only.</p>
            </Panel>

            <Panel title={`Sector worked examples (${pack.sectors.length})`}>
                <div className="grid gap-3 lg:grid-cols-[14rem_minmax(0,1fr)]">
                    <ul className="space-y-0.5">
                        {pack.sectors.map((s) => (
                            <li key={s.code}><button type="button" onClick={() => setOpen(s.code)} className={cn('w-full rounded px-1.5 py-1 text-left text-xs hover:bg-ink-800', open === s.code && 'bg-ink-800 text-gold-400')}>{s.number}. {s.name}</button></li>
                        ))}
                    </ul>
                    {pack.sectors.filter((s) => s.code === open).map((s) => (
                        <div key={s.code} className="space-y-3 text-xs">
                            <div className="grid gap-2 sm:grid-cols-2">
                                <div className="rounded border border-ink-700 p-2"><p className="text-ink-400">Investor scenario</p><p className="text-parchment-100">{s.investor}</p></div>
                                <div className="rounded border border-ink-700 p-2"><p className="text-ink-400">Trader scenario</p><p className="text-parchment-100">{s.trader}</p></div>
                            </div>
                            <div>
                                <h4 className="mb-1 font-semibold">Graded facts</h4>
                                <ul className="space-y-2">
                                    {s.facts.map((f) => (
                                        <li key={f.id} className="rounded border border-ink-800 p-2">
                                            <p className="font-semibold text-parchment-100"><span className="mr-1 font-mono text-[0.6rem] text-gold-500">{f.id}</span>{f.fact}</p>
                                            <p className="mt-0.5 text-ink-300">{f.value}</p>
                                            <p className="mt-0.5 text-[0.65rem] text-ink-400">{f.url ? <a href={f.url} target="_blank" rel="noreferrer" className="hover:text-gold-400">{f.source}</a> : f.source} · {f.date} · grade {f.grade}</p>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            {s.mapStack.length > 0 && (
                                <div>
                                    <h4 className="mb-1 font-semibold">Map layers for this sector</h4>
                                    <table className="w-full text-left">
                                        <thead className="text-ink-400"><tr><th className="py-1 font-medium">Layer</th><th className="py-1 font-medium">Levels</th><th className="py-1 font-medium">Shape</th><th className="py-1 font-medium">Highlights</th></tr></thead>
                                        <tbody className="divide-y divide-ink-800">{s.mapStack.map((l) => <tr key={l.layer}><td className="py-1">{l.layer}</td><td className="py-1 text-ink-300">{l.levels}</td><td className="py-1 text-ink-300">{l.geometry}</td><td className="py-1 text-ink-300">{l.illumination}</td></tr>)}</tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Panel>

            <div className="grid gap-4 xl:grid-cols-2">
                <Panel title="Products, species and minerals (English and Setswana)" action={
                    <select value={group} onChange={(e) => setGroup(e.target.value)} aria-label="Product group" className="h-7 rounded border border-ink-600 bg-ink-950 px-2 text-xs text-parchment-100">
                        <option value="">All groups</option>
                        {groups.map((g) => <option key={g} value={g}>{g}</option>)}
                    </select>
                }>
                    <div className="max-h-96 overflow-y-auto">
                        <table className="w-full text-left text-xs">
                            <thead className="sticky top-0 bg-ink-900 text-ink-400"><tr>{['Product', 'Setswana', 'HS code', 'Sector', 'Note'].map((h) => <th key={h} className="py-1 pr-2 font-medium">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-ink-800">
                                {pack.products.filter((p) => !group || p.group === group).map((p) => (
                                    <tr key={`${p.group}-${p.product}`} className="align-top">
                                        <td className={cn('py-1 pr-2', lang === 'tn' ? 'text-ink-300' : 'text-parchment-100')}>{p.product}</td>
                                        <td className={cn('py-1 pr-2', lang === 'tn' ? 'text-parchment-100' : 'text-ink-300')}>{p.setswana}</td>
                                        <td className="py-1 pr-2 font-mono text-[0.65rem] text-ink-400">{p.hs}</td>
                                        <td className="py-1 pr-2 text-ink-300">{sectorName(p.sector_code)}</td>
                                        <td className="py-1 text-ink-400">{p.note}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.65rem] text-ink-400">Setswana names are still to be validated by the client.</p>
                </Panel>
                <Panel title="Institutions">
                    <div className="max-h-96 overflow-y-auto">
                        <dl className="divide-y divide-ink-800 text-xs">
                            {pack.institutions.map((i) => <div key={i.role} className="grid grid-cols-[9rem_minmax(0,1fr)] gap-2 py-1"><dt className="text-ink-400">{i.role}</dt><dd className="text-parchment-100">{i.institution}</dd></div>)}
                        </dl>
                    </div>
                </Panel>
            </div>

            <Panel title="Top 30 ranked opportunities">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[48rem] text-left text-xs">
                        <thead className="text-ink-400"><tr>{['Rank', 'Opportunity', 'Sector', 'Ticket band', 'Tier', 'Investor type', 'Time to revenue', 'Best place'].map((h) => <th key={h} className="py-1 pr-3 font-medium">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-ink-800">
                            {pack.top.map((t) => (
                                <tr key={t.code}>
                                    <td className="py-1 pr-3 text-gold-500">{t.rank}</td>
                                    <td className="py-1 pr-3">{t.title}<span className="block font-mono text-[0.6rem] text-ink-500">{t.code}{t.citizen_reserved === 'Yes' ? ' · citizen-reserved' : ''}</span></td>
                                    <td className="py-1 pr-3 text-ink-300">{sectorName(t.sector_code)}</td>
                                    <td className="py-1 pr-3 text-ink-300">{t.band}</td>
                                    <td className="py-1 pr-3"><Chip tone={t.tier.startsWith('A') ? 'good' : 'warn'}>{t.tier}</Chip></td>
                                    <td className="py-1 pr-3 text-ink-300">{t.persona}</td>
                                    <td className="py-1 pr-3 text-ink-300">{t.time_to_revenue}</td>
                                    <td className="py-1 text-ink-300">{t.best_place}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>

            <div className="grid gap-4 xl:grid-cols-2">
                <Panel title={`One-stop shop features (${pack.oneStopShop.length})`}>
                    <div className="max-h-96 overflow-y-auto">
                        <ul className="divide-y divide-ink-800 text-xs">
                            {pack.oneStopShop.map((f) => (
                                <li key={f.code} className="py-1.5">
                                    <p className="font-semibold text-parchment-100"><span className="mr-1 font-mono text-[0.6rem] text-gold-500">{f.code}</span>{f.feature}<span className="ml-2 font-normal text-ink-400">{f.gate}</span></p>
                                    <p className="text-ink-300">{f.problem}. {f.how}.</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <p className="mt-2 text-[0.65rem] text-ink-400">Proposed in the country pack; not all features are live on the platform yet.</p>
                </Panel>
                <Panel title="Country pack roll-out">
                    <ul className="space-y-2 text-xs">
                        {pack.rollout.map((r) => <li key={r.wave}><p className="font-semibold text-parchment-100">{r.wave.replace('[PROPOSED]', '(proposed)')}</p><p className="text-ink-300">{r.countries}</p><p className="text-[0.65rem] text-ink-400">{r.note}</p></li>)}
                    </ul>
                </Panel>
            </div>
            {pack.source && <p className="text-[0.65rem] text-ink-400">Source: {pack.source}.</p>}
        </div>
    );
}
