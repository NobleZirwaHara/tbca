/* P24 Country Evidence Audit: currentness computed from the fact dates (prototype #/c/{ISO}/audit). */
import { Bars, Card, DataTable, GradeChip, Kpi, Kpis, StatusChip, TagM, type Col } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import { JSteps } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Item { id: string; t: string; dom: string; src: string; d: string; g: number; age: number | null; cur: string; lin: string }
interface Props {
    base: CountryBase;
    pack: boolean;
    items?: Item[];
    score?: number;
    cnt?: { current: number; ageing: number; out: number };
    verified?: number;
    health?: { dom: string; p: number }[];
    shelf?: HubShelf;
}

const COLS: Col<Item>[] = [
    { k: 'id', l: 'ID', r: (x) => <span className="font-mono">{x.id}</span> },
    { k: 't', l: 'Evidence title' },
    { k: 'dom', l: 'Domain' },
    { k: 'src', l: 'Source / owner', clip: true },
    { k: 'd', l: 'As of' },
    { k: 'age', l: 'Age (months)', num: true },
    { k: 'cur', l: 'Currentness', r: (x) => <StatusChip s={x.cur} /> },
    { k: 'g', l: 'Grade', r: (x) => <GradeChip g={x.g} /> },
    { k: 'lin', l: 'Lineage', r: (x) => <StatusChip s={x.lin} /> },
];

export default function Audit({ base, pack, items = [], score = 0, cnt, verified = 0, health = [], shelf }: Props) {
    const { c } = base;
    if (!pack || !cnt || !shelf) {
        return (
            <CountryPage base={base} pageKey="audit">
                <CountryHead base={base} pageKey="audit" title="Country Evidence Audit" desc="Currentness, completeness and lineage of all country evidence." />
                <JSteps c={c} active="audit" />
                <NoPack c={c} what="Evidence audit" pageKey="audit" />
            </CountryPage>
        );
    }
    return (
        <CountryPage base={base} pageKey="audit">
            <CountryHead base={base} pageKey="audit" title="Country Evidence Audit" desc={`Currentness, completeness and lineage of all ${items.length} Botswana evidence items — computed live from the fact dates (as at 21 Oct 2026, freshness gate ≤ 18 months).`} />
            <JSteps c={c} active="audit" />
            <Kpis>
                <Kpi l="Evidence Audit Score" v={`${score} %`} s={<>Share of items current <TagM /></>} icon="chart" />
                <Kpi l="Current (≤ 18 months)" v={cnt.current} icon="check" />
                <Kpi l="Ageing (19–36 months)" v={cnt.ageing} icon="clock" />
                <Kpi l="Out of date (> 36 months)" v={cnt.out} s="Kept as baselines, never as Tier A triggers" icon="alert" />
                <Kpi l="Verified by re-fetch" v={verified} s="Seeded sample (seed 2026)" icon="shield" />
            </Kpis>
            <Card title="Evidence Health by Domain" icon="layers">
                <Bars rows={health.map((h) => ({ label: h.dom, value: h.p, text: `${h.p} %` }))} />
            </Card>
            <Card title="Evidence Inventory" icon="db">
                <DataTable cols={COLS} rows={items} size={12} filters={['dom', 'cur', 'lin']} name="BW_evidence_audit" />
            </Card>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
