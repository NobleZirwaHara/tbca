import { useState } from 'react';
import { A, B, Card, Chip, Kpi, Kpis, STable, sum, useMoney } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, LedChip, iHref, sprintHref } from '@/Components/Industries/Layout';
import type { AddOn, IndustryBase, SprintCardData } from '@/types/industries';

interface Props extends IndustryBase { s: SprintCardData; addons: AddOn[] }

export default function Addons(p: Props) {
    const { ind, ctx, s, addons } = p;
    const c = ctx.country;
    const money = useMoney();
    const [ack, setAck] = useState(false);
    const [copied, setCopied] = useState(false);
    const req = addons.filter((a) => a.req);
    const est = sum(req.filter((a) => a.fee).map((a) => a.fee ?? 0));
    const csv = ['Component,Ledger,Fee,Basis', ...addons.map((a) => [a.name, a.ledger, a.fee ?? '', a.basis].map((x) => `"${String(x).replace(/"/g, '""')}"`).join(','))].join('\n');

    return (
        <IndustryPage base={p} active="services" label="Add-on disclosure">
            <Head1 eyebrow="Mandatory Add-On Disclosure · Mock-up Page 13" title={s.name} desc={`${ind.name} · ${c.name} · from ${money(s.ep)} ex VAT`} />
            <Card title="Why add-ons are mandatory" icon="alert" tone="gold">
                <p className="text-[0.85rem]">To deliver this Sprint lawfully and with professional integrity, the following components are required for your selected industry context. They are required by law, regulation or professional standards to make the outputs accurate, compliant and defensible.</p>
            </Card>
            <Card title="Mandatory & optional add-ons" icon="layers">
                <STable head={['Component', 'Purpose', 'Ledger', 'Est. fee (ex VAT)', 'Basis', 'Status']} rows={addons.map((a) => [<b>{a.name}</b>, <span className="text-[0.78rem]">{a.purpose}</span>, <LedChip l={a.ledger} />, a.fee ? money(a.fee) : a.ledger === 'S' ? 'Varies' : 'Quote', <span className="text-[0.72rem]">{a.basis}</span>, a.req ? <Chip t="Required" tone="bad" /> : <Chip t="Optional" />])} />
            </Card>
            <Kpis>
                <Kpi l="Base price (T)" v={money(s.ep)} s={`${s.entry} tier`} icon="tag" />
                <Kpi l="Estimated add-ons (P/X)" v={`${money(est)}+`} s="Plus quotes and statutory pass-through" icon="cash" />
                <Kpi l={`VAT ${c.vat === null ? 'n/a' : `${c.vat} %`}`} v={money(Math.round(((s.ep ?? 0) * (c.vat ?? 0)) / 100))} s="On the T ledger" icon="file" />
            </Kpis>
            <p className="text-[0.85rem]">Exact fees are confirmed after scoping. You see all costs before you commit. No commitment is made until you confirm and pay.</p>
            <label className="flex items-start gap-2 rounded-[6px] bg-gold-50 p-3"><input type="checkbox" className="mt-0.5" checked={ack} onChange={(e) => setAck(e.target.checked)} /><b className="text-[0.82rem]">I acknowledge that the above add-ons are mandatory for this Sprint and required for lawful, professional and defensible delivery.</b></label>
            <div className="flex flex-wrap gap-2">
                <A href={sprintHref(ind, s.code)}>← Back to product</A>
                <B onClick={() => { void navigator.clipboard?.writeText(csv).then(() => setCopied(true)); }}>{copied ? 'Disclosure copied' : 'Copy full disclosure'}</B>
                <A v="pri" disabled={!ack} href={`${iHref(ind, 'engage')}?sprint=${encodeURIComponent(s.code)}`}>Continue to gates →</A>
            </div>
        </IndustryPage>
    );
}
