/* P41 to P46 Ledger fee views (prototype pages-corridors.js #/corridors/ledger/{T|X|S|P|D|CT-C}/A/B). */
import { Link } from '@inertiajs/react';
import { A, B, Card, Cols, Kpi, Kpis, STable, StatusChip, sum, TagM, useMoney, useToast } from '@/Components/Industries/Kit';
import { cHref } from '@/Components/CountryHub/Layout';
import { CorridorHead, CorrPage, corUrl, pairCrumb, useMoney2, type Ledg, type Pair } from '@/Components/CountryHub/Corridors';

interface Line { name: string; purpose: string; amount: number | null; cert: string; ref: string; code: string | null }
interface Props { cr: Pair; ledger: string; lg: Ledg; lines: Line[]; aSlug: string }

const OWNER: Record<string, string> = { T: 'TBCA', P: 'Licensed partners', S: 'Government authorities' };

export default function Ledger({ cr, ledger: L, lg, lines, aSlug }: Props) {
    const money = useMoney();
    const money2 = useMoney2();
    const toast = useToast();
    const shown = lines.filter((l) => l.cert !== 'Price Suppressed' && l.amount !== null);
    return (
        <CorrPage crumbs={[pairCrumb(cr), [`Ledger ${L}`]]}>
            <CorridorHead cr={cr} view={`ledger/${L}`} title={`Ledger ${L} Fee View`} sub={`${lg[1]} only — ${lg[2]}. Other economic classes are shown separately in their own ledgers.`} />
            <Kpis>
                <Kpi l="Ledger" v={`${L} · ${lg[1]}`} icon="file" />
                <Kpi l="Ledger owner" v={OWNER[L] ?? 'Third parties'} icon="users" />
                <Kpi l="Resolved / model lines" v={shown.length} s={`${lines.length - shown.length} suppressed`} icon="check" />
                <Kpi l="Estimated ledger range" v={money(sum(shown.map((l) => l.amount ?? 0)))} s="Excludes suppressed lines" icon="cash" />
                <Kpi l="Commercial rule" v="No combined total" s="No cross-ledger combination" icon="lock" />
            </Kpis>
            <Card title={`${L} Fee Lines`} icon="cash" sub={L === 'T' ? 'Amounts = catalogue entry prices (ECON-R0C), ex VAT' : <><TagM /> model basis — split of the ledger estimate</>}>
                <STable head={['#', 'Fee line', 'Purpose', 'Certainty', 'Amount', 'Resolver reference', 'Catalogue']} rows={lines.map((l, i) => [
                    i + 1, <b key="n">{l.name}</b>, l.purpose, <StatusChip key="c" s={l.cert} />,
                    l.cert === 'Price Suppressed' || l.amount === null ? <span key="a" className="text-ink-400">Price Suppressed</span> : money2(l.amount),
                    <span key="r" className="font-mono text-[0.7rem]">{l.ref}</span>,
                    l.code ? <Link key="k" className="font-mono text-controlled-700 hover:underline" href={cHref({ slug: aSlug }, `service/${encodeURIComponent(l.code)}`)}>{l.code}</Link> : '',
                ])} />
            </Card>
            <Cols n={3}>
                <Card title="Why fees are separated"><p className="text-[0.82rem]">TBCA enforces economic separation. Each ledger covers one fee class only and is published and controlled independently.</p></Card>
                <Card title="No Resolution, No Price"><p className="text-[0.82rem]">Some lines are unresolved — their price is suppressed until permission and evidence are complete.</p></Card>
                <Card title="Evidence-first fee publication"><p className="text-[0.82rem]">Resolver confirms price certainty and records the evidence reference for every line.</p></Card>
            </Cols>
            <div className="flex flex-wrap gap-2">
                <B onClick={() => toast.show('Ledger export is not available yet.')}>Export Ledger {L} (CSV)</B>
                <A v="pri" href={corUrl('fees', cr.a, cr.b)}>Fee Schedule Comparison →</A>
            </div>
            {toast.node}
        </CorrPage>
    );
}
