/* P34 Country Closure and Next Route (prototype #/c/{ISO}/closure). */
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { A, B, Card, Chip, Cols, Kpi, Kpis, pct, STable, StatusChip } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { CSteps, type JourneySprint, type JourneyState } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

interface Props { base: CountryBase; j: JourneyState; s: JourneySprint; closures: string[] }

const DESC: Record<string, string> = {
    'Standard Closure': 'Engagement complete. No further deliverables.',
    'Conditional Closure': 'Close now with outstanding items under resolver review.',
    'Pause Engagement': 'Temporarily pause. Can be reactivated later.',
    'Transfer to Another Resolver': 'Hand over to another authorised resolver.',
};

export default function Closure({ base, j, closures }: Props) {
    const { c } = base;
    const [type, setType] = useState(j.closure?.type ?? closures[0]);
    const checks: [string, string][] = [['All deliverables accepted by client', j.accepted ? 'Complete' : 'Pending'], ['Evidence pack finalised and archived', 'Pending'], ['No outstanding actions', 'Complete'], ['Financial settlement', j.paid ? 'Complete' : 'Pending'], ['Compliance & licence obligations', 'Complete'], ['Post-engagement support confirmed', 'Complete']];
    const next: [string, string, string][] = [['Expand to another country', 'Select and prepare a new market.', '/countries/explorer'], ['View corridors', 'Explore cross-border corridors and opportunities.', `/countries/corridors?from=${c.iso3}`], ['Import & Export', 'Find your next trading partner on the heat maps.', cHref(c, 'trade')], ['Engage diaspora & capital', 'Access diaspora networks and inbound capital options.', cHref(c, 'diaspora')]];
    return (
        <CountryPage base={base} pageKey="closure">
            <CountryHead base={base} pageKey="closure" title="Country Closure and Next Route" desc="Close this country engagement or continue to your next market move." />
            <CSteps c={c} active="closure" j={j} />
            <Kpis>
                <Kpi l="Engagement" v={j.engRef || j.ref} s={c.name} icon="file" />
                <Kpi l="Closure readiness" v={`${pct(checks.filter((x) => x[1] === 'Complete').length, checks.length)} %`} icon="chart" />
                <Kpi l="Commercial model" v="Service-by-service" s="Resolver: TBCA · Scope: Full" icon="shield" />
            </Kpis>
            <Cols n={2}>
                <Card title="Closure Readiness" icon="check">
                    <STable head={['Item', 'Status']} rows={checks.map((x) => [x[0], <StatusChip key="s" s={x[1]} />])} />
                </Card>
                <Card title="Close This Engagement" icon="lock">
                    <div className="space-y-2.5">
                        {closures.map((t) => (
                            <label key={t} className="flex items-start gap-2 text-[0.85rem]">
                                <input type="radio" name="cl" className="mt-1 accent-gold-600" checked={type === t} onChange={() => setType(t)} />
                                <span><b>{t}</b><br /><span className="text-[0.72rem] text-ink-400">{DESC[t]}</span></span>
                            </label>
                        ))}
                        {j.closure && <Chip t={`Closure initiated · ${j.closure.type} · ${j.closure.at}`} tone="ok" />}
                        <B v="pri" onClick={() => router.post(cHref(c, 'closure'), { action: 'initiate', type })}>Initiate Closure</B>
                    </div>
                </Card>
            </Cols>
            <Card title="Next Route Options — continue your growth journey" icon="spark" tone="gold">
                <div className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {next.map(([t, d, h]) => (
                        <Link key={t} href={h} className="rounded-[6px] border border-parchment-400 bg-white p-3 hover:border-gold-400">
                            <b className="text-[0.88rem] text-ink-900">{t}</b><div className="text-[0.82rem] text-ink-400">{d}</div>
                        </Link>
                    ))}
                </div>
            </Card>
            <div className="flex flex-wrap gap-2">
                <B onClick={() => router.post(cHref(c, 'closure'), { action: 'reset' })}>Start a new journey</B>
                <A href="/countries">Return to Countries Hub</A>
            </div>
        </CountryPage>
    );
}
