/* AIIM-017 Risk and Outlook (prototype #risk): Botswana BW-1.0 shocks, downturn, pula scenarios and evidence controls. */
import { ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { Btn, BuyBtn, CtaBand, DataMeta, DocView, Frame, Grid, Hero, Kpi, P, PackLoading, Panel, PTabs, Rich, SheetTable, ShockHeat, SvcRail, VBars, type Block, type Row, type Sheet, type Svc } from '@/Components/Aiim/ProtoExplore';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    ready: boolean;
    risk: { infl: string; shocks: Row[]; downturn: Block[]; fxNote: string; part0: Block[]; sheets: Record<string, Sheet>; brief: Svc | null; rail: Svc[] } | null;
    initialTab?: string;
}

const TABS = ['Shock matrix', 'Diamond downturn', 'Pula scenarios', 'Regulatory change', 'Conflicts', 'Data gaps', 'Freshness', 'Macro facts', 'Challenge & limits'];
const KEYS = ['shocks', 'downturn', 'fx', 'regulatory', 'conflicts', 'gaps', 'freshness', 'macro', 'challenge'];

export default function Risk({ ready, risk, initialTab = '' }: Props) {
    const [tab, setTab] = useState(Math.max(0, KEYS.indexOf(initialTab)));
    const crumbs = [{ label: 'Botswana', href: P.cockpit }, { label: 'Risk & Outlook' }];
    if (!ready || !risk) {
        return <Frame title="Risk & Outlook" crumbs={crumbs}><PackLoading country="Botswana" what="Shock matrix, downturn re-tiering, pula scenarios and evidence controls" /><CtaBand /></Frame>;
    }
    const sh = risk.sheets;
    const fx = sh.BW_FX.rows;
    const panels = [
        <ShockHeat key="s" rows={risk.shocks} />,
        <div key="d" className="grid gap-4"><Panel><DocView blocks={risk.downturn} /></Panel><SheetTable sheet={sh.BW_Downturn} filters={['Sector', 'Tier base', 'Tier downturn']} /></div>,
        <div key="f" className="grid gap-4">
            <div className="grid gap-4 lg:grid-cols-2">
                <Panel title="Pula per US$ by scenario"><VBars items={fx.map((f) => ({ n: String(f.Scenario).split(' [')[0].split(' (')[0], v: Number(f['Pula per US$']) }))} fmt={(v) => v.toFixed(2)} /></Panel>
                <Panel title="Scenarios (H-2)"><SheetTable sheet={sh.BW_FX} filters={[]} /></Panel>
            </div>
            <Panel><p className="text-[0.88rem]"><Rich t={risk.fxNote} /></p></Panel>
        </div>,
        <SheetTable key="r" sheet={sh.BW_RegChange} filters={[]} />,
        <SheetTable key="c" sheet={sh.BW_Conflicts} filters={[]} />,
        <div key="g" className="grid gap-4"><SheetTable sheet={sh.BW_DataGaps} filters={[]} /><h3 className="font-semibold text-ink-900">Closed-gap ledger</h3><SheetTable sheet={sh.BW_ClosedGaps} filters={[]} /></div>,
        <SheetTable key="fr" sheet={sh.BW_Freshness} filters={[]} />,
        <SheetTable key="m" sheet={sh.BW_Macro} filters={[]} size={30} />,
        <div key="ch" className="grid gap-4"><SheetTable sheet={sh.BW_Challenge} filters={[]} /><Panel><DocView blocks={risk.part0} /></Panel></div>,
    ];
    return (
        <Frame title="Risk & Outlook" crumbs={crumbs}>
            <Hero eyebrow="Risk & Outlook" title="Diamonds, South Africa dependence and citizen rules"
                lead="The binding constraint is a combination of diamond dependence for exports, revenue and FX; dependence on South Africa for power, imports and the rand leg of the basket; and citizen-preference rules that shape how a foreigner can enter."
                right={<><BuyBtn svc={risk.brief} ctx="Investor Risk Snapshot — Botswana" tone="gold"><ShieldAlert className="size-3.5" /> Investor Risk Snapshot</BuyBtn><Btn href={P.brief('BW-PB-17')} tone="dark">Downturn stress brief</Btn></>}
                meta={<DataMeta />} />
            <Grid cols={6} className="mt-4">
                <Kpi l="Inflation" v={risk.infl} s="Aug 2026 · target 3–6 %" />
                <Kpi l="MoPR" v="5.5 %" s="+200 bp 30 Apr 2026" />
                <Kpi l="Rating" v="BBB-" s="S&P negative" />
                <Kpi l="Deficit 2026/27" v="3.1 %" s="of GDP, revised from 8.9 %" />
                <Kpi l="Debt" v="33 %" s="of GDP · ceiling 60 %" />
                <Kpi l="Unemployment" v="21.0 %" s="youth 28.9 %" />
            </Grid>
            <div className="mt-6">
                <PTabs tabs={TABS} value={tab} onChange={setTab} />
                <div className="pt-4" role="tabpanel">{panels[tab]}</div>
            </div>
            <SvcRail items={risk.rail} title="Risk services" />
            <CtaBand />
        </Frame>
    );
}
