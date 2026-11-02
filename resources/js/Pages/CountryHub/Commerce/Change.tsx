/* P33 Country Change and Re-resolution (prototype #/c/{ISO}/change). */
import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { B, Card, Chip, Cols, Dl, Field, Note, STable, StatusChip, TagM, inputCls, useMoney } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { CSteps, type JourneySprint, type JourneyState } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

interface Props { base: CountryBase; j: JourneyState; s: JourneySprint; vat: number; types: string[] }

export default function Change({ base, j, s, vat, types }: Props) {
    const { c } = base;
    const money = useMoney();
    const form = useForm({ type: types[0], reason: '' });
    const fee = s.fee ?? 0;
    const t = form.data.type;
    const p = ({ 'Scope Change': 0.16, 'Timeline Change': 0.05, 'Deliverable Change': 0.1, 'Tier Upgrade': fee ? ((s.premium || fee) - fee) / fee : 0 } as Record<string, number>)[t] || 0;
    const crs = j.crs ?? [];
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(cHref(c, 'change'), { preserveScroll: true, onSuccess: () => form.setData('reason', '') }); };
    return (
        <CountryPage base={base} pageKey="change">
            <CountryHead base={base} pageKey="change" title="Country Change and Re-resolution" desc="Manage changes to scope, assumptions, timeline or deliverables and request re-resolution if required." />
            <CSteps c={c} active="change" j={j} />
            <Cols n={2}>
                <Card title="New change request" icon="file">
                    <form onSubmit={submit} className="space-y-2.5">
                        <Field label="Change type">
                            <select className={inputCls} name="type" value={t} onChange={(e) => form.setData('type', e.target.value)}>{types.map((x) => <option key={x}>{x}</option>)}</select>
                        </Field>
                        <Field label="Reason for change *">
                            <textarea name="reason" rows={3} required placeholder="e.g. additional districts in scope" value={form.data.reason} onChange={(e) => form.setData('reason', e.target.value)}
                                className="w-full min-w-0 rounded-[4px] border border-parchment-500 bg-white px-2 py-1.5 text-[0.85rem] font-normal text-ink-800" />
                        </Field>
                        {form.errors.reason && <p role="alert" className="text-[0.8rem] text-risk-700">{form.errors.reason}</p>}
                        <B v="pri" type="submit" disabled={form.processing}>Submit Change Request →</B>
                    </form>
                </Card>
                <Card title="Impact Assessment (preliminary)" icon="chart">
                    <Dl rows={[
                        ['Fee impact (est.)', <span key="f">+{money(fee * p * (1 + vat / 100))} incl. VAT <TagM /></span>],
                        ['Timeline impact', t === 'Timeline Change' ? '+10 business days' : '+5 business days'],
                        ['Re-resolution required', t === 'Scope Change' ? <Chip key="r" t="Yes" tone="warn" /> : <Chip key="r" t="No" tone="ok" />],
                        ['Approvals', 'Account manager · Engagement lead · Client sign-off'],
                    ]} />
                </Card>
            </Cols>
            <Card title="Change Requests" icon="layers">
                {crs.length ? <STable head={['ID', 'Type', 'Reason', 'Requested', 'Status']} rows={crs.map((x) => [x.id, x.t, x.r, x.d, <StatusChip key="s" s={x.s} />])} />
                    : <p className="text-[0.82rem] text-ink-400">No change requests yet.</p>}
            </Card>
            <Note><b>Change Policy.</b> Written approval required · impact assessed before implementation · re-resolution if material · audit trail maintained.</Note>
        </CountryPage>
    );
}
