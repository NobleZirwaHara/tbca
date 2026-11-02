/* P04 Country Evidence Panel (prototype pages-profile.js #/c/{ISO}/evidence). */
import { Link } from '@inertiajs/react';
import { useState } from 'react';
import { A, B, Bars, Card, Cols, DataTable, GradeChip, Ic, Kpi, Kpis, Meter, Modal, pct, STable, StatusChip, TagP } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, NoPack, SprintShelf, Why } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Ev { id: string; dom: string; t: string; v: string; src: string; d: string; g: number | string; url: string | null }
interface Props extends ProfileProps {
    bw: { doms: { k: string; n: string; f: number; g3: number; last: string }[]; all: Ev[]; sources: Row[]; conflicts: Row[]; verify: Row[] } | null;
}

const ZA_ITEMS = [['EV-25-00187', 'SARB Quarterly Bulletin – Q2 2026', 'Economy & Financial', 'South African Reserve Bank', 'Official Publication', '30 Jun 2026', 'High'], ['EV-25-00191', 'Companies Act, 2008 (Act 71 of 2008) – Consolidated', 'Legal & Regulatory', 'Government Gazette', 'Primary Legislation', '01 Jul 2026', 'High'], ['EV-25-00192', 'SARS Guide 2026: Individual Tax Returns', 'Tax & Statutory', 'South African Revenue Service', 'Official Publication', '12 Jul 2026', 'High'], ['EV-25-00195', 'South Africa FDI Report 2026', 'Investment & Business', 'UNCTAD', 'International Report', '20 Jul 2026', 'High'], ['EV-25-00148', 'Transport Freight Statistics FY Plan 2026', 'Infrastructure & Logistics', 'Transnet', 'Corporate Publication', '18 Jul 2026', 'Medium']];
const ZA_MANIFEST: [string, number][] = [['Official Government Sources', 31], ['Regulatory & Statutory Bodies', 22], ['International Organisations', 18], ['Research & Think Tanks', 16], ['Private Sector / Corporate', 16], ['Academic & Universities', 6], ['Media (Verified)', 3], ['Other Open Sources', 2]];

function ZaEvidence() {
    return (
        <>
            <Kpis>
                <Kpi l="Country State" v="Activated" s="Commercial objects with valid resolver" icon="shield" />
                <Kpi l="Contradiction Status" v="No Open Contradictions" icon="alert" />
                <Kpi l="Evidence Currentness" v="Current" s="All critical domains current" icon="clock" />
                <Kpi l="Evidence Confidence" v="High" s="Overall confidence rating" icon="check" />
                <Kpi l="Last Quality Review" v="15 Aug 2026" s="Next review: 12 Sep 2026" icon="file" />
            </Kpis>
            <Card title="Top Evidence Items (5 of 109)" icon="file" sub={<>Mock-up P04 content <TagP /></>}>
                <STable head={['ID', 'Evidence title', 'Domain', 'Source', 'Class', 'As of', 'Confidence']} rows={ZA_ITEMS.map((r) => r.map((x, i) => (i === 6 ? <StatusChip key={i} s={x === 'High' ? 'Current · High' : 'Medium'} /> : x)))} />
            </Card>
            <Card title="Source Manifest" icon="db">
                <Bars rows={ZA_MANIFEST.map(([label, value]) => ({ label, value }))} />
            </Card>
        </>
    );
}

function csvOf(rows: Ev[]) {
    const cols: [string, keyof Ev][] = [['ID', 'id'], ['Domain', 'dom'], ['Title', 't'], ['Value', 'v'], ['Source', 'src'], ['Date', 'd'], ['Grade', 'g'], ['URL', 'url']];
    const q = (v: unknown) => { const s = String(v ?? ''); return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s; };
    return [cols.map((c) => q(c[0])).join(','), ...rows.map((r) => cols.map((c) => q(r[c[1]])).join(','))].join('\n');
}

export default function Evidence({ base, bw, shelf }: Props) {
    const { c } = base;
    const [open, setOpen] = useState(false);
    if (!bw) {
        return (
            <CountryPage base={base} pageKey="evidence">
                <CountryHead base={base} pageKey="evidence" title="Country Evidence Panel" desc="Evidence summary by domain, source manifest and contradiction status." />
                {c.isZA ? <ZaEvidence /> : <NoPack c={c} what="Evidence panel" pageKey="evidence" />}
            </CountryPage>
        );
    }
    const download = () => {
        const a = document.createElement('a');
        a.href = URL.createObjectURL(new Blob([csvOf(bw.all)], { type: 'text/csv' }));
        a.download = 'BW_evidence_items.csv';
        a.click();
    };
    return (
        <CountryPage base={base} pageKey="evidence">
            <CountryHead base={base} pageKey="evidence" title="Country Evidence Panel" desc="Every figure on the Botswana pages traces to one of these 129 facts and 90 sources, each with grade, date and URL."
                act={<B v="pri" onClick={() => setOpen(true)}>Download Evidence Pack</B>} />
            <Kpis>
                <Kpi l="Country State" v="Activated" s="Full pack BW-1.0 · CPDS-1.2" icon="shield" />
                <Kpi l="Contradictions" v="20 handled" s="0 open — all labelled" icon="alert" />
                <Kpi l="Evidence Currentness" v="Current" s="Freshness gate: Tier A needs fact ≤ 18 months" icon="clock" />
                <Kpi l="Evidence Confidence" v="76 % grade 3" s="102 sector + 27 macro facts" icon="check" />
                <Kpi l="Last Quality Review" v="09 Oct 2026" s="18 facts re-fetched (seed 2026)" icon="file" />
            </Kpis>
            <Card title="Evidence Summary by Domain" icon="layers" sub="18 sectors + macro · click a domain for the sector page">
                <Cols n={3}>
                    {bw.doms.map((d) => (
                        <Link key={d.k} href={cHref(BW, `sector/${d.k}`)} className="flex min-w-0 items-start gap-2.5 rounded-[6px] border border-parchment-400 bg-white p-3 hover:border-gold-400">
                            <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-gold-50 text-gold-700"><Ic n="db" /></span>
                            <div className="min-w-0 flex-1">
                                <div className="text-[0.72rem] font-semibold text-ink-400">{d.n}</div>
                                <div className="text-[1rem] leading-tight font-bold text-ink-900">{d.f} facts · {pct(d.g3, d.f)} % G3</div>
                                <div className="mb-1 text-[0.72rem] text-ink-400">Latest {d.last}</div>
                                <Meter p={pct(d.g3, d.f)} tone="ok" />
                            </div>
                        </Link>
                    ))}
                    <div className="flex min-w-0 items-start gap-2.5 rounded-[6px] border border-parchment-400 bg-white p-3">
                        <span className="grid size-7 shrink-0 place-items-center rounded-[6px] bg-gold-50 text-gold-700"><Ic n="chart" /></span>
                        <div><div className="text-[0.72rem] font-semibold text-ink-400">Macro &amp; Economy</div><div className="text-[1rem] font-bold text-ink-900">27 facts</div><div className="text-[0.72rem] text-ink-400">BW_Macro</div></div>
                    </div>
                </Cols>
            </Card>
            <Card title="All Evidence Items (129)" icon="file">
                <DataTable<Ev> name="BW_evidence_items" rows={bw.all} filters={['dom', 'g']} size={10} cols={[
                    { k: 'id', l: 'ID', r: (x) => <span className="font-mono">{x.id}</span> }, { k: 'dom', l: 'Domain' }, { k: 't', l: 'Evidence title' }, { k: 'v', l: 'Value', clip: true },
                    { k: 'src', l: 'Source', clip: true }, { k: 'd', l: 'As of' }, { k: 'g', l: 'Grade', r: (x) => <GradeChip g={x.g} /> },
                    { k: 'url', l: 'Link', r: (x) => (x.url ? <a href={x.url} target="_blank" rel="noopener" className="inline-flex items-center gap-1 text-controlled-700 hover:underline">open <Ic n="ext" className="size-3" /></a> : '') },
                ]} />
            </Card>
            <Cols n={2}>
                <Card title="Source Manifest (90 sources)" icon="db">
                    <DataTable<Row> name="BW_Sources" rows={bw.sources} size={8} filters={['Grade']} cols={[
                        { k: 'Source', l: 'Source', clip: true }, { k: 'Date', l: 'Date' }, { k: 'Fact IDs', l: 'Fact IDs', clip: true }, { k: 'Grade', l: 'Grade', r: (x) => <GradeChip g={x.Grade} /> },
                    ]} />
                </Card>
                <Card title="Contradiction Register (20)" icon="alert">
                    <DataTable<Row> name="BW_Conflicts" rows={bw.conflicts} size={8} cols={[
                        { k: 'ID', l: 'ID' }, { k: 'Item', l: 'Item' }, { k: 'Value A', l: 'Value A', clip: true }, { k: 'Value B', l: 'Value B', clip: true }, { k: 'Handling', l: 'Handling' },
                    ]} />
                </Card>
            </Cols>
            <Card title="Verification Log — seeded random sample (18 facts)" icon="check">
                <DataTable<Row> name="BW_VerifyLog" rows={bw.verify} size={6} cols={[
                    { k: 'Fact', l: 'Fact' }, { k: 'Sector', l: 'Sector' }, { k: 'Finding', l: 'Finding', clip: true }, { k: 'Result', l: 'Result', r: (x) => <StatusChip s={x.Result} /> }, { k: 'Action', l: 'Action' },
                ]} />
            </Card>
            <Why>A buyer can open any figure, see who said it and when, and judge it. That is what makes a country page decision-grade rather than marketing.</Why>
            {shelf && <SprintShelf shelf={shelf} c={c} />}
            <Modal title="Download Evidence Pack" open={open} onClose={() => setOpen(false)}>
                <p className="mb-3 text-[0.88rem]">The Botswana evidence pack contains 129 facts, 90 sources, 20 contradictions and the 18-fact verification log.</p>
                <div className="flex flex-wrap gap-2">
                    <B v="pri" onClick={download}>Download CSV</B>
                    <A href={cHref(BW, 'dataroom/BW_Facts')}>Open in Data Room</A>
                </div>
            </Modal>
        </CountryPage>
    );
}
