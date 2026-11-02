import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Btn, Chk, DEAL, Dl, Fld, Flow, FormPanel, QuickLinks, eng, inputCls, type Country } from '@/Components/Aiim/ProtoEngagement';
import { useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps, Engagement } from '@/types/aiim';

interface Props extends AiimPageProps {
    engagement: Engagement;
    country: Country | null;
    deliverables: string[];
    balance: number;
    balancePercent: number;
    balanceOrder?: string | number | null;
    canAccept: boolean;
}

/** Page 63 Delivery Acceptance: accepting issues the certificate and opens the final balance checkout. */
export default function Delivery({ engagement: e, deliverables, balance, balancePercent, canAccept, balanceOrder }: Props) {
    const money = useMoney();
    const form = useForm({ action: 'acceptance', received: false, comments: '' });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/message')); };
    const err = form.errors as Record<string, string>;
    return (
        <Flow title="Delivery Acceptance" eyebrow="Page 63 · Deliverable acceptance certificate (AAB-EMB-236)" steps={{ list: DEAL, on: 4 }}
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: e.mandate ?? e.reference, href: eng(e.reference) }]}
            side={<QuickLinks links={[['Request a scope change', eng(e.reference, '/change')], ['Raise a dispute', eng(e.reference, '/dispute')]]} />}>
            {balanceOrder && (
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-4 text-[0.88rem]">
                    <span>Deliverables accepted. The final balance of {money(balance)} excl. VAT is still unpaid.</span>
                    <Btn href={`/checkout/${balanceOrder}`} size="sm">Pay final balance</Btn>
                </div>
            )}
            <FormPanel title="Accept deliverables" submit="Accept and issue certificate" onSubmit={submit} processing={form.processing} disabled={!canAccept} back={eng(e.reference)}>
                <Dl rows={[
                    ['Engagement', e.title],
                    ['Deliverables', deliverables.join('; ') || '—'],
                    ['Balance due', `${balancePercent} % on acceptance · ${money(balance)} excl. VAT`],
                    ['Status', e.statusLabel],
                ]} />
                {!canAccept && <p className="text-[0.82rem] text-ink-600">Acceptance opens once your advisor marks the deliverables as delivered. This mandate is {e.statusLabel.toLowerCase()}.</p>}
                <Chk checked={form.data.received} onChange={(v) => form.setData('received', v)} error={err.received}>All deliverables received and reviewed.</Chk>
                <Fld label="Comments" error={err.comments}><textarea rows={4} className={inputCls} value={form.data.comments} onChange={(ev) => form.setData('comments', ev.target.value)} /></Fld>
            </FormPanel>
        </Flow>
    );
}
