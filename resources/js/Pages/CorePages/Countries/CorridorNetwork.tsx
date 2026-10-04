import { Head, Link, router } from '@inertiajs/react';
import { ArrowRight, CalendarDays, Coins, Download, Info, Network, RotateCcw, Search, ShieldCheck, Sparkles, Waypoints } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { CountryFrame, SideBox } from '@/Components/CorePages/CountryParts';
import { BarRow, Donut, Flag } from '@/Components/CorePages/Kit';
import { Modal } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';

interface Route { to: string; region: string; evidence: string; confidence: string; x: number; y: number }
interface Props {
    network: {
        kpis: { sellable: number; theoretical: number; with_evidence: number; high_confidence: number; activation_cost: string };
        confidence: { label: string; count: number; pct: number; tone: string }[];
        regions: { label: string; count: number; pct: number }[];
        heatmap: Record<string, (string | null)[]>;
        routes: Route[];
        popular: { to: string; iso: string; status: string; ledger: boolean }[];
    };
    filters: { q: string; arrival: string; evidence: string; confidence: string };
}

const routeColor: Record<string, string> = { 'High Confidence': 'var(--color-verified-500)', 'Evidence Available': 'var(--color-controlled-500)', 'Limited Evidence': 'var(--color-attested-500)', 'No Evidence': 'var(--color-ink-300)' };
const toneColor: Record<string, string> = { good: 'var(--color-verified-500)', info: 'var(--color-controlled-500)', warn: 'var(--color-attested-500)', neutral: 'var(--color-ink-200)' };
const heat: Record<string, string> = { high: 'bg-verified-500/40', medium: 'bg-controlled-500/30', low: 'bg-attested-500/40', none: 'bg-parchment-300' };
const ORIGIN = { x: 54, y: 78 };

export default function CorridorNetwork({ network: n, filters }: Props) {
    const [q, setQ] = useState(filters.q);
    const [routes, setRoutes] = useState(true);
    const [nodes, setNodes] = useState(true);
    const [how, setHow] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const go = (next: Partial<Props['filters']>) => router.get('/find-the-right-service/corridors', { ...filters, ...next }, { preserveState: true, preserveScroll: true, replace: true });
    const search = (e: FormEvent) => {
        e.preventDefault();
        go({ q });
    };
    const csv = `data:text/csv;charset=utf-8,${encodeURIComponent(['From,To,Region,Evidence,Confidence', ...n.routes.map((r) => `South Africa,${r.to},${r.region},${r.evidence},${r.confidence}`)].join('\n'))}`;

    const map = (
        <svg viewBox="0 0 100 100" className="h-full w-full" role="img" aria-label="Corridor routes from South Africa">
            <rect width="100" height="100" fill="var(--color-parchment-100)" />
            {[[8, 15, 30, 30], [40, 12, 22, 22], [44, 38, 20, 45], [62, 18, 30, 40], [22, 50, 15, 30], [80, 70, 14, 12]].map(([x, y, w, h], i) => <ellipse key={i} cx={x + w / 2} cy={y + h / 2} rx={w / 2} ry={h / 2} fill="var(--color-parchment-400)" opacity={0.6} />)}
            {routes && n.routes.map((r) => <path key={r.to} d={`M${ORIGIN.x},${ORIGIN.y} Q${(ORIGIN.x + r.x) / 2},${Math.min(ORIGIN.y, r.y) - 12} ${r.x},${r.y}`} fill="none" stroke={routeColor[r.confidence]} strokeWidth={0.6} opacity={0.9} />)}
            {nodes && n.routes.map((r) => <g key={`n${r.to}`}><circle cx={r.x} cy={r.y} r={1.2} fill={routeColor[r.confidence]} /><text x={r.x + 1.5} y={r.y - 1} fontSize={2.6} fill="var(--color-ink-700)">{r.to}</text></g>)}
            <circle cx={ORIGIN.x} cy={ORIGIN.y} r={1.8} fill="var(--color-verified-500)" />
            <text x={ORIGIN.x + 2} y={ORIGIN.y + 1} fontSize={3} fontWeight="bold" fill="var(--color-verified-700)">South Africa</text>
        </svg>
    );

    return (
        <div>
            <Head title="Corridor Network" />
            <CountryFrame
                crumbs={[{ label: 'Countries', href: '/find-the-right-service/countries' }, { label: 'Corridors' }, { label: 'Corridor Network' }]}
                title="Corridor Network"
                lead="Global corridor truth across all country pairs."
                actions={
                    <>
                        <button type="button" onClick={() => setHow(true)} className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-300 px-3 text-[0.8125rem]"><Info className="size-4" aria-hidden="true" />How Corridor Network Works</button>
                        <a href={csv} download="corridor-network.csv" className="inline-flex h-9 items-center gap-1.5 rounded-[4px] border border-ink-300 px-3 text-[0.8125rem]"><Download className="size-4" aria-hidden="true" />Export Network Data</a>
                    </>
                }
                aside={
                    <>
                        <SideBox title={<span className="flex items-center gap-2"><ShieldCheck className="size-5 text-verified-500" aria-hidden="true" />Network Truth</span>}>
                            <div className="rounded-[6px] bg-verified-50 p-3"><p className="text-[0.75rem]">Current Sellable</p><p className="text-[1.75rem] font-bold">{n.kpis.sellable}</p><p className="text-[0.6875rem] text-verified-700">No corridor is currently sellable.</p></div>
                            <div className="mt-2 rounded-[6px] border border-parchment-400 p-3"><p className="text-[0.75rem]">Raw Theoretical Maximum</p><p className="text-[1.75rem] font-bold">{n.kpis.theoretical.toLocaleString()}</p><p className="text-[0.6875rem] text-ink-500">All possible directional pairs.</p></div>
                            <p className="mt-3 text-[0.75rem] font-semibold">Our Commitment</p>
                            <p className="text-[0.75rem] text-ink-600">No price. No promise. Only verified corridors when governance and evidence are complete.</p>
                        </SideBox>
                        <SideBox title="Popular Corridor Searches">
                            <ul className="space-y-2 text-[0.75rem]">
                                {n.popular.map((p) => (
                                    <li key={p.to} className="flex items-center justify-between gap-2">
                                        {p.ledger ? <Link href="/find-the-right-service/corridors/za-ae/ledger-s" className="hover:text-gold-700"><Flag iso="ZA" /> South Africa → <Flag iso={p.iso} /> {p.to}</Link> : <span><Flag iso="ZA" /> South Africa → <Flag iso={p.iso} /> {p.to}</span>}
                                        <span className={cn('rounded-[3px] px-1.5 text-[0.625rem]', p.status === 'Evidence Available' ? 'bg-controlled-50 text-controlled-700' : 'bg-attested-50 text-attested-700')}>{p.status}</span>
                                    </li>
                                ))}
                            </ul>
                        </SideBox>
                        <SideBox title="Need Guidance?"><p className="text-[0.75rem] text-ink-600">Speak to a TBCA Client Success Advisor about a specific corridor or activation readiness.</p><Link href="/discovery-call" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-ink-300 text-[0.8125rem]"><CalendarDays className="size-4" aria-hidden="true" />Book Discovery Call</Link></SideBox>
                    </>
                }
            >
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[[Waypoints, 'Current Sellable Corridors', n.kpis.sellable, 'Across activated corridors', 'Controlled'], [Sparkles, 'Raw Theoretical Maximum', n.kpis.theoretical.toLocaleString(), 'Directional corridor pairs (54 × 53)', 'Raw Theoretical'], [Network, 'Corridor Pairs with Evidence', n.kpis.with_evidence, 'Pairs with ≥1 verified evidence item', 'Evidence Available'], [ShieldCheck, 'High Confidence Corridors', n.kpis.high_confidence, 'Ready to progress', 'High Confidence'], [Coins, 'Estimated Activation Cost', n.kpis.activation_cost, 'For first active corridor', 'Model Basis']].map(([I, l, v, s, t]) => {
                        const Ico = I as typeof Network;
                        return <div key={l as string} className="rounded-[8px] border border-parchment-400 p-3"><Ico className="size-6 text-gold-600" aria-hidden="true" /><p className="mt-1 text-[0.75rem] font-semibold text-ink-700">{l as string}</p><p className="text-[1.5rem] font-bold text-ink-900">{v as string}</p><p className="text-[0.6875rem] text-ink-500">{s as string}</p><span className="mt-1 inline-block rounded-[3px] bg-parchment-200 px-1.5 text-[0.625rem]">{t as string}</span></div>;
                    })}
                </div>
                <form onSubmit={search} className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-6">
                    <div className="relative lg:col-span-2"><label htmlFor="cn-q" className="sr-only">Search corridors</label><input id="cn-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search countries, regions or corridors..." className="h-9 w-full rounded-[4px] border border-parchment-500 pr-8 pl-2 text-[0.8125rem]" /><button type="submit" aria-label="Search" className="absolute top-2.5 right-2"><Search className="size-4" /></button></div>
                    <label className="text-[0.6875rem]">Departure Region<select disabled className="h-9 w-full rounded-[4px] border border-parchment-500 text-[0.8125rem]"><option>Africa (South Africa)</option></select></label>
                    <label className="text-[0.6875rem]">Arrival Region<select value={filters.arrival} onChange={(e) => go({ arrival: e.target.value })} className="h-9 w-full rounded-[4px] border border-parchment-500 text-[0.8125rem]"><option value="">All</option>{n.regions.map((r) => <option key={r.label}>{r.label}</option>)}</select></label>
                    <label className="text-[0.6875rem]">Evidence Status<select value={filters.evidence} onChange={(e) => go({ evidence: e.target.value })} className="h-9 w-full rounded-[4px] border border-parchment-500 text-[0.8125rem]"><option value="">All</option>{n.confidence.map((c) => <option key={c.label}>{c.label}</option>)}</select></label>
                    <button type="button" onClick={() => { setQ(''); go({ q: '', arrival: '', evidence: '', confidence: '' }); }} className="mt-4 inline-flex h-9 items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-[0.8125rem] text-gold-700"><RotateCcw className="size-4" aria-hidden="true" />Reset Filters</button>
                </form>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <section className="rounded-[8px] border border-parchment-400 p-3 lg:col-span-2">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Global Corridor Map (Evidence Status)</h2>
                        <div className="mt-2 grid gap-3 md:grid-cols-[10rem_1fr]">
                            <div className="space-y-1.5 text-[0.75rem]">
                                {n.confidence.map((c) => <p key={c.label} className="flex items-center gap-2"><span className="size-2.5 rounded-full" style={{ background: toneColor[c.tone] }} />{c.label} ({c.count.toLocaleString()})</p>)}
                                <p className="pt-2 font-semibold">Display</p>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={routes} onChange={(e) => setRoutes(e.target.checked)} className="accent-gold-600" />Show Routes</label>
                                <label className="flex items-center gap-2"><input type="checkbox" checked={nodes} onChange={(e) => setNodes(e.target.checked)} className="accent-gold-600" />Show Nodes</label>
                            </div>
                            <div className="relative aspect-[16/10] overflow-hidden rounded-[6px] border border-parchment-300">
                                {map}
                                <button type="button" onClick={() => setExpanded(true)} className="absolute right-2 bottom-2 rounded-[4px] border border-parchment-500 bg-white px-2 py-1 text-[0.6875rem]">Expand Map</button>
                            </div>
                        </div>
                        {n.routes.length === 0 && <p className="mt-2 text-center text-[0.75rem] text-ink-500">No routes match these filters.</p>}
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 p-3">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Network Overview</h2>
                        <dl className="mt-2 space-y-1.5 text-[0.75rem]">
                            {[['Total Countries', '54'], ['Total Regions', '7'], ['Directional Pairs (54 × 53)', '2,862'], ['Pairs with Evidence', '186 (6.5%)'], ['High Confidence', '12 (0.4%)'], ['Current Sellable', '0 (0.0%)'], ['Evidence Coverage', '6.5%'], ['Governance Status', 'Controlled']].map(([k, v]) => <div key={k} className="flex justify-between"><dt>{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                        </dl>
                        <p className="mt-3 rounded-[6px] bg-controlled-50 p-2 text-[0.6875rem] text-controlled-700">Corridor routes are not commitments. They represent potential pairs subject to evidence and Resolver readiness.</p>
                    </section>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                    <section className="rounded-[8px] border border-parchment-400 p-3">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Network by Confidence Level</h2>
                        <div className="mt-2 flex flex-wrap items-center gap-4">
                            <Donut segments={n.confidence.map((c) => ({ value: c.count, color: toneColor[c.tone], label: c.label }))} center="2,862" sub="Total Pairs" />
                            <ul className="space-y-1 text-[0.75rem]">{n.confidence.map((c) => <li key={c.label} className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: toneColor[c.tone] }} />{c.label} <strong>{c.count.toLocaleString()} ({c.pct}%)</strong></li>)}</ul>
                        </div>
                    </section>
                    <section className="space-y-2 rounded-[8px] border border-parchment-400 p-3">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Network by Region</h2>
                        {n.regions.map((r, i) => <BarRow key={r.label} label={r.label} value={r.count} max={1378} suffix={` (${r.pct}%)`} color={['bg-verified-500', 'bg-controlled-500', 'bg-attested-500', 'bg-referenced-500', 'bg-gold-500'][i]} />)}
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 p-3">
                        <h2 className="text-[0.9375rem] font-bold text-ink-900">Evidence Coverage Heatmap</h2>
                        <table className="mt-2 w-full text-center text-[0.625rem]">
                            <thead><tr><th className="text-left">From \ To</th>{Object.keys(n.heatmap).map((k) => <th key={k}>{k}</th>)}</tr></thead>
                            <tbody>{Object.entries(n.heatmap).map(([from, row]) => <tr key={from}><th className="text-left font-medium">{from}</th>{row.map((v, i) => <td key={i} className="p-0.5"><span className={cn('block h-5 rounded-sm', v ? heat[v] : 'bg-white')} title={v ?? 'Same region'}>{v ? '' : '–'}</span></td>)}</tr>)}</tbody>
                        </table>
                        <p className="mt-2 flex flex-wrap gap-2 text-[0.625rem]">{[['high', 'High (≥80%)'], ['medium', 'Medium (30-79%)'], ['low', 'Low (1-29%)'], ['none', 'None (0%)']].map(([k, l]) => <span key={k} className="flex items-center gap-1"><span className={cn('size-2.5 rounded-sm', heat[k])} />{l}</span>)}</p>
                    </section>
                </div>
                <p className="mt-4 flex gap-2 rounded-[6px] bg-controlled-50 p-2 text-[0.75rem] text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" />Corridor network data is evidence-based and Resolver-controlled. No commercial availability is implied. Activation requires TBCA Board approval and regulatory readiness.</p>
                <Link href="/find-the-right-service/corridors/za-ae/ledger-s" className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">Open South Africa → UAE statutory fee view (Ledger S) <ArrowRight className="size-4" aria-hidden="true" /></Link>
            </CountryFrame>

            <Modal open={how} onClose={() => setHow(false)} title="How the Corridor Network Works">
                <ul className="list-disc space-y-2 pl-5 text-sm text-ink-700">
                    <li>Every ordered pair of 54 African country objects (and selected global partners) is a directional corridor: 54 × 53 = 2,862 pairs.</li>
                    <li>A corridor only becomes sellable when both endpoints are resolved, pair-specific evidence exists and release gates pass.</li>
                    <li>Evidence confidence is shown by colour. No price or promise is made for any corridor before activation.</li>
                </ul>
            </Modal>
            <Modal open={expanded} onClose={() => setExpanded(false)} title="Global Corridor Map" size="xl">
                <div className="aspect-[16/10]">{map}</div>
            </Modal>
        </div>
    );
}
