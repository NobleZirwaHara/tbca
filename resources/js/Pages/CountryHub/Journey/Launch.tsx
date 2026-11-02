/* P23 Country Launch Readiness (prototype #/c/{ISO}/launch). */
import { Link } from '@inertiajs/react';
import { Card, Chip, Kpi, Kpis, STable, StatusChip, TagM, TagS } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import { JSteps, MeterCell } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props { base: CountryBase; plan90: Row[] | null; shelf: HubShelf }

const CATS: [string, number, string][] = [['Legal & Regulatory', 100, 'Completed'], ['Compliance & Risk', 90, 'In Progress'], ['Payments & Settlement', 85, 'In Progress'], ['Localisation (Content & UX)', 80, 'In Progress'], ['Technology & Integrations', 70, 'In Progress'], ['Partner & Provider Setup', 60, 'In Progress'], ['Operations & Support', 55, 'In Progress'], ['Training & Enablement', 35, 'Not Started']];

export default function Launch({ base, plan90, shelf }: Props) {
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="launch">
            <CountryHead base={base} pageKey="launch" title="Country Launch Readiness" desc={`Validate and confirm all dependencies are in place for a successful market-entry launch in ${c.name}.`} />
            <JSteps c={c} active="launch" />
            <Kpis>
                <Kpi l="Overall Readiness" v="78 %" s={<>18 / 23 complete <TagM /></>} icon="chart" />
                <Kpi l="Critical Blockers" v={1} s="Require attention" icon="alert" />
                <Kpi l="Key Dependencies" v={5} s="In progress" icon="layers" />
                <Kpi l="Target Launch" v="15 Jan 2027" icon="clock" />
            </Kpis>
            <Card title="Readiness by Category" icon="layers">
                <STable head={['Category', 'Progress', 'Status']} rows={CATS.map((r) => [<b key="c">{r[0]}</b>, <MeterCell key="m" p={r[1]} min={150} tone={r[1] >= 85 ? 'ok' : r[1] >= 50 ? 'warn' : 'bad'} />, <StatusChip key="s" s={r[2]} />])} />
            </Card>
            {plan90 && (
                <Card title="Launch plan from the pack — 90-day activation (K-5)" icon="clock" sub={<TagS s="BW_Plan90" />}>
                    <STable head={['Window', 'Action', 'Output', 'Owner', 'KPI']} rows={plan90.map((r) => [<b key="w">{r.Window}</b>, String(r.Action), String(r.Output), String(r.Owner), String(r.KPI)])} />
                </Card>
            )}
            <Card title="Critical Blockers" icon="alert">
                <STable head={['Blocker', 'Impact', 'Owner', 'Target resolve']} rows={[[c.isBW ? 'Enacted 2026/27 corporate tax rate not confirmed (DG-01)' : 'Outstanding regulatory confirmation', 'High', 'Legal / Data', '04 Nov 2026']]} />
            </Card>
            {c.isBW && (
                <Card title="Data-pack go-live gate (CPDS-1.2 validator)" icon="check">
                    <p className="text-[0.88rem]"><Chip t="30 / 30 pass" tone="ok" /> — the country data pack is launch-ready. <Link href={cHref(BW, 'resolver')} className="text-controlled-700 hover:underline">See the validator →</Link></p>
                </Card>
            )}
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
