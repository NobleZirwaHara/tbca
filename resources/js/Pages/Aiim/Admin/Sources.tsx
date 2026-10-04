import { Head, Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { Donut } from '@/Components/Aiim/Charts';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { SourceItem } from '@/types/aiim';

interface Props { sources: SourceItem[]; byCategory: Record<string, number>; models: { model: string; avg: number; count: number }[] }

export default function Sources({ sources, byCategory, models }: Props) {
    const [sel, setSel] = useState<SourceItem | null>(sources[0] ?? null);
    const verified = sources.filter((s) => s.verification === 'verified').length;
    const p = sel?.profile ?? {};
    return (
        <ConsoleLayout area="AIIM Admin Area" areaIcon={ShieldCheck} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'Source & Confidence Administration' }]} title="Source & Confidence Administration" description="Manage data sources, confidence models, verification rules and quality standards across the AIIM platform." badge={<Chip tone="good">Data Governance: Compliant</Chip>}>
            <Head title="AIIM Source & Confidence Administration" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <KpiTile label="Approved Sources" value={sources.length} />
                <KpiTile label="Source Categories" value={Object.keys(byCategory).length} />
                <KpiTile label="Confidence Models" value={models.length} />
                <KpiTile label="Verification Coverage" value={`${Math.round((verified / Math.max(1, sources.length)) * 100)}%`} tone="good" />
            </div>
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem]">
                <Panel title="Data Sources">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[48rem] text-xs">
                            <thead className="bg-parchment-200 text-ink-600"><tr>{['Source ID', 'Source Name', 'Provider / Owner', 'Category', 'Data Type', 'Coverage', 'Last Updated', 'Model', 'Confidence', 'Verification'].map((h) => <th key={h} className="px-2 py-2 text-left">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">{sources.map((s) => <tr key={s.code} onClick={() => setSel(s)} className={cn('cursor-pointer hover:bg-parchment-100', sel?.code === s.code && 'bg-gold-50')}><td className="px-2 py-1.5 font-mono text-referenced-700">{s.code}</td><td className="px-2 font-semibold">{s.name}</td><td className="px-2">{s.provider}</td><td className="px-2">{s.category}</td><td className="px-2">{s.dataType}</td><td className="px-2">{s.coverage}</td><td className="px-2">{s.updated}</td><td className="px-2">{s.model} {s.tierName}</td><td className="px-2">{s.confidence}%</td><td className="px-2"><Chip tone={levelTone(s.verification)}>{s.verification}</Chip></td></tr>)}</tbody>
                        </table>
                    </div>
                </Panel>
                {sel && (
                    <Panel title="Source Details" action={<Chip tone="good">{sel.code}</Chip>}>
                        <p className="font-semibold">{sel.name}</p><p className="text-xs text-ink-500">{sel.provider}</p>
                        <dl className="mt-2 space-y-1 text-xs">{[['Category', sel.category], ['Data Type', sel.dataType], ['Coverage', sel.coverage], ['Update Frequency', p.frequency], ['Data Format', p.format], ['Licence Type', p.licence], ['Cost to Access', zar2(p.cost ?? 0)], ['Confidence Model', `${sel.model} (Tier ${sel.tier} ${sel.tierName})`], ['Confidence Score', `${sel.confidence}% · Grade ${sel.grade.grade}`], ['Verification Status', sel.verification], ['Next Review', sel.nextReview]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right">{v ?? '—'}</dd></div>)}</dl>
                        {p.points && <p className="mt-2 text-xs">Data points: {p.points.total} total · {p.points.active} active · {p.points.flagged} flagged</p>}
                        <Link href={`/aiim/sources/${sel.code}`} className="mt-3 inline-block text-xs font-semibold text-gold-700">View public evidence page →</Link>
                        <p className="mt-2 text-[0.65rem] text-ink-400">Editing sources and confidence scores is being connected.</p>
                    </Panel>
                )}
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Panel title="Source Categories Overview"><Donut centre={String(sources.length)} sub="Total Sources" data={Object.entries(byCategory).map(([label, value]) => ({ label, value }))} /></Panel>
                <Panel title="Confidence Model Performance"><SimpleTable columns={['Model', 'Avg Confidence', 'Active Sources']} rows={models.map((m) => [m.model, `${m.avg}%`, m.count])} /></Panel>
            </div>
        </ConsoleLayout>
    );
}

Sources.layout = null;
