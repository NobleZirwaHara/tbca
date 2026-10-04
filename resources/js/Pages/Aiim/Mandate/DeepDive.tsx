import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { BarList, Columns, Gauge } from '@/Components/Aiim/Charts';
import { Chip, riskTone } from '@/Components/Aiim/Chips';
import { MandateFrame } from '@/Components/Aiim/EngagementKit';
import { SectionCard } from '@/Components/Aiim/Shell';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Data {
    sector: string; province: string; marketSize: string; cagr: string; drivers: string; outlook: string;
    forecast: [string, number][]; insights: string[]; attractiveness: [string, number][];
    opportunities: [string, string, string, string, string][]; risks: [string, string][]; sources: string;
}

const TABS = ['Executive Summary', 'Market Overview', 'Sector Analysis', 'Demand & Supply', 'Investment Landscape', 'Regulatory Environment', 'Risks & Mitigation', 'SWOT Analysis', 'Sources & Evidence'];

export default function DeepDive({ engagement: e, data: d }: AiimPageProps & { engagement: Engagement; data: Data }) {
    const [tab, setTab] = useState(TABS[0]);
    const score = Math.round(d.attractiveness.reduce((s, [, v]) => s + v, 0) / d.attractiveness.length);
    return (
        <MandateFrame
            e={e}
            title="Market and Sector Deep Dive"
            description="Comprehensive market analysis and sector intelligence for informed investment decision-making."
            guidance="This deep dive provides strategic insights, market dynamics, growth outlook and investment considerations for your selected sector and province."
            stage="Deep Dive & Analysis"
            tabs={TABS}
            tab={tab}
            onTab={setTab}
        >
            {tab === 'Executive Summary' || tab === 'Market Overview' ? (
                <>
                    <div className="grid gap-4 xl:grid-cols-[14rem_minmax(0,1fr)_minmax(0,1fr)]">
                        <SectionCard title="At a Glance"><dl className="space-y-2 text-xs">{[['Sector', d.sector], ['Province', d.province], ['Market Size (2024)', d.marketSize], ['CAGR (2024–2030)', d.cagr], ['Key Growth Drivers', d.drivers], ['Investment Outlook', d.outlook]].map(([k, v]) => <div key={k}><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}</dl></SectionCard>
                        <SectionCard title="Market Size & Growth Forecast (ZAR Billion)"><Columns data={d.forecast} highlight="2024" /><p className="mt-2 text-[0.65rem] text-ink-500">Source: {d.sources} · Confidence: High</p></SectionCard>
                        <SectionCard title="Key Market Insights"><ul className="space-y-2 text-xs">{d.insights.map((i) => <li key={i} className="flex gap-1.5"><CheckCircle2 className="size-3.5 shrink-0 text-verified-500" />{i}</li>)}</ul></SectionCard>
                    </div>
                    <div className="mt-4 grid gap-4 xl:grid-cols-3">
                        <SectionCard title="Sector Attractiveness"><Gauge dark={false} value={score} label="High Attractiveness" /><div className="mt-3"><BarList data={d.attractiveness.map(([label, value]) => ({ label, value }))} /></div></SectionCard>
                        <SectionCard title="Top Investment Opportunities"><table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="text-left">Opportunity</th><th>Type</th><th>Est. Investment</th><th>IRR Potential</th></tr></thead><tbody className="divide-y divide-parchment-300">{d.opportunities.map(([n, t, , inv, irr]) => <tr key={n}><td className="py-1.5">{n}</td><td className="text-center">{t}</td><td className="text-center">{inv}</td><td className="text-center">{irr}</td></tr>)}</tbody></table></SectionCard>
                        <SectionCard title="Risks Snapshot"><ul className="space-y-1.5 text-xs">{d.risks.map(([r, l]) => <li key={r} className="flex justify-between"><span>{r}</span><Chip tone={riskTone(l)}>{l}</Chip></li>)}</ul></SectionCard>
                    </div>
                </>
            ) : (
                <SectionCard title={tab}>
                    <p className="text-sm text-ink-600">The {tab.toLowerCase()} section of this deep dive is delivered in the full report for {d.sector} in {d.province}. Sources: {d.sources}.</p>
                </SectionCard>
            )}
        </MandateFrame>
    );
}
