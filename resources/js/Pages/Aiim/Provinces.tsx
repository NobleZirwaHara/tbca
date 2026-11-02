/* AIIM-003 District & Council Selector (prototype #units). Botswana: 16 units; South Africa: 9 provinces; others: loaded areas. */
import { Link } from '@inertiajs/react';
import LegacyProvinces, { type Props as SaProps } from '@/Components/Aiim/Explorer/LegacyProvinces';
import { Btn, CtaBand, DataMeta, Frame, Grid, Hero, P, PackLoading, Panel, Rich, Section, SheetTable, TagRow, VBars, type Sheet } from '@/Components/Aiim/ProtoExplore';
import { useUsdM } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface UnitCard { code: string; name: string; kind: string; pop: number; share: number; env: number; templates: number; tierA: number; tags: string[] }
interface Props extends AiimPageProps {
    country: { slug: string; name: string; flag: string; regionName: string };
    mode: 'bw' | 'sa' | 'units' | 'none';
    bw: { lead: string; cards: UnitCard[]; units: Sheet; envNote: string; envelopes: Sheet; institutions: Sheet } | null;
    sa: Omit<SaProps, keyof AiimPageProps> | null;
    units: { slug: string; name: string; kind: string; population: number | null; source: string | null }[];
}

export default function Provinces(props: Props) {
    if (props.mode === 'sa' && props.sa) return <LegacyProvinces {...(props as unknown as SaProps)} {...props.sa} />;
    if (props.mode === 'bw' && props.bw) return <BotswanaUnits bw={props.bw} />;
    return <OtherUnits country={props.country} units={props.units} />;
}

function BotswanaUnits({ bw }: { bw: NonNullable<Props['bw']> }) {
    const usdM = useUsdM();
    return (
        <Frame title="District & Council Selector" crumbs={[{ label: 'Botswana', href: P.cockpit }, { label: 'Units' }]}>
            <Hero eyebrow="District & Council Selector" title="16 administrative units" lead={<Rich t={bw.lead} />} right={<Btn href={P.map} tone="gold">Open on map</Btn>} meta={<DataMeta />} />
            <Grid cols={4} className="mt-4">
                {bw.cards.map((u) => (
                    <Link key={u.code} href={P.unit(u.code)} className="flex min-w-0 flex-col gap-3 rounded-[12px] border border-parchment-400 bg-white p-4 hover:border-gold-500">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0"><div className="font-mono text-[0.7rem] text-ink-500">{u.code} · {u.kind}</div><h3 className="text-[1.02rem] font-semibold text-ink-900">{u.name}</h3></div>
                            <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.7rem] font-bold text-gold-800">{u.share.toFixed(1)} %</span>
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[0.78rem]">
                            <div><div className="text-ink-500">Population</div><b className="tabular-nums">{u.pop.toLocaleString('en-US')}</b></div>
                            <div><div className="text-ink-500">Envelope</div><b className="tabular-nums">{usdM(u.env)}</b></div>
                            <div><div className="text-ink-500">Templates</div><b>{u.templates}</b></div>
                            <div><div className="text-ink-500">Tier A</div><b>{u.tierA}</b></div>
                        </div>
                        <TagRow tags={u.tags} />
                    </Link>
                ))}
            </Grid>
            <Section title="Units register (D-1)" sub="All columns from BW_Units."><SheetTable sheet={bw.units} size={25} filters={[]} /></Section>
            <Section title="Unit investment envelopes (G-5)" sub={<Rich t={bw.envNote} />}>
                <div className="grid gap-4 lg:grid-cols-2">
                    <Panel title="Weighted vs equal split (US$ m)"><VBars items={bw.envelopes.rows.map((e) => ({ n: String(e.Unit), v: Number(e['Envelope US$ m (weighted)']) }))} fmt={(v) => v.toFixed(1)} /></Panel>
                    <SheetTable sheet={bw.envelopes} size={25} filters={[]} />
                </div>
            </Section>
            <Section title="Institutions (D-5)" sub="50 roles mapped to Botswana institutions."><SheetTable sheet={bw.institutions} size={10} /></Section>
            <CtaBand />
        </Frame>
    );
}

function OtherUnits({ country, units }: { country: Props['country']; units: Props['units'] }) {
    const total = units.reduce((s, u) => s + (u.population ?? 0), 0);
    return (
        <Frame title="District & Council Selector" crumbs={[{ label: country.name, href: `/aiim/country/${country.slug}` }, { label: 'Units' }]}>
            <Hero eyebrow="District & Council Selector" title={`${units.length || 'No'} first-level areas`} lead={`First-level administrative areas of ${country.name} as loaded in AIIM. Open an area on the country map for its towns, projects and opportunity records.`}
                right={<Btn href={`/aiim/country/${country.slug}/map`} tone="gold">Open on map</Btn>} />
            {units.length ? (
                <Grid cols={4} className="mt-4">
                    {units.map((u) => (
                        <Link key={u.slug} href={`/aiim/country/${country.slug}?tab=map&unit=${u.slug}`} className="flex min-w-0 flex-col gap-2 rounded-[12px] border border-parchment-400 bg-white p-4 hover:border-gold-500">
                            <div className="flex items-start justify-between gap-2">
                                <div><div className="text-[0.72rem] text-ink-500">{u.kind}</div><h3 className="text-[1.02rem] font-semibold text-ink-900">{u.name}</h3></div>
                                {u.population && total ? <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[0.7rem] font-bold text-gold-800">{((100 * u.population) / total).toFixed(1)} %</span> : null}
                            </div>
                            <div className="text-[0.78rem]"><span className="text-ink-500">Population </span><b>{u.population ? u.population.toLocaleString('en-US') : 'Not loaded'}</b>{u.source && <div className="text-[0.7rem] text-ink-400">{u.source}</div>}</div>
                        </Link>
                    ))}
                </Grid>
            ) : (
                <div className="mt-4"><PackLoading country={country.name} what="Districts, councils and their profiles"><Btn href={`${P.custom}?country=${country.slug}`} tone="gold">Request regional intelligence</Btn></PackLoading></div>
            )}
            <CtaBand text={`Speak to a TBCA Advisor for tailored market entry, verification, partner mapping and deal advisory in ${country.name}.`} />
        </Frame>
    );
}
