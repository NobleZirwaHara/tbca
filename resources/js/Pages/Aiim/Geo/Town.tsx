/* Town profile, L3 (prototype #town.ID, no mock-up number). */
import { Link, router } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { TownCard, type TownCardData } from '@/Components/Aiim/Explorer/BwCards';
import BwMap, { useMapData, type BwMapRaw } from '@/Components/Aiim/Explorer/BwMap';
import { Btn, BuyBtn, CtaBand, DataMeta, Frame, Hero, P, PackLoading, Panel, TierPill, type Row, type Svc } from '@/Components/Aiim/ProtoExplore';
import { DataTable, N, type Col } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    country: { slug: string; name: string };
    town: TownCardData | null;
    coverage?: Row[];
    ranked?: Row[];
    map?: BwMapRaw;
    brief?: Svc | null;
}

const lnk = 'text-controlled-700 underline decoration-dotted underline-offset-2 hover:text-gold-700 font-mono';
const cols = (keys: string[], nums: string[]): Col<Row>[] => keys.map((k) => ({
    k, l: k, num: nums.includes(k),
    r: k === 'Tier' ? (r: Row) => <TierPill t={r.Tier} /> : k === 'Template' ? (r: Row) => <Link href={P.opp(String(r.Template))} className={lnk}>{r.Template}</Link> : undefined,
}));

export default function Town(props: Props) {
    if (!props.town || !props.map) {
        const c = props.country;
        return (
            <Frame title="Town Profile" crumbs={[{ label: c.name, href: `/aiim/country/${c.slug}` }, { label: 'Towns' }]}>
                <PackLoading country={c.name} what="Town and place profiles with ranked leads and coverage" />
                <CtaBand />
            </Frame>
        );
    }
    return <BotswanaTown {...props} town={props.town} map={props.map} />;
}

function BotswanaTown({ town: t, coverage = [], ranked = [], map, brief = null }: Props & { town: TownCardData; map: BwMapRaw }) {
    const data = useMapData(map);
    return (
        <Frame title={t.name} crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: t.unitName, href: P.unit(t.unit) }, { label: t.name }]}>
            <Hero
                eyebrow={`L3 · ${t.kind} · ${t.id}`}
                title={t.name}
                lead={`${t.name} (${t.unitName}) — population ${N(t.pop)}; nearest gateway ${t.gateway} at ${N(t.km)} km (straight line); ${t.ranked} ranked leads and ${t.coverage} coverage rows.`}
                right={<>
                    <BuyBtn svc={brief} ctx={`${t.name} Town Profile (BW-PB-01)`} tone="gold"><Briefcase className="size-3.5" /> Town Profile</BuyBtn>
                    <Btn href={P.mapAt(t.id)} tone="dark">On map</Btn>
                    <Btn href={P.verify} tone="dark">Verify on site</Btn>
                </>}
                meta={<DataMeta />}
            />
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
                <div className="grid min-w-0 content-start gap-4">
                    <Panel flush><div className="overflow-hidden rounded-[12px]">
                        <BwMap data={data} height={560} sel={{ type: 'town', id: t.id }} layers={{ corr: true }}
                            onSelect={(s) => { if (s?.type === 'town' && s.id !== t.id) router.visit(P.town(s.id)); else if (s?.type === 'hot') router.visit(P.project(`H${s.i}`)); else if (s?.type === 'unit') router.visit(P.unit(s.code)); }} />
                    </div></Panel>
                    <Panel title={<>Coverage rows at {t.name} <small className="font-normal text-ink-500">{coverage.length}</small></>}>
                        <DataTable<Row> name={`bw-${t.id}-coverage`} cols={cols(['Row', 'Template', 'Sector', 'Opportunity', 'Band', 'Lead score', 'Tier'], ['Lead score'])} rows={coverage} size={15} filters={['Sector', 'Tier']} compact />
                    </Panel>
                    {ranked.length > 0 && (
                        <Panel title="Ranked leads">
                            <DataTable<Row> name={`bw-${t.id}-ranked`} cols={cols(['Lead ID', 'Template', 'Opportunity', 'Rank', 'RA', 'M', 'H', 'F', 'G', 'Lead score', 'Tier', 'Persona', 'Time to revenue'], ['Rank', 'RA', 'M', 'H', 'F', 'G', 'Lead score'])} rows={ranked} size={10} compact />
                        </Panel>
                    )}
                </div>
                <Panel className="content-start"><TownCard t={{ ...t, brief }} /></Panel>
            </div>
            <CtaBand />
        </Frame>
    );
}
