import { Link } from '@inertiajs/react';
import { StatusPill, SimpleTable } from '@/Components/ui/Kit';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { DeeperBox, SelectionBox } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';
import type { ReportProps } from './Quote';

export default function Reports({ reports }: AiimPageProps & { reports: ReportProps[] }) {
    const url = (r: ReportProps) => (['draft', 'changes_requested'].includes(r.status) ? `/aiim/reports/${r.reference}/configure` : r.status === 'quoted' ? `/aiim/reports/${r.reference}/quote` : `/aiim/workspace/reports/${r.reference}`);
    return (
        <AiimPage title="My Reports" crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Reports' }]} subtitle="Configured, quoted, in-production and delivered premium reports." actions={<ButtonLink href="/aiim/store" size="sm">Order a Report</ButtonLink>} rail={<><SelectionBox /><DeeperBox /></>}>
            <SimpleTable
                columns={['Report', 'Title', 'Type', 'Total', 'Status']}
                rows={reports.map((r) => [<Link key="r" href={url(r)} className="font-mono text-gold-700 hover:underline">{r.reference}</Link>, r.title, r.typeName, zar2(r.total), <StatusPill key="s" status={r.status} />])}
                empty="No reports yet."
            />
        </AiimPage>
    );
}
