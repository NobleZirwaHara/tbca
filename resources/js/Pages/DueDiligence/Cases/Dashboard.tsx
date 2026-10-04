import { Link } from '@inertiajs/react';
import { Box, CalendarClock, CheckCircle2, Circle, Clock, FolderOpen, Hourglass, MinusCircle, Users } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, GoldLink, evidenceLabel, rand, shortDate, usd } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdCommercial, DdEvent } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    nextActions: { title: string; body: string; priority: string; href: string }[];
    milestones: { label: string; state: 'done' | 'current' | 'pending'; date: string | null }[];
    evidence: { id: number; label: string; status: string; required: boolean; documents_count: number }[];
    events: DdEvent[];
    commercial: DdCommercial;
    snapshot: Record<string, string | number | null>;
    subjects: { entities: number; individuals: number };
}

const PRIORITY: Record<string, string> = { High: 'bg-risk-50 text-risk-700', Medium: 'bg-attested-50 text-attested-700', Low: 'bg-parchment-200 text-ink-600' };

/** DD-031 Case Dashboard. */
export default function Dashboard(props: Props) {
    const { case: c, nextActions, milestones, evidence, events, commercial, snapshot, subjects, coordinator } = props;
    const base = `/due-diligence/cases/${c.reference}`;

    return (
        <CaseLayout
            page={props}
            active=""
            wide
            title="Case Dashboard"
            subtitle="Track progress, complete required actions and monitor your due diligence case securely."
            actions={
                <>
                    <ButtonLink href={nextActions[0]?.href ?? `${base}/evidence`} trailingIcon="arrow-right">Open Case Workspace</ButtonLink>
                    <ButtonLink href={`${base}/review`} variant="outline-light">Message Case Team</ButtonLink>
                </>
            }
        >
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {[
                    [FolderOpen, 'Case ID', c.reference, `Created: ${shortDate(c.createdAt)}`],
                    [Box, 'Service Selected', c.package, c.familyName],
                    [Hourglass, 'Current Stage', `${c.step}. ${props.journey[c.step - 1]?.label}`, c.statusLabel],
                    [Clock, 'Turnaround SLA', shortDate(c.slaDueAt), 'Target date'],
                    [Users, 'Subject Count', `${subjects.entities} Entit${subjects.entities === 1 ? 'y' : 'ies'}`, `${subjects.individuals} Individuals`],
                    [CalendarClock, 'Last Updated', shortDate(c.updatedAt), new Date(c.updatedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) + ' SAST'],
                ].map(([I, k, v, s]) => {
                    const Icon = I as typeof Box;
                    return (
                        <div key={k as string} className="flex gap-3 rounded-[10px] border border-parchment-400 bg-white p-3">
                            <Icon className="size-7 shrink-0 text-gold-600" aria-hidden="true" />
                            <div className="min-w-0"><p className="text-[0.6875rem] text-ink-500">{k as string}</p><p className="truncate text-sm font-bold text-ink-900">{v as string}</p><p className="text-[0.6875rem] text-gold-700">{s as string}</p></div>
                        </div>
                    );
                })}
            </div>

            <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
                <Card title="Next Actions">
                    <ul className="space-y-2">
                        {nextActions.slice(0, 5).map((a) => (
                            <li key={a.title}>
                                <Link href={a.href} className="flex items-start gap-2 rounded p-1 hover:bg-parchment-100">
                                    <span className="flex-1"><span className="block text-[0.8125rem] font-semibold">{a.title}</span><span className="block text-xs text-ink-500">{a.body}</span></span>
                                    <span className={cn('rounded px-1.5 text-[0.625rem] font-semibold', PRIORITY[a.priority])}>{a.priority}</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Card>
                <Card title="Case Progress">
                    <ol className="space-y-2">
                        {milestones.map((m) => (
                            <li key={m.label} className="flex items-center gap-2 text-[0.8125rem]">
                                {m.state === 'done' ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : m.state === 'current' ? <Hourglass className="size-4 text-gold-600" aria-hidden="true" /> : <Circle className="size-4 text-ink-300" aria-hidden="true" />}
                                <span className="flex-1">{m.label}</span>
                                <span className={cn('text-xs', m.state === 'current' ? 'text-gold-700' : 'text-ink-400')}>{m.state === 'done' ? shortDate(m.date) : m.state === 'current' ? 'In Progress' : 'Pending'}</span>
                            </li>
                        ))}
                    </ol>
                </Card>
                <Card title="Required Evidence" action={<GoldLink href={`${base}/evidence`}>Manage Evidence</GoldLink>}>
                    <ul className="space-y-1.5">
                        {evidence.map((e) => {
                            const [l, cls] = evidenceLabel(e.status, e.required);
                            return (
                                <li key={e.id} className="flex items-center gap-2 text-xs">
                                    {l === 'Uploaded' ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : l === 'Not Required' ? <MinusCircle className="size-4 text-ink-300" aria-hidden="true" /> : <Clock className="size-4 text-attested-500" aria-hidden="true" />}
                                    <span className="flex-1">{e.label}</span><span className={cls}>{l}</span>
                                </li>
                            );
                        })}
                    </ul>
                </Card>
                <div className="space-y-4">
                    <Card title="Case Snapshot">
                        <dl className="space-y-1 text-xs">
                            {[['Case Name', c.caseName], ['Case ID', c.reference], ['Service Package', c.package], ['Client', c.clientName], ['Assigned Coordinator', coordinator.name], ['Team Email', coordinator.email], ['Portal Access', `Active | ${snapshot.portalUsers} Users`]].map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium break-words">{v}</dd></div>)}
                        </dl>
                    </Card>
                    <Card title="Commercial Summary">
                        <dl className="space-y-1 text-xs">
                            {[['TBCA Expert Fee', commercial.expert], ['TBCA Platform Fee', commercial.platform], ['External Third-Party Costs', commercial.external]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd>{rand(v as number, 2)} <span className="text-ink-400">{usd(v as number)}</span></dd></div>)}
                            <div className="flex justify-between border-t border-parchment-300 pt-1"><dt>VAT (15%)</dt><dd>{rand(commercial.vat, 2)}</dd></div>
                            <div className="flex justify-between rounded bg-gold-50 px-1 py-1 text-sm font-bold"><dt>Total Paid</dt><dd>{rand(commercial.total, 2)}</dd></div>
                            {commercial.credits > 0 && <div className="flex justify-between text-verified-700"><dt>Credits / refunds</dt><dd>- {rand(commercial.credits, 2)}</dd></div>}
                        </dl>
                    </Card>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="Recent Activity" action={<GoldLink href={`${base}/consent`}>View audit trail</GoldLink>}>
                    <ul className="space-y-2">{events.map((e) => <li key={e.code} className="flex gap-2 text-xs"><CheckCircle2 className="size-4 shrink-0 text-verified-500" aria-hidden="true" /><span className="flex-1">{e.description}</span><span className="text-ink-400">{shortDate(e.at)}</span></li>)}</ul>
                </Card>
                <Card title="Support & Communication">
                    <div className="space-y-2 text-[0.8125rem]">
                        <button type="button" onClick={() => openAskQuestion({ subject: `Message case team ${c.reference}`, section: 'due-diligence' })} className="block w-full rounded border border-parchment-400 p-2 text-left hover:border-gold-500"><strong className="block">Message Case Team</strong><span className="text-xs text-ink-500">Chat securely with your coordinator</span></button>
                        <button type="button" onClick={() => openAskQuestion({ subject: `Question on ${c.reference}`, section: 'due-diligence' })} className="block w-full rounded border border-parchment-400 p-2 text-left hover:border-gold-500"><strong className="block">Ask a Question</strong><span className="text-xs text-ink-500">Get help or clarification</span></button>
                        <Link href="/contact" className="block rounded border border-parchment-400 p-2 hover:border-gold-500"><strong className="block">Schedule Specialist Call</strong><span className="text-xs text-ink-500">Book a call with a due diligence expert</span></Link>
                    </div>
                </Card>
                <Card title="Your Case Coordinator">
                    <p className="text-sm font-bold">{coordinator.name}</p>
                    <p className="text-xs text-ink-500">{coordinator.role}</p>
                    <p className="mt-2 text-xs">{coordinator.email}</p>
                    <p className="text-xs">{coordinator.phone}</p>
                    <div className="mt-3 space-y-1">
                        <GoldLink href={`${base}/evidence`}>Upload Evidence</GoldLink>
                        <GoldLink href={`${base}/subject`}>Case Workspace</GoldLink>
                    </div>
                </Card>
            </div>
        </CaseLayout>
    );
}
