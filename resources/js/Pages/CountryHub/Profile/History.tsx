/* P56 Country Change History (prototype pages-profile.js #/c/{ISO}/history). */
import { Card, DataTable, STable, StatusChip } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage, NoPack } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { bw: { editions: Row[]; challenge: Row[]; changes: Row[]; verify: Row[] } | null }

export default function History({ base, bw }: Props) {
    const { c } = base;
    if (!bw) {
        return (
            <CountryPage base={base} pageKey="history">
                <CountryHead base={base} pageKey="history" title="Country Change History" desc="Every change to the country object, its evidence and its resolver state." />
                <NoPack c={c} what="Change history" pageKey="history" />
            </CountryPage>
        );
    }
    return (
        <CountryPage base={base} pageKey="history">
            <CountryHead base={base} pageKey="history" title="Country Change History" desc="Edition log, the challenge of the previous pack, regulatory changes and verification actions — the audit trail behind BW-1.0." />
            <Card title="Edition change log — how the AIIM country packs evolved" icon="layers">
                <STable head={['Edition', 'What it added', 'Binding constraint']} rows={bw.editions.map((r) => [<b key="e">{String(r.Edition ?? '')}</b>, String(r['What it added'] ?? ''), String(r['Binding constraint'] ?? '')])} />
            </Card>
            <Card title="Challenge of DZ-1.0 — weaknesses fixed in BW-1.0" icon="alert" sub="Part 0 of the Country Pack">
                <DataTable<Row> name="BW_Challenge" rows={bw.challenge} size={8} cols={[
                    { k: '#', l: '#' }, { k: 'Weakness in DZ-1.0', l: 'Weakness', clip: true }, { k: 'Why it matters', l: 'Why it matters', clip: true }, { k: 'Fix in BW-1.0', l: 'Fix', clip: true }, { k: 'Where', l: 'Where' },
                ]} />
            </Card>
            <Card title="Regulatory changes in force" icon="bell">
                <DataTable<Row> name="BW_RegChange" rows={bw.changes} size={6} cols={[
                    { k: 'ID', l: 'ID' }, { k: 'Change', l: 'Change' }, { k: 'Instrument', l: 'Instrument' }, { k: 'Status', l: 'Status', r: (x) => <StatusChip s={x.Status} /> }, { k: 'Impact', l: 'Impact' },
                ]} />
            </Card>
            <Card title="Verification actions (09 Oct 2026)" icon="check">
                <DataTable<Row> name="BW_VerifyLog" rows={bw.verify} size={6} cols={[
                    { k: 'Fact', l: 'Fact' }, { k: 'Sector', l: 'Sector' }, { k: 'Result', l: 'Result', r: (x) => <StatusChip s={x.Result} /> }, { k: 'Action', l: 'Action' },
                ]} />
            </Card>
        </CountryPage>
    );
}
