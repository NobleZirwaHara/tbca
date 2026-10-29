import { Card, DataTable, TagP, Ticks } from '@/Components/Industries/Kit';
import { Head1, IndustryPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type R = Record<string, string | number | null>;
interface Props extends IndustryBase { groups: string[]; commodities: R[]; products: R[] }

export default function Commodities(p: Props) {
    const { ind } = p;
    return (
        <IndustryPage base={p} active="commodities">
            <Head1 eyebrow="Products & HS Codes" title={`${ind.name} — products and tariff lines`} desc="HS 2022 codes used for trade intelligence, tariff checks and the Import & Export heat maps." />
            <Card title="Industry HS groups in the trade model" icon="swap">
                {p.groups.length ? <Ticks items={p.groups} /> : <p className="text-[0.85rem]"><TagP /> Services industry — no goods groups.</p>}
            </Card>
            {p.commodities.length > 0 && (
                <Card title="Commodities (I2_Commodity_HS)" icon="tag">
                    <DataTable<R> name="commodities" rows={p.commodities} size={12} filters={['Group']}
                        cols={[{ k: 'Group', l: 'Group' }, { k: 'Commodity', l: 'Commodity' }, { k: 'HS 2022 (6-digit)', l: 'HS 2022' }, { k: 'SA model anchor / note', l: 'Anchor', clip: true }, { k: 'Commodity-specific must-find', l: 'Must-find', clip: true }]} />
                </Card>
            )}
            {p.products.length > 0 && (
                <Card title="Botswana products (EN / Setswana)" icon="globe">
                    <DataTable<R> name="bw-products" rows={p.products} size={12} cols={[{ k: 'Group', l: 'Group' }, { k: 'Product', l: 'Product' }, { k: 'Setswana [VERIFY]', l: 'Setswana' }, { k: 'HS 2022', l: 'HS' }, { k: 'Note', l: 'Note', clip: true }]} />
                </Card>
            )}
        </IndustryPage>
    );
}
