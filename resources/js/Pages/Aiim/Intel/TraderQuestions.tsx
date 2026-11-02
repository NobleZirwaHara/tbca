import * as L from 'lucide-react';
import { CtaBand, DataMeta, Grid, HBars, Hero, Kpi, PackLoading, Section } from '@/Components/Aiim/ProtoExplore';
import { BuyBtn, BwFrame, ChainCards, CTable, PTable, SvcRail, TabBox, type IntelBase, type PageT, type QRow, type RailP, type Row, type SvcP } from '@/Components/Aiim/ProtoSearch';
import { N } from '@/Components/Industries/Kit';

interface Props extends IntelBase {
    chain: QRow[];
    kpi: { questions: number; bwRows: number; i2Rows: number; products: number };
    byGroup: { n: string; v: number }[];
    bwRows: PageT | null;
    i2Rows: PageT;
    chains: Row[];
    i2Chain: Row[];
    analyst: SvcP | null;
    rail: RailP;
}

/** Trader Info Type: the 40 trader questions answered for every product (prototype #trdinfo). */
export default function TraderQuestions(p: Props) {
    const { c, bw, kpi } = p;
    const loading = <PackLoading country={c.name} what="Country-anchored trader answers" />;
    return (
        <BwFrame title={`Trader Info Type · ${c.name}`} crumbs={[{ label: c.name, href: `/aiim/country/${c.slug}` }, { label: 'Trader Info Type' }]} facts={p.facts}>
            <Hero
                eyebrow="Trader Info Type"
                title="40 trader questions, answered for every product"
                lead={bw
                    ? 'The Trader Chain (TQ01–TQ40) covers product definition, availability, price, quality, logistics, customs, finance and counterparties, anchored to BURS, SACU and Botswana institutions. 5,600 Botswana rows and 3,523 Issue 2.0 rows.'
                    : `The Trader Chain (TQ01–TQ40) covers product definition, availability, price, quality, logistics, customs, finance and counterparties. The 3,523 Issue 2.0 rows apply to every country; ${c.name} anchors show here once its country pack is loaded.`}
                right={<BuyBtn s={p.analyst} ctx="Trade Analyst Agent output" tone="gold"><L.Package className="size-3.5" /> Ask the Trade Analyst</BuyBtn>}
                meta={bw ? <DataMeta /> : undefined}
            />
            <Grid cols={4} className="mt-4">
                <Kpi l="Questions" v={kpi.questions} s="TQ01–TQ40" />
                <Kpi l={`${c.name} rows`} v={bw ? N(kpi.bwRows) : '—'} s={bw ? 'BW_Trader_InfoTypes' : 'Country pack loading'} />
                <Kpi l="Issue 2.0 rows" v={N(kpi.i2Rows)} s="I2_Trader_InfoTypes" />
                <Kpi l="Products" v={N(kpi.products)} s={bw ? '55 BW + 85 Issue 2.0' : '85 Issue 2.0'} />
            </Grid>
            <div className="mt-5">
                <TabBox tabs={['Trader chain (40)', 'Rows by product group', `All ${bw ? N(kpi.bwRows) + ' ' : ''}${c.name} rows`, `Issue 2.0 rows (${N(kpi.i2Rows)})`, `Sector trader chains (${bw ? p.chains.length : 0})`]}>
                    {[
                        bw ? <ChainCards key="c" rows={p.chain} anchorKey="Botswana anchor" /> : <ChainCards key="c" rows={p.i2Chain as QRow[]} anchorKey="SA model anchor" anchorLabel="SA model anchor" />,
                        bw ? <div key="g" className="rounded-[12px] border border-parchment-400 bg-white p-4"><HBars items={p.byGroup} /></div> : <div key="g">{loading}</div>,
                        bw && p.bwRows ? <PTable key="b" t={p.bwRows} prop="bwRows" name="BW_Trader_InfoTypes" slug={c.slug} /> : <div key="b">{loading}</div>,
                        <PTable key="i" t={p.i2Rows} prop="i2Rows" name="I2_Trader_InfoTypes" slug={c.slug} />,
                        bw ? <CTable key="h" rows={p.chains} name="BW_Chains-Trader" filters={['Sector']} size={15} /> : <div key="h">{loading}</div>,
                    ]}
                </TabBox>
            </div>
            <Section title="Issue 2.0 trader chain (SA model anchors)"><CTable rows={p.i2Chain} name="I2_Trader_Chain" size={10} slug={c.slug} /></Section>
            <div className="mt-8"><SvcRail rail={p.rail} ctx={`Trader information — ${c.name}`} /></div>
            <CtaBand />
        </BwFrame>
    );
}
