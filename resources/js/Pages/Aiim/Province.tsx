/* AIIM-004 Unit Profile (prototype #unit.GA). Botswana units by code (/aiim/province/GA); South African provinces by slug. */
import { Link, router } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { UnitCard, type UnitCardData } from '@/Components/Aiim/Explorer/BwCards';
import BwMap, { useMapData, type BwMapRaw } from '@/Components/Aiim/Explorer/BwMap';
import LegacyProvince, { type Props as SaProps } from '@/Components/Aiim/Explorer/LegacyProvince';
import { Btn, BuyBtn, CtaBand, DataMeta, Frame, Hero, P, Panel, SaveBtn, SvcRail, TierPill, type Row, type Svc } from '@/Components/Aiim/ProtoExplore';
import { DataTable, N, type Col } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface TownRow { id: string; name: string; kind: string; pop: number; gateway: string; km: number; rl: number; cov: number }
interface BwProps extends AiimPageProps {
    mode: 'bw';
    unit: UnitCardData;
    towns: TownRow[];
    ranked: Row[];
    map: BwMapRaw;
    brief: Svc | null;
    rail: Svc[];
}
type Props = BwProps | (SaProps & { mode: 'sa' });

const lnk = 'text-controlled-700 underline decoration-dotted underline-offset-2 hover:text-gold-700';

export default function Province(props: Props) {
    return props.mode === 'bw' ? <BotswanaUnit {...props} /> : <LegacyProvince {...props} />;
}

function BotswanaUnit({ unit: u, towns, ranked, map, brief, rail }: BwProps) {
    const data = useMapData(map);
    const placeCols: Col<TownRow>[] = [
        { k: 'name', l: 'Place', r: (t) => <Link href={P.town(t.id)} className={lnk}>{t.name}</Link> }, { k: 'kind', l: 'Kind' },
        { k: 'pop', l: 'Population', num: true, r: (t) => N(t.pop) }, { k: 'gateway', l: 'Nearest gateway' }, { k: 'km', l: 'km', num: true },
        { k: 'rl', l: 'Ranked leads', num: true }, { k: 'cov', l: 'Coverage', num: true },
    ];
    const keys = ['Lead ID', 'Template', 'Sector', 'Opportunity', 'Band', 'Persona', 'Place', 'Lead score', 'Tier', 'Time to revenue'];
    const leadCols: Col<Row>[] = keys.map((k) => ({
        k, l: k, num: k === 'Lead score',
        r: k === 'Tier' ? (r: Row) => <TierPill t={r.Tier} /> : k === 'Template' ? (r: Row) => <Link href={P.opp(String(r.Template))} className={`${lnk} font-mono`}>{r.Template}</Link> : undefined,
    }));

    return (
        <Frame title={`${u.name} Unit Profile`} crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Units', href: P.units }, { label: u.name }]}>
            <Hero
                eyebrow={`${u.kind} · ${u.code} · Unit profile`}
                title={u.name}
                lead={`${u.name} holds ${N(u.pop)} people (Census 2022), ${u.places} pinned place(s), ${u.templates} eligible templates and ${u.tierA} Tier A templates. Asset tags: ${u.tags.join(', ')}.`}
                right={<>
                    <BuyBtn svc={brief} ctx={`${u.name} District Profile (BW-PB-01)`} tone="gold"><Briefcase className="size-3.5" /> District Profile</BuyBtn>
                    <Btn href={P.mapAt(u.code)} tone="dark">On map</Btn>
                    <SaveBtn type="aiim-unit" itemKey={`BW-${u.code}`} label={u.name} url={P.unit(u.code)} />
                </>}
                meta={<DataMeta />}
            />
            <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_400px]">
                <div className="grid min-w-0 content-start gap-4">
                    <Panel flush><div className="overflow-hidden rounded-[12px]">
                        <BwMap data={data} height={640} sel={{ type: 'unit', code: u.code }} layers={{ corr: false, air: false }}
                            onSelect={(s) => { if (s?.type === 'town') router.visit(P.town(s.id)); else if (s?.type === 'unit' && s.code !== u.code) router.visit(P.unit(s.code)); else if (s?.type === 'hot') router.visit(P.project(`H${s.i}`)); }} />
                    </div></Panel>
                    <Panel title={<>Places in {u.name} <small className="font-normal text-ink-500">{towns.length}</small></>}><DataTable<TownRow> name={`bw-${u.code}-places`} cols={placeCols} rows={towns} size={15} compact /></Panel>
                    <Panel title={<>Ranked leads in {u.name} <small className="font-normal text-ink-500">{ranked.length}</small></>}><DataTable<Row> name={`bw-${u.code}-ranked-leads`} cols={leadCols} rows={ranked} size={10} filters={['Sector', 'Place']} compact /></Panel>
                </div>
                <div className="grid min-w-0 content-start gap-4">
                    <Panel><UnitCard u={{ ...u, brief }} /></Panel>
                    <SvcRail items={rail} title="Unit services" />
                </div>
            </div>
            <CtaBand />
        </Frame>
    );
}
