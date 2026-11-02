import AiimPage from '@/Components/Aiim/Shell';
import { ServiceRail, SheetTable, type Cell, type Sheet, type SvcRail } from '@/Components/Aiim/ProtoDesk';
import { Card, Chip, StatusChip, STable } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface FeedAlert { id: number; risk: string; category: string; title: string; entity: string; status: string; channel: string; raised: string }
interface Props extends AiimPageProps { changes: Record<string, Cell>[]; freshness: Sheet; gaps: Sheet; rail: SvcRail; feed: FeedAlert[] }

/** AIIM mock 75: Monitoring Alerts (prototype #alerts): BW_RegChange, BW_Freshness and BW_DataGaps. */
export default function Alerts({ changes, freshness, gaps, rail, feed }: Props) {
    return (
        <AiimPage
            title="Monitoring Alerts"
            crumbs={[{ label: 'Monitoring Alerts' }]}
            subtitle="Page 75 · Live alert feed for Botswana"
            notice={false}
            rail={<ServiceRail rail={rail} />}
        >
            <div className="grid gap-4">
                <Card title="Regulatory and policy alerts">
                    <ul className="divide-y divide-parchment-300">
                        {changes.map((r) => (
                            <li key={String(r.ID)} className="flex flex-wrap items-start justify-between gap-3 py-2.5">
                                <div className="min-w-0 flex-1">
                                    <p className="text-[0.86rem] font-semibold text-ink-900">{r.Change}</p>
                                    <p className="mt-0.5 flex flex-wrap gap-x-3 text-[0.72rem] text-ink-400">
                                        <span className="font-mono">{r.ID}</span><span>{r.Instrument}</span><span>{r.Sector}</span><span>impact {r.Impact}</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <StatusChip s={r.Status} />
                                    <p className="mt-1 text-[0.7rem] text-ink-400">{r['Templates affected']} templates</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Freshness rules"><SheetTable s={freshness} bare /></Card>
                <Card title="Open data gaps"><SheetTable s={gaps} bare /></Card>
                {feed.length > 0 && (
                    <Card title="Your alerts">
                        <STable compact head={['Raised', 'Alert', 'Entity', 'Category', 'Risk', 'Channel', 'Status']} rows={feed.map((a) => [a.raised, a.title, a.entity, a.category, <Chip key="r" t={a.risk} tone={a.risk === 'high' ? 'bad' : a.risk === 'medium' ? 'warn' : 'grey'} />, a.channel, <StatusChip key="s" s={a.status} />])} />
                    </Card>
                )}
            </div>
        </AiimPage>
    );
}
