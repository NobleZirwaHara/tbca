import { ArrowRight, ArrowUpRight, Bell, Download, Lock, Minus, Scale } from 'lucide-react';
import { useState } from 'react';
import { RailLink } from '@/Components/Aiim/Actions';
import { Gauge, TrendLine } from '@/Components/Aiim/Charts';
import { Chip, riskTone } from '@/Components/Aiim/Chips';
import AiimPage, { DeeperBox, RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Tabs } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    risk: {
        score: number; label: string; outlook: string; confidence: string; asAt: string;
        categories: [string, string, number, string, number][];
        outlookRows: [string, string][];
        trend: [string, number][];
        top: string[];
        sectorRisk: [string, string, number][];
        signals: [string, string, string][];
        scenarios: [string, string][];
        mitigation: string[];
        sources: string;
    };
}

const TABS = ['Risk Overview', 'Sector Risk', 'Regional Comparison', 'Early Warning Signals', 'Scenario Outlook', 'Mitigation Factors', 'Methodology & Sources'];

export default function Risk({ risk }: Props) {
    const [tab, setTab] = useState(TABS[0]);
    const trendIcon = (t: string) => (t === 'improving' ? <ArrowUpRight className="size-4 text-verified-500" /> : <Minus className="size-4 text-ink-400" />);

    return (
        <AiimPage
            title="Risk and Outlook"
            crumbs={[{ label: 'South Africa', href: '/aiim/country/south-africa' }, { label: 'Risk & Outlook' }]}
            subtitle="Country and sector risk landscape, outlook and early signals."
            description="Understand key risks, opportunities and future outlook to inform better investment decisions."
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Quick Actions">
                        <RailLink href="/aiim/workspace/watchlist" icon={<Bell className="size-4" />} label="Add to Watchlist" sub="Track this view" />
                        <RailLink href="/aiim/store/SA-RISK-Q2" icon={<Download className="size-4" />} label="Export Risk Summary" sub="CSV / PDF" />
                        <RailLink href="/aiim/workspace/compare" icon={<Scale className="size-4" />} label="Compare Scenarios" sub="Add up to 3 scenarios" />
                        <RailLink href="/aiim/workspace/alerts" icon={<Bell className="size-4" />} label="Create Alert" sub="Set risk threshold alerts" />
                    </RailBox>
                    <DeeperBox text="Unlock detailed risk models, scenario analyses, early warning alerts and expert support." />
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-3">
                <SectionCard dark title="Overall Country Risk Snapshot: South Africa">
                    <div className="flex flex-wrap items-center gap-4">
                        <Gauge value={risk.score} label={risk.label} invert />
                        <div className="text-sm">
                            <p className="text-xs text-ink-400">Outlook (12 Months)</p>
                            <p className="flex items-center gap-1 text-2xl font-bold">{risk.outlook}<ArrowUpRight className="size-5 text-verified-500" /></p>
                            <p className="mt-2 text-xs text-verified-500">Confidence: {risk.confidence}</p>
                            <p className="text-xs text-ink-400">As at: {risk.asAt}</p>
                        </div>
                    </div>
                </SectionCard>
                <SectionCard dark title="Risk Heat Map (Key Categories)">
                    <ul className="space-y-1.5 text-xs">{risk.categories.map(([c, l]) => <li key={c} className="flex justify-between"><span>{c}</span><Chip tone={riskTone(l)}>{l}</Chip></li>)}</ul>
                </SectionCard>
                <SectionCard dark title="Outlook Summary">
                    <ul className="space-y-2 text-sm">{risk.outlookRows.map(([k, v]) => <li key={k} className="flex justify-between"><span className="text-ink-300">{k}</span><span className="font-semibold">{v}</span></li>)}</ul>
                    <p className="mt-3 text-[0.65rem] text-ink-400">Sources: {risk.sources} · As at {risk.asAt}</p>
                </SectionCard>
            </div>

            <Tabs className="mt-5" tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />
            <div className="mt-4">
                {tab === 'Risk Overview' && (
                    <div className="grid gap-4 lg:grid-cols-3">
                        <SectionCard title="Risk by Category (Detailed)">
                            <table className="w-full text-xs">
                                <thead className="text-ink-500"><tr><th className="py-1 text-left">Category</th><th>Level</th><th>Score</th><th>Trend</th><th>vs LY</th></tr></thead>
                                <tbody>{risk.categories.map(([c, l, s, t, d]) => <tr key={c} className="border-t border-parchment-300"><td className="py-1.5">{c}</td><td className="text-center"><Chip tone={riskTone(l)}>{l}</Chip></td><td className="text-center">{s}</td><td><span className="flex justify-center">{trendIcon(t)}</span></td><td className={`text-center ${d > 0 ? 'text-verified-700' : d < 0 ? 'text-risk-500' : ''}`}>{d > 0 ? `+${d}` : d}</td></tr>)}</tbody>
                            </table>
                        </SectionCard>
                        <SectionCard title="Risk Trend (Overall Score)"><TrendLine data={risk.trend} /><p className="text-[0.65rem] text-ink-500">Trend key: ↗ Improving · ↔ Stable · ↘ Deteriorating</p></SectionCard>
                        <SectionCard title="Top Risks to Monitor">
                            <ol className="space-y-2 text-sm">{risk.top.map((t, i) => <li key={t} className="flex gap-2"><span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span>{t}</li>)}</ol>
                            <ButtonLink href="/aiim/store/SA-RISK-Q2" size="sm" variant="outline" className="mt-4 w-full" icon="lock">View Full Risk Report</ButtonLink>
                        </SectionCard>
                    </div>
                )}
                {tab === 'Sector Risk' && <SectionCard title="Sector Risk"><ul className="space-y-2 text-sm">{risk.sectorRisk.map(([s, l, n]) => <li key={s} className="flex items-center justify-between gap-3"><span className="flex-1">{s}</span><Chip tone={riskTone(l)}>{l}</Chip><span className="w-10 text-right font-semibold">{n}</span></li>)}</ul></SectionCard>}
                {tab === 'Regional Comparison' && <SectionCard title="Regional Comparison"><p className="text-sm text-ink-600">South Africa is the only active Phase 1 country pack. Regional risk comparisons will be published as additional country packs pass the activation gate.</p></SectionCard>}
                {tab === 'Early Warning Signals' && <SectionCard title="Early Warning Signals"><ul className="space-y-2 text-sm">{risk.signals.map(([s, c, st]) => <li key={s} className="flex items-center justify-between gap-2"><span className="flex-1">{s}</span><Chip tone="dark">{c}</Chip><Chip tone={st === 'Improving' ? 'good' : st === 'Elevated' ? 'bad' : 'warn'}>{st}</Chip></li>)}</ul></SectionCard>}
                {tab === 'Scenario Outlook' && <div className="grid gap-4 md:grid-cols-3">{risk.scenarios.map(([t, d]) => <SectionCard key={t} title={t}><p className="text-sm text-ink-600">{d}</p></SectionCard>)}</div>}
                {tab === 'Mitigation Factors' && <SectionCard title="Mitigation Factors"><ul className="space-y-2 text-sm">{risk.mitigation.map((m) => <li key={m} className="flex gap-2"><ArrowRight className="size-4 text-gold-600" />{m}</li>)}</ul></SectionCard>}
                {tab === 'Methodology & Sources' && (
                    <SectionCard title="Methodology & Sources">
                        <p className="text-sm text-ink-600">Scores combine Tier 1–2 official and institutional sources ({risk.sources}) weighted by recency and confidence. Every score is human-reviewed before publication.</p>
                        <ButtonLink href="/aiim/methodology" size="sm" variant="outline" className="mt-3">Read the AIIM methodology</ButtonLink>
                        <p className="mt-3 flex items-center gap-1 text-xs text-ink-400"><Lock className="size-3" />Full risk models are a premium product.</p>
                    </SectionCard>
                )}
            </div>
        </AiimPage>
    );
}
