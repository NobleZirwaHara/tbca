import { router, useForm } from '@inertiajs/react';
import { useState } from 'react';
import { Banner, Flow, SvcRow } from '@/Components/Aiim/ProtoAccount';
import { B, Card, Check, Field, inputCls, Kpi, Kpis, N, useMoney } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    summary: { balance: number; total: number; used: number };
    wallet: { auto_recharge: boolean; auto_recharge_threshold_zar: number | null; auto_recharge_amount_zar: number | null };
    packs: { code: string; credits: number; price: number; label: string; saving?: string }[];
    count: number;
    transactions: { reference: string; date: string; description: string; type: string; amount: number; related: string | null }[];
    manifest: { count: number; total: number };
}

/** Mock-up 29: Wallet and Credits. */
export default function Wallet({ summary, wallet, packs, count, transactions, manifest }: Props) {
    const money = useMoney();
    const [amount, setAmount] = useState('');
    const auto = useForm({ auto_recharge: Boolean(wallet.auto_recharge), auto_recharge_threshold_zar: wallet.auto_recharge_threshold_zar ?? 1000, auto_recharge_amount_zar: wallet.auto_recharge_amount_zar ?? 5000 });

    return (
        <Flow
            title="Wallet and Credits"
            eyebrow="Prepaid credits (AAB-EMB-228)"
            crumbs={[{ label: 'Workspace', href: '/aiim/workspace' }]}
            side={
                <>
                    <Banner icon="cash">Credits are prepaid in ZAR through secure checkout, with VAT charged on the top-up. They pay for AIIM services only and are not a bank balance.</Banner>
                    <Card title="Auto-recharge">
                        <form onSubmit={(e) => { e.preventDefault(); auto.post('/aiim/wallet/auto-recharge', { preserveScroll: true }); }} className="grid gap-2.5">
                            <Check checked={auto.data.auto_recharge} onChange={(v) => auto.setData('auto_recharge', v)}>Top up automatically when the balance runs low</Check>
                            <Field label="When the balance falls below (ZAR)"><input type="number" className={inputCls} value={auto.data.auto_recharge_threshold_zar} onChange={(e) => auto.setData('auto_recharge_threshold_zar', Number(e.target.value))} /></Field>
                            <Field label="Top up by (ZAR)"><input type="number" className={inputCls} value={auto.data.auto_recharge_amount_zar} onChange={(e) => auto.setData('auto_recharge_amount_zar', Number(e.target.value))} /></Field>
                            {Object.values(auto.errors)[0] && <p role="alert" className="text-[0.75rem] text-risk-600">{Object.values(auto.errors)[0]}</p>}
                            <B type="submit" sm disabled={auto.processing}>Save</B>
                        </form>
                    </Card>
                </>
            }
        >
            <Kpis>
                <Kpi l="Balance" v={money(summary.balance)} s={`${money(summary.total)} bought, ${money(summary.used)} used`} icon="cash" />
                <Kpi l="Transactions" v={String(count)} icon="file" />
                <Kpi l="Manifest" v={money(manifest.total)} s={`${manifest.count} items`} icon="cart" />
            </Kpis>
            <Card title="Top up">
                <div className="grid gap-3 sm:grid-cols-3">
                    {packs.map((p) => (
                        <button key={p.code} type="button" onClick={() => router.post('/aiim/wallet/top-up', { pack: p.code })} className="grid gap-1 rounded-[6px] border border-parchment-400 bg-white p-3 text-left hover:border-gold-500">
                            <span className="text-[0.7rem] font-bold tracking-wide text-ink-500 uppercase">{p.label}</span>
                            <b className="font-mono text-[1.1rem] text-ink-900">{N(p.credits)} credits</b>
                            <span className="text-[0.75rem] text-ink-500">ZAR-denominated · pay {money(p.price)} excl. VAT{p.saving ? ` · ${p.saving}` : ''}</span>
                        </button>
                    ))}
                </div>
                <form onSubmit={(e) => { e.preventDefault(); router.post('/aiim/wallet/top-up', { amount: Number(amount) }); }} className="mt-3 flex flex-wrap items-end gap-2">
                    <Field label="Other amount (ZAR, 500 to 100,000)" className="w-56"><input type="number" min={500} max={100000} className={inputCls} value={amount} onChange={(e) => setAmount(e.target.value)} /></Field>
                    <B type="submit" disabled={!amount}>Top up</B>
                </form>
            </Card>
            <Card title="Recent activity">
                {transactions.length ? (
                    <ul className="grid gap-2">
                        {transactions.map((t) => (
                            <SvcRow
                                key={t.reference}
                                title={t.description}
                                meta={<><span className="font-mono">{t.related ?? t.reference}</span><span>{t.date}</span></>}
                                right={<span className={cn('font-mono text-[0.85rem] font-bold', t.amount < 0 ? 'text-risk-600' : 'text-verified-700')}>{t.amount < 0 ? '−' : '+'}{money(Math.abs(t.amount))}</span>}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-[0.85rem] text-ink-500">No activity yet.</p>
                )}
            </Card>
        </Flow>
    );
}
