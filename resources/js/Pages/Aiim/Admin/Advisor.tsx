import { Head, Link } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import { leadHref, SheetTable, Split, type Cell, type Sheet } from '@/Components/Aiim/ProtoDesk';
import { Bars, Card, Chip, DataTable, Kpi, Kpis, N, STable, statusTone } from '@/Components/Industries/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';

type Lead = Record<string, Cell>;
interface QueueRow { reference: string; title: string; client: string; company: string | null; type: string; status: string; rawStatus: string; advisor: string | null; updated: string }
interface Props {
    kpis: { leads: number; aplus: number; due: number; owners: number };
    leads: Lead[];
    byOwner: { n: string; v: number }[];
    plan: Sheet;
    queue: QueueRow[];
    reports: { reference: string; title: string; client: string; status: string }[];
}

const tierTone = (t: string) => (t.startsWith('A+') ? 'gold' : t.startsWith('A') ? 'ok' : t.startsWith('B') ? 'info' : 'grey');
const COLS = ['Lead ID', 'Hotspot', 'Place', 'Opportunity', 'Lead score', 'Tier', 'Next action', 'Institution to call', 'Owner', 'Due'];

/** AIIM mock 78: AIIM Advisor Dashboard (prototype #advisor-dash): BW_Hotspot_Leads queue, plus the live engagement queue. */
export default function Advisor({ kpis, leads, byOwner, plan, queue, reports }: Props) {
    return (
        <ConsoleLayout area="AIIM Advisor Area" areaIcon={Users} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'AIIM Advisor Dashboard' }]} title="AIIM Advisor Dashboard" description="Page 78 · Lead queue and 90-day plan">
            <Head title="AIIM Advisor Dashboard" />
            <Split side={<Card title="90-day plan"><SheetTable s={plan} bare /></Card>}>
                <Kpis>
                    <Kpi l="Hotspot leads" v={N(kpis.leads)} icon="pin" />
                    <Kpi l="Tier A+" v={N(kpis.aplus)} icon="star" />
                    <Kpi l="Due in Oct–Nov 2026" v={N(kpis.due)} icon="clock" />
                    <Kpi l="Owners" v={N(kpis.owners)} icon="users" />
                </Kpis>
                <Card title="Lead queue">
                    <DataTable<Lead> name="hotspot-leads" size={15} filters={['Tier', 'Owner']} rows={leads} cols={COLS.map((k) => ({
                        k, l: k, num: k === 'Lead score', clip: ['Hotspot', 'Opportunity', 'Next action', 'Institution to call', 'Owner'].includes(k),
                        r: k === 'Lead ID' ? (r: Lead) => <Link href={leadHref(String(r[k]))} className="font-semibold whitespace-nowrap text-controlled-700 hover:underline">{r[k]}</Link>
                            : k === 'Tier' ? (r: Lead) => <Chip t={String(r[k] ?? '')} tone={tierTone(String(r[k] ?? ''))} />
                                : undefined,
                    }))} />
                </Card>
                <Card title="Leads by verification owner"><Bars rows={byOwner.map((o) => ({ label: o.n, value: o.v }))} /></Card>
                <Card title="Engagement queue (live)">
                    <div id="queue">
                        {queue.length ? (
                            <STable compact head={['Reference', 'Title', 'Client', 'Type', 'Status', 'Advisor', 'Updated']} rows={queue.map((q) => [<span key="r" className="font-mono">{q.reference}</span>, q.title, `${q.client}${q.company ? ` (${q.company})` : ''}`, q.type, <Chip key="s" t={q.status} tone={statusTone(q.status)} />, q.advisor ?? 'Unassigned', q.updated])} />
                        ) : <p className="text-[0.82rem] text-ink-400">No engagements yet.</p>}
                    </div>
                </Card>
                {reports.length > 0 && (
                    <Card title="Reports in production">
                        <STable compact head={['Report', 'Title', 'Client', 'Status']} rows={reports.map((r) => [r.reference, r.title, r.client, <Chip key="s" t={r.status.replace('_', ' ')} tone="warn" />])} />
                    </Card>
                )}
            </Split>
        </ConsoleLayout>
    );
}

Advisor.layout = null;
