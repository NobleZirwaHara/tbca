import { Link, useForm } from '@inertiajs/react';
import { CheckCircle2, FileText, Gavel, Search, ShieldCheck, Trash2, UploadCloud } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { StatusPill } from '@/Components/ui/Kit';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, shortDate } from '@/Components/DueDiligence/Ui';
import type { DdCasePageProps, DdCommercial, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    report: DdReportMeta;
    sections: string[];
    findings: { value: string; label: string }[];
    disputes: { reference: string; status: string; outcome: string | null; created_at: string }[];
    commercial: DdCommercial;
}

/** DD-045 Open Dispute or False-Positive Review. TBCA corrects its own error without charge. */
export default function Dispute(props: Props) {
    const { case: c, report, sections, findings, disputes } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const canOpen = ['delivered', 'monitoring'].includes(c.status);
    const form = useForm<{ report_section: string; finding: string; finding_ref: string; page: string; description: string; remedy: string; remedy_other: string; freeze: boolean; files: File[] }>({
        report_section: sections.includes('Risk Register') ? 'Risk Register' : sections[0] ?? '', finding: findings[0]?.label ?? '', finding_ref: findings[0]?.value ?? '', page: '', description: '', remedy: 'correct', remedy_other: '', freeze: false, files: [],
    });
    const err = form.errors as Record<string, string>;

    return (
        <CaseLayout
            page={props}
            active="dispute"
            title="Open Dispute or False-Positive Review"
            subtitle="Challenge a finding or request a false-positive review."
            description="Submit your request below. TBCA will review your evidence and respond. TBCA corrects its own error without charge."
            roleNote="You are opening a dispute or requesting a false-positive review."
            bandNote="No additional fee if TBCA made the error."
            aside={
                <>
                    <Card title="Case information">
                        <dl className="space-y-1 text-xs">{[['Case ID', c.reference], ['Subject', c.subjectName], ['Report', `${report.title} ${report.version}`], ['Report approved', shortDate(report.approvedAt, true)]].map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-1"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                    </Card>
                    <Card title="Commercial information">
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt>Dispute review</dt><dd className="rounded bg-verified-50 px-1.5 text-verified-700">Included (TBCA error)</dd></div>
                            <div className="flex justify-between"><dt>New scope fees</dt><dd className="rounded bg-attested-50 px-1.5 text-attested-700">Quoted if required</dd></div>
                        </dl>
                    </Card>
                    {disputes.length > 0 && (
                        <Card title="Dispute history">
                            <ul className="space-y-2">{disputes.map((d) => <li key={d.reference}><Link href={`${base}/disputes/${d.reference}`} className="flex items-center gap-2 text-xs hover:text-gold-700"><span className="flex-1 font-mono">{d.reference}</span><StatusPill status={d.outcome ?? d.status} /></Link></li>)}</ul>
                        </Card>
                    )}
                </>
            }
        >
            {!canOpen && <p className="rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs">A dispute is already open or the case is not in a delivered state. You can follow existing disputes in the history panel.</p>}
            <div className="grid gap-5 xl:grid-cols-12">
                <form className="space-y-4 xl:col-span-7" onSubmit={(e) => { e.preventDefault(); form.post(`${base}/disputes`, { forceFormData: true }); }}>
                    <Card title="1. Select the item you want to challenge">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                            <Field label="Report section" error={err.report_section} className="lg:col-span-1">{(id) => <Select id={id} value={form.data.report_section} options={sections} onChange={(e) => form.setData('report_section', e.target.value)} />}</Field>
                            <Field label="Finding / item" error={err.finding} className="lg:col-span-2">
                                {(id) => findings.length ? (
                                    <Select id={id} value={form.data.finding_ref} options={findings} onChange={(e) => { const f = findings.find((x) => x.value === e.target.value); form.setData((d) => ({ ...d, finding_ref: e.target.value, finding: f?.label ?? '' })); }} />
                                ) : <Input id={id} value={form.data.finding} onChange={(e) => form.setData('finding', e.target.value)} />}
                            </Field>
                            <Field label="Page" error={err.page}>{(id) => <Input id={id} value={form.data.page} onChange={(e) => form.setData('page', e.target.value)} />}</Field>
                        </div>
                    </Card>
                    <Card title="2. Describe the issue">
                        <Field label="Explain why you believe this finding is incorrect or should be reviewed." error={err.description} hint={`${form.data.description.length} / 1000`}>{(id) => <Textarea id={id} maxLength={1000} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} />}</Field>
                    </Card>
                    <Card title="3. Upload supporting evidence (optional)">
                        <label className="flex cursor-pointer flex-col items-center gap-1 rounded-[8px] border-2 border-dashed border-parchment-500 p-4 text-xs text-ink-600 hover:border-gold-500">
                            <UploadCloud className="size-6" aria-hidden="true" />Drag & drop files here or <span className="font-semibold text-gold-700">Choose Files</span>
                            <input type="file" multiple className="sr-only" accept=".pdf,.jpg,.jpeg,.png,.docx" onChange={(e) => form.setData('files', [...form.data.files, ...Array.from(e.target.files ?? [])].slice(0, 5))} />
                        </label>
                        {form.data.files.length > 0 && <ul className="mt-2 space-y-1">{form.data.files.map((f, n) => <li key={n} className="flex items-center gap-2 text-xs"><FileText className="size-4 text-gold-600" aria-hidden="true" /><span className="flex-1">{f.name} · {(f.size / 1024).toFixed(0)} KB</span><button type="button" aria-label={`Remove ${f.name}`} onClick={() => form.setData('files', form.data.files.filter((_, j) => j !== n))}><Trash2 className="size-4 text-risk-500" /></button></li>)}</ul>}
                        {err.files && <p className="text-xs text-risk-500">{err.files}</p>}
                    </Card>
                    <Card title="4. Requested remedy">
                        <fieldset className="grid gap-2 sm:grid-cols-2">
                            <legend className="sr-only">What outcome are you requesting?</legend>
                            {[['correct', 'Remove or correct the finding'], ['reclassify', 'Reclassify risk level'], ['clarify', 'Add clarification note to the report'], ['other', 'Other (please specify)']].map(([v, l]) => (
                                <label key={v} className="flex items-center gap-2 text-[0.8125rem]"><input type="radio" name="remedy" value={v} checked={form.data.remedy === v} onChange={() => form.setData('remedy', v)} className="accent-gold-600" />{l}</label>
                            ))}
                        </fieldset>
                        {form.data.remedy === 'other' && <Field label="Specify the remedy" error={err.remedy_other} className="mt-2">{(id) => <Input id={id} value={form.data.remedy_other} onChange={(e) => form.setData('remedy_other', e.target.value)} />}</Field>}
                    </Card>
                    <Card title="5. Evidence freeze acknowledgement">
                        <Checkbox label="I understand that no further evidence can be added to this case unless TBCA requests it." checked={form.data.freeze} onChange={(e) => form.setData('freeze', e.target.checked)} />
                        {err.freeze && <p className="mt-1 text-xs text-risk-500">{err.freeze}</p>}
                        {err.status && <p className="mt-1 text-xs text-risk-500">{err.status}</p>}
                        <div className="mt-4 flex flex-wrap gap-3">
                            <Button type="submit" disabled={!canOpen || form.processing} trailingIcon="arrow-right">Submit Dispute / Review Request</Button>
                            <ButtonLink href={`${base}/report`} variant="outline">Return to Report</ButtonLink>
                        </div>
                    </Card>
                </form>
                <Card title="Review process" className="h-fit xl:col-span-5">
                    <ol className="space-y-4">
                        {[[CheckCircle2, 'Dispute received', 'Your request will be logged and reviewed.'], [Search, 'Independent review', 'An Independent Dispute Reviewer will assess your challenge and evidence.'], [Gavel, 'Outcome & response', 'We will notify you of the outcome and any next steps.']].map(([I, t, b]) => {
                            const Icon = I as typeof Gavel;
                            return <li key={t as string} className="flex gap-3"><Icon className="size-6 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-sm">{t as string}</strong><span className="text-xs text-ink-500">{b as string}</span></span></li>;
                        })}
                    </ol>
                    <p className="mt-4 flex gap-2 rounded bg-verified-50 p-3 text-xs"><ShieldCheck className="size-4 shrink-0 text-verified-600" aria-hidden="true" /><span><strong className="block">TBCA error correction</strong>If the issue is due to a TBCA error, it will be corrected at no charge.</span></p>
                    <p className="mt-2 rounded bg-controlled-50 p-3 text-xs"><strong className="block">New scope or evidence</strong>If new evidence or expanded scope is required, we will provide a quote before any work begins.</p>
                </Card>
            </div>
        </CaseLayout>
    );
}
