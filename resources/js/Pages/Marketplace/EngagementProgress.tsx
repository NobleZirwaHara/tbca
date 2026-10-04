import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, Info, Search, TriangleAlert } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, InfoRows, StageTrack, zarCode } from '@/Components/Marketplace/ui';
import type { MkDeliverable, MkEngagement } from '@/types/marketplace';

interface Props {
    engagement: MkEngagement;
    stages: string[];
    deliverable: MkDeliverable | null;
    budget: string | null;
    openDispute: string | null;
}

export default function EngagementProgress({ engagement: e, stages, deliverable, openDispute }: Props) {
    const [dispute, setDispute] = useState(false);
    const form = useForm({ type: 'Quality / Deliverable', subject: '', description: '', resolution_sought: '', amount_zar: '', priority: 'medium' });
    const timeline = e.meta.timeline ?? [];
    const current = stages[Math.min(e.trackerStep, stages.length) - 1];
    const canSee = deliverable && ['released', 'accepted', 'correction_requested', 'clarification_requested'].includes(deliverable.status);

    return (
        <>
            <Head title={`Work-in-Progress Tracker – ${e.reference}`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Client Portal', href: '/portal' }, { label: 'Marketplace', href: '/marketplace/my' }, { label: 'Engagements', href: '/marketplace/my' }, { label: e.reference }, { label: 'Progress' }]} />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div><h1 className="font-serif text-3xl font-bold text-ink-900">Work-in-Progress Tracker</h1><p className="text-sm text-ink-500">Track the status of your marketplace engagement from provider assignment to final delivery.</p></div>
                        <div className="flex items-center gap-6 rounded-[8px] border border-gold-300/60 bg-white px-5 py-3">
                            <div className="text-sm"><p className="font-bold">Engagement ID: {e.reference}</p><p className="text-ink-600">Service: {e.service}</p><p className="text-ink-600">Status: {e.stageLabel}</p></div>
                            <StatusPill status={e.stageLabel} tone="info" />
                        </div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="space-y-5 lg:col-span-8">
                            <Card title="Delivery Progress">
                                <StageTrack stages={stages} current={e.trackerStep} />
                                <p className="mt-4 flex items-center gap-2 rounded bg-controlled-50 px-3 py-2 text-sm text-controlled-700"><Info className="size-4" aria-hidden="true" /> Current Stage: {e.trackerStep > stages.length ? 'Delivered' : current} — {e.stageLabel}.</p>
                            </Card>
                            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                                <Card title="Current Activity">
                                    <div className="flex gap-3">
                                        <Search className="size-10 shrink-0 rounded border border-controlled-500/30 bg-controlled-50 p-2 text-controlled-600" aria-hidden="true" />
                                        <div className="text-sm">
                                            <p className="font-semibold text-ink-900">{e.stage === 'in_qa' ? 'Quality Assurance Review' : e.stageLabel}</p>
                                            <p className="text-ink-600">{e.stage === 'in_qa' ? 'The provider has submitted the deliverable. Our QA team is reviewing against the agreed methodology, data accuracy and quality standards.' : timeline[0]?.description ?? 'Work is progressing under TBCA oversight.'}</p>
                                            <InfoRows dense className="mt-2" rows={[['QA Reviewer', deliverable?.reviewer ?? e.meta.reviewer ?? 'Assigned on submission'], ['Latest update', timeline[0]?.at ?? '—']]} />
                                        </div>
                                    </div>
                                </Card>
                                <Card tone="cream" title="At-Risk Factors">
                                    <p className="flex items-center gap-2 text-sm text-ink-700"><TriangleAlert className="size-4 text-attested-500" aria-hidden="true" />{openDispute ? `Dispute ${openDispute} open` : e.stage === 'corrections' ? 'Correction cycle open' : 'None at this time'}</p>
                                    <p className="mt-2 text-xs text-ink-600">If delays occur, you will be notified immediately with revised timelines.</p>
                                </Card>
                            </div>
                            <Card title="Detailed Timeline">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[560px] text-[0.8125rem]">
                                        <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Date & Time', 'Event', 'Description', 'Owner', 'Status'].map((h) => <th key={h} scope="col" className="px-3 py-2 text-left">{h}</th>)}</tr></thead>
                                        <tbody className="divide-y divide-parchment-300">
                                            {timeline.length === 0 && <tr><td colSpan={5} className="px-3 py-6 text-center text-ink-400">No events yet.</td></tr>}
                                            {timeline.map((t, i) => <tr key={i}><td className="px-3 py-2 whitespace-nowrap">{t.at}</td><td className="px-3 py-2 font-medium">{t.event}</td><td className="px-3 py-2 text-ink-600">{t.description}</td><td className="px-3 py-2">{t.owner}</td><td className="px-3 py-2"><StatusPill status={t.status} /></td></tr>)}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                        <aside className="space-y-4 lg:col-span-4">
                            <Card title="Engagement Summary">
                                <InfoRows dense rows={[['Service Category', e.categoryLabel], ['Provider', e.provider?.name], ['Target Delivery Date', e.targetDate], ['Engagement Value', zarCode(e.valueZar)], ['Current Forecast', <StatusPill key="f" status={e.meta.forecast ?? 'On Track'} tone="good" />], ['QA Standard', e.qaStandard]]} />
                            </Card>
                            <Card title="Documents & Evidence">
                                <ul className="space-y-1.5 text-sm">{((e.meta.documents ?? []) as [string, string][]).map(([k, v]) => <li key={k} className="flex justify-between"><span>{k}</span><span className="flex items-center gap-1 text-xs text-verified-700">{v !== 'Pending' && <CheckCircle2 className="size-3.5" aria-hidden="true" />}{v}</span></li>)}</ul>
                                {canSee && <Link href={`/marketplace/engagements/${e.reference}/deliverables/${deliverable!.reference}`} className="mt-3 block text-sm font-semibold text-gold-700">Review deliverable {deliverable!.reference} →</Link>}
                            </Card>
                            <Card title="Need Help?">
                                <p className="text-sm text-ink-600">Questions about your engagement?</p>
                                <div className="mt-3 space-y-2">
                                    <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openAskQuestion({ subject: `Engagement ${e.reference}`, section: 'marketplace' })}>Ask a Question</Button>
                                    {openDispute ? <Link href={`/marketplace/engagements/${e.reference}/disputes/${openDispute}`} className="block text-center text-sm font-semibold text-risk-600">View open dispute {openDispute}</Link>
                                        : !['awaiting_payment', 'closed'].includes(e.stage) && <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => setDispute(true)}>Raise a Dispute</Button>}
                                </div>
                            </Card>
                        </aside>
                    </div>
                </div>
            </section>
            <Modal open={dispute} onClose={() => setDispute(false)} title="Raise a Marketplace Dispute" size="lg"
                footer={<><Button variant="outline" size="sm" type="button" onClick={() => setDispute(false)}>Cancel</Button><Button size="sm" type="button" disabled={form.processing} onClick={() => form.post(`/marketplace/engagements/${e.reference}/disputes`)}>Submit Dispute</Button></>}>
                <div className="grid gap-3 md:grid-cols-2">
                    <Field label="Dispute Type" required error={form.errors.type}>{(id) => <Select id={id} value={form.data.type} onChange={(ev) => form.setData('type', ev.target.value)} options={['Quality / Deliverable', 'Timeliness / Delay', 'Scope Change', 'Billing / Fees', 'Conduct']} />}</Field>
                    <Field label="Priority" required error={form.errors.priority}>{(id) => <Select id={id} value={form.data.priority} onChange={(ev) => form.setData('priority', ev.target.value)} options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]} />}</Field>
                    <Field label="Reason for Dispute" required className="md:col-span-2" error={form.errors.subject}>{(id) => <Input id={id} maxLength={150} value={form.data.subject} onChange={(ev) => form.setData('subject', ev.target.value)} />}</Field>
                    <Field label="Description" required className="md:col-span-2" error={form.errors.description}>{(id) => <Textarea id={id} maxLength={2000} value={form.data.description} onChange={(ev) => form.setData('description', ev.target.value)} />}</Field>
                    <Field label="Resolution Sought" required className="md:col-span-2" error={form.errors.resolution_sought}>{(id) => <Textarea id={id} maxLength={1000} value={form.data.resolution_sought} onChange={(ev) => form.setData('resolution_sought', ev.target.value)} />}</Field>
                    <Field label="Amount in Dispute (ZAR)" hint={`Up to ${zarCode(e.valueZar)}`} error={form.errors.amount_zar}>{(id) => <Input id={id} type="number" min={0} value={form.data.amount_zar} onChange={(ev) => form.setData('amount_zar', ev.target.value)} />}</Field>
                </div>
                <p className="mt-3 text-xs text-ink-500">Raising a dispute holds any provider payout for this engagement until resolution. Disputes follow the Marketplace Terms, QA Standards and South African law.</p>
            </Modal>
        </>
    );
}
