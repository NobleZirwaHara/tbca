/* P21 Language Pack Builder (prototype #/c/{ISO}/langpack). */
import { Bars, Card, N, STable, StatusChip } from '@/Components/Industries/Kit';
import { cHref } from '@/Components/CountryHub/Layout';
import { MeterCell, Planner } from '@/Components/CountryHub/Journey';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Props { base: CountryBase; pending: number; shelf: HubShelf }

export default function LangPack({ base, pending, shelf }: Props) {
    const { c } = base;
    const L: [string, string, string, number, number, string][] = c.isBW
        ? [['English', 'en-BW', 'Primary', 1248, 100, 'Ready'], ['Setswana', 'tn-BW', 'Primary', 612, 49, 'In Progress'], ['Ikalanga', 'kck-BW', 'Secondary', 0, 0, 'Planned']]
        : [['English', 'en-ZA', 'Primary', 1248, 100, 'Ready'], ['Afrikaans', 'af-ZA', 'Primary', 1102, 90, 'Ready'], ['isiZulu', 'zu-ZA', 'Secondary', 856, 68, 'In Progress'], ['isiXhosa', 'xh-ZA', 'Secondary', 612, 55, 'In Progress'], ['Sesotho', 'st-ZA', 'Additional', 324, 40, 'Planned']];
    return (
        <Planner base={base} pageKey="langpack" title="Language Pack Builder" desc={`Create and manage multi-language packs for ${c.name} to localise your content and user experience.`}
            score={73} progSub={`Languages in pack: ${L.length}`} shelf={shelf}
            kpis={[['Content Items', '1,248', 'In this pack', 'file'], ['Pending Review', pending, c.isBW ? 'Setswana terms [VERIFY]' : 'Require attention', 'alert']]}
            blocks={<>
                <Card title="Language Pack Coverage" icon="globe">
                    <STable head={['Language', 'Locale', 'Role', 'Content items', 'Completion', 'Review']} rows={L.map((l) => [<b key="l">{l[0]}</b>, l[1], <StatusChip key="r" s={l[2]} />, N(l[3]), <MeterCell key="m" p={l[4]} />, <StatusChip key="v" s={l[5]} />])} />
                </Card>
                <Card title="Content Translation Status" icon="layers">
                    <Bars rows={([['Web pages', 83], ['Documents & guides', 66], ['Forms & templates', 71], ['Emails & notifications', 64], ['System messages', 74]] as [string, number][]).map(([l, v]) => ({ label: l, value: v, text: `${v} %` }))} />
                </Card>
            </>}
            actions={[
                ['LPK-26-001', c.isBW ? 'Review Setswana legal terms' : 'Review isiZulu legal terms', 'Language', 'Legal Team', '20 Oct 2026', 'High', 'In Progress'],
                ['LPK-26-002', 'Translate new pricing page', 'Content', 'Content Team', '22 Oct 2026', 'High', 'In Progress'],
                ['LPK-26-003', 'QA secondary-language templates', 'QA', 'QA Team', '25 Oct 2026', 'Medium', 'Planned'],
                ['LPK-26-004', 'Localise email notifications', 'Comms', 'Comms Team', '28 Oct 2026', 'Medium', 'Planned'],
                ['LPK-26-005', 'Accessibility review (all)', 'Accessibility', 'Accessibility Team', '01 Nov 2026', 'Low', 'Not Started'],
            ]}
            summary={[['Total Languages', L.length], ['Ready', L.filter((l) => l[5] === 'Ready').length], ['In Progress', L.filter((l) => l[5] === 'In Progress').length], ['Planned', L.filter((l) => l[5] === 'Planned').length]]}
            acts={[['Edit Language Pack', cHref(c, 'langpack'), 'pri'], ['Export Language Pack (XLIFF)', cHref(c, 'language')]]}
        />
    );
}
