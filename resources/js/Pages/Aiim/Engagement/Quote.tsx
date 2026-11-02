import { Link, useForm } from '@inertiajs/react';
import type { FormEvent, ReactNode } from 'react';
import { ADV, Banner, Btn, Chk, Dl, Flow, Panel, SumBox, btn, eng, svcHref } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps, Engagement } from '@/types/aiim';

/** Page 45 Formal Quotation: the scope lines the advisor issued, priced from the app's catalogue. */
export default function Quote({ engagement: e }: AiimPageProps & { engagement: Engagement }) {
    const q = e.quote!;
    const form = useForm({ accept: false });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/quote')); };
    const open = e.status === 'quoted';
    const items = q.items as (EngagementItem & { code?: string })[];
    const extra = q.lines.filter((l) => l.code !== 'AIIM-ENG-EXP' && Number(l.amount) > 0);
    const lines: [ReactNode, number | null][] = [
        ...items.map((it): [ReactNode, number | null] => [it.code ? <Link href={svcHref(it.code)} className="hover:text-gold-700">{it.item} <span className="font-mono text-[0.7rem] text-ink-500">{it.code}</span></Link> : it.item, it.amount]),
        ...extra.map((l): [ReactNode, number | null] => [l.label, Number(l.amount)]),
    ];
    return (
        <Flow title="Formal Quotation" eyebrow={`Page 45 · ${q.engagement_type ?? 'Market entry'} engagement`} steps={{ list: ADV, on: 2 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]}
            side={<Banner>Amounts exclude VAT and are priced in ZAR from the TBCA catalogue. {q.deposit_percent} % deposit on signature; balance on acceptance of deliverables.</Banner>}>
            <Panel title="Quotation">
                <div className="mb-3">
                    <Dl rows={[
                        ['Quote', <span className="font-mono">{q.number ?? e.reference}</span>],
                        ['Valid until', q.valid_until ?? '—'],
                        ['Client', [e.client.name, e.client.company].filter(Boolean).join(', ')],
                        ['Engagement', e.title],
                        ['Duration', q.duration],
                    ]} />
                </div>
                <SumBox lines={lines} />
                {open ? (
                    <form onSubmit={submit} className="mt-4 grid gap-3">
                        <Chk checked={form.data.accept} onChange={(v) => form.setData('accept', v)} error={form.errors.accept}>I accept the scope, line items, fees and payment terms in this quotation.</Chk>
                        <div><button type="submit" className={btn('gold')} disabled={form.processing}>Review engagement letter</button></div>
                    </form>
                ) : (
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                        <Btn href={eng(e.reference, '/letter')}>Review engagement letter</Btn>
                        {e.quoteAcceptedAt && <span className="text-[0.8rem] text-ink-500">Accepted {e.quoteAcceptedAt}</span>}
                    </div>
                )}
            </Panel>
        </Flow>
    );
}

type EngagementItem = { item: string; description: string; deliverables: string; amount: number };
