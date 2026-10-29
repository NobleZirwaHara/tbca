import { router } from '@inertiajs/react';
import { useState } from 'react';
import { A, B, Card, Chip, Kpi, Kpis, N, STable, Steps, Ticks, useMoney } from '@/Components/Industries/Kit';
import { CtxPanel, EngBar, Head1, NoEngagement, PlainPage, Shell } from '@/Components/Industries/Layout';
import type { Engagement, IndustryBase, Totals } from '@/types/industries';

interface Props extends IndustryBase { e: Engagement | null; tt?: Totals }

export default function Checkout(p: Props) {
    const { e, tt } = p;
    const money = useMoney();
    const [split, setSplit] = useState(() => e?.splits ?? [{ m: 'Corporate card', who: e?.reg?.o || 'Primary payer', pct: 60 }, { m: 'Bank transfer (EFT)', who: 'Co-funder', pct: 35 }, { m: 'Client wallet', who: 'Prepaid funds', pct: 5 }]);
    const [saved, setSaved] = useState(false);
    const crumbs: [string, string?][] = [['Industries', '/industries'], ['Engagement', '/industries/workspace'], ['Split Checkout']];
    if (!e || !tt) return <Shell title="Split Checkout" crumbs={crumbs}><NoEngagement base={p} /></Shell>;
    const paidAll = tt.out <= 0;
    const tot = split.reduce((a, s) => a + (Number(s.pct) || 0), 0);
    const amt = (pct: number) => Math.round((tt.out * pct) / 100);

    return (
        <PlainPage title="Split Checkout" crumbs={crumbs} right={<><Card title="Payment Security" icon="lock"><Ticks items={['256-bit TLS encryption', 'PCI DSS compliant processors', 'Fraud protection enabled', 'No hidden charges']} /></Card><CtxPanel base={p} /></>}>
            <Head1 eyebrow="Mock-up Page 20" title="Split Checkout" desc="Complete your purchase using multiple payment methods. Your ledger updates in real time. Payment here is simulated: no money moves and no card details are taken." />
            <EngBar e={p.engagement} />
            <Steps items={['Engagement Summary', 'Split Checkout', 'Review & Confirm', 'Payment Processing', 'Receipt & Ledger Update'].map((s, i) => ({ label: s, step: `Step ${i + 1}`, state: paidAll ? 'done' : i === 1 ? 'on' : i < 1 ? 'done' : '' }))} />
            {paidAll ? (
                <Card title="Paid in full" icon="check"><p className="text-[0.88rem]"><Chip t="Completed" tone="ok" /> All T-ledger amounts are settled. <a href="/industries/workspace/ledger" className="underline">View the fee ledger →</a></p></Card>
            ) : (
                <>
                    <Kpis>
                        <Kpi l="Total amount" v={money(tt.total)} s="T fee + VAT" icon="cash" />
                        <Kpi l="Amount to pay" v={money(tt.out)} s="Outstanding" icon="cash" />
                        <Kpi l="Outstanding after payment" v={money(0)} s="0 % remaining" icon="check" />
                    </Kpis>
                    <Card title="1. Select payment split" icon="cash">
                        <STable head={['Payment method', 'Payer / source', '% of total', 'Amount']} rows={split.map((s, i) => [s.m, s.who,
                            <input type="number" min={0} max={100} step={0.5} aria-label={`Percent for ${s.m}`} className="h-8 w-[90px] rounded-[4px] border border-parchment-500 px-1.5" value={s.pct}
                                onChange={(x) => { const n = split.map((y, j) => (j === i ? { ...y, pct: Number(x.target.value) || 0 } : y)); setSplit(n); setSaved(false); }} />, <b>{money(amt(s.pct))}</b>])} />
                        <div className="mt-2 flex justify-between text-[0.85rem]"><span>Total</span><b>{N(tot, 1)} % · {money(amt(tot))}</b></div>
                    </Card>
                    <Card title="2. Apply to invoice" icon="file">
                        <STable compact head={['Description', 'Amount']} rows={[[`${e.name} · ${e.ref}`, money(e.price)], ['VAT', money(tt.vat)]]} />
                        <p className="mt-2 text-[0.72rem] text-ink-400">This payment fully settles the T-ledger invoice. P/X/S items are contracted separately.</p>
                    </Card>
                    <Card title="3. Ledger preview" icon="layers">
                        <STable compact head={['Entry', 'Type', 'Amount']} rows={[['Opening balance', 'Balance', money(tt.out)], ...split.map((s) => [s.m, 'Payment', `−${money(amt(s.pct))}`]), ['Closing balance', 'Balance', money(0)]]} />
                    </Card>
                    <div className="flex flex-wrap gap-2">
                        <A href="/industries/engage/letter">← Back to engagement</A>
                        <B onClick={() => router.post('/industries/engage/action', { do: 'splits', splits: split }, { preserveScroll: true, onSuccess: () => setSaved(true) })}>{saved ? 'Draft saved' : 'Save as draft'}</B>
                        <B v="pri" disabled={Math.abs(tot - 100) > 0.05} onClick={() => router.post('/industries/engage/action', { do: 'pay', splits: split })}>Confirm & pay (simulated)</B>
                    </div>
                </>
            )}
        </PlainPage>
    );
}
