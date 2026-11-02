/* P09 Country Selection Impact (prototype pages-profile.js #/c/{ISO}/impact?with=). */
import { router } from '@inertiajs/react';
import { A, Card, Chip, Flag, Note, STable, TagS, Ticks } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import type { HubCountry } from '@/types/countryHub';

type ImpactRow = Record<'st' | 'svc' | 'rcs' | 'price' | 'tax' | 'pay' | 'legal' | 'data' | 'dep', string>;
interface Props extends ProfileProps { o: HubCountry; a: ImpactRow; b: ImpactRow; oLive: boolean; bench: [string, string, string][] | null }

const F: [string, keyof ImpactRow][] = [['Activation State', 'st'], ['Services Available', 'svc'], ['Resolver Completeness (RCS)', 'rcs'], ['Pricing', 'price'], ['Tax & Statutory', 'tax'], ['Payment Methods', 'pay'], ['Legal & Regulatory', 'legal'], ['Data & Privacy', 'data'], ['Deployment Readiness', 'dep']];

export default function Impact({ base, o, a, b, oLive, bench }: Props) {
    const { c, countries } = base;
    return (
        <CountryPage base={base} pageKey="impact" extraCrumbs={[[`vs ${o.name}`]]}>
            <CountryHead base={base} pageKey="impact" title="Country Selection Impact" desc="Understand how selecting a country affects availability, pricing, tax, payments, legal regime and commercial conditions." />
            <div className="flex flex-wrap items-center gap-3">
                <Card className="min-w-[200px] flex-1">
                    <div className="flex items-center gap-2.5"><Flag iso2={c.iso2} className="text-[2rem]" /><div><b>{c.name}</b> <Chip t="Selected" tone="gold" /><div className="text-[0.72rem] text-ink-400">{c.state}</div></div></div>
                </Card>
                <span className="text-[1.4rem]" aria-hidden="true">⇄</span>
                <Card className="min-w-[200px] flex-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                        <Flag iso2={o.iso2} className="text-[2rem]" />
                        <div className="min-w-0 flex-1"><b>{o.name}</b><div className="text-[0.72rem] text-ink-400">{o.state}</div></div>
                        <label>
                            <span className="sr-only">Compare with</span>
                            <select value={o.iso3} onChange={(e) => router.visit(cHref(c, 'impact', `?with=${e.target.value}`))}
                                className="h-[30px] rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.78rem]">
                                {countries.filter((x) => x.iso3 !== c.iso3).map((x) => <option key={x.iso3} value={x.iso3}>{x.name}</option>)}
                            </select>
                        </label>
                    </div>
                </Card>
            </div>
            <Note className="border-controlled-500 bg-controlled-50">You are viewing potential impact. Only resolved country context permits commercial activation.</Note>
            <Card title="Impact Overview" icon="swap">
                <STable head={['Factor', `${c.name} (Selected)`, o.name, 'Impact']} rows={F.map(([l, k]) => [
                    <b key="l">{l}</b>, a[k], b[k],
                    a[k] === b[k] ? <Chip key="i" t="No change" tone="ok" /> : oLive ? <Chip key="i" t="Information" tone="info" /> : <Chip key="i" t="Requires action" tone="warn" />,
                ])} />
            </Card>
            {!oLive && (
                <Note className="border-risk-500 bg-risk-50"><b>NOT READY.</b> {o.name} is not ready for commercial activation. Complete resolver, legal, tax, payment and regulatory requirements before activation. <a className="text-controlled-700 hover:underline" href={cHref(o, 'resolver')}>View missing dependencies →</a></Note>
            )}
            {bench && (
                <Card title="Macro benchmark — both countries have AIIM packs" icon="chart" sub={<TagS s="BW_Benchmark" />}>
                    <STable head={['Metric', c.name, o.name]} rows={bench.map((r) => [r[0], r[1], r[2]])} />
                </Card>
            )}
            <Card title="What Changes Next" icon="spark">
                <Ticks items={['Services will become available', 'Prices will be displayed', 'Tax treatment will apply', 'Payment methods will be enabled', 'Legal regime will be confirmed', 'Data & privacy safeguards will apply']} />
                <div className="mt-3 flex flex-wrap gap-2">
                    <A href={cHref(o, 'resolver')}>View Country Context Resolver</A>
                    <A href={cHref(o, 'trade/2', `?partner=${c.iso3}`)}>Trade between the two →</A>
                </div>
            </Card>
        </CountryPage>
    );
}
