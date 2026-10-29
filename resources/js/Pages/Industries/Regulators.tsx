import { router } from '@inertiajs/react';
import { A, Card, DataTable, SrcTag } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, iHref } from '@/Components/Industries/Layout';
import type { IndustryBase, Regulator } from '@/types/industries';

interface Props extends IndustryBase { rows: Regulator[] }

export default function Regulators(p: Props) {
    const { ind, ctx } = p;
    return (
        <IndustryPage base={p} active="regulators">
            <Head1 eyebrow="Regulators & Permits" title={`${ind.name} — regulators in ${ctx.country.name}`} desc="Bodies that license, permit or supervise this industry. Botswana uses BW_Permits and BW_Institutions; South Africa uses the mock-up regulator register; other countries show the roles their pack will name." />
            <div>
                <label className="text-[0.8rem]">Country{' '}
                    <select className="h-8 rounded-[4px] border border-parchment-500 bg-white px-1.5 text-[0.78rem]" value={ctx.country.iso3} onChange={(e) => router.get(iHref(ind, 'regulators'), { iso: e.target.value }, { preserveScroll: true })}>
                        {p.countries.map((c) => <option key={c.iso3} value={c.iso3}>{c.name}</option>)}
                    </select>
                </label>
            </div>
            <Card>
                <DataTable<Regulator> key={ctx.country.iso3} name="regulators" rows={p.rows} size={15}
                    cols={[{ k: 'name', l: 'Body / role', clip: true }, { k: 'type', l: 'Type' }, { k: 'what', l: 'Permits / scope', clip: true }, { k: 'time', l: 'Typical time' }, { k: 'status', l: 'Status' }, { l: 'Source', r: (r) => <SrcTag src={r.src} />, v: (r) => r.src }]} />
            </Card>
            <div><A href={`/admin/industries/regulators?iso=${ctx.country.iso3}`}>Sector Regulator Register (admin) →</A></div>
        </IndustryPage>
    );
}
