import { router } from '@inertiajs/react';
import { Boxes, CheckCircle2, Copy, Database, Layers } from 'lucide-react';
import AdminShell from '@/Components/Shop/AdminShell';
import { ActionButton, BarList, Card, Donut, FilterBar, fmtDate, Kpi, KpiGrid, pct } from '@/Components/Shop/AdminKit';
import { Progress, SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';

interface Group { id: number; group_code: string; title: string; content_type: string; duplicates: number; canonical_code: string; match_score: number; vehicle: string; act: string; status: string; members: string[] | null; updated_at: string }
interface Props {
    rows: Group[];
    kpis: { sources: number; masters: number; groups: number; in_duplicates: number; consolidated: number };
    statusCounts: Record<string, number>;
    typeCounts: Record<string, number>;
    filters: { tab: string; status: string | null; q: string | null };
}

const NEXT: Record<string, { status: string; label: string; tone: 'good' | 'bad' | 'neutral' }[]> = {
    pending_review: [{ status: 'pending_validation', label: 'Approve merge', tone: 'good' }, { status: 'rejected', label: 'Reject', tone: 'bad' }],
    pending_validation: [{ status: 'consolidated', label: 'Validate & consolidate', tone: 'good' }, { status: 'pending_review', label: 'Back to review', tone: 'neutral' }],
    consolidated: [{ status: 'pending_review', label: 'Reopen', tone: 'neutral' }],
    rejected: [{ status: 'pending_review', label: 'Reopen', tone: 'neutral' }],
};

export default function Duplication({ rows, kpis, statusCounts, typeCounts, filters }: Props) {
    const setTab = (tab: string) => router.get('/admin/shop/duplication', { ...filters, tab }, { preserveState: true, preserveScroll: true });
    return (
        <AdminShell title="Content Duplication and Rationalisation" description="Detect, consolidate and retire duplicate or near-duplicate products, names, descriptions and media. Enforce canonical naming and content standards.">
            <KpiGrid cols={5}>
                <Kpi icon={<Database className="size-5" />} label="Total Source Records" value={kpis.sources} caption="100% of Catalogue" tone="info" />
                <Kpi icon={<Boxes className="size-5" />} label="Canonical Product Masters" value={kpis.masters} caption={pct(kpis.masters, kpis.sources) + ' of Catalogue'} tone="good" />
                <Kpi icon={<Copy className="size-5" />} label="Duplicate / Near-Duplicate Groups" value={kpis.groups} caption="Groups Identified" tone="warn" />
                <Kpi icon={<Layers className="size-5" />} label="Source Records in Duplicates" value={kpis.in_duplicates} caption={pct(kpis.in_duplicates, kpis.sources)} tone="bad" />
                <Kpi icon={<CheckCircle2 className="size-5" />} label="Consolidated (This Period)" value={kpis.consolidated} caption="Groups Consolidated" tone="good" />
            </KpiGrid>

            <FilterBar
                path="/admin/shop/duplication"
                filters={filters}
                selects={[{ name: 'status', label: 'Status', options: [{ value: 'pending_review', label: 'Pending Review' }, { value: 'pending_validation', label: 'Pending Validation' }, { value: 'consolidated', label: 'Consolidated' }, { value: 'rejected', label: 'Rejected' }] }]}
            />

            <div className="grid gap-4 xl:grid-cols-12">
                <div className="space-y-3 xl:col-span-9">
                    <Tabs value={filters.tab} onChange={setTab} tabs={[{ key: 'groups', label: 'Duplicate Groups' }, { key: 'name', label: 'Name Duplicates' }, { key: 'description', label: 'Description Duplicates' }, { key: 'media', label: 'Media Duplicates' }]} />
                    <SimpleTable
                        columns={['Group ID', 'Duplicate Group Title (Proposed Canonical Name)', 'Content Type', 'Duplicates', 'Canonical Master', 'Best Match', 'Primary Vehicle', 'Primary Act', 'Status', 'Last Action', 'Actions']}
                        rows={rows.map((g) => [
                            <span key="c" className="font-mono text-xs">{g.group_code}</span>,
                            <span key="t" title={(g.members ?? []).join('\n')}>{g.title}</span>,
                            g.content_type, g.duplicates, <span key="m" className="font-mono text-xs">{g.canonical_code}</span>, `${g.match_score}%`, g.vehicle, g.act,
                            <StatusPill key="s" status={g.status} />,
                            <span key="u" className="text-xs">{fmtDate(g.updated_at)}</span>,
                            <div key="a" className="flex flex-wrap gap-1">
                                {(NEXT[g.status] ?? []).map((n) => <ActionButton key={n.status} href={`/admin/shop/duplication/${g.id}/status`} data={{ status: n.status }} tone={n.tone}>{n.label}</ActionButton>)}
                            </div>,
                        ])}
                        empty="No groups in this view."
                    />
                </div>
                <div className="space-y-4 xl:col-span-3">
                    <Donut title="Duplication Overview" segments={Object.entries(typeCounts).map(([label, value]) => ({ label, value }))} caption="Duplicate Records" />
                    <Card title="Consolidation Progress">
                        <p className="mb-1 text-xs">{kpis.consolidated} of {kpis.groups} groups consolidated</p>
                        <Progress value={(100 * kpis.consolidated) / Math.max(1, kpis.groups)} tone="good" />
                    </Card>
                    <Card title="Duplicate Health"><BarList rows={Object.entries(statusCounts).map(([k, v]) => ({ label: k.replace('_', ' '), value: v }))} /></Card>
                    <Card title="Governance & Standards">
                        <ul className="space-y-1 text-xs">
                            {['Canonical Naming Rules - Active', 'Buyer-Segment Default Name Prohibited - Enforced', 'Language Parity Required - Enforced', 'Vehicle & Act Resolved - Enforced', 'ProductVersion Checked - Enforced'].map((t) => <li key={t}>✓ {t}</li>)}
                        </ul>
                    </Card>
                </div>
            </div>
        </AdminShell>
    );
}

Duplication.layout = null;
