import { Card, Cols, DataTable, STable, TagP } from '@/Components/Industries/Kit';
import { Head1, IndustryPage } from '@/Components/Industries/Layout';
import type { IndustryBase } from '@/types/industries';

type R = Record<string, string | number | null>;
interface Props extends IndustryBase { chains: R[]; wx: R[]; mapStack: R[]; layers: R[] }

export default function Chains(p: Props) {
    const { ind } = p;
    const s = (r: R, k: string) => String(r[k] ?? '');
    return (
        <IndustryPage base={p} active="chains">
            <Head1 eyebrow="Value Chains & Questions" title={`${ind.name} — what investors and traders ask`} desc="The question chains that drive AIIM: every question maps to information types, a map behaviour and the institution that holds the answer." />
            {p.chains.length ? (
                <Card title="Botswana chains (BW_Chains)" icon="layers">
                    <DataTable<R> name="chains" rows={p.chains} size={12} filters={['Sector name', 'Chain']}
                        cols={[{ k: 'Sector name', l: 'Sector' }, { k: 'Chain', l: 'Chain' }, { k: '#', l: '#', num: true }, { k: 'Question', l: 'Question' }, { k: 'Information types', l: 'Information types', clip: true }, { k: 'Map behaviour', l: 'Map' }, { k: 'Institution/role', l: 'Institution', clip: true }]} />
                </Card>
            ) : <p className="text-[0.85rem]"><TagP /> No AIIM chains mapped to this industry yet.</p>}
            {p.wx.length > 0 && (
                <Card title="South Africa worked example (I2_WX_Chains)" icon="layers">
                    <DataTable<R> name="wx-chains" rows={p.wx} size={8} filters={['Chain']}
                        cols={[{ k: 'Sector name', l: 'Sector' }, { k: 'Chain', l: 'Chain' }, { k: 'Question', l: 'Question' }, { k: 'SA instance', l: 'SA instance', clip: true }, { k: 'Replication role', l: 'Replication role', clip: true }]} />
                </Card>
            )}
            <Cols>
                {p.mapStack.length > 0 && <Card title="Map stack (BW_MapStack)" icon="map"><STable compact head={['Layer', 'Levels', 'Geometry', 'Illumination']} rows={p.mapStack.map((r) => [s(r, 'Layer'), s(r, 'Levels'), s(r, 'Geometry'), <span className="text-[0.78rem]">{s(r, 'Illumination')}</span>])} /></Card>}
                {p.layers.length > 0 && <Card title="Continental map layers (I2_Map_Layers)" icon="map"><STable compact head={['Asset', 'Layer', 'Geometry', 'Security']} rows={p.layers.map((r) => [s(r, 'Asset type'), s(r, 'Layer'), s(r, 'Geometry (derived)'), s(r, 'Security class')])} /></Card>}
            </Cols>
        </IndustryPage>
    );
}
