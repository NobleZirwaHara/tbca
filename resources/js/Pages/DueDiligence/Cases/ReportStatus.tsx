import { CheckCircle2, Circle, FileText, Info, Link2, ShieldCheck, UserX } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { RequestTable, TaskTable, Timeline, type RequestRow, type TaskRow } from '@/Components/DueDiligence/ReviewParts';
import { Card } from '@/Components/DueDiligence/Ui';
import { CasePresenterRank } from '@/Components/DueDiligence/rank';
import type { DdCasePageProps } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    tasks: TaskRow[];
    clarifications: RequestRow[];
    report: { version: string; status: string; sections: string[] } | null;
    partnerUsed: boolean;
}

/** DD-041 Draft Report and QA Status. */
export default function ReportStatus(props: Props) {
    const { case: c, tasks, clarifications, report, partnerUsed } = props;
    const r = CasePresenterRank(c.status);
    const qaDone = tasks.length > 0 && tasks.every((t) => t.status === 'completed');
    const state = (min: number, current?: boolean): 'done' | 'current' | 'pending' => (r >= min ? 'done' : current ? 'current' : 'pending');

    return (
        <CaseLayout
            page={props}
            active="report-status"
            title="Draft Report and QA Status"
            subtitle={c.status === 'report_draft' ? 'The draft report has been assembled and is undergoing quality assurance before client release.' : r >= 7 ? 'Your report has passed QA.' : 'The draft report is assembled once checks and review are complete.'}
            description="This is not yet the final report. Every finding must trace to source evidence before release."
            roleNote="You are viewing draft report QA status."
            bandNote="Included in your approved plan. No hidden costs or surcharges."
            actions={r >= 7 ? <ButtonLink href={`/due-diligence/cases/${c.reference}/report-ready`} trailingIcon="arrow-right">View Report Ready</ButtonLink> : undefined}
            aside={
                <>
                    <Card title="Draft report status">
                        <dl className="space-y-1 text-xs">
                            {[['Status', c.status === 'report_draft' ? 'Under QA review' : r >= 7 ? 'Approved' : 'Not started'], ['QA SLA performance', 'On track'], ['Review lock', c.status === 'report_draft' ? 'Locked for QA' : r >= 7 ? 'Released' : 'Pending'], ['Report version', report?.version ?? '—']].map(([k, v]) => <div key={k} className="flex justify-between"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                        </dl>
                    </Card>
                    <Card title="Draft report contents">
                        <ul className="grid grid-cols-1 gap-1 text-xs">
                            {(report?.sections ?? ['Executive Summary', 'Scope & Method', 'Risk Register', 'Management Responses', 'Limitations', 'Appendices']).map((s) => <li key={s} className="flex items-center gap-2">{report ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : <Circle className="size-4 text-ink-300" aria-hidden="true" />}{s}</li>)}
                        </ul>
                    </Card>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4">
                    <Timeline
                        title="Draft report workflow"
                        items={[
                            { label: 'Evidence intake complete', state: state(2) },
                            { label: 'Checks and screening complete', state: state(4, r === 3) },
                            { label: 'Human review complete', state: state(6, r === 4) },
                            ...(partnerUsed ? [{ label: 'Qualified partner review complete', state: state(6, r === 5) }] : []),
                            { label: 'Draft report assembled', state: state(6) },
                            { label: 'QA review in progress', state: qaDone || r >= 7 ? 'done' : r === 6 ? 'current' : 'pending' },
                            { label: 'Senior reviewer approval', state: state(7) },
                            { label: 'Client-ready report release', state: state(8, r === 7) },
                        ]}
                    />
                </div>
                <div className="space-y-5 xl:col-span-8">
                    <Card title="Current QA assignment">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="flex items-center gap-3"><span className="flex size-12 items-center justify-center rounded-[8px] bg-ink-950 text-gold-400"><ShieldCheck className="size-6" aria-hidden="true" /></span><div><p className="font-semibold">TBCA Quality Assurance Desk</p><span className="rounded bg-gold-50 px-1.5 text-[0.625rem] font-semibold text-gold-800">Senior Reviewer</span><p className="text-xs text-ink-500">Independent QA Function</p></div></div>
                            <dl className="space-y-1 text-xs"><dt className="text-ink-500">Review type</dt><dd>Quality Assurance Review</dd><dt className="text-ink-500">Scope</dt><dd>Full draft report and supporting evidence</dd></dl>
                            <dl className="space-y-1 text-xs"><dt className="text-ink-500">Location</dt><dd>Johannesburg, South Africa</dd><dt className="text-ink-500">Contact</dt><dd>qa.desk@thebusinessclinic.africa</dd></dl>
                        </div>
                    </Card>
                    <Card title="QA checklist"><TaskTable tasks={tasks} note="All checklist items are mandatory before senior reviewer approval." /></Card>
                    <RequestTable caseRef={c.reference} requests={clarifications} title="Open clarifications" />
                </div>
            </div>
            <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-4">
                {[[FileText, 'Draft only', 'This is a draft report under QA. Not yet released to the client as final.'], [Link2, 'Evidence linked', 'Every finding must trace to source evidence.'], [UserX, 'No conclusion yet', 'QA may still revise wording or classification.'], [Info, 'QA required', 'Release occurs only after senior reviewer approval.']].map(([I, t, b]) => {
                    const Icon = I as typeof Info;
                    return <p key={t as string} className="flex gap-2"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">{t as string}</strong>{b as string}</span></p>;
                })}
            </div>
        </CaseLayout>
    );
}
