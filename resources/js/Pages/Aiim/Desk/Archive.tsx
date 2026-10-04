import { Archive as ArchiveIcon, CheckCircle2, Clock, ShieldCheck, Trash2 } from 'lucide-react';
import { Donut } from '@/Components/Aiim/Charts';
import { Chip } from '@/Components/Aiim/Chips';
import { AiGuidance } from '@/Components/Aiim/EngagementKit';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { KpiTile } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    items: { type: string; name: string; related: string; archived: string; retain: string; size: string; by: string; status: string }[];
    byType: Record<string, number>;
}

export default function Archive({ items, byType }: Props) {
    const pending = items.filter((i) => i.status === 'deletion_requested').length;
    return (
        <AiimPage
            title="Archive & Deletion"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Archive & Deletion' }]}
            description="Manage the long-term archive and deletion of your mandates, reports, data and workspace items in line with POPIA and retention policies."
            accent="purple"
            notice={<AiGuidance>Ensure archived data remains accessible for the retention period. Deleted data is permanently and securely removed.</AiGuidance>}
            rail={<SelectionBox />}
        >
            <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <KpiTile label="Data Retention Policy" value="7 Years" caption="From transaction close date" icon={<ShieldCheck className="size-4" />} />
                <KpiTile label="Archived Items" value={items.length} caption="Securely stored" icon={<ArchiveIcon className="size-4" />} />
                <KpiTile label="Deletion Requests" value={pending} caption="Awaiting approval" icon={<Trash2 className="size-4" />} />
                <KpiTile label="Consent Status" value="Active" caption="POPIA lawful processing" tone="good" icon={<CheckCircle2 className="size-4" />} />
            </div>
            <div className="grid gap-4 xl:grid-cols-3">
                <SectionCard title="Archive Summary"><Donut centre={String(items.length)} sub="Archived Items" data={Object.entries(byType).map(([label, value]) => ({ label, value }))} /></SectionCard>
                <SectionCard title="Data Lifecycle Overview" className="xl:col-span-2">
                    <ol className="grid grid-cols-4 gap-2 text-center text-xs">{[['Active', 'In use'], ['Archived', 'Stored securely'], ['Retention', 'Policy period'], ['Deleted', 'Permanently removed']].map(([t, s], i) => <li key={t}><span className="mx-auto flex size-10 items-center justify-center rounded-full border-2 border-referenced-500 text-referenced-700">{i + 1}</span><strong className="mt-1 block">{t}</strong>{s}</li>)}</ol>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-xs"><p className="flex items-center gap-2"><Clock className="size-4 text-referenced-500" />Next Review Date: <strong>12 June 2026</strong></p><p className="flex items-center gap-2"><ShieldCheck className="size-4 text-verified-500" />Retention Compliance: <strong>100% Compliant</strong></p></div>
                </SectionCard>
            </div>
            <SectionCard title="Recently Archived Items" className="mt-4" action={<div className="flex gap-2"><Button type="button" size="sm" variant="outline" disabled>Export Before Deletion</Button><Button type="button" size="sm" variant="outline" disabled>Request Deletion</Button></div>}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[44rem] text-xs"><thead className="text-ink-500"><tr>{['Type', 'Item Name', 'Related Mandate / ID', 'Archived On', 'Retain Until', 'Size', 'Archived By', 'Status'].map((h) => <th key={h} className="px-2 py-1 text-left">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-parchment-300">{items.map((i) => <tr key={i.name}><td className="px-2 py-1.5">{i.type}</td><td className="px-2">{i.name}</td><td className="px-2 text-referenced-700">{i.related}</td><td className="px-2">{i.archived}</td><td className="px-2">{i.retain}</td><td className="px-2">{i.size}</td><td className="px-2">{i.by}</td><td className="px-2"><Chip tone={i.status === 'archived' ? 'good' : 'warn'}>{i.status.replace('_', ' ')}</Chip></td></tr>)}</tbody>
                    </table>
                </div>
            </SectionCard>
        </AiimPage>
    );
}
