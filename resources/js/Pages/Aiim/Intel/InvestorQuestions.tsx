import * as L from 'lucide-react';
import { CtaBand, DataMeta, Grid, Hero, Kpi, PackLoading, Section, VBars } from '@/Components/Aiim/ProtoExplore';
import { BuyBtn, BwFrame, ChainCards, CTable, PTable, SvcRail, TabBox, type IntelBase, type PageT, type QRow, type RailP, type Row, type SvcP } from '@/Components/Aiim/ProtoSearch';
import { N } from '@/Components/Industries/Kit';

interface Props extends IntelBase {
    chain: QRow[];
    kpi: { questions: number; bwRows: number; i2Rows: number; assets: number };
    bySector: { n: string; v: number; c: string }[];
    bwRows: PageT | null;
    i2Rows: PageT;
    chains: Row[];
    assets: Row[];
    i2Chain: Row[];
    analyst: SvcP | null;
    rail: RailP;
}

/** Investor Info Type: the 45 investor questions answered per asset type and sector (prototype #invinfo). */
export default function InvestorQuestions(p: Props) {
    const { c, bw, kpi } = p;
    const loading = <PackLoading country={c.name} what="Country-anchored investor answers" />;
    return (
        <BwFrame title={`Investor Info Type · ${c.name}`} crumbs={[{ label: c.name, href: `/aiim/country/${c.slug}` }, { label: 'Investor Info Type' }]} facts={p.facts}>
            <Hero
                eyebrow="Investor Info Type"
                title="45 investor questions, answered for every asset type in 18 sectors"
                lead={bw
                    ? 'The Investor Chain (IQ01–IQ45) is the backbone: each question lists the information types, how the map behaves and the Botswana anchor. It expands to 18,810 Botswana rows and 4,600 Issue 2.0 rows.'
                    : `The Investor Chain (IQ01–IQ45) is the backbone. The 4,600 Issue 2.0 rows apply to every country; ${c.name} anchors show here once its country pack is loaded.`}
                right={<BuyBtn s={p.analyst} ctx="Country Analyst Agent output" tone="gold"><L.TrendingUp className="size-3.5" /> Ask the Country Analyst</BuyBtn>}
                meta={bw ? <DataMeta /> : undefined}
            />
            <Grid cols={4} className="mt-4">
                <Kpi l="Questions" v={kpi.questions} s="IQ01–IQ45" />
                <Kpi l={`${c.name} rows`} v={bw ? N(kpi.bwRows) : '—'} s={bw ? 'BW_Investor_InfoTypes' : 'Country pack loading'} />
                <Kpi l="Issue 2.0 rows" v={N(kpi.i2Rows)} s="I2_Investor_InfoTypes" />
                <Kpi l="Asset types" v={N(kpi.assets)} s="I2_Asset_Register" />
            </Grid>
            <div className="mt-5">
                <TabBox tabs={['Investor chain (45)', 'Rows by sector', `All ${bw ? N(kpi.bwRows) + ' ' : ''}${c.name} rows`, `Issue 2.0 rows (${N(kpi.i2Rows)})`, `Sector chains (${bw ? p.chains.length : 0})`, `Asset register (${p.assets.length})`]}>
                    {[
                        bw ? <ChainCards key="c" rows={p.chain} anchorKey="Botswana anchor" /> : <ChainCards key="c" rows={p.i2Chain as QRow[]} anchorKey="SA model anchor" anchorLabel="SA model anchor" />,
                        bw ? <div key="s" className="rounded-[12px] border border-parchment-400 bg-white p-4"><VBars items={p.bySector} /></div> : <div key="s">{loading}</div>,
                        bw && p.bwRows ? <PTable key="b" t={p.bwRows} prop="bwRows" name="BW_Investor_InfoTypes" slug={c.slug} /> : <div key="b">{loading}</div>,
                        <PTable key="i" t={p.i2Rows} prop="i2Rows" name="I2_Investor_InfoTypes" slug={c.slug} />,
                        bw ? <CTable key="h" rows={p.chains} name="BW_Chains-Investor" filters={['Sector']} size={15} /> : <div key="h">{loading}</div>,
                        <CTable key="a" rows={p.assets} name="I2_Asset_Register" size={20} slug={c.slug} />,
                    ]}
                </TabBox>
            </div>
            <Section title="Issue 2.0 investor chain (SA model anchors)"><CTable rows={p.i2Chain} name="I2_Investor_Chain" size={10} slug={c.slug} /></Section>
            <div className="mt-8"><SvcRail rail={p.rail} ctx={`Investor information — ${c.name}`} /></div>
            <CtaBand />
        </BwFrame>
    );
}
