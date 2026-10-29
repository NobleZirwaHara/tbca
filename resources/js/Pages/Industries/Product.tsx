import { router } from '@inertiajs/react';
import { useState } from 'react';
import { A, ActChip, B, Card, Chip, Cols, CxChip, Dl, Field, Ic, Ticks, inputCls, saveState, useMoney } from '@/Components/Industries/Kit';
import { CallButton, Head1, IndustryPage, LimitStatement, iHref, sprintHref } from '@/Components/Industries/Layout';
import type { IndustryBase, SprintCardData } from '@/types/industries';

type Rule = { type: string; reason: string; msg: string; ref: string; alt: string };
interface Props extends IndustryBase {
    s: SprintCardData & { prices: Record<string, number>; up: string | null; app: { id: number; slug: string; title: string; status: string } | null; familyName: string };
    block: Rule | null;
    ack: boolean;
}

const WHAT: Record<string, string[]> = {
    Diagnostic: ['Comprehensive readiness assessment', 'Market & regulatory gap analysis', 'Prioritised action plan', 'Benchmarking against sector peers', 'AIIM-powered insights', 'PDF report + data tables'],
    Report: ['Sector analysis', 'Risk & policy overview', 'Opportunity assessment', 'Sources and methodology annex'],
};

export default function Product(p: Props) {
    const { ind, ctx, s, block } = p;
    const c = ctx.country;
    const money = useMoney();
    const [ack, setAck] = useState(p.ack);
    const tiers = Object.keys(s.prices);
    const [tier, setTier] = useState(tiers.includes(s.entry ?? '') ? (s.entry as string) : tiers[0]);
    const what = WHAT[s.type ?? ''] ?? ['Fixed scope and deliverables', 'Human-reviewed output', 'Delivery in your Industry Workspace', 'Evidence and sources attached'];
    const sellable = s.priced && tiers.length > 0;

    return (
        <IndustryPage base={p} active="services" label={s.name}>
            <Head1 eyebrow={<><ActChip /> Product · Mock-up Page 14</>} title={s.name} desc={`${s.code} · ${s.type} · ${s.familyName} · sector-adapted for ${ind.name}${ctx.sub ? ` › ${ctx.sub.name}` : ''}`} />
            {block && (
                <div className="rounded-[6px] border-2 border-risk-500 bg-risk-50 p-4">
                    <h3 className="flex items-center gap-2 font-semibold text-risk-700"><Ic n="lock" /> {block.type} for {ind.name}</h3>
                    <p className="my-2 text-[0.88rem]">{block.msg}</p>
                    <Dl rows={[['Reason', block.reason], ['Reference', <span className="text-[0.78rem]">{block.ref}</span>], ['Approved alternative', block.alt]]} />
                    <div className="mt-3 flex flex-wrap gap-2"><A v="pri" href={iHref(ind, 'partners')}>Use Partner Route</A><CallButton v="default" sm={false}>Speak to a TBCA Advisor</CallButton></div>
                </div>
            )}
            <Cols>
                <Card title="Overview" icon="check">
                    <Ticks items={what} />
                    <Dl className="mt-3" rows={[['Complexity', <CxChip n={s.cx} name={s.cxName} />], ['Service family', s.familyName], ['Archetype', <span className="font-mono text-[0.72rem]">{s.up}</span>], ['Human review', 'Mandatory before release'], ['Catalogue record', s.app ? <a className="text-controlled-700 underline" href={`/sprints/${s.app.slug}`}>{s.app.title}</a> : <Chip t="Not in app catalogue yet" tone="warn" />]]} />
                </Card>
                <Card title="Price" icon="cash">
                    {sellable ? (
                        <>
                            <Field label="Tier"><select className={inputCls} value={tier} onChange={(e) => setTier(e.target.value)}>{tiers.map((t) => <option key={t}>{t}</option>)}</select></Field>
                            <div className="my-2 text-[1.6rem] font-bold">{money(s.prices[tier])}</div>
                            <div className="text-[0.72rem] text-ink-400">Catalogue price · ex VAT · {c.name} VAT {c.vat === null ? 'n/a' : `${c.vat} %`} added at checkout</div>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <B onClick={() => router.post('/basket', { item_type: 'sprint', item_code: s.code, name: s.name, variant: tier, unit_zar: s.prices[tier], commercial_act: 'purchase', meta: { section: 'industries', industry: ind.code, country: c.iso3 } }, { preserveScroll: true })}>Add to cart</B>
                                {s.app && <B onClick={() => router.post('/saved', { item_type: 'sprint', item_key: s.app?.slug, label: s.name, url: sprintHref(ind, s.code) }, { preserveScroll: true })}>Add to compare</B>}
                                <A v="pri" disabled={!ack || Boolean(block)} href={`${sprintHref(ind, s.code)}/addons`}>Continue to add-ons →</A>
                            </div>
                        </>
                    ) : <p className="text-[0.85rem] text-ink-400">{s.inApp ? 'Not separately sellable — embedded component or not yet viable.' : 'This Sprint is classified for the industry but has no record in the TBCA Sprint catalogue yet, so it cannot be priced or sold.'}</p>}
                </Card>
            </Cols>
            <Card title="Sector Limitation Statement" icon="shield" sub={`Visible at all times · IN-LIM-${ind.code}-001`}>
                <LimitStatement ind={ind} sprintName={s.name} />
                <label className="mt-3 flex flex-wrap items-start gap-2 rounded-[6px] bg-gold-50 p-3">
                    <input type="checkbox" className="mt-0.5" checked={ack} disabled={Boolean(block)} onChange={(e) => { setAck(e.target.checked); void saveState(`lim-${ind.code}-${s.code}`, e.target.checked); }} />
                    <b className="min-w-0 flex-1 text-[0.82rem]">I have read and understood the scope, limitations and exclusions that apply to this Sprint and its outputs.</b>
                    <Chip t="Required to continue" tone="warn" />
                </label>
            </Card>
        </IndustryPage>
    );
}
