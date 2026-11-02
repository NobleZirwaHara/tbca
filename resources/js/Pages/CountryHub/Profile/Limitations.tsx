/* P10 Country Limitations and Absence (prototype pages-profile.js #/c/{ISO}/limitations). */
import { Card, Cols, DataTable, Kpi, Kpis, STable, StatusChip, TagS } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, NoPack } from '@/Components/CountryHub/Layout';
import { NotClaimed, type ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { bw: { gaps: Row[]; closed: Row[]; conflicts: Row[] } | null }

export default function Limitations({ base, bw }: Props) {
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="limitations">
            <CountryHead base={base} pageKey="limitations" title="Country Limitations and Absence" desc="A transparent view of what TBCA can prove, what is limited, what is absent, and what is not claimed." />
            {!bw ? <NoPack c={c} what="Absence register" pageKey="limitations" /> : (
                <>
                    <Kpis>
                        <Kpi l="Open data gaps" v="16" s="Band-weighted Tier A impact" icon="alert" />
                        <Kpi l="Closed this issue" v="5" s="BW_ClosedGaps" icon="check" />
                        <Kpi l="Contradictions handled" v="20" s="Shown as ranges or corrected" icon="swap" />
                        <Kpi l="Open contradictions" v="0" s="All labelled" icon="shield" />
                    </Kpis>
                    <Card title="Absence Register — open data gaps with closure plan" icon="alert" sub={<TagS s="BW_DataGaps" />}>
                        <DataTable<Row> name="BW_DataGaps" rows={bw.gaps} size={8} filters={['Priority']} cols={[
                            { k: 'ID', l: 'ID' }, { k: 'Missing data', l: 'Missing data' }, { k: 'Needed for', l: 'Needed for' }, { k: 'Holder', l: 'Holder' },
                            { k: 'Priority', l: 'Priority', r: (x) => <StatusChip s={x.Priority} /> }, { k: 'Tier A', l: 'Tier A affected', num: true }, { k: 'Weighted', l: 'Weighted', num: true },
                            { k: 'How to close', l: 'How to close' }, { k: 'Cost', l: 'Cost' }, { k: 'Days', l: 'Days', num: true },
                        ]} />
                    </Card>
                    <Cols n={2}>
                        <Card title="Closed-gap ledger (5)" icon="check">
                            <STable compact head={['ID', 'Gap', 'How closed', 'Status']} rows={bw.closed.map((r) => [String(r.ID ?? ''), String(r.Gap ?? ''), <span key="h" className="text-[0.82rem]">{String(r['How closed'] ?? '')}</span>, <StatusChip key="s" s={r.Status} />])} />
                        </Card>
                        <Card title="Conflict, vintage and arithmetic register" icon="swap">
                            <DataTable<Row> name="BW_Conflicts" rows={bw.conflicts} size={6} cols={[
                                { k: 'ID', l: 'ID' }, { k: 'Item', l: 'Item' }, { k: 'Value A', l: 'Value A', clip: true }, { k: 'Value B', l: 'Value B', clip: true }, { k: 'Handling', l: 'Handling' },
                            ]} />
                        </Card>
                    </Cols>
                </>
            )}
            <NotClaimed />
        </CountryPage>
    );
}
