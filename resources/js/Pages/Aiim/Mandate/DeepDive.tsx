import { useState } from 'react';
import { BriefCta, Btn, Flow, PackLoading, Panel, SvcRail, eng, inputCls, type Country, type Rail, type Svc } from '@/Components/Aiim/ProtoEngagement';
import { DataTable, Kpi, Kpis } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Sector {
    code: string; name: string; slug: string; templates: number; tierA: number; facts: number; shock: number | string | null;
    chain: { n: string | number; question: string; types: string; map: string; evidence: string; institution: string }[];
}

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    sectors: Sector[];
    initial: string;
    brief: Svc | null;
    rail: Rail;
}

/** Page 54 Market and Sector Deep Dive. */
export default function DeepDive({ engagement: e, country, sectors, initial, brief, rail }: Props) {
    const [code, setCode] = useState(sectors.some((s) => s.code === initial) ? initial : sectors[0]?.code ?? '');
    const s = sectors.find((x) => x.code === code);
    return (
        <Flow title="Market and Sector Deep Dive" eyebrow="Page 54" crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }, { label: 'Sectors', href: '/aiim/sectors' }]}
            lead="Pick a sector to see everything BW-1.0 holds on it, then commission a deep dive."
            side={<>
                <BriefCta title="Commissioned sector deep dive" sub="40-section uniform sector profile with analyst review" s={brief} label="Commission" context={e.title} />
                <SvcRail rail={rail} context="Sector deep dive" />
            </>}>
            {sectors.length ? (
                <>
                    <label className="grid max-w-md gap-1.5 text-[0.82rem] font-semibold text-ink-800">Sector
                        <select className={inputCls} value={code} onChange={(ev) => setCode(ev.target.value)}>{sectors.map((x) => <option key={x.code} value={x.code}>{x.name}</option>)}</select>
                    </label>
                    {s && (
                        <>
                            <Kpis>
                                <Kpi l="Templates" v={s.templates} icon="layers" />
                                <Kpi l="Tier A" v={s.tierA} icon="star" />
                                <Kpi l="Facts" v={s.facts} icon="file" />
                                <Kpi l="Shock index" v={s.shock ?? '—'} icon="alert" />
                            </Kpis>
                            <Panel title="Investor chain answered">
                                <DataTable key={s.code} name={`investor-chain-${s.code}`} size={10} rows={s.chain} cols={[
                                    { k: 'n', l: '#', num: true }, { k: 'question', l: 'Question', clip: true }, { k: 'types', l: 'Information types', clip: true },
                                    { k: 'map', l: 'Map behaviour', clip: true }, { k: 'evidence', l: 'Evidence', clip: true }, { k: 'institution', l: 'Institution/role', clip: true },
                                ]} />
                            </Panel>
                            <div><Btn href={`/aiim/sector/${s.slug}`} v="ghost" size="sm">Open full sector page</Btn></div>
                        </>
                    )}
                </>
            ) : <PackLoading country={country} what="The sector deep dive" />}
        </Flow>
    );
}
