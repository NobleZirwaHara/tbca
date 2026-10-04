import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Clock, Download, Eye, FileText, Info, MessageSquare, Printer, RefreshCw, ShieldCheck } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { Field, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, CheckList, FactStrip, InfoRows, Notice, StageTrack } from '@/Components/Marketplace/ui';
import { cn } from '@/lib/cn';
import type { MkDeliverable, MkEngagement } from '@/types/marketplace';

interface Props { engagement: MkEngagement; deliverable: MkDeliverable; stages: string[]; reviewed: boolean }

const DECISIONS = [
    ['accept', 'Accept Deliverable', 'I confirm the deliverable meets the requirements. No corrections needed.', CheckCircle2, 'text-verified-500'],
    ['corrections', 'Request Corrections', 'The deliverable requires corrections or additional work.', RefreshCw, 'text-attested-500'],
    ['clarification', 'Request Clarification', 'I need more information or clarification before deciding.', MessageSquare, 'text-controlled-500'],
] as const;

export default function Deliverable({ engagement: e, deliverable: d, stages, reviewed }: Props) {
    const form = useForm({ decision: '', comment: '' });
    const rate = useForm({ rating: 5, body: '' });
    const qa = d.qa ?? {};
    const open = d.status === 'released';
    const accepted = d.status === 'accepted';
    const checks = Object.entries((qa.checks ?? {}) as Record<string, string>);

    return (
        <>
            <Head title={`Deliverable Receipt & QA Evidence – ${d.reference}`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Client Portal', href: '/portal' }, { label: 'Marketplace', href: '/marketplace/my' }, { label: e.reference, href: `/marketplace/engagements/${e.reference}/progress` }, { label: 'Deliverables' }, { label: d.reference }]} />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div><h1 className="font-serif text-3xl font-bold text-ink-900">Deliverable Receipt &amp; QA Evidence</h1><p className="text-sm text-ink-500">Review the deliverable, view QA evidence, and either accept or request corrections.</p></div>
                        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Printer className="size-4" aria-hidden="true" /> Print / Save Record</Button>
                    </div>
                    <FactStrip items={[
                        { label: 'Engagement ID', value: e.reference }, { label: 'Deliverable ID', value: d.reference }, { label: 'Approved Version', value: `v${d.version}${accepted ? ' FINAL' : ''}` },
                        { label: 'Release Status', value: <span className="text-verified-700">{accepted ? 'ACCEPTED BY CLIENT' : open ? 'APPROVED FOR CLIENT REVIEW' : d.status.replace(/_/g, ' ').toUpperCase()}</span> },
                        { label: 'Gate', value: 'GATE-MP-12' }, { label: 'Human Review', value: <span className="text-verified-700">COMPLETE</span> },
                    ]} />
                    <Card><StageTrack stages={stages} current={e.deliverableStep} /></Card>
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="space-y-5 lg:col-span-8">
                            <div className="grid gap-5 md:grid-cols-2">
                                <Card title="A. Deliverable Details">
                                    <div className="flex gap-3">
                                        <FileText className="size-10 shrink-0 text-ink-500" aria-hidden="true" />
                                        <div className="min-w-0"><p className="font-semibold break-words text-ink-900">{d.fileName}</p><StatusPill status={`Version ${d.version}`} tone="info" /></div>
                                    </div>
                                    <InfoRows dense className="mt-3" rows={[['Submitted by', e.provider?.name], ['Submitted on', d.submittedAt], ['Deliverable Type', d.meta.type ?? 'Final Deliverable'], ['Provider Submission Ref', d.meta.submission_ref], ['File Size', d.meta.size ?? '—'], ['Watermark', 'The Business Clinic.Africa™ – Approved Client Version']]} />
                                    <div className="mt-3 grid grid-cols-2 gap-2">
                                        <Button type="button" variant="outline" size="sm" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" /> Download</Button>
                                        <Button type="button" variant="outline" size="sm" onClick={() => openAskQuestion({ subject: `Preview ${d.reference}`, section: 'marketplace' })}><Eye className="size-4" aria-hidden="true" /> Preview</Button>
                                    </div>
                                    <p className="mt-3 flex items-center gap-2 text-xs text-ink-500">Virus scanned <StatusPill status="Clean" tone="good" /></p>
                                    {accepted && <Notice tone="good" className="mt-3">This is the approved final client version. Provider drafts are not client-releasable and are not shown here.</Notice>}
                                </Card>
                                <Card title="B. QA Evidence & Assurance">
                                    <div className="grid grid-cols-2 gap-2">
                                        {[['QA Status', (qa.outcome ?? 'Passed').toUpperCase()], ['Requirements Met', qa.requirements ?? '12 / 12'], ['Data Accuracy', qa.accuracy ?? '98%'], ['QA Score', `${qa.score ?? 92} / 100`]].map(([k, v]) => (
                                            <div key={k} className="rounded border border-parchment-300 p-2"><p className="text-[0.6875rem] text-ink-500">{k}</p><p className="font-bold text-verified-700">{v}</p></div>
                                        ))}
                                    </div>
                                    <InfoRows dense className="mt-3" rows={[['QA Standard ID', e.qaStandard], ['Reviewer', qa.reviewer ?? d.reviewer], ['Final QA Date', qa.date], ['Assurance Record ID', qa.record]]} />
                                    {checks.length > 0 && <ul className="mt-3 grid grid-cols-2 gap-1 text-xs">{checks.map(([k, v]) => <li key={k} className="flex items-center gap-1"><CheckCircle2 className="size-3.5 text-verified-500" aria-hidden="true" />{k}: {v}</li>)}</ul>}
                                    {(qa.evidence ?? []).length > 0 && <div className="mt-3"><p className="text-xs font-semibold text-ink-900">QA Evidence Pack</p><ul className="mt-1 space-y-1 text-xs text-ink-600">{(qa.evidence as string[]).map((f) => <li key={f} className="flex gap-1"><FileText className="size-3.5" aria-hidden="true" />{f}</li>)}</ul></div>}
                                </Card>
                            </div>
                            <div className="grid gap-5 md:grid-cols-2">
                                <Card title="C. Control Status">
                                    <ul className="space-y-1.5 text-sm">{[['Rights Control', 'Confirmed'], ['Privacy Control', 'Confirmed'], ['Security Control', 'Confirmed'], ['Professional Boundary Control', 'Passed']].map(([k, v]) => <li key={k} className="flex justify-between"><span className="flex items-center gap-2"><ShieldCheck className="size-4 text-gold-600" aria-hidden="true" />{k}</span><span className="font-semibold text-verified-700">{v}</span></li>)}</ul>
                                    <p className="mt-3 rounded bg-parchment-200 p-2 text-xs text-ink-600"><strong>Limitations &amp; Notes.</strong> This deliverable supports internal decision making based on the information and sources provided. It does not constitute legal, tax, engineering, or lender due-diligence opinion.</p>
                                </Card>
                                <Card title="D. Deliverable Summary">
                                    <p className="text-xs font-semibold text-ink-900">Scope Delivered</p>
                                    <CheckList items={(e.meta.scope_items ?? []).slice(0, 5)} />
                                    <p className="mt-3 text-xs font-semibold text-ink-900">Notes from Provider</p>
                                    <p className="text-sm text-ink-600">{d.meta.notes}</p>
                                    {e.briefRef && <Link href={`/marketplace/briefs/${e.briefRef}/review`} className="mt-2 block text-sm font-semibold text-controlled-600">View Scope &amp; Price Confirmation</Link>}
                                </Card>
                            </div>
                        </div>
                        <aside className="space-y-4 lg:col-span-4">
                            {open ? (
                                <Card tone="green" title="Your Decision">
                                    <form onSubmit={(ev) => { ev.preventDefault(); form.post(`/marketplace/engagements/${e.reference}/deliverables/${d.reference}/decision`, { preserveScroll: true }); }}>
                                        <p className="mb-3 text-sm text-ink-600">Please review the deliverable and choose an action.</p>
                                        <div role="radiogroup" aria-label="Decision" className="space-y-2">
                                            {DECISIONS.map(([k, t, body, I, tone]) => (
                                                <button key={k} type="button" role="radio" aria-checked={form.data.decision === k} onClick={() => form.setData('decision', k)}
                                                    className={cn('flex w-full gap-3 rounded-[6px] border bg-white p-3 text-left', form.data.decision === k ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                                    <I className={cn('size-5 shrink-0', tone)} aria-hidden="true" />
                                                    <span><span className="block text-sm font-semibold text-ink-900">{t}</span><span className="text-xs text-ink-500">{body}</span></span>
                                                </button>
                                            ))}
                                        </div>
                                        {form.data.decision && form.data.decision !== 'accept' && (
                                            <Field label="Details" required className="mt-3" error={form.errors.comment}>{(id) => <Textarea id={id} value={form.data.comment} onChange={(ev) => form.setData('comment', ev.target.value)} maxLength={1000} />}</Field>
                                        )}
                                        {d.meta.clarification && <p className="mt-2 text-xs text-ink-500">Last clarification ({d.meta.clarification_at}): {d.meta.clarification}</p>}
                                        <Button type="submit" className="mt-3 w-full" disabled={!form.data.decision || form.processing} trailingIcon="arrow-right">Submit Decision</Button>
                                    </form>
                                </Card>
                            ) : (
                                <Card title="Decision">
                                    <StatusPill status={d.status} />
                                    <p className="mt-2 text-sm text-ink-600">{accepted ? `Accepted on ${d.decidedAt}. The provider payout has been released for processing.` : d.status === 'correction_requested' ? 'Corrections requested. A revised version will be QA-reviewed before release.' : 'This version is not open for a decision.'}</p>
                                    {d.meta.decision_comment && <p className="mt-2 text-xs text-ink-500">“{d.meta.decision_comment}”</p>}
                                </Card>
                            )}
                            <Card tone="cream" title="Important">
                                <ul className="space-y-1.5 text-xs text-ink-700"><li className="flex gap-1.5"><Clock className="size-3.5" aria-hidden="true" />You have 5 business days to respond.</li><li>If no response is received, we will follow up.</li><li>Corrections (if any) will be tracked in the next stage.</li><li>New scope is not a correction — submit a new brief.</li></ul>
                            </Card>
                            {['accepted', 'closed'].includes(e.stage) || accepted ? (!reviewed && (
                                <Card title="Rate the provider">
                                    <form className="space-y-3" onSubmit={(ev) => { ev.preventDefault(); rate.post(`/marketplace/engagements/${e.reference}/review`, { preserveScroll: true }); }}>
                                        <Field label="Rating">{(id) => <Select id={id} value={String(rate.data.rating)} onChange={(ev) => rate.setData('rating', Number(ev.target.value))} options={['5', '4', '3', '2', '1']} />}</Field>
                                        <Field label="Comment" required error={rate.errors.body}>{(id) => <Textarea id={id} value={rate.data.body} onChange={(ev) => rate.setData('body', ev.target.value)} maxLength={1000} />}</Field>
                                        <Button type="submit" size="sm" disabled={rate.processing}>Submit rating</Button>
                                    </form>
                                </Card>
                            )) : null}
                            <Card title="Need Help?">
                                <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openAskQuestion({ subject: `Deliverable ${d.reference}`, section: 'marketplace' })}><Info className="size-4" aria-hidden="true" /> Ask a Question</Button>
                                <Link href={`/marketplace/engagements/${e.reference}/progress`} className="mt-2 block text-center text-sm font-semibold text-gold-700">Back to WIP Tracker / Raise Issue</Link>
                            </Card>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
