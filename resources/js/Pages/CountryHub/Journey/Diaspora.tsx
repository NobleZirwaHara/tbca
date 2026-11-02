/* P26 Diaspora and Inbound Capital (prototype #/c/{ISO}/diaspora). */
import { Link } from '@inertiajs/react';
import { Card, Chip, Dl, Kpi, Kpis, pct, STable, StatusChip, TagM } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import { FactCite, JSteps } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf, Row } from '@/types/countryHub';

interface Props { base: CountryBase; pack: boolean; tou?: Row | null; fxOpps?: Row[]; precedents?: Row[]; shelf?: HubShelf }

const IND: [string, string][] = [['Foreign ownership permitted (outside reserved list)', 'Met'], ['Repatriation of capital & profits', 'Met'], ['No exchange controls (since 1999)', 'Met'], ['Investment-grade rating (BBB-)', 'Met'], ['Concessionary tax (manufacturing / IFSC 15 %)', 'Met'], ['Citizen-reservation clarity (DG-03 open)', 'In Progress'], ['Corporate tax certainty (DG-01 open)', 'In Progress'], ['Power supply security (imports ≈35 %)', 'Not Met'], ['Diamond dependence of FX receipts', 'Not Met']];

const tierChip = (t: unknown) => { const s = String(t ?? ''); return s === 'A+' || s === 'A' ? <Chip t={s} tone="ok" /> : s === 'B' ? <Chip t="B" tone="info" /> : <Chip t={s || '—'} />; };

export default function Diaspora({ base, pack, tou, fxOpps: fx = [], precedents = [], shelf }: Props) {
    const { c } = base;
    const head = <CountryHead base={base} pageKey="diaspora" title="Diaspora and Inbound Capital" desc={pack ? `Country-context information to help diaspora and foreign investors explore opportunities in ${c.name}. Not investment advice. Professional advice required.` : 'Country context for diaspora and foreign investors.'} />;
    if (!pack || !shelf) {
        return <CountryPage base={base} pageKey="diaspora">{head}<JSteps c={c} active="diaspora" /><NoPack c={c} what="Inbound capital brief" pageKey="diaspora" /></CountryPage>;
    }
    const met = IND.filter((i) => i[1] === 'Met').length;
    const sc = pct(met + 0.5 * IND.filter((i) => i[1] === 'In Progress').length, IND.length);
    return (
        <CountryPage base={base} pageKey="diaspora">
            {head}
            <JSteps c={c} active="diaspora" />
            {c.isBW ? (
                <>
                    <Kpis>
                        <Kpi l="Capital Opportunity Score" v={`${sc} %`} s={<>{met} / {IND.length} indicators met <TagM /></>} icon="chart" />
                        <Kpi l="FX-earning Top-30 opportunities" v={fx.length} s="Earn hard currency" icon="cash" />
                        <Kpi l="Precedent deals" v={precedents.length} s="Signed / approved / under construction" icon="file" />
                        <Kpi l="Non-citizen arrivals 2024" v="2,081,199" s="BW-TOU-F2" icon="users" />
                    </Kpis>
                    <Card title="Inbound Capital Environment" icon="shield">
                        <STable compact head={['Indicator', 'Status']} rows={IND.map((r) => [r[0], <StatusChip key="s" s={r[1]} />])} />
                    </Card>
                    <Card title="Visitor and diaspora source markets" icon="globe">
                        <p className="text-[0.88rem]">{String(tou?.Value ?? '')}</p>
                        <p className="mt-2"><FactCite r={tou} /></p>
                    </Card>
                    <Card title="Top sectors for inbound capital — FX-earning opportunities" icon="star">
                        <STable compact head={['Opp', 'Sector', 'Band', 'Tier', 'Time to revenue']} rows={fx.map((r) => [
                            <Link key="o" href={cHref(BW, `opp/${r['Opp ID']}`)} className="text-controlled-700 hover:underline">{r.Opportunity}</Link>,
                            String(r.Sector), String(r.Band ?? '').split(' ')[0], tierChip(r.Tier), String(r['Time to revenue'] ?? ''),
                        ])} />
                    </Card>
                    <Card title="Precedent deals that signal appetite" icon="file">
                        <STable compact head={['Deal', 'Size', 'Date', 'Status']} rows={precedents.map((r) => [String(r.Deal), String(r.Size), String(r.Date), <StatusChip key="s" s={r.Status} />])} />
                    </Card>
                    <Card title="Money movement" icon="swap">
                        <Dl rows={[['Opening a local account', 'Standard KYC / AML'], ['Forex inflow', 'Via authorised dealers'], ['Profit repatriation', 'No exchange controls (BW-MAC-F19)'], ['Currency regime', 'Crawling peg, 50 % ZAR / 50 % SDR (BW-MAC-F11)'], ['Reserves', 'US$4.162 bn end-Jun 2026 (BW-MAC-F12)']]} />
                    </Card>
                </>
            ) : (
                <>
                    <Kpis>
                        <Kpi l="Capital Opportunity Score" v="68 %" s="17/25 indicators met" icon="chart" />
                        <Kpi l="Key Opportunities" v="12" s="High-potential sectors" icon="star" />
                        <Kpi l="Estimated diaspora" v="3.0 M+" s="USA, UK, Australia, Canada, UAE" icon="users" />
                    </Kpis>
                    <Card title="Top Sectors for Inbound Capital" icon="star" sub="Mock-up P26 content">
                        <STable head={['Sector', 'Opportunity', 'Policy support', 'Readiness']} rows={[['Renewable Energy', 'High', 'High', 'High'], ['Mining & Critical Minerals', 'High', 'Medium', 'High'], ['Infrastructure (Transport)', 'High', 'High', 'Medium'], ['Agri-processing & Food', 'Medium', 'High', 'Medium'], ['Technology & Digital Services', 'Medium', 'Medium', 'Medium']]} />
                    </Card>
                </>
            )}
            <SprintShelf shelf={shelf} c={c} />
        </CountryPage>
    );
}
