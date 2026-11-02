import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { addToManifest, Banner, Flow, FlowSteps } from '@/Components/Aiim/ProtoAccount';
import { A, B, Card, Check, Dl, useMoney } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    object: { code: string; kind: 'template' | 'project'; title: string };
    charge: number | null;
    wallet: number;
}

/** Mock-up 28: Metered Unlock Approval. */
export default function UnlockApproval({ object: o, charge, wallet }: Props) {
    const money = useMoney();
    const form = useForm({ method: 'wallet', confirm: false });
    const cost = charge ?? 0;
    const short = charge === null || wallet < cost;
    const submit = (e: FormEvent) => { e.preventDefault(); form.transform((d) => ({ ...d, method: 'wallet' })); form.post(`/aiim/unlock/${o.code}/approve`); };

    return (
        <Flow
            title="Metered Unlock Approval"
            eyebrow="Approve a wallet debit"
            crumbs={[{ label: 'Locked object', href: `/aiim/unlock/${o.code}` }]}
            steps={<FlowSteps on={2} />}
            side={<Banner>Credits are bought with VAT included, so an unlock debits the amount before VAT. Nothing is debited until you approve.</Banner>}
        >
            <form onSubmit={submit} noValidate className="grid gap-3 rounded-[6px] border border-parchment-400 bg-white p-4">
                <h3 className="text-[0.95rem] font-semibold text-ink-900">Approve this unlock</h3>
                <Dl rows={[['Object', o.title], ['Charge', charge === null ? 'Not in the app catalogue yet' : `${money(cost)} (VAT paid on the credits)`], ['Wallet balance', money(wallet)], ['After approval', money(wallet - cost)]]} />
                {short ? (
                    <>
                        <Banner icon="cash">Not enough credit. Top up first.</Banner>
                        <div className="flex flex-wrap gap-2">
                            <A v="pri" href="/aiim/wallet">Top up wallet</A>
                            {o.kind === 'template' && charge !== null && <B onClick={() => addToManifest('template', o.code, o.title)}>Add to fee manifest instead</B>}
                        </div>
                    </>
                ) : (
                    <>
                        <Check checked={form.data.confirm} onChange={(v) => form.setData('confirm', v)}>I approve a wallet debit of {money(cost)} for {o.title}.</Check>
                        {form.errors.confirm && <p role="alert" className="text-[0.75rem] text-risk-600">{form.errors.confirm}</p>}
                        <div><B v="pri" type="submit" disabled={form.processing}>Approve and unlock</B></div>
                    </>
                )}
                {o.kind === 'project' && (
                    <p className="text-[0.78rem] text-ink-500">Prefer to pay by card or EFT? <button type="button" className="font-semibold text-gold-700 underline" onClick={() => { form.transform((d) => ({ ...d, method: 'card' })); form.post(`/aiim/unlock/${o.code}/approve`); }}>Pay at secure checkout</button>.</p>
                )}
            </form>
        </Flow>
    );
}
