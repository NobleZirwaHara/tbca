import { useForm } from '@inertiajs/react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { ReleaseStrip, ReportDetails } from '@/Components/DueDiligence/ReportParts';
import { Card, rand, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdCasePageProps, DdCommercial, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    report: DdReportMeta;
    limitations: string[];
    acknowledgedAt: string | null;
    commercial: DdCommercial;
}

/** DD-043 Report Limitation Acknowledgement (G8). */
export default function Limitations(props: Props) {
    const { case: c, report, limitations, acknowledgedAt } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const form = useForm({ confirm: false });

    return (
        <CaseLayout
            page={props}
            active="report-ready"
            title="Report Limitation Acknowledgement"
            subtitle="Please review and acknowledge the important limitations before accessing your report."
            description="By acknowledging, you confirm that you understand the scope and use of this report."
            roleNote="You must acknowledge the limitations before viewing the report."
            bandNote="You have already paid for this report. No hidden release fee applies."
            aside={
                <>
                    <Card title="Acknowledgement is required">
                        <p className="text-xs text-ink-600">You must read and acknowledge the limitations above before you can access and use the report.</p>
                        <p className="mt-2 flex gap-2 rounded bg-attested-50 p-2 text-[0.6875rem] text-ink-700"><ShieldCheck className="size-4 shrink-0 text-attested-600" aria-hidden="true" />Acknowledgement will be recorded as part of the delivery audit. Once acknowledged, you can view and download the report.</p>
                    </Card>
                    <Card title="Commercial information">
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt>Payment state</dt><dd className="text-verified-700">Paid</dd></div>
                            <div className="flex justify-between"><dt>Outstanding balance</dt><dd>{rand(0, 2)}</dd></div>
                        </dl>
                    </Card>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="xl:col-span-4"><ReportDetails report={report} /></div>
                <Card title="Key limitations (summary)" className="xl:col-span-8">
                    <ul className="space-y-2.5">{limitations.map((l) => <li key={l} className="flex gap-2 text-[0.8125rem] text-ink-700"><AlertTriangle className="mt-0.5 size-4 shrink-0 text-attested-500" aria-hidden="true" />{l}</li>)}</ul>
                </Card>
            </div>
            <Card>
                {acknowledgedAt ? (
                    <div className="flex flex-wrap items-center gap-3">
                        <p className="flex-1 text-sm text-verified-700">Limitations acknowledged on {shortDate(acknowledgedAt, true)}.</p>
                        <ButtonLink href={`${base}/report`} trailingIcon="arrow-right">View Report</ButtonLink>
                    </div>
                ) : (
                    <form className="space-y-3" onSubmit={(e) => { e.preventDefault(); form.post(`${base}/limitations`); }}>
                        <Checkbox label={<><strong className="block text-ink-900">By acknowledging, you confirm that you have read, understood and accept the limitations of this report.</strong>This acknowledgement is required before you can access the full report.</>} checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                        {(form.errors.confirm || (form.errors as Record<string, string>).status) && <p className="text-xs text-risk-500">{form.errors.confirm ?? (form.errors as Record<string, string>).status}</p>}
                        <div className="flex flex-wrap gap-3">
                            <Button type="submit" disabled={!form.data.confirm || form.processing} trailingIcon="arrow-right">Acknowledge Limitations / View Report</Button>
                            <ButtonLink href={`${base}/report-ready`} variant="outline">Back</ButtonLink>
                        </div>
                    </form>
                )}
            </Card>
            <ReleaseStrip />
        </CaseLayout>
    );
}
