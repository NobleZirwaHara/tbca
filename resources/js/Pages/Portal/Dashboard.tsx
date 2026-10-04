import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Calendar, FileText, MessageCircle, Plus, Upload, Wallet } from 'lucide-react';
import PortalShell from '@/Components/Portal/PortalShell';
import { Donut, Legend } from '@/Components/Portal/Charts';
import { KpiRow } from '@/Components/Portal/Panels';
import { Panel, Progress, StatusPill } from '@/Components/ui/Kit';
import { usePrice } from '@/lib/money';
import type { Kpi } from '@/types/portal';

interface Props {
    greeting: string;
    kpis: Kpi[];
    projects: { reference: string; name: string; sub: string | null; status: string; health: string; progress: number; due: string | null; lead: string | null }[];
    actions: { title: string; type: string; status: string; due: string; href: string }[];
    actionCount: number;
    taskStats: { overdue: number; due_soon: number; in_progress: number; completed: number };
    meetings: { topic: string; day: string; month: string; time: string; channel: string; with: string; in: string }[];
    messages: { from: string; body: string; at: string }[];
    documents: { id: number; name: string; type: string | null; size: string; date: string }[];
    invoices: { number: string; reference: string; date: string; amount: number; status: string }[];
    outstanding: number;
    outstandingCount: number;
    activity: { title: string; meta: string; tag: string; href: string | null }[];
    timeline: { label: string; status: string; date: string }[];
    timelineProject: string | null;
    native: { label: string; href: string }[];
}

function More({ href, label }: { href: string; label: string }) {
    return (
        <Link href={href} className="text-xs font-semibold text-controlled-700 hover:underline">
            {label}
        </Link>
    );
}

/** CP-SCR-013 Client Dashboard and Command Centre. */
export default function Dashboard(p: Props) {
    const price = usePrice();
    const quick = [
        { label: 'Start a Project', href: '/portal/intake', icon: Plus },
        { label: 'Book a Meeting', href: '/portal/meetings', icon: Calendar },
        { label: 'Upload Document', href: '/portal/documents/upload', icon: Upload },
        { label: 'View Invoices', href: '/portal/invoices', icon: Wallet },
        { label: 'Browse Services', href: '/shop', icon: FileText },
        { label: 'Secure Messages', href: '/portal/messages', icon: MessageCircle },
    ];

    return (
        <PortalShell title="Client Dashboard & Command Centre" icon="layout-dashboard" subtitle={`Welcome back, ${p.greeting}. Here is the latest on your TBCA engagements.`} crumbs={[{ label: 'Dashboard' }]}>
            <Head title="Client Dashboard" />
            <KpiRow kpis={p.kpis} />

            <div className="grid gap-5 xl:grid-cols-3">
                <Panel title="My Active Projects" action={<More href="/portal/projects" label="View All Projects" />} className="xl:col-span-2">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-[0.8125rem]">
                            <thead className="text-xs text-ink-500">
                                <tr>
                                    <th className="py-2 pr-3">Project / Sprint</th>
                                    <th className="py-2 pr-3">Status</th>
                                    <th className="py-2 pr-3">Progress</th>
                                    <th className="py-2 pr-3">Delivery Date</th>
                                    <th className="py-2">Account Lead</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-parchment-300">
                                {p.projects.map((pr) => (
                                    <tr key={pr.reference}>
                                        <td className="py-2 pr-3">
                                            <Link href={`/portal/projects/${pr.reference}`} className="font-semibold text-ink-900 hover:text-gold-700">
                                                {pr.name}
                                            </Link>
                                            <p className="text-xs text-ink-500">{pr.sub}</p>
                                        </td>
                                        <td className="py-2 pr-3">
                                            <StatusPill status={pr.health === 'at_risk' ? 'At Risk' : pr.status === 'completed' ? 'Completed' : 'On Track'} tone={pr.health === 'at_risk' ? 'bad' : 'good'} />
                                        </td>
                                        <td className="py-2 pr-3">
                                            <div className="flex min-w-28 items-center gap-2">
                                                <Progress value={pr.progress} className="h-1.5" />
                                                <span className="text-xs">{pr.progress}%</span>
                                            </div>
                                        </td>
                                        <td className="py-2 pr-3 whitespace-nowrap">{pr.due}</td>
                                        <td className="py-2 whitespace-nowrap">{pr.lead}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Panel>

                <Panel title={`One Action Centre (${p.actionCount})`} action={<More href="/portal/actions" label="View All" />}>
                    <ul className="space-y-2">
                        {p.actions.map((a) => (
                            <li key={a.title}>
                                <Link href={a.href} className="flex items-start gap-2 rounded-[6px] border border-parchment-300 p-2 hover:border-gold-400">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[0.8125rem] font-medium text-ink-900">{a.title}</p>
                                        <p className="text-xs text-ink-500">{a.due}</p>
                                    </div>
                                    <StatusPill status={a.status.replace('_', ' ')} tone={a.status === 'overdue' ? 'bad' : a.status === 'due_soon' ? 'warn' : 'info'} />
                                </Link>
                            </li>
                        ))}
                        {p.actions.length === 0 && <li className="text-sm text-ink-400">Nothing waiting on you.</li>}
                    </ul>
                </Panel>

                <Panel title="Task Overview" action={<More href="/portal/tasks" label="View Tasks" />}>
                    {(() => {
                        const items = [
                            { label: 'Overdue', value: p.taskStats.overdue, tone: 'bad' },
                            { label: 'Due Soon', value: p.taskStats.due_soon, tone: 'orange' },
                            { label: 'In Progress', value: p.taskStats.in_progress, tone: 'good' },
                            { label: 'Completed', value: p.taskStats.completed, tone: 'info' },
                        ];
                        return (
                            <div className="flex items-center gap-4">
                                <Donut items={items} center={String(items.reduce((s, i) => s + i.value, 0))} centerLabel="Tasks" size={112} />
                                <Legend items={items} />
                            </div>
                        );
                    })()}
                </Panel>

                <Panel title={`Project Timeline${p.timelineProject ? ` – ${p.timelineProject}` : ''}`} action={<More href="/portal/timeline" label="View Full Timeline" />}>
                    <ol className="space-y-2.5">
                        {p.timeline.map((s) => (
                            <li key={s.label} className="flex items-center gap-2 text-[0.8125rem]">
                                <span className={`size-3 rounded-full ${s.status === 'completed' ? 'bg-verified-500' : s.status === 'in_progress' ? 'bg-gold-500' : 'bg-parchment-500'}`} aria-hidden="true" />
                                <span className="flex-1 text-ink-800">{s.label}</span>
                                <span className="text-xs text-ink-500">{s.status === 'completed' ? `Completed ${s.date}` : s.status === 'in_progress' ? 'In progress' : `Starts ${s.date}`}</span>
                            </li>
                        ))}
                    </ol>
                </Panel>

                <Panel title="Upcoming Schedule" action={<More href="/portal/meetings" label="View Calendar" />}>
                    <ul className="space-y-2.5">
                        {p.meetings.map((m) => (
                            <li key={m.topic + m.day} className="flex gap-3">
                                <span className="flex w-11 shrink-0 flex-col items-center rounded-[6px] bg-ink-900 py-1 text-gold-300">
                                    <span className="text-[0.625rem] font-bold">{m.month}</span>
                                    <span className="text-base leading-none font-bold">{m.day}</span>
                                </span>
                                <div className="min-w-0 flex-1 text-[0.8125rem]">
                                    <p className="font-semibold text-ink-900">{m.topic}</p>
                                    <p className="text-xs text-ink-500">
                                        {m.time} · {m.channel} · With {m.with}
                                    </p>
                                </div>
                                <span className="text-[0.6875rem] text-ink-500">{m.in}</span>
                            </li>
                        ))}
                        {p.meetings.length === 0 && <li className="text-sm text-ink-400">No upcoming meetings.</li>}
                    </ul>
                </Panel>

                <Panel title="Messages & Updates" action={<More href="/portal/messages" label="View All" />}>
                    <ul className="space-y-2.5">
                        {p.messages.map((m, i) => (
                            <li key={i} className="text-[0.8125rem]">
                                <p className="font-semibold text-ink-900">
                                    {m.from} <span className="font-normal text-ink-400">· {m.at}</span>
                                </p>
                                <p className="line-clamp-2 text-ink-600">{m.body}</p>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel title="Documents & Deliverables" action={<More href="/portal/documents" label="View All Files" />}>
                    <ul className="divide-y divide-parchment-300">
                        {p.documents.map((d) => (
                            <li key={d.id} className="flex items-center gap-2 py-2 text-[0.8125rem]">
                                <FileText className="size-4 text-gold-600" aria-hidden="true" />
                                <Link href={`/portal/documents/${d.id}`} className="flex-1 truncate text-ink-900 hover:underline">
                                    {d.name}
                                </Link>
                                <span className="text-xs text-ink-500">{d.size}</span>
                            </li>
                        ))}
                    </ul>
                </Panel>

                <Panel title="Payment Summary" action={<More href="/portal/invoices" label="View All Invoices" />}>
                    <p className="text-xs text-ink-500">Total Outstanding</p>
                    <p className="text-2xl font-bold text-risk-600">{price(p.outstanding)}</p>
                    <p className="mb-3 text-xs text-ink-500">{p.outstandingCount} invoices due</p>
                    <ul className="divide-y divide-parchment-300 text-[0.8125rem]">
                        {p.invoices.map((i) => (
                            <li key={i.number} className="flex items-center gap-2 py-1.5">
                                <Link href={`/portal/invoices/${i.reference}`} className="flex-1 font-mono text-xs text-controlled-700 hover:underline">
                                    {i.number}
                                </Link>
                                <span>{price(i.amount)}</span>
                                <StatusPill status={i.status} />
                            </li>
                        ))}
                    </ul>
                    <Link href="/portal/invoices?tab=outstanding" className="mt-3 flex w-full justify-center rounded-[4px] bg-gold-500 py-2 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                        Make a Payment
                    </Link>
                </Panel>

                <Panel title="Recent Activity" action={<More href="/portal/notifications" label="View All" />}>
                    <ul className="space-y-2 text-[0.8125rem]">
                        {p.activity.map((a, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <span className="mt-1.5 size-2 rounded-full bg-gold-500" aria-hidden="true" />
                                <span className="flex-1 text-ink-800">{a.href ? <Link href={a.href} className="hover:underline">{a.title}</Link> : a.title}</span>
                                <span className="text-[0.6875rem] text-ink-500">{a.meta}</span>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <Panel title="Quick Links" className="mt-5">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
                    {quick.map((q) => (
                        <Link key={q.label} href={q.href} className="flex flex-col items-center gap-2 rounded-[8px] border border-parchment-400 p-3 text-center text-xs font-semibold text-ink-800 hover:border-gold-400">
                            <q.icon className="size-5 text-gold-600" aria-hidden="true" />
                            {q.label}
                        </Link>
                    ))}
                </div>
            </Panel>

            <Panel title="Your Platform Workspaces" className="mt-5">
                <div className="flex flex-wrap gap-2">
                    {p.native.map((n) => (
                        <Link key={n.href} href={n.href} className="inline-flex items-center gap-1.5 rounded-full border border-gold-400 bg-gold-50 px-3 py-1.5 text-xs font-semibold text-ink-900 hover:bg-gold-100">
                            My {n.label} <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </Panel>
        </PortalShell>
    );
}

Dashboard.layout = null;
