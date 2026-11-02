/* One-Stop Shop & Premium (prototype pages-intel.js #/c/{ISO}/onestop). */
import { A, Card, Cols, DataTable, STable, StatusChip, TagS } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { BwOnly, type BwOnlyData } from '@/Components/CountryHub/IntelData';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase;
    bwOnly: BwOnlyData | null;
    shelf: HubShelf;
    premium?: Row[];
    features?: Row[];
    plan90?: Row[];
    rollout?: Row[];
    readme?: string[];
    summary?: Row[];
}

export default function Onestop({ base, bwOnly, shelf, premium = [], features = [], plan90 = [], rollout = [], readme = [], summary = [] }: Props) {
    if (bwOnly) return <BwOnly base={base} pageKey="onestop" data={bwOnly} shelf={shelf} />;
    const { c } = base;
    return (
        <CountryPage base={base} pageKey="onestop">
            <CountryHead base={base} pageKey="onestop" title="AIIM Botswana as a One-Stop Shop" desc="80 platform features that solve a named user problem, 17 premium products, a 90-day activation plan and the rollout to 54 countries (Parts C, J, K)." />
            <Card title="Premium products and services (Part J)" icon="star">
                <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,230px),1fr))] gap-3">
                    {premium.map((p) => (
                        <div key={String(p.Code)} className="flex min-w-0 flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3">
                            <span className="self-start rounded-[3px] bg-parchment-300 px-1.5 py-px text-[0.66rem] font-bold tracking-wide text-ink-600 uppercase">{p.Code}</span>
                            <h4 className="text-[0.86rem] leading-snug font-semibold text-ink-900">{p.Product}</h4>
                            <div className="text-[0.8rem] text-ink-400">For: {p['For whom']}</div>
                            <div className="text-[0.8rem]">{p.Contents}</div>
                            <div className="mt-auto flex gap-1.5 pt-1"><A sm v="pri" href={cHref(c, 'quote', `?premium=${encodeURIComponent(String(p.Code))}`)}>Request</A></div>
                        </div>
                    ))}
                </div>
            </Card>
            <Card title="One-stop-shop features (80)" icon="layers" sub={<><TagS s="BW_OneStopShop" /> [PROPOSED]</>}>
                <DataTable<Row> name="BW_OneStopShop" rows={features} size={10} filters={['Gate']} cols={[
                    { k: 'Code', l: 'Code' }, { k: 'Feature', l: 'Feature' }, { k: 'User problem', l: 'User problem' }, { k: 'How it works', l: 'How it works', clip: true },
                    { k: 'Gate', l: 'Gate', r: (x) => <StatusChip s={x.Gate} /> },
                ]} />
            </Card>
            <Cols>
                <Card title="90-day activation plan (K-5)" icon="clock">
                    <STable compact head={['Window', 'Action', 'Output', 'Owner', 'KPI']} rows={plan90.map((r) => [<b key="w">{r.Window}</b>, r.Action, r.Output, r.Owner, r.KPI])} />
                </Card>
                <Card title="Rollout to 54 countries (K-7)" icon="globe">
                    <STable compact head={['Wave', 'Countries', 'Note']} rows={rollout.map((r) => [<b key="w">{r.Wave}</b>, r.Countries, r.Note])} />
                </Card>
            </Cols>
            <Card title="Read me — scoring rules" icon="book">
                <ul className="list-disc space-y-1 ps-5">{readme.map((t, i) => <li key={i} className="text-[0.82rem]">{t}</li>)}</ul>
            </Card>
            <Card title="Pack summary (28 measures)" icon="chart">
                <STable compact head={['Measure', 'Value']} rows={summary.map((r) => [r.Measure, <b key="v">{r.Value}</b>])} />
            </Card>
        </CountryPage>
    );
}
