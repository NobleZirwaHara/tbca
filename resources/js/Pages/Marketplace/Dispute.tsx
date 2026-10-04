import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Download, FileText, Info, Send, TriangleAlert, Users } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tag } from '@/Components/ui/Kit';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Card, InfoRows, Notice, StageTrack, zarCode, priorityTone } from '@/Components/Marketplace/ui';
import type { MkDispute, MkEngagement } from '@/types/marketplace';

export default function Dispute({ engagement: e, dispute: d, stages }: { engagement: MkEngagement; dispute: MkDispute; stages: string[] }) {
    const msg = useForm({ body: '', document: '' });
    const closed = ['closed', 'withdrawn'].includes(d.status);
    const timeline = (d.meta.timeline ?? []) as { at: string; title: string; body: string }[];
    const messages = (d.meta.messages ?? []) as { from: string; role: string; at: string; body: string }[];
    const docs = (d.meta.documents ?? []) as { name: string; by: string; at: string; size: string }[];

    return (
        <>
            <Head title={`Marketplace Dispute – ${d.reference}`} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca space-y-5">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Client Portal', href: '/portal' }, { label: 'Marketplace', href: '/marketplace/my' }, { label: e.reference, href: `/marketplace/engagements/${e.reference}/progress` }, { label: 'Disputes' }, { label: d.reference }]} />
                    <div className="flex flex-wrap items-start justify-between gap-4">
                        <div><h1 className="font-serif text-3xl font-bold text-ink-900">Marketplace Dispute</h1><p className="text-sm text-ink-500">Raise, track and resolve disputes fairly with transparency and accountability.</p></div>
                        <div className="grid grid-cols-2 gap-6 rounded-[8px] border border-gold-300/60 bg-white px-5 py-3 text-sm">
                            <div><p className="font-bold">Engagement ID: {e.reference}</p><p className="text-ink-600">Service: {e.service}</p><p className="text-ink-600">Provider: {e.provider?.name}</p></div>
                            <div><p className="font-bold">Dispute ID: {d.reference}</p><p className="flex items-center gap-1 text-ink-600">Status: <StatusPill status={d.status} /></p></div>
                        </div>
                    </div>
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="space-y-5 lg:col-span-8">
                            <Card title="Dispute Resolution Process">
                                <StageTrack stages={stages} current={d.step} />
                                <Notice tone="gold" className="mt-4">Our Dispute Resolution process follows the Marketplace Terms, QA Standards and South African law.</Notice>
                            </Card>
                            <div className="grid gap-5 md:grid-cols-3">
                                <Card title="Dispute Details">
                                    <InfoRows dense rows={[['Reason for Dispute', d.subject], ['Description', d.description], ['Resolution Sought', d.meta.resolution_sought], ['Supporting Evidence', `${docs.length} files attached`]]} />
                                </Card>
                                <Card title="Timeline">
                                    <ol className="space-y-3 border-l-2 border-parchment-400 pl-3 text-sm">
                                        {timeline.map((t, i) => <li key={i}><p className="text-xs font-semibold text-ink-900">{t.at}</p><p className="font-medium text-controlled-700">{t.title}</p><p className="text-xs text-ink-500">{t.body}</p></li>)}
                                        {!closed && <li><p className="text-xs text-ink-400">Next Step</p><p className="text-xs text-ink-600">Decision expected by {d.responseDue}.</p></li>}
                                    </ol>
                                </Card>
                                <Card title="Communication Log">
                                    <ul className="max-h-72 space-y-2 overflow-y-auto">
                                        {messages.map((m, i) => <li key={i} className="rounded border border-parchment-300 bg-white p-2 text-xs"><p className="font-semibold text-ink-900">{m.from}</p><p className="text-ink-400">{m.at}</p><p className="mt-1 text-ink-700">{m.body}</p></li>)}
                                    </ul>
                                    {!closed && (
                                        <form className="mt-3 space-y-2" onSubmit={(ev) => { ev.preventDefault(); msg.post(`/marketplace/engagements/${e.reference}/disputes/${d.reference}/messages`, { preserveScroll: true, onSuccess: () => msg.reset() }); }}>
                                            <Field label="Message" error={msg.errors.body}>{(id) => <Textarea id={id} value={msg.data.body} onChange={(ev) => msg.setData('body', ev.target.value)} maxLength={1500} className="min-h-16" />}</Field>
                                            <Field label="Attach evidence (file name)" hint="PDF, DOCX, XLSX, PPTX, ZIP · 20MB per file">{(id) => <Input id={id} value={msg.data.document} onChange={(ev) => msg.setData('document', ev.target.value)} />}</Field>
                                            <Button type="submit" size="sm" variant="outline" className="w-full" disabled={msg.processing}><Send className="size-4" aria-hidden="true" /> Send Message</Button>
                                        </form>
                                    )}
                                </Card>
                            </div>
                            <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
                                <Card title="Dispute Documents & Evidence">
                                    <ul className="divide-y divide-parchment-300 text-sm">
                                        {docs.length === 0 && <li className="py-2 text-ink-400">No documents yet.</li>}
                                        {docs.map((f) => <li key={f.name} className="flex flex-wrap items-center justify-between gap-2 py-2"><span className="flex items-center gap-2"><FileText className="size-4" aria-hidden="true" />{f.name}</span><span className="flex items-center gap-3 text-xs text-ink-500">Uploaded by {f.by} · {f.at} · {f.size}<Download className="size-4" aria-label="Download" /></span></li>)}
                                    </ul>
                                </Card>
                                <Card tone="cream" title="Important Notice">
                                    <ul className="space-y-1.5 text-xs text-ink-700"><li>Please remain professional and provide factual information.</li><li>False or misleading claims may result in termination of access.</li><li>All communications are logged for transparency.</li></ul>
                                </Card>
                            </div>
                        </div>
                        <aside className="space-y-4 lg:col-span-4">
                            <Card title="Dispute Summary">
                                <InfoRows dense rows={[
                                    ['Dispute Type', <Tag key="t" tone="gold" className="normal-case">{d.type}</Tag>], ['Raised By', d.meta.raised_by ?? 'You (Client)'], ['Raised On', d.raisedOn],
                                    ['Response Due', <span key="r">{d.responseDue} {d.responseDaysLeft !== null && !closed && <span className="text-risk-600">({d.responseDaysLeft} days left)</span>}</span>],
                                    ['Priority Level', <StatusPill key="p" status={d.priority} tone={priorityTone(d.priority)} />], ['Linked Deliverable', d.meta.linked_deliverable], ['Linked Stage', d.meta.linked_stage], ['Amount in Dispute', zarCode(d.amountZar)],
                                ]} />
                            </Card>
                            <Card title="Participants">
                                <ul className="space-y-2 text-sm">{[['Client (You)', 'The Business Clinic.Africa™'], ['Provider', e.provider?.name], ['TBCA Dispute Resolution Team', 'Independent Review Panel']].map(([k, v]) => <li key={k} className="flex gap-2"><Users className="size-4 text-ink-400" aria-hidden="true" /><span><span className="block font-semibold text-ink-900">{k}</span><span className="text-xs text-ink-500">{v}</span></span></li>)}</ul>
                            </Card>
                            <Card title="Need Help?"><Button type="button" variant="outline" size="sm" className="w-full" onClick={() => openAskQuestion({ subject: `Dispute ${d.reference}`, section: 'marketplace' })}><Info className="size-4" aria-hidden="true" /> Ask a Question</Button></Card>
                        </aside>
                    </div>
                    <div className="flex flex-wrap justify-between gap-3">
                        <Link href={`/marketplace/engagements/${e.reference}/progress`} className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-ink-300 bg-white px-5 text-sm"><ArrowLeft className="size-4" aria-hidden="true" /> Back to Engagement</Link>
                        <div className="flex gap-3">
                            {!closed && !['won', 'lost'].includes(d.status) && <Button type="button" variant="outline" onClick={() => confirm('Withdraw this dispute?') && router.post(`/marketplace/engagements/${e.reference}/disputes/${d.reference}/withdraw`)}><TriangleAlert className="size-4" aria-hidden="true" /> Withdraw Dispute</Button>}
                            <Button type="button" onClick={() => openAskQuestion({ subject: 'Marketplace dispute resolution policy', section: 'marketplace' })}>View Resolution Policy</Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
