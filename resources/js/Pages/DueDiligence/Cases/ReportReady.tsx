import { BadgeCheck, CalendarClock, CheckCircle2, FileText, Hash, Lock, UserCheck } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { DeliverablesTable, ReleaseStrip } from '@/Components/DueDiligence/ReportParts';
import { Card, rand, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdCasePageProps, DdCommercial, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    report: DdReportMeta;
    commercial: DdCommercial;
}

/** DD-042 Report Ready. */
export default function ReportReady(props: Props) {
    const { case: c, report, commercial } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const delivered = ['delivered', 'disputed', 'monitoring', 'closed'].includes(c.status);
    const next = delivered ? `${base}/report` : `${base}/limitations`;

    return (
        <CaseLayout
            page={props}
            active="report-ready"
            title="Report Ready"
            subtitle="Your report has been approved and is ready for release."
            description="Review the final deliverables and proceed to the limitation acknowledgement to access your report."
            roleNote="Review the final deliverables and proceed to limitations."
            actions={<ButtonLink href={next} trailingIcon="arrow-right">{delivered ? 'View Report' : 'Proceed to Limitations'}</ButtonLink>}
            aside={
                <>
                    <Card title="Payment & entitlement">
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt>Payment state</dt><dd className="rounded bg-verified-50 px-1.5 text-verified-700">Paid</dd></div>
                            <div className="flex justify-between"><dt>Entitlement state</dt><dd className="rounded bg-verified-50 px-1.5 text-verified-700">Active</dd></div>
                            <div className="flex justify-between"><dt>Final milestone</dt><dd>Settled</dd></div>
                            <div className="flex justify-between"><dt>Outstanding balance</dt><dd>{rand(0, 2)}</dd></div>
                            {commercial.credits > 0 && <div className="flex justify-between text-verified-700"><dt>Credits issued</dt><dd>{rand(commercial.credits, 2)}</dd></div>}
                        </dl>
                    </Card>
                    <Card title="Release certificate">
                        <p className="flex gap-2 text-xs"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />Release certificate issued. All prerequisites for release have been met.</p>
                    </Card>
                    <Card title="Next step">
                        <p className="text-xs text-ink-600">{delivered ? 'Limitations acknowledged. Your report is available in the secure viewer.' : 'Review and acknowledge the report limitations. You must acknowledge the limitations before accessing your report.'}</p>
                        <ButtonLink href={next} size="sm" className="mt-3 w-full" trailingIcon="arrow-right">{delivered ? 'Open Secure Viewer' : 'Proceed to Limitations'}</ButtonLink>
                    </Card>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <Card title="Report approval summary" className="xl:col-span-5">
                    <ul className="space-y-3 text-xs">
                        {[[CheckCircle2, 'Report status', 'Approved and ready for release'], [UserCheck, 'Report approved by', `${report.approvedBy ?? '—'}, Report Approver`], [CalendarClock, 'Approval date & time', shortDate(report.approvedAt, true)], [FileText, 'Report version', report.version], [Hash, 'Report hash (SHA-256)', report.hash ? `${report.hash.slice(0, 28)}…` : '—'], [Lock, 'Release lock', 'Released'], [BadgeCheck, 'Report ready since', shortDate(report.approvedAt, true)]].map(([I, k, v]) => {
                            const Icon = I as typeof Lock;
                            return <li key={k as string} className="flex gap-2"><Icon className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">{k as string}</strong><span className="font-mono text-ink-600">{v as string}</span></span></li>;
                        })}
                    </ul>
                </Card>
                <Card title="Final deliverables" className="xl:col-span-7">
                    <DeliverablesTable report={report} />
                    <p className="mt-3 flex gap-2 rounded bg-verified-50 p-3 text-xs text-ink-700"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /><span><strong className="block">All deliverables are final and approved.</strong>You are ready to acknowledge the report limitations to access your report.</span></p>
                </Card>
            </div>
            <ReleaseStrip />
        </CaseLayout>
    );
}
