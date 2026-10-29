import { A, Card, DataTable, Kpi, Kpis, N, StatusChip, useMoney } from '@/Components/Industries/Kit';
import { Head1, IndustryPage, Shelf, iHref, sprintHref } from '@/Components/Industries/Layout';
import { useCurrency } from '@/lib/money';
import type { IndustryBase, ServerTableData, SprintCardData } from '@/types/industries';

type Row = { code: string; name: string; type: string; family: string; core: string; cxl: string; status: string; ep: number | null };
interface Props extends IndustryBase {
    fam: { code: string; name: string } | null;
    kpi: { mapped: number; sellable: number; restricted: number; blocked: number; unmatched: number };
    shelf: SprintCardData[];
    table: ServerTableData<Row>;
}

export default function Services(p: Props) {
    const { ind, fam, kpi } = p;
    const money = useMoney();
    const { currency } = useCurrency();
    const qs = new URLSearchParams({ csv: '1', ...(fam ? { fam: fam.code } : {}), ...(p.table.q ? { q: p.table.q } : {}) });
    Object.entries(p.table.f).forEach(([k, v]) => qs.set(`f[${k}]`, v));
    if (p.table.sort !== null) { qs.set('sort', String(p.table.sort)); qs.set('dir', String(p.table.dir)); }

    return (
        <IndustryPage base={p} active="services">
            <Head1 eyebrow="Services & Sprints" title={`${ind.name} — Services & Sprints`}
                desc={`Every catalogue Sprint mapped to ${ind.name} through its service family, with complexity class and boundary status. Prices are the TBCA Sprint catalogue prices (ZAR ex VAT; display currency ${currency}).`}
                act={fam ? <A href={iHref(ind, 'services')}>Clear family filter</A> : undefined} />
            <Kpis>
                <Kpi l="Mapped Sprints" v={N(kpi.mapped)} s={fam ? fam.name : 'All families with weight ≥ 2'} icon="tag" />
                <Kpi l="Sellable" v={N(kpi.sellable)} s="Viable · published" icon="check" />
                <Kpi l="Restricted" v={N(kpi.restricted)} s="Conditioned" icon="alert" />
                <Kpi l="Blocked" v={N(kpi.blocked)} s="Never sold" icon="lock" />
                {kpi.unmatched > 0 && <Kpi l="Not in app catalogue" v={N(kpi.unmatched)} s="Classified, no app Sprint record" icon="db" />}
            </Kpis>
            <Shelf ind={ind} sprints={p.shelf} title="Featured for this industry" />
            <Card title="Full list" icon="tag">
                <DataTable<Row> name={`sprints-${ind.code}`} server={p.table} only={['table']} csvHref={`${iHref(ind, 'services')}?${qs.toString()}`} filters={['family', 'type', 'cxl', 'status', 'core']}
                    rowHref={(r) => sprintHref(ind, r.code)}
                    cols={[
                        { k: 'code', l: 'Code' }, { k: 'name', l: 'Sprint', clip: true }, { k: 'type', l: 'Type' }, { k: 'family', l: 'Family' }, { k: 'core', l: 'Fit' }, { k: 'cxl', l: 'Complexity' },
                        { l: 'Status', r: (r) => <StatusChip s={r.status} />, v: (r) => r.status }, { l: 'From', r: (r) => (r.ep ? money(r.ep) : '—'), v: (r) => r.ep ?? 0, num: true },
                    ]} />
            </Card>
        </IndustryPage>
    );
}
