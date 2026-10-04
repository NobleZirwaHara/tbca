import { Head } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { BarList, Donut } from '@/Components/Aiim/Charts';
import { Chip, levelTone } from '@/Components/Aiim/Chips';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { KpiTile, Panel, SimpleTable } from '@/Components/ui/Kit';

interface Props {
    data: { kpis: [string, number, string][]; byStage: [string, number][]; pipeline: [string, number][]; bySector: [string, number][]; tasks: string[][]; meetings: string[][]; performance: string[][] };
    queue: { reference: string; title: string; client: string; company: string | null; type: string; status: string; rawStatus: string; advisor: string | null; updated: string }[];
    reports: { reference: string; title: string; client: string; status: string }[];
}

export default function Advisor({ data, queue, reports }: Props) {
    return (
        <ConsoleLayout area="AIIM Advisor Area" areaIcon={Users} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'Advisor Dashboard' }]} title="Advisor Dashboard" description="Manage your clients, mandates and deliver exceptional advisory outcomes.">
            <Head title="AIIM Advisor Dashboard" />
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">{data.kpis.map(([l, v, c]) => <KpiTile key={l} label={l} value={v} caption={c} />)}</div>
            <Panel title="Engagement Queue (live)" className="mt-4">
                <div id="queue">
                    <SimpleTable
                        columns={['Reference', 'Title', 'Client', 'Type', 'Status', 'Advisor', 'Updated']}
                        rows={queue.map((q) => [<span key="r" className="font-mono">{q.reference}</span>, q.title, `${q.client}${q.company ? ` (${q.company})` : ''}`, q.type, <Chip key="s" tone={levelTone(q.status)}>{q.status}</Chip>, q.advisor ?? 'Unassigned', q.updated])}
                        empty="No engagements yet."
                    />
                    <p className="mt-2 text-xs text-ink-500">Queue actions (review, record discovery outcome, issue quotation, record counterparty consent, deliver) are being connected.</p>
                </div>
            </Panel>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="Mandates by Stage"><Donut data={data.byStage.map(([label, value]) => ({ label, value }))} centre={String(data.byStage.reduce((s, x) => s + x[1], 0))} sub="Total Mandates" /></Panel>
                <Panel title="Mandate Pipeline"><BarList data={data.pipeline.map(([label, value]) => ({ label, value, display: String(value) }))} max={30} /></Panel>
                <Panel title="Mandates by Sector"><BarList data={data.bySector.map(([label, value]) => ({ label, value, display: String(value) }))} max={8} /></Panel>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <Panel title="Tasks Requiring Attention" className="lg:col-span-2"><SimpleTable columns={['Task', 'Mandate', 'Due Date', 'Priority']} rows={data.tasks.map(([t, m, d, p]) => [t, m, d, <Chip key="p" tone={p === 'High' ? 'bad' : p === 'Medium' ? 'warn' : 'good'}>{p}</Chip>])} /></Panel>
                <Panel title="Upcoming Meetings"><ul className="space-y-2 text-xs">{data.meetings.map(([d, t, tm, s]) => <li key={t} className="flex gap-2"><span className="w-12 font-bold text-referenced-700">{d}</span><span className="flex-1">{t}<span className="block text-ink-500">{tm}</span></span><Chip tone={s === 'Confirmed' ? 'good' : 'warn'}>{s}</Chip></li>)}</ul></Panel>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-2">
                <Panel title="Reports in Production"><SimpleTable columns={['Report', 'Title', 'Client', 'Status']} rows={reports.map((r) => [r.reference, r.title, r.client, <Chip key="s" tone="warn">{r.status.replace('_', ' ')}</Chip>])} empty="No reports awaiting delivery." /></Panel>
                <Panel title="Performance Summary (This Month)"><ul className="grid grid-cols-2 gap-3">{data.performance.map(([l, v, c]) => <li key={l} className="rounded border border-parchment-300 p-2 text-xs"><p className="text-ink-500">{l}</p><p className="text-xl font-bold">{v}</p><p className="text-verified-700">{c}</p></li>)}</ul></Panel>
            </div>
        </ConsoleLayout>
    );
}

Advisor.layout = null;
