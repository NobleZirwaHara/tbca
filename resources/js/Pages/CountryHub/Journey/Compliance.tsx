/* P22 Country Compliance Planner: interactive permit timeline (prototype #/c/{ISO}/compliance?sector=). */
import { Card, Cols, Kpi, Kpis, N, PillNav, STable, StatusChip, TagM, TagP, TagR } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import { FactCite, JSteps } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props {
    base: CountryBase;
    pack: boolean;
    sector?: string;
    sectors?: Record<string, string>;
    permit?: { issuer: string; time: string; items: string[]; lo: number; hi: number };
    changes?: Row[];
    rules?: Row[];
    shelf?: HubShelf;
}

function Timeline({ items, lo, hi, label }: { items: string[]; lo: number; hi: number; label: string }) {
    const W = 640;
    const span = Math.max(hi + 2, 12);
    const sc = (x: number) => 160 + (x * (W - 180)) / span;
    return (
        <svg viewBox={`0 0 ${W} ${40 + items.length * 34}`} width="100%" role="img" aria-label={`Permit timeline for ${label}: ${lo} to ${hi} months`}>
            {[0, 3, 6, 9, 12, 18, 24].filter((x) => x <= span).map((x) => (
                <g key={x}>
                    <line x1={sc(x)} x2={sc(x)} y1={18} y2={30 + items.length * 34} stroke="#ebe0cd" />
                    <text x={sc(x)} y={12} fontSize={10} textAnchor="middle" fill="#6b6b78">M{x}</text>
                </g>
            ))}
            {items.map((it, i) => {
                const s = i, e = s + lo + ((hi - lo) * (i + 1)) / items.length;
                return (
                    <g key={i}>
                        <text x={0} y={42 + i * 34} fontSize={11} fill="#23232a">{it.slice(0, 26)}</text>
                        <rect x={sc(s)} y={30 + i * 34} width={sc(e) - sc(s)} height={16} rx={3} fill="#d6a32e" />
                        <text x={sc(e) + 4} y={42 + i * 34} fontSize={10} fill="#4a4a56">{N(e - s, 0)} m</text>
                    </g>
                );
            })}
        </svg>
    );
}

export default function Compliance({ base, pack, sector = 'MIN', sectors = {}, permit, changes = [], rules = [], shelf }: Props) {
    const { c } = base;
    if (!pack || !permit || !shelf) {
        return (
            <CountryPage base={base} pageKey="compliance">
                <CountryHead base={base} pageKey="compliance" title="Country Compliance Planner" desc="Permits, filings and regulatory watch for your entry." />
                <JSteps c={c} active="compliance" />
                <NoPack c={c} what="Compliance planner" pageKey="compliance" />
            </CountryPage>
        );
    }
    const name = sectors[sector] ?? sector;
    const { items, lo, hi } = permit;
    return (
        <CountryPage base={base} pageKey="compliance" extraCrumbs={[[name]]}>
            <CountryHead base={base} pageKey="compliance" title="Country Compliance Planner" desc="Choose your sector: the planner lays out the permits, issuers and lead times from the pack, adds the citizen rules and the regulatory changes to watch." />
            <JSteps c={c} active="compliance" />
            <PillNav items={Object.keys(sectors).map((k) => ({ label: k, href: cHref(BW, 'compliance', `?sector=${k}`), on: k === sector }))} />
            <Kpis>
                <Kpi l="Sector" v={name} icon="layers" />
                <Kpi l="Permits" v={items.length} s={permit.issuer} icon="file" />
                <Kpi l="Typical lead time" v={permit.time} s="Marked [VERIFY] in the pack" icon="clock" />
                <Kpi l="Regulatory changes to watch" v={changes.length} s="In this sector" icon="bell" />
            </Kpis>
            <Card title={<>Permit timeline <TagM /></>} icon="clock">
                <Timeline items={items} lo={lo} hi={hi} label={name} />
                <p className="text-[0.72rem] text-ink-400">Bars spread the pack's typical range ({permit.time}) across the permits in sequence — an indicative plan, not a regulator commitment.</p>
            </Card>
            <Cols n={2}>
                <Card title="Citizen rules that apply to every entrant" icon="users">
                    <STable compact head={['Rule', 'Evidence']} rows={rules.map((r) => [String(r.Item ?? ''), <FactCite key="f" r={r} />])} />
                </Card>
                <Card title="Regulatory changes in this sector" icon="bell">
                    <STable compact head={['ID', 'Change', 'Status', 'Impact']} rows={changes.length
                        ? changes.map((r) => [String(r.ID), String(r.Change), <StatusChip key="s" s={r.Status} />, String(r.Impact ?? '')])
                        : [['—', 'No sector-specific change logged', '', '']]} />
                </Card>
            </Cols>
            <Card title={<>Compliance calendar (first year) <TagP /></>} icon="file">
                <STable head={['Month', 'Obligation', 'Authority']} rows={[
                    ['M1', 'Company registration & trading licence', <>CIPA / Local authority <TagR /></>],
                    ['M1', 'Tax registration (CIT, VAT if above threshold)', <>BURS <TagR /></>],
                    [`M2–M${hi}`, items.join(' · ') || 'Sector permits', permit.issuer],
                    ['Monthly', 'VAT and PAYE returns', <>BURS <TagR /></>],
                    ['Annual', 'Annual return & financial statements', <>CIPA / BURS <TagR /></>],
                ]} />
            </Card>
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
