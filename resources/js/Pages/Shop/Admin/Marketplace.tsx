import { FileText, Handshake, Inbox, Users } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, Kpi, KpiGrid, fmtDate } from '@/Components/Shop/AdminKit';

interface Row { reference: string; title: string | null; status: string; next: string | null; category: string | null; budget: string | null; industry: string | null; submitted_at: string | null }

const NEXT_LABEL: Record<string, string> = { matching: 'Start matching', proposals_received: 'Proposals received', provider_selected: 'Provider selected', closed: 'Close brief' };

function MarketplaceConsole({ rows, counts, drafts }: { rows: Row[]; counts: Record<string, number>; drafts: number }) {
    return (
        <AdminShell title="Marketplace Console" description="A5 Marketplace Briefs: submitted -> matching -> proposals received -> provider selected -> closed. No brief creates an engagement or payment.">
            <KpiGrid cols={4}>
                <Kpi icon={<Inbox className="size-5" />} tone="warn" label="Submitted" value={counts.submitted ?? 0} />
                <Kpi icon={<Users className="size-5" />} tone="info" label="Matching" value={counts.matching ?? 0} />
                <Kpi icon={<Handshake className="size-5" />} tone="good" label="Proposals / Selected" value={(counts.proposals_received ?? 0) + (counts.provider_selected ?? 0)} />
                <Kpi icon={<FileText className="size-5" />} label="Open drafts" value={drafts} />
            </KpiGrid>
            <SimpleTable columns={['Brief', 'Title', 'Category', 'Industry', 'Budget', 'Submitted', 'Status', 'Actions']} rows={rows.map((r) => [
                <span key="r" className="font-mono text-xs">{r.reference}</span>, r.title ?? '-', r.category ?? '-', r.industry ?? '-', r.budget ?? '-', fmtDate(r.submitted_at),
                <StatusPill key="s" status={r.status} />,
                r.next ? <ActionButton key="a" href={`/admin/shop/marketplace/${r.reference}/advance`} tone="good">{NEXT_LABEL[r.next] ?? r.next}</ActionButton> : '-',
            ])} empty="No briefs submitted yet." />
        </AdminShell>
    );
}

MarketplaceConsole.layout = null;
export default MarketplaceConsole;
