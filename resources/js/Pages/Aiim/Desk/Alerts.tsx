import { useState } from 'react';
import { Donut } from '@/Components/Aiim/Charts';
import { Chip, riskTone } from '@/Components/Aiim/Chips';
import { AiGuidance } from '@/Components/Aiim/EngagementKit';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { KpiTile, Tabs } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Alert { id: number; risk: string; category: string; title: string; entity: string; source: string; confidence: number; status: string; channel: string; raised: string }

interface Props extends AiimPageProps {
    alerts: Alert[];
    byRisk: Record<string, number>;
    byCategory: Record<string, number>;
    byChannel: Record<string, number>;
    mandates: number;
    watchlists: number;
}

const TABS = ['Alert Dashboard', 'Active Alerts', 'Watchlists', 'Mandate Monitoring', 'Market Monitoring', 'Alert Rules', 'Sources & Signals', 'Notification Settings', 'Audit Trail'];

export default function Alerts({ alerts, byRisk, byCategory, byChannel, mandates, watchlists }: Props) {
    const [tab, setTab] = useState(TABS[0]);
    const [risk, setRisk] = useState('');
    const total = alerts.length;
    const shown = alerts.filter((a) => !risk || a.risk === risk).filter((a) => tab !== 'Active Alerts' || a.status !== 'acknowledged');
    return (
        <AiimPage
            title="Monitoring & Alerts"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Monitoring & Alerts' }]}
            description="Real-time monitoring of your mandates, markets and watchlists with intelligent alerts."
            accent="purple"
            notice={<AiGuidance>AI continuously monitors your selected entities and markets, surfacing material changes and opportunities.</AiGuidance>}
            rail={<SelectionBox />}
        >
            <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                <KpiTile label="Active Mandates" value={mandates} />
                <KpiTile label="Active Watchlist Items" value={watchlists} />
                <KpiTile label="High Risk" value={byRisk.high ?? 0} tone="bad" />
                <KpiTile label="Medium Risk" value={byRisk.medium ?? 0} tone="warn" />
                <KpiTile label="Low Risk" value={byRisk.low ?? 0} tone="good" />
                <KpiTile label="Total Alerts" value={total} />
            </div>
            <Tabs className="mb-4" tabs={TABS.map((t) => ({ key: t, label: t }))} value={tab} onChange={setTab} />
            <div className="grid gap-4 xl:grid-cols-3">
                <SectionCard title="Alerts by Risk Level"><Donut centre={String(total)} sub="Total Alerts" data={['high', 'medium', 'low'].map((r) => ({ label: `${r[0].toUpperCase()}${r.slice(1)} Risk`, value: byRisk[r] ?? 0 }))} /></SectionCard>
                <SectionCard title="Top Alert Categories"><ul className="space-y-1.5 text-xs">{Object.entries(byCategory).sort((a, b) => b[1] - a[1]).map(([c, n]) => <li key={c} className="flex justify-between"><span>{c}</span><span>{n} ({Math.round((n / total) * 100)}%)</span></li>)}</ul></SectionCard>
                <SectionCard title="Active Alerts by Channel"><ul className="space-y-1.5 text-xs">{Object.entries(byChannel).map(([c, n]) => <li key={c} className="flex justify-between capitalize"><span>{c.replace('-', ' ')}</span><span>{n} ({Math.round((n / total) * 100)}%)</span></li>)}</ul><ButtonLink href="/aiim/workspace/watchlist" size="sm" variant="outline" className="mt-3 w-full">Manage Watchlists</ButtonLink></SectionCard>
            </div>
            <SectionCard title="Latest Alerts" className="mt-4" action={<select aria-label="Filter by risk" value={risk} onChange={(e) => setRisk(e.target.value)} className="h-8 rounded border border-parchment-500 px-2 text-xs"><option value="">All risks</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[48rem] text-xs"><thead className="text-ink-500"><tr>{['Date / Time', 'Risk', 'Category', 'Title', 'Entity / Mandate', 'Source', 'Confidence', 'Status'].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-parchment-300">{shown.map((a) => <tr key={a.id}><td className="px-2 py-1.5">{a.raised}</td><td className="px-2"><Chip tone={riskTone(a.risk)} className="uppercase">{a.risk}</Chip></td><td className="px-2">{a.category}</td><td className="px-2 font-medium">{a.title}</td><td className="px-2">{a.entity}</td><td className="px-2">{a.source}</td><td className="px-2">{a.confidence}%</td><td className="px-2"><Chip tone={a.status === 'new' ? 'good' : a.status === 'in_review' ? 'warn' : 'info'}>{a.status.replace('_', ' ')}</Chip></td></tr>)}</tbody>
                    </table>
                </div>
            </SectionCard>
        </AiimPage>
    );
}
