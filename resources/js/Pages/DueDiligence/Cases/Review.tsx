import { UserRound } from 'lucide-react';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { RequestTable, Timeline, type RequestRow } from '@/Components/DueDiligence/ReviewParts';
import { Card, shortDate } from '@/Components/DueDiligence/Ui';
import { CasePresenterRank } from '@/Components/DueDiligence/rank';
import type { DdCasePageProps, DdEvent } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    reviewer: { name: string | null; role: string | null; startedAt: string | null; dueAt: string | null; decision: string | null };
    requests: RequestRow[];
    flags: { total: number; awaiting: number; categories: number };
    documentCount: number;
    lastEvent: DdEvent | null;
}

function remaining(due: string | null) {
    if (!due) return '—';
    const ms = new Date(due).getTime() - Date.now();
    if (ms <= 0) return 'Overdue';
    const h = Math.floor(ms / 3.6e6);
    return `${Math.floor(h / 24)}d ${h % 24}h ${Math.floor((ms % 3.6e6) / 6e4)}m`;
}

/** DD-039 Human Review Status. */
export default function Review(props: Props) {
    const { case: c, reviewer, requests, flags, documentCount, lastEvent } = props;
    const r = CasePresenterRank(c.status);
    const inReview = ['review_required', 'partner_review'].includes(c.status);

    return (
        <CaseLayout
            page={props}
            active="review"
            title="Human Review Status"
            subtitle={inReview ? 'A human reviewer is assessing risk items and evidence.' : r > 5 ? 'Human review is complete.' : 'Human review starts after checks and screening.'}
            description="No decision is released until review is complete. You will be notified in the portal when the review is complete."
            roleNote="You are viewing the progress of the human review."
            bandNote="No extra charge for the review unless a scope expansion is approved."
            aside={
                <>
                    <Card title="Review status">
                        <dl className="space-y-1 text-xs">
                            {[['Status', inReview ? 'Under review' : r > 5 ? 'Complete' : 'Not started'], ['Review lock', inReview ? 'Active' : 'Released'], ['SLA performance', reviewer.dueAt && new Date(reviewer.dueAt) < new Date() && inReview ? 'Overdue' : 'On track'], ['Last updated', shortDate(lastEvent?.at ?? c.updatedAt, true)]].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                        </dl>
                    </Card>
                    <Card title="Risk summary (for awareness only)">
                        <dl className="space-y-1 text-xs">
                            {[['Total risk flags', flags.total], ['Categories affected', flags.categories], ['Information requests', requests.length], ['Awaiting your response', flags.awaiting + requests.filter((x) => x.status === 'open').length]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                        </dl>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">This is not a conclusion. A decision will be made after review.</p>
                    </Card>
                    <Card title="Fee information (review services)">
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt>TBCA Expert Review Fee</dt><dd>Included</dd></div>
                            <div className="flex justify-between"><dt>Report Generation Fee</dt><dd>Included</dd></div>
                            <div className="flex justify-between"><dt>Senior Review Fee</dt><dd>Quoted if required</dd></div>
                        </dl>
                    </Card>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                    <Timeline
                        title="Review process timeline"
                        items={[
                            { label: 'Risk items identified', sub: `${flags.total} risk flag(s) raised`, state: r >= 4 ? 'done' : 'pending' },
                            { label: 'Evidence submitted', sub: `${documentCount} documents provided`, state: r >= 2 ? 'done' : 'current' },
                            { label: 'Human review in progress', sub: 'Assigned to reviewer', state: r > 5 ? 'done' : inReview ? 'current' : 'pending', date: reviewer.startedAt },
                            { label: 'Reviewer decision', state: reviewer.decision ? 'done' : 'pending' },
                            { label: 'Senior review (if required)', state: r >= 7 ? 'done' : 'pending' },
                            { label: 'Review complete', state: r > 5 ? 'done' : 'pending' },
                        ]}
                    />
                </div>
                <div className="space-y-5 xl:col-span-8">
                    <Card title="Current reviewer assignment">
                        {reviewer.name ? (
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="flex items-center gap-3"><span className="flex size-14 items-center justify-center rounded-full bg-ink-950 text-gold-400"><UserRound className="size-7" aria-hidden="true" /></span><div><p className="font-semibold">{reviewer.name}</p><p className="text-xs text-ink-500">{reviewer.role}</p><span className="rounded bg-gold-50 px-1.5 text-[0.625rem] font-semibold text-gold-800">Primary Reviewer</span></div></div>
                                <dl className="space-y-1 text-xs"><dt className="text-ink-500">Team</dt><dd>Risk & Compliance Review Team</dd><dt className="text-ink-500">Location</dt><dd>Johannesburg, South Africa</dd></dl>
                                <dl className="space-y-1 text-xs"><dt className="text-ink-500">Review started</dt><dd>{shortDate(reviewer.startedAt, true)}</dd><dt className="text-ink-500">SLA target</dt><dd>{shortDate(reviewer.dueAt, true)}</dd><dt className="text-ink-500">Time remaining</dt><dd className="font-semibold text-risk-600">{inReview ? remaining(reviewer.dueAt) : '—'}</dd></dl>
                            </div>
                        ) : <p className="text-sm text-ink-500">A reviewer is assigned automatically when a risk flag or mandatory review rule locks release (G7).</p>}
                        {reviewer.decision && <p className="mt-3 rounded bg-verified-50 p-2 text-xs text-verified-700">Reviewer decision recorded.</p>}
                    </Card>
                    <RequestTable caseRef={c.reference} requests={requests} />
                    <p className="rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-xs text-ink-700"><strong>Safe and secure.</strong> All information you provide is encrypted, access-controlled and used only for this due diligence case. No raw vendor output is displayed.</p>
                </div>
            </div>
        </CaseLayout>
    );
}
