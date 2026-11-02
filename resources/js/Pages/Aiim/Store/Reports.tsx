import { Link } from '@inertiajs/react';
import { Hero, Panel, PillLink, ProtoFrame, SvcRail, type SvcCard } from '@/Components/Aiim/ProtoLibrary';
import { useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';
import { Stages, StatusPill } from './Delivery';
import type { ReportProps } from './Quote';

const url = (r: ReportProps) => (['draft', 'changes_requested'].includes(r.status) ? `/aiim/reports/${r.reference}/configure` : r.status === 'quoted' ? `/aiim/reports/${r.reference}/quote` : `/aiim/workspace/reports/${r.reference}`);

/** Page 38: Report Delivery, the list of your reports. */
export default function Reports({ reports, rail }: AiimPageProps & { reports: ReportProps[]; rail: SvcCard[] }) {
    const money = useMoney();
    return (
        <ProtoFrame title="Report Delivery" crumbs={[{ label: 'Workspace', href: '/aiim/workspace' }, { label: 'Report Delivery' }]}>
            <Hero eyebrow="Page 38" title="Report Delivery" actions={<PillLink href="/aiim/store">Order a report</PillLink>} />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <Panel title="Your reports">
                    {reports.length ? (
                        <ul className="grid gap-2.5">
                            {reports.map((r) => (
                                <li key={r.reference} className="flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-parchment-400 p-3">
                                    <div className="min-w-0">
                                        <Link href={url(r)} className="font-semibold text-ink-900 hover:text-gold-700">{r.title}</Link>
                                        <div className="flex flex-wrap gap-x-3 text-[0.75rem] text-ink-500"><span className="font-mono">{r.reference}</span><span>{r.typeName}</span><span>{r.created}</span><span>{money(r.total)}</span></div>
                                    </div>
                                    <StatusPill status={r.status} />
                                </li>
                            ))}
                        </ul>
                    ) : <p className="text-[0.86rem] text-ink-500">No reports yet.</p>}
                </Panel>
                <div className="grid content-start gap-4">
                    {reports[0] && <Panel title="Delivery stages" right={<span className="font-mono text-[0.72rem] text-ink-500">{reports[0].reference}</span>}><Stages r={reports[0]} /></Panel>}
                    <SvcRail title="After delivery" items={rail} />
                </div>
            </div>
        </ProtoFrame>
    );
}
