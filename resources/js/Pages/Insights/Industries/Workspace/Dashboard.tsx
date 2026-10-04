import { Link } from '@inertiajs/react';
import { Briefcase, CheckCircle2, ChevronRight, Circle, ClipboardList, Download, FileText, Mail, MessageSquare, Phone, Upload } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, SmallLink, Stat, Status, zar } from '@/Components/Insights/Shared';
import { cn } from '@/lib/cn';
import type { WorkspaceBase } from '@/types/insights';

interface Props extends WorkspaceBase {
    progress: number;
    tasks: { id: number; title: string; detail: string | null; priority: string; due: string | null }[];
    taskTotals: { open: number; total: number };
    timeline: { title: string; status: string; date: string }[];
    activity: { title: string; text: string; at: string; icon: string }[];
    documents: { title: string; file: string; status: string }[];
    advisor: { name: string; role: string; email: string; phone: string } | null;
    gates: { id: number; code: string; name: string; status: string }[];
    totals: { committed: number; payments: number; outstanding: number; disbursements: number };
    dueOn: string | null;
    nextMilestone: { title: string; date: string } | null;
    deliverablesReady: number;
}

const STAGES = [['S0-S2', 'Discovery'], ['S3', 'Intelligence'], ['S4', 'Access'], ['S5', 'Reports'], ['S6', 'Payment'], ['S7-S12', 'Execution']];

export default function WorkspaceDashboard(props: Props) {
    const { engagement: e, progress, tasks, taskTotals, timeline, activity, documents, advisor, gates, totals, dueOn, nextMilestone, deliverablesReady } = props;
    const root = `/industries/workspace/${e.reference}`;
    const stageNum = parseInt(e.stage.replace(/\D/g, ''), 10) || 0;
    const stageIdx = stageNum <= 2 ? 0 : stageNum >= 7 ? 5 : stageNum - 2;

    return (
        <WorkspaceShell
            base={props}
            title="Industry Workspace Dashboard"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="Your central workspace to manage engagement activities, access deliverables, track payments, and collaborate with TBCA."
            actions={
                <>
                    <a href={`${root}/ledger-export`} className="flex items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Download className="size-4" /> Export Dashboard</a>
                    <button type="button" onClick={() => openAskQuestion({ subject: `Message on ${e.reference}`, section: 'industries' })} className="flex items-center gap-1.5 rounded-[4px] border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><MessageSquare className="size-4" /> Messages</button>
                    <button type="button" onClick={() => openAskQuestion({ subject: `Support request – ${e.reference}`, section: 'industries' })} className="rounded-[4px] bg-gold-500 px-3 py-2 text-xs font-bold">Request Support</button>
                </>
            }
            right={
                <>
                    <Box title="Gate Status" action={<SmallLink href={`${root}/gates`}>View All</SmallLink>}>
                        <ul className="space-y-1.5 text-xs">{gates.map((g) => <li key={g.id} className="flex items-center justify-between"><span>{g.code}: {g.name}</span><Status value={g.status} /></li>)}</ul>
                    </Box>
                    {advisor && (
                        <Box title="Support & Advisor">
                            <div className="flex items-center gap-3">
                                <span className="flex size-12 items-center justify-center rounded-full bg-ink-900 font-bold text-gold-400">{advisor.name.split(' ').map((n) => n[0]).join('')}</span>
                                <div><p className="text-[0.6875rem] text-ink-500">Your TBCA Advisor</p><p className="font-semibold">{advisor.name}</p><p className="text-xs text-ink-500">{advisor.role}</p></div>
                            </div>
                            <p className="mt-2 flex items-center gap-1.5 text-xs"><Mail className="size-3.5" />{advisor.email}</p>
                            <p className="flex items-center gap-1.5 text-xs"><Phone className="size-3.5" />{advisor.phone}</p>
                            <button type="button" onClick={() => openAskQuestion({ subject: `Message for ${advisor.name}`, section: 'industries' })} className="mt-3 w-full rounded border border-gold-500 py-1.5 text-xs font-semibold text-gold-800">Send Message</button>
                        </Box>
                    )}
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                    <p className="text-xs text-ink-500">Engagement Progress</p>
                    <p className="text-2xl font-bold">{progress}%</p>
                    <div className="mt-1 h-1.5 rounded-full bg-parchment-300"><div className="h-full rounded-full bg-controlled-500" style={{ width: `${progress}%` }} /></div>
                    <p className="mt-1 text-[0.6875rem] text-verified-700">{e.status === 'active' ? 'On Track' : e.status}</p>
                </div>
                <Stat label="Tasks In Progress" value={taskTotals.open} caption={`of ${taskTotals.total} total tasks`} icon={<ClipboardList className="size-5" />} />
                <Stat label="Next Milestone" value={<span className="text-base">{nextMilestone?.title ?? 'All complete'}</span>} caption={nextMilestone?.date ?? (dueOn ? `Due ${dueOn}` : undefined)} icon={<Briefcase className="size-5" />} />
                <Stat label="Deliverables Ready" value={deliverablesReady} caption="View documents below" icon={<FileText className="size-5" />} />
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
                <Box title="Engagement Timeline">
                    <ol className="flex items-start justify-between gap-1">
                        {STAGES.map(([s, l], i) => (
                            <li key={s} className="flex flex-1 flex-col items-center text-center">
                                {i < stageIdx ? <CheckCircle2 className="size-5 text-verified-500" /> : <Circle className={cn('size-5', i === stageIdx ? 'fill-controlled-50 text-controlled-500' : 'text-parchment-500')} />}
                                <span className="mt-1 text-[0.625rem] font-semibold">{s}</span>
                                <span className="text-[0.625rem] text-ink-500">{l}</span>
                            </li>
                        ))}
                    </ol>
                    <p className="mt-3 inline-block rounded border border-controlled-500/30 bg-controlled-50 px-2 py-0.5 text-xs text-controlled-700">Current Stage: {e.stageLabel}</p>
                    <ul className="mt-3 space-y-2 text-xs">
                        {timeline.map((t) => <li key={t.title} className="flex items-center justify-between gap-2"><span>• {t.title}</span><span className="flex items-center gap-2"><Status value={t.status} /><span className="w-28 text-right text-ink-500">{t.date}</span></span></li>)}
                    </ul>
                </Box>
                <Box title="Recent Activity">
                    <ul className="space-y-3 text-xs">
                        {activity.map((a, i) => (
                            <li key={i} className="flex gap-3">
                                {a.icon === 'upload' ? <Upload className="size-5 text-purple-600" /> : a.icon === 'message' ? <MessageSquare className="size-5 text-attested-500" /> : <CheckCircle2 className="size-5 text-verified-500" />}
                                <span><strong className="block">{a.title}</strong>{a.text}<span className="block text-ink-400">{a.at}</span></span>
                            </li>
                        ))}
                    </ul>
                </Box>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
                <Box title="Key Documents" action={<SmallLink href={`${root}/engagement-letter`}>View All</SmallLink>}>
                    <ul className="space-y-2 text-xs">
                        {documents.length === 0 && <li className="text-ink-400">Documents appear once your engagement letter is signed.</li>}
                        {documents.map((d) => <li key={d.file} className="flex items-center justify-between gap-2"><span className="flex gap-2"><FileText className="size-4 text-gold-700" /><span><strong className="block">{d.title}</strong><span className="text-ink-400">{d.file}</span></span></span><Status value={d.status} /></li>)}
                    </ul>
                </Box>
                <Box title="Outstanding Tasks">
                    <ul className="space-y-2 text-xs">
                        {tasks.length === 0 && <li className="text-ink-400">No open tasks.</li>}
                        {tasks.map((t) => <li key={t.id} className="flex items-start justify-between gap-2"><span><strong className="block">{t.title}</strong><span className="text-ink-500">{t.detail}</span></span><span className="text-right"><Status value={t.priority} /><span className="block text-ink-400">{t.due}</span></span></li>)}
                    </ul>
                </Box>
                <Box title="Payment Summary">
                    <dl className="space-y-2 text-sm">
                        <div className="flex justify-between"><dt>Total Fee</dt><dd className="font-semibold">{zar(totals.committed, 2)}</dd></div>
                        <div className="flex justify-between"><dt>Total Paid</dt><dd className="font-semibold text-verified-700">{zar(totals.payments, 2)}</dd></div>
                        <div className="flex justify-between"><dt>Outstanding Balance</dt><dd className="font-semibold text-risk-700">{zar(totals.outstanding, 2)}</dd></div>
                        <div className="flex justify-between"><dt>Due Date</dt><dd>{dueOn ?? '—'}</dd></div>
                    </dl>
                    <Link href={`${root}/ledger`} className="mt-3 flex items-center justify-center gap-1 rounded border border-parchment-500 py-1.5 text-xs font-semibold">Go to Payments & Ledger <ChevronRight className="size-3.5" /></Link>
                </Box>
            </div>
            <p className="rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-3 text-xs text-controlled-700"><strong>Transparency Commitment.</strong> All engagement activities, fees, milestones, and communications are recorded and auditable. No hidden costs. No surprises.</p>
        </WorkspaceShell>
    );
}
