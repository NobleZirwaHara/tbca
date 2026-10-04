import { Info, Lock, Scale, ShieldCheck, UserX } from 'lucide-react';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { RequestTable, TaskTable, Timeline, type RequestRow, type TaskRow } from '@/Components/DueDiligence/ReviewParts';
import { Card, shortDate } from '@/Components/DueDiligence/Ui';
import { CasePresenterRank } from '@/Components/DueDiligence/rank';
import type { DdCasePageProps } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    partner: { name: string; type: string; scope: string; lead: string; contact: string; location?: string } | null;
    tasks: TaskRow[];
    requests: RequestRow[];
    referredAt: string | null;
}

/** DD-040 Qualified Partner Review Status. */
export default function PartnerReview(props: Props) {
    const { case: c, partner, tasks, requests, referredAt } = props;
    const r = CasePresenterRank(c.status);
    const active = c.status === 'partner_review';
    const allDone = tasks.length > 0 && tasks.every((t) => t.status === 'completed');
    const due = tasks.reduce<string | null>((m, t) => (t.due_at && (!m || t.due_at > m) ? t.due_at : m), null);

    return (
        <CaseLayout
            page={props}
            active="partner-review"
            title="Qualified Partner Review Status"
            subtitle={partner ? 'A qualified partner is reviewing flagged items within their approved scope.' : 'No qualified partner review is required for this case.'}
            description="Partner review is independent and regulated. Raw findings remain restricted. No conclusion will be released until review and QA are complete."
            roleNote="You are viewing the status of the qualified partner review."
            bandNote="Included in your approved plan. External partner costs are approved."
            aside={
                <Card title="Review status">
                    <dl className="space-y-1 text-xs">
                        {[['Status', active ? 'Under partner review' : r > 5 ? 'Complete' : 'Not started'], ['SLA performance', 'On track'], ['Review lock', active ? 'Active' : 'Released'], ['Estimated completion', shortDate(due)]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                    </dl>
                </Card>
            }
        >
            {partner ? (
                <>
                    <div className="grid gap-5 xl:grid-cols-12">
                        <div className="xl:col-span-4">
                            <Timeline
                                title="Partner review timeline"
                                items={[
                                    { label: 'Risk items referred to partner', sub: 'Scope approved and partner assigned', state: 'done', date: referredAt },
                                    { label: 'Partner review in progress', sub: 'Qualified partner reviewing within scope', state: allDone || r > 5 ? 'done' : 'current' },
                                    { label: 'Partner findings submission', state: allDone || r > 5 ? 'done' : 'pending' },
                                    { label: 'Partner coordinator verification', state: r > 5 ? 'done' : 'pending' },
                                    { label: 'Senior reviewer approval', state: r >= 7 ? 'done' : 'pending' },
                                    { label: 'Review complete', state: r > 5 ? 'done' : 'pending' },
                                ]}
                            />
                        </div>
                        <div className="space-y-5 xl:col-span-8">
                            <Card title="Current partner assignment">
                                <div className="grid gap-4 sm:grid-cols-3">
                                    <div><p className="flex items-center gap-2 font-semibold"><Scale className="size-6 text-gold-600" aria-hidden="true" />{partner.name}</p><span className="mt-1 inline-block rounded bg-gold-50 px-1.5 text-[0.625rem] font-semibold text-gold-800">Qualified {partner.type.split(' ')[0]} Partner</span></div>
                                    <dl className="space-y-1 text-xs"><dt className="text-ink-500">Review type</dt><dd>{partner.type}</dd><dt className="text-ink-500">Scope</dt><dd>{partner.scope}</dd></dl>
                                    <dl className="space-y-1 text-xs"><dt className="text-ink-500">Lead reviewer</dt><dd>{partner.lead}</dd><dt className="text-ink-500">Location</dt><dd>{partner.location ?? 'South Africa'}</dd><dt className="text-ink-500">Contact</dt><dd>{partner.contact}</dd></dl>
                                </div>
                            </Card>
                            <Card title="Review tasks"><TaskTable tasks={tasks} note="All tasks are within the approved partner scope. Any scope changes require approval (G9)." /></Card>
                            <RequestTable caseRef={c.reference} requests={requests} />
                        </div>
                    </div>
                    <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-4">
                        {[[ShieldCheck, 'Safe and secure', 'Partner review is independent, confidential and subject to professional regulation.'], [Lock, 'Information protected', 'Raw partner output is restricted. Only authorised reviewers can access full findings.'], [UserX, 'No conclusion yet', 'This is a review step only. No decision has been made.'], [Info, 'QA required', 'Findings will be verified by our Partner Coordinator and approved by a Senior Reviewer.']].map(([I, t, b]) => {
                            const Icon = I as typeof Info;
                            return <p key={t as string} className="flex gap-2"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">{t as string}</strong>{b as string}</span></p>;
                        })}
                    </div>
                </>
            ) : <Card><p className="text-sm text-ink-600">Your case has not been referred to a qualified partner (RL4). Partner review is used when legal, regulatory or specialist professional review is required.</p></Card>}
        </CaseLayout>
    );
}
