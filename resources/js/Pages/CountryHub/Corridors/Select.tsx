/* P36 Corridor Selector (prototype pages-corridors.js #/corridors/select). */
import { Link, router } from '@inertiajs/react';
import { A, Card, Chip, DataTable, Flag, Note, TagM, inputCls, useMoney, type Col } from '@/Components/Industries/Kit';
import { CorrChip, CorrPage, corUrl, PTitle, type Endpoint } from '@/Components/CountryHub/Corridors';
import type { CountryOption } from '@/types/countryHub';

interface Row { a: string; b: string; aIso2: string; bIso2: string; to: string; type: string; st: string; items: number; conf: number; sellable: boolean; est: number; days: string }
interface Props { countries: CountryOption[]; from: Endpoint; to: Endpoint | null; rows: Row[] }

const fl = (iso2: string) => (/^[A-Z]{2}$/.test(iso2) ? String.fromCodePoint(...[...iso2].map((ch) => 127397 + ch.charCodeAt(0))) : '');

export default function Select({ countries, from, to, rows }: Props) {
    const money = useMoney();
    const go = (f: string, t: string) => router.visit(`/countries/corridors/select?from=${f}${t ? `&to=${t}` : ''}`);
    const cols: Col<Row>[] = [
        { k: 'to', l: 'Corridor', r: (x) => <span className="whitespace-nowrap"><Flag iso2={x.aIso2} /> → <Flag iso2={x.bIso2} /> <Link className="text-controlled-700 hover:underline" href={corUrl('detail', x.a, x.b)}>{x.to}</Link></span> },
        { k: 'type', l: 'Type' },
        { k: 'st', l: 'Evidence status', r: (x) => <><CorrChip s={x.st} /><div className="text-[0.7rem] text-ink-400">{x.items} items</div></> },
        { k: 'conf', l: 'Confidence', num: true, r: (x) => `${x.conf} %` },
        { k: 'c', l: 'Commercial availability', v: (x) => (x.sellable ? 'Sellable · service-by-service' : 'Pair evidence required'), r: (x) => (x.sellable ? <Chip t="Sellable · service-by-service" tone="ok" /> : <Chip t="Pair evidence required" tone="warn" />) },
        { k: 'est', l: 'Est. activation cost (model basis)', num: true, r: (x) => money(x.est) },
        { k: 'days', l: 'Time to activate (est.)', r: (x) => `${x.days} days` },
        { k: 'x', l: '', v: () => '', r: (x) => <A sm href={corUrl('detail', x.a, x.b)}>View Corridor ›</A> },
    ];
    return (
        <CorrPage crumbs={[['Corridor Selector']]}>
            <PTitle title="Corridor Selector" desc="Select two countries to explore cross-border corridors with evidence status, confidence level and activation readiness." />
            <Card>
                <div className="flex flex-wrap items-end gap-3">
                    <label className="flex min-w-[220px] flex-col gap-1 text-[0.78rem] font-semibold text-ink-600">1. From (Departure)
                        <select className={inputCls} value={from.iso3} onChange={(e) => go(e.target.value, to?.iso3 ?? '')}>
                            {countries.map((x) => <option key={x.iso3} value={x.iso3}>{fl(x.iso2)} {x.name}</option>)}
                        </select>
                    </label>
                    <span className="pb-1 text-[1.5rem]" aria-hidden="true">→</span>
                    <label className="flex min-w-[220px] flex-col gap-1 text-[0.78rem] font-semibold text-ink-600">2. To (Arrival)
                        <select className={inputCls} value={to?.iso3 ?? ''} onChange={(e) => go(from.iso3, e.target.value)}>
                            <option value="">All arrival countries</option>
                            {countries.map((x) => <option key={x.iso3} value={x.iso3}>{fl(x.iso2)} {x.name}</option>)}
                        </select>
                    </label>
                    <Note className="min-w-[200px] flex-1">Each corridor shows verified evidence, Resolver readiness and commercial availability.</Note>
                </div>
            </Card>
            <Card title={`Available corridors (${from.name} → ${to ? to.name : 'all'}) — ${rows.length} found`} icon="swap"
                sub={<><TagM /> evidence status derived from REC membership, SACU and Botswana gateways</>}>
                <DataTable key={`${from.iso3}-${to?.iso3 ?? ''}`} cols={cols} rows={rows} sort={3} dir={-1} size={15} filters={['type', 'st']} name={`corridors_${from.iso3}`} />
            </Card>
        </CorrPage>
    );
}
