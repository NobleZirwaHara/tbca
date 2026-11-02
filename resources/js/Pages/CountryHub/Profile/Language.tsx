/* P13 Country Language and Localisation (prototype pages-profile.js #/c/{ISO}/language). */
import { Link } from '@inertiajs/react';
import { Card, DataTable, Kpi, Kpis, Meter, N, Note, STable, StatusChip, TagM, TagR, TagS } from '@/Components/Industries/Kit';
import { BW, cHref, CountryHead, CountryPage, SprintShelf } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import type { Row } from '@/types/countryHub';

interface Props extends ProfileProps { products: Row[] | null }
type Lang = [string, string, string, string, number];

export default function Language({ base, products, shelf }: Props) {
    const { c } = base;
    const langs: Lang[] = c.isBW
        ? [['English', 'EN', 'English', 'Primary (official)', 100], ['Setswana', 'TN', 'Setswana', 'Primary (national)', 22], ['Afrikaans', 'AF', 'Afrikaans', 'Available', 0], ['Ikalanga', 'KCK', 'Ikalanga', 'Planned', 0]]
        : c.isZA
            ? [['English', 'EN', 'English', 'Primary', 100], ['Afrikaans', 'AF', 'Afrikaans', 'Primary', 100], ['Zulu', 'ZU', 'isiZulu', 'Available', 15], ['Xhosa', 'XH', 'isiXhosa', 'Planned', 0], ['Sesotho', 'ST', 'Sesotho', 'Planned', 0], ['Tswana', 'TN', 'Setswana', 'Planned', 0]]
            : (c.languages ?? '').split(',').map((l, i): Lang => [l.trim(), '', l.trim(), i ? 'Planned' : 'Primary', 0]);
    return (
        <CountryPage base={base} pageKey="language">
            <CountryHead base={base} pageKey="language" title="Country Language and Localisation" desc={`Manage supported languages, content localisation, terminology and cultural adaptation for ${c.name}.`} />
            <Kpis>
                <Kpi l="Primary Languages" v={langs.filter((l) => /Primary/.test(l[3])).map((l) => l[0]).join(', ')} icon="globe" />
                <Kpi l="Content Localised" v={c.isBW ? '61 %' : c.isZA ? '87 %' : '0 %'} s={<>Of active content <TagM /></>} icon="check" />
                <Kpi l="Setswana product terms" v={products ? N(products.length) : '—'} s={products ? 'BW_Products (flagged [VERIFY])' : undefined} icon="book" />
                <Kpi l="Character set" v="Unicode UTF-8" s="Latin · no RTL" icon="file" />
            </Kpis>
            <Card title="Supported Languages" icon="globe" sub={c.isBW ? <>English is the official business language; Setswana is the national language <TagR /></> : undefined}>
                <STable head={['Language', 'Code', 'Native name', 'Status', 'Content coverage']} rows={langs.map((l) => [
                    <b key="l">{l[0]}</b>, l[1], l[2], <StatusChip key="s" s={l[3]} />,
                    <div key="m" className="flex min-w-[120px] items-center gap-2"><div className="flex-1"><Meter p={l[4]} /></div><span className="text-[0.72rem]">{l[4]} %</span></div>,
                ])} />
            </Card>
            {products && (
                <Card title="Product, species and mineral register — English and Setswana (Part E)" icon="book" sub={<TagS s="BW_Products" />}>
                    <DataTable<Row> name="BW_Products" rows={products} size={10} filters={['Group']} cols={[
                        { k: 'Group', l: 'Group' }, { k: 'Product', l: 'Product' }, { k: 'Setswana [VERIFY]', l: 'Setswana', r: (x) => <i>{String(x['Setswana [VERIFY]'] ?? '')}</i> },
                        { k: 'HS 2022', l: 'HS 2022' }, { k: 'Sector', l: 'Sector', r: (x) => <Link className="text-controlled-700 hover:underline" href={cHref(BW, `sector/${x.Sector}`)}>{String(x.Sector ?? '')}</Link> }, { k: 'Note', l: 'Note' },
                    ]} />
                    <Note className="mt-2">Setswana terms carry a <b>[VERIFY]</b> flag in the pack: they need native-speaker review before publication. This is exactly the work the <Link className="text-controlled-700 hover:underline" href={cHref(BW, 'langpack')}>Language Pack Builder</Link> schedules.</Note>
                </Card>
            )}
            {shelf && <SprintShelf shelf={shelf} c={c} />}
        </CountryPage>
    );
}
