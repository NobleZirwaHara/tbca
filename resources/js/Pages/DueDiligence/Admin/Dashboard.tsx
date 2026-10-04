import { Head, Link, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import { DD_ADMIN_NAV } from '@/Components/DueDiligence/AdminNav';
import { rand, shortDate } from '@/Components/DueDiligence/Ui';

interface CaseRow { reference: string; name: string; package: string; status: string; statusLabel: string; slaDueAt: string | null; overdue: boolean; risk: string; updatedAt: string; isSample: boolean }
interface Props {
    kpis: Record<string, number>;
    byStatus: { status: string; label: string; count: number }[];
    queue: CaseRow[];
    events: { code: string; case: string | null; description: string; actor: string; at: string }[];
    quotes: { reference: string; client: string | null; package: string; status: string; total: number | null; updatedAt: string }[];
    closures: (CaseRow & { approvals: Record<string, boolean> | null })[];
}

/** Due Diligence Control Tower. */
export default function AdminDashboard({ kpis, byStatus, queue, events, quotes, closures }: Props) {
    const max = Math.max(1, ...byStatus.map((s) => s.count));
    return (
        <ConsoleLayout area="Due Diligence Control Tower" areaIcon={ShieldCheck} groups={DD_ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Due Diligence' }]} title="Control Tower" description="Case lifecycle, review locks, QA, disputes and closures. Every transition is guard-checked server side.">
            <Head title="Due Diligence Control Tower" />
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <KpiTile label="Active cases" value={kpis.active} />
                <KpiTile label="In human / partner review" value={kpis.review} tone="warn" />
                <KpiTile label="Report QA" value={kpis.qa} tone="gold" />
                <KpiTile label="Disputed" value={kpis.disputed} tone={kpis.disputed ? 'bad' : 'neutral'} />
                <KpiTile label="Active monitoring" value={kpis.monitoring} tone="good" />
                <KpiTile label="SLA breached" value={kpis.slaBreached} tone={kpis.slaBreached ? 'bad' : 'good'} />
                <KpiTile label="Open quotes" value={kpis.quotes} />
                <KpiTile label="Collected (incl. VAT)" value={rand(kpis.revenue)} tone="gold" />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-3">
                <Panel title="Cases by status">
                    <ul className="space-y-1.5">
                        {byStatus.map((s) => (
                            <li key={s.status}>
                                <Link href={`/admin/due-diligence/cases?status=${s.status}`} className="flex items-center gap-2 text-xs hover:text-gold-700">
                                    <span className="w-36 shrink-0">{s.label}</span>
                                    <span className="h-2 rounded bg-gold-500" style={{ width: `${(s.count / max) * 100}%`, minWidth: s.count ? 6 : 0 }} />
                                    <span className="font-semibold">{s.count}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
                <Panel title="Staff action queue (by SLA)" className="xl:col-span-2">
                    <SimpleTable
                        columns={['Case', 'Package', 'Status', 'Risk', 'SLA']}
                        rows={queue.map((c) => [<Link key="l" href={`/admin/due-diligence/cases/${c.reference}`} className="font-mono text-gold-700 hover:underline">{c.reference}</Link>, c.package, <StatusPill key="s" status={c.statusLabel} />, c.risk, <span key="d" className={c.overdue ? 'font-semibold text-risk-600' : ''}>{shortDate(c.slaDueAt)}</span>])}
                        empty="Nothing waiting on staff."
                    />
                </Panel>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Deletion approvals (dual control)">
                    <SimpleTable
                        columns={['Case', 'Privacy Lead', 'Finance Controller']}
                        rows={closures.map((c) => [
                            <Link key="l" href={`/admin/due-diligence/cases/${c.reference}`} className="font-mono text-gold-700">{c.reference}</Link>,
                            c.approvals?.privacy_lead ? 'Approved' : <Button key="p" size="sm" variant="outline" onClick={() => router.post(`/admin/due-diligence/cases/${c.reference}/closure`, { role: 'privacy_lead' }, { preserveScroll: true })}>Approve</Button>,
                            c.approvals?.finance_controller ? 'Approved' : <Button key="f" size="sm" variant="outline" onClick={() => router.post(`/admin/due-diligence/cases/${c.reference}/closure`, { role: 'finance_controller' }, { preserveScroll: true })}>Approve</Button>,
                        ])}
                        empty="No deletion requests."
                    />
                </Panel>
                <Panel title="Recent quotes">
                    <SimpleTable columns={['Quote', 'Client', 'Package', 'Status', 'Total']} rows={quotes.map((q) => [<span key="r" className="font-mono">{q.reference}</span>, q.client, q.package, <StatusPill key="s" status={q.status} />, q.total ? rand(q.total) : '—'])} />
                </Panel>
            </div>
            <Panel title="Audit timeline (latest)" className="mt-5">
                <SimpleTable columns={['Event', 'Case', 'Description', 'Actor', 'When']} rows={events.map((e) => [<span key="c" className="font-mono">{e.code}</span>, e.case, e.description, e.actor, shortDate(e.at, true)])} />
            </Panel>
        </ConsoleLayout>
    );
}

AdminDashboard.layout = null;
