/* P19 Localisation Planner (prototype #/c/{ISO}/localisation). */
import { Bars, Card, STable, StatusChip } from '@/Components/Industries/Kit';
import { cHref } from '@/Components/CountryHub/Layout';
import { MeterCell, Planner } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Props { base: CountryBase; products: { count: number; rows: { en: string; tn: string; hs: string }[] } | null; shelf: HubShelf }

export default function Localisation({ base, products, shelf }: Props) {
    const { c } = base;
    const langs: [string, string, string, number][] = c.isBW ? [['English', 'Primary', 'en-BW', 90], ['Setswana', 'Primary', 'tn-BW', 35], ['Ikalanga', 'Secondary', 'kck', 0]]
        : c.isZA ? [['English', 'Primary', 'en-ZA', 90], ['Afrikaans', 'Primary', 'af-ZA', 60], ['isiZulu', 'Secondary', 'zu-ZA', 25]]
            : (c.languages ?? '').split(',').map((l, i) => [l.trim(), i ? 'Secondary' : 'Primary', '', 0]);
    return (
        <Planner base={base} pageKey="localisation" title="Localisation Planner" desc={`Plan and track localisation requirements to successfully enter and operate in ${c.name}.`}
            score={64} progSub="14 / 22 completed" shelf={shelf}
            kpis={[['Languages in Scope', langs.length, 'Primary pack', 'globe'], ['Critical Items', 3, 'Require attention', 'alert']]}
            blocks={<>
                <Card title="Localisation Overview" icon="layers">
                    <Bars rows={([['Language', 80], ['Formats & Units', 70], ['Content Adaptation', 60], ['Regulatory & Compliance', 50], ['UI / UX Localisation', 75]] as [string, number][]).map(([l, v]) => ({ label: l, value: v, text: `${v} %` }))} />
                </Card>
                <Card title="Target Languages" icon="globe">
                    <STable head={['Language', 'Role', 'Locale', 'Coverage']} rows={langs.map((l) => [<b key="l">{l[0]}</b>, <StatusChip key="r" s={l[1]} />, l[2], <MeterCell key="m" p={l[3]} />])} />
                </Card>
                {products && (
                    <Card title="Terminology to localise (BW_Products)" icon="book">
                        <p className="mb-2 text-[0.82rem]">{products.count} product, species and mineral terms already carry Setswana names flagged <b>[VERIFY]</b>. Examples:</p>
                        <STable compact head={['English', 'Setswana', 'HS']} rows={products.rows.map((p) => [p.en, <i key="t">{p.tn}</i>, p.hs])} />
                    </Card>
                )}
            </>}
            actions={[
                ['LOC-26-001', 'Translate legal disclosures', 'Compliance', 'Legal Team', '25 Oct 2026', 'High', 'In Progress'],
                ['LOC-26-002', `Localise pricing & currency (${c.currency}, VAT)`, 'Formats & Units', 'Finance Team', '28 Oct 2026', 'High', 'In Progress'],
                ['LOC-26-003', 'Adapt terms & conditions', 'Content Adaptation', 'Legal Team', '01 Nov 2026', 'High', 'In Progress'],
                ['LOC-26-004', 'Localise website UI', 'UI/UX Localisation', 'Product Team', '05 Nov 2026', 'Medium', 'In Progress'],
                ['LOC-26-005', c.isBW ? 'Native review of 55 Setswana terms' : 'Prepare secondary-language content pack', 'Language', 'Content Team', '12 Nov 2026', 'Medium', 'Planned'],
            ]}
            summary={[['Total Requirements', 22], ['Completed', 14], ['In Progress', 5], ['Planned', 2], ['Not Started', 1]]}
            acts={[['Edit Localisation Plan', cHref(c, 'localisation'), 'pri'], ['Language Pack Builder', cHref(c, 'langpack')], ['Payment Localisation', cHref(c, 'paylocal')]]}
        />
    );
}
