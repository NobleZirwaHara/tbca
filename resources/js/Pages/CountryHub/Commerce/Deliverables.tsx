/* P32 Country Deliverables and Evidence (prototype #/c/{ISO}/deliverables). */
import { router } from '@inertiajs/react';
import { A, B, Card, Chip, Kpi, Kpis, STable, StatusChip } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { CSteps, MeterCell, type JourneySprint, type JourneyState } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

interface Props {
    base: CountryBase;
    j: JourneyState;
    s: JourneySprint;
    domains: { dom: string; n: number; p: number }[] | null;
    premiumStore: { code: string; name: string; contents: string }[] | null;
}

export default function Deliverables({ base, j, s, domains, premiumStore }: Props) {
    const { c } = base;
    const D: [string, string, string][] = [[`${s.name} — draft`, 'v0.9', 'In Review'], ['Scope confirmation note', 'v1.0', 'Completed'], ['Data request register', 'v1.1', 'In Progress'], [`Evidence pack ${c.iso2}-01`, 'v1.0', 'Pending'], [`${s.name} — final`, 'v0.1', 'Not Started']];
    const accept = j.accepted
        ? <Chip t={`Accepted ${j.accepted}`} tone="ok" />
        : <B sm v="pri" disabled={!j.paid} title={j.paid ? undefined : 'Available after payment'} onClick={() => router.post(cHref(c, 'deliverables'))}>Accept deliverables</B>;
    return (
        <CountryPage base={base} pageKey="deliverables">
            <CountryHead base={base} pageKey="deliverables" title="Country Deliverables and Evidence" desc={`Track deliverables, evidence packs, review status and source-backed outputs for your ${c.name} engagement.`} />
            <CSteps c={c} active="deliverables" j={j} />
            <Kpis>
                <Kpi l="Total deliverables" v={D.length} icon="file" />
                <Kpi l="Evidence review state" v="Current" s="Human-reviewed" icon="shield" />
                <Kpi l="Verified domains" v={c.isBW ? '18 / 18' : '—'} icon="db" />
                <Kpi l="Open review items" v={2} icon="alert" />
            </Kpis>
            <Card title="Deliverables Register" icon="file" act={accept}>
                <STable head={['#', 'Deliverable', 'Version', 'Status', 'Evidence pack']} rows={D.map((d, i) => [i + 1, <b key="d">{d[0]}</b>, d[1], <StatusChip key="s" s={d[2]} />, `${c.iso2}-01`])} />
            </Card>
            {domains && (
                <Card title="Evidence Pack Summary — source quality & freshness by domain" icon="db">
                    <STable head={['Domain', 'Facts', 'Grade 3 share', 'Status']} rows={domains.map((d) => [d.dom, d.n, <MeterCell key="m" p={d.p} tone="ok" />, <StatusChip key="s" s="Verified" />])} />
                </Card>
            )}
            {premiumStore && (
                <Card title="Add-on deliverables from the Botswana premium store" icon="star">
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,220px),1fr))] gap-3">
                        {premiumStore.map((p) => (
                            <div key={p.code} className="flex min-w-0 flex-col gap-1.5 rounded-[6px] border border-parchment-400 bg-white p-3">
                                <span className="self-start rounded-[3px] bg-parchment-300 px-1.5 py-px text-[0.66rem] font-bold text-ink-600 uppercase">{p.code}</span>
                                <h4 className="text-[0.88rem] leading-snug font-semibold text-ink-900">{p.name}</h4>
                                <div className="text-[0.8rem]">{p.contents}</div>
                                <div className="mt-auto pt-1"><A sm v="pri" href={cHref(BW, 'quote', `?premium=${encodeURIComponent(p.code)}`)}>Add</A></div>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </CountryPage>
    );
}
