import { Head, Link, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import { DD_ADMIN_NAV } from '@/Components/DueDiligence/AdminNav';
import { rand, shortDate } from '@/Components/DueDiligence/Ui';

interface Props {
    requests: { id: number; reference: string; status: string; data: Record<string, unknown>; fee_view: { total: number } | null; staff_note: string | null; client: string | null; submittedAt: string | null }[];
    batches: { id: number; reference: string; file_name: string; status: string; progress: number; rows: number; valid_rows: number; duplicates: number; client: string | null }[];
    alerts: { id: number; reference: string; subject: string; alert_type: string; source: string; risk_level: string; status: string; reviewer: string | null; case: string | null; detectedAt: string | null }[];
    subscriptions: { id: number; reference: string; plan_name: string }[];
}

const NEXT: Record<string, string[]> = { submitted: ['scoping', 'declined'], scoping: ['quoted', 'declined'], quoted: ['accepted', 'declined'] };

/** Enterprise requests, bulk batches and the monitoring alert review queue. */
export default function AdminEnterprise({ requests, batches, alerts }: Props) {
    return (
        <ConsoleLayout area="Due Diligence Control Tower" areaIcon={ShieldCheck} groups={DD_ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Due Diligence', href: '/admin/due-diligence' }, { label: 'Enterprise & Monitoring' }]} title="Enterprise & Monitoring" description="Scope enterprise requests, process batches and review alerts before any client-facing disposition.">
            <Head title="DD Enterprise & Monitoring" />
            <Panel title="Enterprise screening requests">
                <SimpleTable
                    columns={['Reference', 'Client', 'Programme', 'Volume', 'Indicative total', 'Status', 'Move to']}
                    rows={requests.map((r) => [
                        <span key="r" className="font-mono">{r.reference}</span>, r.client, String(r.data.name ?? ''), String(r.data.volume ?? ''), r.fee_view ? `From ${rand(r.fee_view.total)}` : '—', <StatusPill key="s" status={r.status} />,
                        <span key="m" className="flex gap-1">{(NEXT[r.status] ?? []).map((n) => <Button key={n} size="sm" variant="outline" onClick={() => router.post(`/admin/due-diligence/enterprise/${r.reference}`, { status: n }, { preserveScroll: true })}>{n}</Button>)}</span>,
                    ])}
                    empty="No enterprise requests."
                />
            </Panel>
            <Panel title="Bulk batches" className="mt-4">
                <SimpleTable
                    columns={['Batch', 'Client', 'File', 'Rows (valid / dupes)', 'Status', 'Progress', '']}
                    rows={batches.map((b) => [<span key="r" className="font-mono">{b.reference}</span>, b.client, b.file_name, `${b.rows} (${b.valid_rows} / ${b.duplicates})`, <StatusPill key="s" status={b.status} />, `${b.progress}%`,
                        ['queued', 'processing'].includes(b.status) ? <Button key="a" size="sm" variant="outline" onClick={() => router.post(`/admin/due-diligence/batches/${b.id}/advance`, {}, { preserveScroll: true })}>Advance</Button> : '—'])}
                    empty="No batches."
                />
            </Panel>
            <Panel title="Monitoring alert review queue" className="mt-4">
                <SimpleTable
                    columns={['Alert', 'Case', 'Subject', 'Type', 'Risk', 'Detected', 'Status', 'Action']}
                    rows={alerts.map((a) => [<span key="r" className="font-mono">{a.reference}</span>, a.case ? <Link key="c" href={`/admin/due-diligence/cases/${a.case}`} className="text-gold-700">{a.case}</Link> : '—', a.subject, a.alert_type, a.risk_level, shortDate(a.detectedAt), <StatusPill key="s" status={a.status} />,
                        a.status !== 'reviewed' ? <Button key="b" size="sm" variant="outline" onClick={() => router.post(`/admin/due-diligence/alerts/${a.id}`, { status: 'reviewed' }, { preserveScroll: true })}>Mark reviewed</Button> : a.reviewer])}
                    empty="No alerts."
                />
            </Panel>
        </ConsoleLayout>
    );
}

AdminEnterprise.layout = null;
