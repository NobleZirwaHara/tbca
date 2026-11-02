import { Link, router, usePage } from '@inertiajs/react';
import { X } from 'lucide-react';
import { Banner, btnGold, Flow, FlowSteps, PriceFrom, SumBox, type Svc } from '@/Components/Aiim/ProtoAccount';
import { B, Bars, Card, Ic, useMoney } from '@/Components/Industries/Kit';
import { useCurrency } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { AiimPageProps, Totals } from '@/types/aiim';

export interface FeeItem { type: string; key: string; label: string; code: string | null; service: string; context: string; delivery: string | null; price: number | null; url: string }

interface Props extends AiimPageProps {
    items: FeeItem[];
    estimate: Totals;
    prices: { rows: { price: number; count: number }[]; total: number; missing: number };
    journey: { title: string; count: number; items: Svc[] }[];
}

/** Request a fee manifest (signed in) or sign in first. */
export function useManifest() {
    const authed = Boolean(usePage<SharedProps>().props.auth.user);
    return () => (authed ? router.post('/aiim/fees/manifest') : router.visit('/login'));
}

/** Mock-up 25: Fee Discovery. */
export default function FeeDiscovery({ items, estimate, prices, journey }: Props) {
    const money = useMoney();
    const { currency } = useCurrency();
    const openManifest = useManifest();
    const remove = (i: FeeItem) => router.delete('/aiim/fees/items', { data: { type: i.type, key: i.key }, preserveScroll: true });

    return (
        <Flow
            title="Fee Discovery"
            eyebrow="What things cost in AIIM Botswana"
            lead={`Browsing, maps and teaser cards are free. Full records, briefs, agents, verification and advisory are priced per service (ZAR, VAT-exclusive; shown in ${currency}).`}
            crumbs={[{ label: 'Botswana', href: '/aiim/country/botswana' }]}
            steps={<FlowSteps on={0} />}
            right={<B v="pri" sm onClick={openManifest} disabled={!items.length}><Ic n="cart" /> Fee manifest ({items.length})</B>}
            side={
                <Card title="In your manifest">
                    {items.length ? (
                        <>
                            <ul className="mb-3 grid gap-1.5 text-[0.8rem]">
                                {items.map((i) => (
                                    <li key={i.type + i.key} className="flex items-start justify-between gap-2">
                                        <Link href={i.url} className="min-w-0 text-ink-800 hover:text-gold-700">{i.label}{i.context && i.context !== i.label && <span className="block text-[0.7rem] text-ink-400">{i.context}</span>}</Link>
                                        <button type="button" onClick={() => remove(i)} aria-label={`Remove ${i.label}`} className="p-0.5 text-ink-400 hover:text-risk-600"><X className="size-3.5" /></button>
                                    </li>
                                ))}
                            </ul>
                            <SumBox lines={estimate.lines.map((l) => [l.label, l.amount])} vatAmount={estimate.vat} total={estimate.total} />
                            <B v="pri" block className="mt-3" onClick={openManifest}>Review manifest</B>
                        </>
                    ) : (
                        <p className="text-[0.85rem] text-ink-500">Empty. Use <b>Add</b> or <b>Get the Brief</b> on any page.</p>
                    )}
                </Card>
            }
        >
            <Card title="AIIM entry prices">
                <div className="grid gap-4 md:grid-cols-2">
                    <Bars rows={prices.rows.map((r) => ({ label: `from ${money(r.price)}`, value: r.count, text: `${r.count} services` }))} />
                    <div className="grid content-start gap-2">
                        <Banner>Every amount comes from the TBCA service catalogue. Nothing is charged until you approve a fee manifest and pay.</Banner>
                        <p className="text-[0.82rem] text-ink-500">The fee manifest is assembled as you add services on any page (AAB-EMB-229).</p>
                        {prices.missing > 0 && <p className="text-[0.75rem] text-ink-400">{prices.missing} of {prices.total} AIIM services are not in the app catalogue yet.</p>}
                    </div>
                </div>
            </Card>
            <section>
                <h2 className="mb-3 text-[1.1rem] font-semibold text-ink-900">Fee schedule by journey</h2>
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    {journey.map((g) => (
                        <Card key={g.title} title={g.title} act={<span className="font-mono text-[0.75rem] text-ink-400">{g.count}</span>}>
                            <ul className="grid gap-2">
                                {g.items.map((s) => (
                                    <li key={s.code}>
                                        <Link href={`/aiim/services/${s.code}`} className="flex items-start justify-between gap-2 rounded-[6px] border border-parchment-400 p-2.5 hover:border-gold-500">
                                            <span className="min-w-0"><b className="block text-[0.8rem] text-ink-900">{s.name}</b><span className="text-[0.68rem] text-ink-400"><span className="font-mono">{s.code}</span> {s.delivery}</span></span>
                                            <span className="shrink-0 font-mono text-[0.78rem] font-semibold">{s.price !== null ? money(s.price) : <PriceFrom price={null} />}</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            {g.count > g.items.length && <Link href="/aiim/services" className="mt-2 inline-block text-[0.72rem] text-ink-500 hover:text-gold-700">+ {g.count - g.items.length} more in the service catalogue</Link>}
                        </Card>
                    ))}
                </div>
            </section>
            {items.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    <button type="button" className={btnGold} onClick={openManifest}>Review manifest</button>
                    <button type="button" className="text-[0.75rem] text-ink-500 underline" onClick={() => router.post('/aiim/fees/clear', {}, { preserveScroll: true })}>Clear manifest</button>
                </div>
            )}
        </Flow>
    );
}
