import { Head, Link, useForm } from '@inertiajs/react';
import { CheckCircle2, FileText, Lock } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Progress, StatusPill } from '@/Components/ui/Kit';
import { Checkbox } from '@/Components/ui/Form';
import { Card, CodeChip, InfoRows, Notice, RefCard } from '@/Components/Marketplace/ui';
import { PsBody, PsJourney, money } from '@/Components/Marketplace/PartnerKit';
import type { MkPartnerRequest, PartnerQuote } from '@/types/marketplace';

export default function Status({ request: r, journey }: { request: MkPartnerRequest; journey: string[] }) {
    const q = r.quote as PartnerQuote;
    const dv = r.meta.delivery ?? {};
    const st = r.meta.settlement;
    const form = useForm({ confirm: false });
    const history = (r.meta.history ?? []) as { at: string; title: string; body: string }[];

    return (
        <>
            <Head title={`${r.stageLabel} – ${r.reference}`} />
            <PsBody>
                <div className="grid gap-5 lg:grid-cols-12">
                    <div className="lg:col-span-8">
                        <CodeChip code="PS-019" />
                        <h1 className="mt-2 font-serif text-4xl font-bold text-ink-900">{r.stage === 'completed' ? 'Engagement Completed' : r.stage === 'closed' ? 'Request Closed' : 'Engagement In Delivery'}</h1>
                        <p className="text-ink-600">{r.title} · {r.partner?.name}</p>
                        <PsJourney journey={journey} step={r.step} className="mt-5" />
                    </div>
                    <div className="lg:col-span-4"><RefCard reference={r.reference} badge={<StatusPill status={r.stageLabel} />} rows={[['Order', r.orderRef ? `${r.orderRef} (${r.orderStatus})` : '—'], ['Arrangement', r.arrangement], ['Professional', r.partner?.name], ['Indicative Total', q.total ? money(q.total) : '—']]} /></div>
                </div>
                {r.stage === 'closed' ? <Notice tone="info">This request is closed. You may submit a new request at any time.</Notice> : (
                    <div className="grid gap-5 lg:grid-cols-12">
                        <div className="space-y-5 lg:col-span-8">
                            <Card title="Delivery Progress">
                                <div className="flex items-center justify-between text-sm"><span>Milestone: <strong>{dv.milestone ?? '—'}</strong></span><span>{dv.progress ?? 0}%</span></div>
                                <Progress value={dv.progress ?? 0} className="mt-2" />
                                {dv.comment && <p className="mt-3 text-sm text-ink-600">Update from the professional: {dv.comment}</p>}
                                <ul className="mt-3 divide-y divide-parchment-300 text-sm">{(dv.files ?? []).map((f: { name: string; status: string; uploaded: string }) => <li key={f.name} className="flex justify-between py-1.5"><span className="flex items-center gap-2"><FileText className="size-4" aria-hidden="true" />{f.name}</span><span className="text-xs text-ink-500">{f.uploaded} · {f.status}</span></li>)}</ul>
                            </Card>
                            {r.stage === 'qa_review' && (
                                <Card tone="green" title="Client Sign-off">
                                    <p className="text-sm text-ink-700">The professional work has passed TBCA QA and partner sign-off. Confirm acceptance to complete the engagement and release settlement.</p>
                                    <Checkbox className="mt-3" label="I confirm the delivered professional work meets the agreed scope." checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} />
                                    <Button type="button" className="mt-3" disabled={!form.data.confirm || form.processing} onClick={() => form.post(`/partner-services/requests/${r.reference}/sign-off`)}><CheckCircle2 className="size-4" aria-hidden="true" />Sign Off Delivery</Button>
                                </Card>
                            )}
                            {st && <Card title="Settlement"><InfoRows dense rows={[['Settlement Reference', st.reference], ['Invoice', st.invoice], ['Professional Fee (P)', money(st.p)], ['TBCA Coordination Fee (T)', money(st.t)], ['Status', st.status]]} /></Card>}
                        </div>
                        <Card className="lg:col-span-4" title="Matter History">
                            <ol className="space-y-3 border-l-2 border-parchment-400 pl-3">{history.slice().reverse().map((h, i) => <li key={i}><p className="text-xs text-ink-400">{h.at}</p><p className="text-sm font-semibold">{h.title}</p>{h.body && <p className="text-xs text-ink-500">{h.body}</p>}</li>)}</ol>
                            <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" />All work is limited to the authorised mandate.</p>
                        </Card>
                    </div>
                )}
                <Link href="/partner-services/requests" className="text-sm font-semibold text-gold-700">← My Requests</Link>
            </PsBody>
        </>
    );
}
