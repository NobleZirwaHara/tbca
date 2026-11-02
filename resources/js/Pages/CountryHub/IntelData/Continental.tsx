/* Continental Model: the Issue 2.0 (I2) sheets for every country (prototype pages-intel.js #/c/{ISO}/continental). */
import { Card, DataTable, TagS, Tabs } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { HubAfricaMap, MapLegend } from '@/Components/CountryHub/Maps';
import { csvHref } from '@/Components/CountryHub/IntelData';
import type { CountryBase, CountryOption, Row } from '@/types/countryHub';
import type { ServerTableData } from '@/types/industries';

interface Props {
    base: CountryBase;
    tab: string;
    tabs: [string, string][];
    sheet: string;
    label: string;
    headers: string[];
    filters: string[];
    table: ServerTableData<Row>;
    activation: Record<string, { wave: string; status: string }> | null;
    map: (CountryOption & { pack: string | null })[] | null;
}

const WAVE = ['#2fa35a', '#d6a32e', '#e6bd63', '#9a9aa5', '#6b6b78', '#4a4a56'];

export default function Continental({ base, tab, tabs, sheet, label, headers, filters, table, activation, map }: Props) {
    const { c } = base;
    const path = cHref(c, 'continental');
    return (
        <CountryPage base={base} pageKey="continental" extraCrumbs={[[label]]}>
            <CountryHead base={base} pageKey="continental" title="Continental Model" desc="The Issue 2.0 continental catalogue that every country pack replicates: assets, layers, roles, the South Africa model instance and the 54-country activation plan." />
            <Tabs items={tabs} active={tab} hrefFor={(k) => `${path}?tab=${k}`} />
            {tab === 'activation' && activation && map && (
                <Card title="54-country activation — proposed waves" icon="map">
                    <HubAfricaMap countries={map} dark={false} label="Map of Africa: proposed activation wave per country"
                        fill={(iso) => WAVE[parseInt(String(activation[iso]?.wave ?? ''), 10) || 0]}
                        tip={(iso, name) => `${name}\nWave ${activation[iso]?.wave ?? ''} · ${activation[iso]?.status ?? ''}`} />
                    <MapLegend items={[[WAVE[0], 'Wave 0'], [WAVE[1], '1'], [WAVE[2], '2'], [WAVE[3], '3'], [WAVE[4], '4'], [WAVE[5], '5']]} />
                </Card>
            )}
            <Card title={label} icon="db" sub={<TagS s={sheet} />}>
                <DataTable<Row> key={tab} name={sheet} server={table} only={['table']} filters={filters} csvHref={csvHref(path, table, { tab })}
                    cols={headers.map((h) => ({ k: h, l: h, clip: true }))} />
            </Card>
        </CountryPage>
    );
}
