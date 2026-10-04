import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { Ban, Flag, Lock, MessageSquare, RefreshCw, ShieldCheck, Terminal, Upload, Headphones } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, Ticks, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdEvent } from '@/types/due-diligence';

interface FindingRow { id: number; reference: string; check_category: string; flag_type: string; source: string; severity: string; status: string; summary: string | null; response_type: string | null; client_response: string | null; detectedAt: string | null }
interface Props extends DdCasePageProps {
    findings: FindingRow[];
    lastEvent: DdEvent | null;
}

const SEV: Record<string, string> = { low: 'bg-verified-500', medium: 'bg-risk-500', high: 'bg-risk-600', critical: 'bg-risk-700' };
const STATUS_LABEL: Record<string, string> = { open: 'Requires your input', client_responded: 'Response received — reviewing', reviewing: 'Under human review', cleared: 'Cleared', confirmed: 'Confirmed by reviewer' };

/** DD-038 Risk Flag Notice: a signal under review, never a conclusion. */
export default function Risk(props: Props) {
    const { case: c, findings, lastEvent } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const [active, setActive] = useState<FindingRow | null>(null);
    const form = useForm<{ response_type: string; response: string; file: File | null }>({ response_type: 'explanation', response: '', file: null });
    const open = (f: FindingRow, type: string) => { form.setData({ response_type: type, response: '', file: null }); setActive(f); };
    const count = (s: string[]) => findings.filter((f) => s.includes(f.status)).length;

    return (
        <CaseLayout
            page={props}
            active="risk"
            title="Risk Flag Notice"
            subtitle={findings.length ? 'We have identified a potential risk signal that requires your attention.' : 'No risk flags have been raised on this case.'}
            description="Our screening may detect items that need further review. A flag is not a conclusion. You will have an opportunity to respond."
            roleNote="Review the flag and provide any additional information."
            bandNote="No additional fee for responding to this notice."
            aside={
                <>
                    <Card title="Flag summary">
                        <dl className="space-y-1 text-xs">
                            {[['Total flags', findings.length], ['Reviewing', count(['client_responded', 'reviewing'])], ['Cleared', count(['cleared'])], ['Requires your input', count(['open'])]].map(([k, v]) => <div key={k as string} className="flex justify-between"><dt>{k}</dt><dd className="font-semibold">{v}</dd></div>)}
                        </dl>
                    </Card>
                    <Card title="Risk context">
                        <dl className="space-y-1 text-xs">
                            <div className="flex justify-between"><dt>Overall risk state</dt><dd className="rounded bg-risk-50 px-1.5 text-risk-700">{c.chips[7]?.value}</dd></div>
                            <div className="flex justify-between"><dt>Last updated</dt><dd>{shortDate(lastEvent?.at ?? c.updatedAt, true)}</dd></div>
                        </dl>
                    </Card>
                </>
            }
        >
            {findings.length === 0 && <Card><p className="text-sm text-ink-600">No risk flags or the report is not ready. If a potential match is found, you will see a review notice here — never raw vendor data.</p></Card>}
            {findings.map((f) => (
                <div key={f.id} className="grid gap-5 xl:grid-cols-12">
                    <Card title="Flagged item" className="xl:col-span-7">
                        <div className="grid gap-4 sm:grid-cols-[8rem_1fr]">
                            <div className="flex flex-col items-center gap-2">
                                <span className="flex size-20 items-center justify-center rounded-full bg-risk-50"><Flag className="size-9 text-risk-600" aria-hidden="true" /></span>
                                <span className={cn('rounded px-2 py-0.5 text-[0.6875rem] font-bold text-white capitalize', SEV[f.severity])}>{f.severity} Risk Flag</span>
                            </div>
                            <dl className="space-y-1.5 text-xs">
                                {[['Subject', c.subjectName], ['Check Category', f.check_category], ['Flag Type', f.flag_type], ['Source', f.source], ['First Detected', shortDate(f.detectedAt, true)], ['Reference ID', f.reference], ['Status', STATUS_LABEL[f.status] ?? f.status]].map(([k, v]) => <div key={k} className="grid grid-cols-3 gap-2"><dt className="text-ink-500">{k}</dt><dd className="col-span-2 font-medium">{v}</dd></div>)}
                            </dl>
                        </div>
                        <div className="mt-4 rounded-[8px] bg-attested-50 p-3 text-xs text-ink-700">
                            <strong className="block">What this means</strong>
                            {f.summary ?? 'A potential match was identified that may be relevant to the subject.'} This is a risk signal only. No conclusion has been made.
                        </div>
                        {f.client_response && <p className="mt-3 rounded bg-parchment-100 p-3 text-xs"><strong>Your response ({f.response_type?.replace('_', ' ')}):</strong> {f.client_response}</p>}
                        <div className="mt-3 rounded-[8px] border border-parchment-400 p-3 text-xs text-ink-600"><strong className="block text-ink-900">Evidence snapshot (restricted)</strong>Raw vendor output is not displayed. You see only the minimum information required.</div>
                    </Card>
                    <Card title="What you can do" className="xl:col-span-5">
                        {['open', 'client_responded'].includes(f.status) ? (
                            <ul className="space-y-2">
                                {[[MessageSquare, 'Provide your explanation', 'Share your perspective or additional context.', 'explanation'], [Upload, 'Upload supporting documents', 'Provide documents that may help clarify.', 'explanation'], [Ban, 'Mark as not relevant', 'Explain why this item is not relevant to this case.', 'not_relevant'], [RefreshCw, 'Request re-screen', 'Ask us to re-check with updated parameters.', 'rescreen']].map(([I, t, b, type]) => {
                                    const Icon = I as typeof Flag;
                                    return <li key={t as string}><button type="button" onClick={() => open(f, type as string)} className="flex w-full gap-2 rounded-[6px] border border-parchment-400 p-2.5 text-left hover:border-gold-500"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-[0.8125rem]">{t as string}</strong><span className="text-xs text-ink-500">{b as string}</span></span></button></li>;
                                })}
                                <li><button type="button" onClick={() => openAskQuestion({ subject: `Risk flag ${f.reference}`, section: 'due-diligence' })} className="flex w-full gap-2 rounded-[6px] border border-parchment-400 p-2.5 text-left hover:border-gold-500"><Headphones className="size-5 text-gold-600" aria-hidden="true" /><span><strong className="block text-[0.8125rem]">Ask your Case Manager</strong><span className="text-xs text-ink-500">Discuss this flag with your Case Manager.</span></span></button></li>
                            </ul>
                        ) : <p className="text-sm text-ink-600">{STATUS_LABEL[f.status]}. No further input is needed.</p>}
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <div><p className="mb-1 text-xs font-semibold">Next steps</p><Ticks items={['You can provide information or documents.', 'Our team will review your response.', 'We will update the risk status after review.']} /></div>
                            <div><p className="mb-1 text-xs font-semibold">Important to know</p><Ticks items={['One flag does not determine the outcome.', 'You have the right to respond.', 'All information remains confidential and secure.']} /></div>
                        </div>
                    </Card>
                </div>
            ))}
            <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-3">
                <p className="flex gap-2"><Lock className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">Stage lock</strong>We cannot proceed to the next stage until open flags are reviewed and your response is considered.</span></p>
                <p className="flex gap-2"><ShieldCheck className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">Secure and confidential</strong>All flag details are encrypted, access-controlled and used only for this case.</span></p>
                <p className="flex gap-2"><Terminal className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">System event</strong>{lastEvent ? `${lastEvent.code} | ${lastEvent.type}` : 'None'}</span></p>
            </div>
            <Modal open={active !== null} onClose={() => setActive(null)} title={`Respond to ${active?.reference ?? ''}`} footer={<Button type="button" disabled={form.processing} onClick={() => active && form.post(`${base}/findings/${active.id}/respond`, { preserveScroll: true, forceFormData: true, onSuccess: () => setActive(null) })}>Submit response</Button>}>
                <div className="space-y-3">
                    <p className="text-xs text-ink-500">Response type: <strong className="capitalize">{form.data.response_type.replace('_', ' ')}</strong></p>
                    <Field label="Your response" error={form.errors.response} required>{(id) => <Textarea id={id} value={form.data.response} onChange={(e) => form.setData('response', e.target.value)} />}</Field>
                    <Field label="Supporting document (optional)" error={form.errors.file}>{(id) => <input id={id} type="file" accept=".pdf,.jpg,.jpeg,.png,.docx" className="text-xs" onChange={(e) => form.setData('file', e.target.files?.[0] ?? null)} />}</Field>
                </div>
            </Modal>
        </CaseLayout>
    );
}
