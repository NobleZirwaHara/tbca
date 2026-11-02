import { Btn, CtaBand, Hero, P, Rich, Section } from '@/Components/Aiim/ProtoExplore';
import { BuyBtn, BwFrame, cHref, ObjActions, type IntelBase, type Row, type SvcP } from '@/Components/Aiim/ProtoSearch';

interface QRow { q: string; question: string; tag: string; info: string; map: string; anchor: string; gate: string | null }
interface Props extends IntelBase {
    name: string;
    product: Row | null;
    commodity: Row | null;
    hs: string;
    sector: string;
    rows: QRow[];
    anchorLabel: string;
    record: SvcP | null;
    tariff: SvcP | null;
}

/** One product or commodity with every trader question answered for it (prototype #hs.{product}). */
export default function HsProduct({ name, product: p, commodity: c, hs, sector, rows, record, tariff, c: country, facts, saved }: Props) {
    return (
        <BwFrame title={`${name} · Commodity HS`} crumbs={[{ label: 'Commodity HS', href: cHref(country.slug, 'hs') }, { label: name }]} facts={facts}>
            <Hero
                eyebrow={`HS ${hs} · ${sector}`}
                title={name}
                lead={p
                    ? <>Setswana: <b>{String(p['Setswana [VERIFY]'])}</b> <span className="mx-0.5 inline-block rounded-[3px] border border-attested-500/50 bg-attested-50 px-1 text-[0.68rem] font-bold text-attested-700">VERIFY</span> · {String(p.Group)} · {String(p.Note)}</>
                    : <>{String(c?.Group ?? '')} · {String(c?.['SA model anchor / note'] ?? '')}</>}
                right={<>
                    <BuyBtn s={record} ctx={`HS ${hs} trade record`} tone="gold">Trade record HS6</BuyBtn>
                    <BuyBtn s={tariff} ctx={`HS ${hs} tariff lookup`}>Tariff lookup</BuyBtn>
                    <Btn href={P.sector(sector)} tone="dark">Sector</Btn>
                    <ObjActions type="product" itemKey={name} saved={saved} compare={false} />
                </>}
            />
            {c && <Section title="Commodity-specific must-find"><p className="text-[0.9rem]"><Rich t={c['Commodity-specific must-find']} /></p></Section>}
            <Section title={<>Trader information types for this product <small className="text-[0.8rem] font-normal text-ink-500">{rows.length} rows</small></>} sub="Every TQ question answered for this product.">
                <div className="grid gap-3 md:grid-cols-2">
                    {rows.map((r, i) => (
                        <div key={i} className="grid content-start gap-1.5 rounded-[10px] border border-parchment-400 bg-white p-3.5">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-[4px] bg-ink-950 px-1.5 py-0.5 font-mono text-[0.72rem] text-gold-400">{r.q}</span>
                                <span className="font-semibold text-ink-900">{r.question}</span>
                                <span className="ml-auto rounded-full bg-controlled-50 px-2 py-0.5 text-[0.68rem] font-bold text-controlled-700">{r.tag}</span>
                            </div>
                            <div className="text-[0.84rem]"><Rich t={r.info} /></div>
                            <div className="text-[0.75rem] text-ink-500">Map: {r.map}</div>
                            <div className="text-[0.78rem]"><b>Anchor:</b> <Rich t={r.anchor} />{r.gate && <> · <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.68rem] font-bold text-gold-800">{r.gate}</span></>}</div>
                        </div>
                    ))}
                </div>
            </Section>
            <CtaBand />
        </BwFrame>
    );
}
