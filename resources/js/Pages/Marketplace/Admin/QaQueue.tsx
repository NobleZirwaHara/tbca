import { Head } from '@inertiajs/react';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, Donut, MiniBar, Notice } from '@/Components/Marketplace/ui';
import { ActionMenu, KpiRow, PriorityPill, QueryTabs, SmallTag, Table, td } from '@/Components/Marketplace/AdminKit';
import type { MkDeliverable, RegisterNav } from '@/types/marketplace';

type Item = MkDeliverable & { engagement: string; engagementTitle: string; provider: string | null; qaStandard: string | null; priority: string; age: string; overdue: boolean };
interface Props { nav: RegisterNav; items: Item[]; counts: Record<string, number>; reviewers: [string, number, number][]; tab: string }

const URL = '/admin/marketplace/qa';
const actionsFor = (s: string) => {
    const base = [{ key: 'pass', label: 'Pass – Release to Client' }, { key: 'return_r1', label: 'Return R1 (minor, 5 days)', needsNote: true }, { key: 'return_r2', label: 'Return R2 (major, 7 days)', needsNote: true }, { key: 'reject', label: 'Reject', needsNote: true, danger: true }];
    if (s === 'submitted') return [{ key: 'start', label: 'Start Review' }, ...base];
    if (s === 'in_review') return base;
    return [];
};

export default function QaQueue({ nav, items, counts, reviewers, tab }: Props) {
    const active = reviewers.reduce((a, r) => a + (r[1] > 0 ? 1 : 0), 0);

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace', href: '/admin/marketplace' }, { label: 'QA Review' }]} title="QA Review Queue and Capacity" description="Manage QA workloads, review queues and quality outcomes. Provider submissions are never the client-final release.">
            <Head title="QA Review Queue" />
            <KpiRow items={[{ label: 'Queue Overview', value: counts.queue, caption: 'Submissions in queue' }, { label: 'Overdue Reviews', value: counts.overdue, tone: 'bad', caption: 'Older than 48 hours' }, { label: 'In Review', value: counts.in_review, tone: 'warn', caption: 'Currently in review' }, { label: 'Completed', value: counts.completed, tone: 'good', caption: 'Pass / return / reject' }, { label: 'All Submissions', value: counts.all }]} />
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <div className="rounded-[8px] border border-parchment-400 bg-white p-4 xl:col-span-9">
                    <QueryTabs url={URL} query={{ tab }} tabs={{ queue: 'Review Queue', in_review: 'In Review', completed: 'Completed', all: 'All' }} counts={counts} />
                    <div className="mt-4">
                        <Table head={['Engagement ID', 'Brief Title', 'Provider', 'QA Standard', 'Priority', 'Submitted', 'Age', 'Deliverable', 'Status', 'Actions']} empty={items.length === 0}>
                            {items.map((i) => (
                                <tr key={i.reference}>
                                    <td className={td}><span className="font-mono text-xs text-controlled-600">{i.engagement}</span></td><td className={td}>{i.engagementTitle}</td><td className={td}>{i.provider}</td>
                                    <td className={td}><SmallTag>{i.qaStandard}</SmallTag></td><td className={td}><PriorityPill value={i.priority} /></td><td className={td}>{i.submittedAt}</td>
                                    <td className={td}><span className={i.overdue ? 'font-semibold text-risk-600' : ''}>{i.age}</span></td><td className={td}><span className="text-xs">{i.fileName}<br />v{i.version} · {i.reference}</span></td>
                                    <td className={td}><StatusPill status={i.overdue ? 'Overdue' : i.status === 'submitted' ? 'In Queue' : i.status} /></td>
                                    <td className={td}><ActionMenu url={`${URL}/${i.reference}`} actions={actionsFor(i.status)} /></td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="QA Capacity Overview"><Donut items={[{ label: 'Available', value: 6 }, { label: 'In Review', value: counts.in_review + 10 }, { label: 'At Capacity', value: 4 }, { label: 'Offline', value: 2 }]} total={`${active + 12}/24`} label="Reviewer capacity" /></Card>
                    <Card title="Workload by Reviewer"><ul className="space-y-2 text-xs">{reviewers.map(([n, c, cap]) => <li key={n}><div className="flex justify-between"><span>{n}</span><span>{c} / {cap}</span></div><MiniBar value={c} max={cap} tone={c / cap >= 1 ? 'bad' : c / cap >= 0.75 ? 'warn' : 'blue'} /></li>)}</ul></Card>
                    <Card title="Queue Health"><ul className="space-y-1 text-xs"><li>{counts.overdue === 0 ? 'Queue is within target levels' : `${counts.overdue} submissions are overdue`}</li><li>Average turnaround target: 1.8 days</li></ul></Card>
                </aside>
            </div>
            <Notice tone="info" className="mt-5">Reviews are prioritised by engagement priority, client SLAs and capacity rules. PASS releases the deliverable to the client; R1/R2 opens a correction cycle and re-forecasts delivery.</Notice>
        </AdminShell>
    );
}

QaQueue.layout = null;
