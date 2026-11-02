/* P06 Country Service Catalogue (prototype pages-profile.js #/c/{ISO}/catalogue?topic=). */
import { Link, router } from '@inertiajs/react';
import { A, B, Card, Chip, Cols, DataTable, Kpi, Kpis, N, StatusChip, useMoney } from '@/Components/Industries/Kit';
import { cHref, corHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import type { ProfileProps } from '@/Components/CountryHub/Profile';
import { cn } from '@/lib/cn';
import type { ServerTableData } from '@/types/industries';
import type { TopicCount } from './Availability';

type Row = { code: string; name: string; cat: string; type: string | null; entry: string | null; price: number | null; avail: string };
interface Props extends ProfileProps {
    topic: string | null;
    cats: TopicCount[];
    kpi: { a: number; r: number; u: number; total: number };
    table: ServerTableData<Row>;
}

export default function Catalogue({ base, topic, cats, kpi, table }: Props) {
    const { c } = base;
    const money = useMoney();
    const topicLabel = cats.find((x) => x.k === topic)?.l;
    const qs = new URLSearchParams({ csv: '1', ...(topic ? { topic } : {}), ...(table.q ? { q: table.q } : {}) });
    Object.entries(table.f).forEach(([k, v]) => qs.set(`f[${k}]`, v));
    if (table.sort !== null) { qs.set('sort', String(table.sort)); qs.set('dir', String(table.dir)); }
    const add = (x: Row) => router.post('/basket', { item_type: 'sprint', item_code: x.code, name: x.name, variant: x.entry, unit_zar: x.price ?? 0, commercial_act: 'purchase', meta: { section: 'countries', country: c.iso3 } }, { preserveScroll: true });

    return (
        <CountryPage base={base} pageKey="catalogue" extraCrumbs={topicLabel ? [[topicLabel]] : []}>
            <CountryHead base={base} pageKey="catalogue" title="Country Service Catalogue"
                desc={`${N(kpi.total)} country-relevant Sprints from the 7,589-Sprint priced catalogue (ECON-R0C), grouped by what a visitor to ${c.name} needs.`} />
            <Kpis>
                <Kpi l="Available" v={N(kpi.a)} s="Services you can buy" icon="check" />
                <Kpi l="Restricted" v={N(kpi.r)} s="Embedded — sold within a native Sprint" icon="lock" />
                <Kpi l="Unavailable" v={N(kpi.u)} s="No viable standalone tier" icon="alert" />
                <Kpi l="Total Services" v={N(kpi.total)} s="Across 9 categories" icon="tag" />
            </Kpis>
            <Cols n={3}>
                {cats.map((x) => (
                    <Link key={x.k} href={cHref(c, 'catalogue', `?topic=${x.k}`)}
                        className={cn('block min-w-0 rounded-[6px] border bg-white p-4 shadow-[0_1px_2px_rgba(8,8,11,.06)]', x.k === topic ? 'border-gold-500 shadow-[0_0_0_2px_var(--color-gold-200)]' : 'border-parchment-400 hover:border-gold-400')}>
                        <b className="text-ink-900">{x.l}</b>
                        <div className="my-1.5 flex flex-wrap gap-1"><Chip t={`${x.a} Available`} tone="ok" /><Chip t={`${x.r} Restricted`} tone="warn" /><Chip t={`${x.u} Unavailable`} tone="bad" /></div>
                        <div className="text-[0.82rem] text-ink-400">{x.a && x.min ? `From ${money(x.min)} ex VAT` : 'Prices suppressed — No Resolution, No Price'}</div>
                    </Link>
                ))}
            </Cols>
            {topic && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[0.85rem]">Filtered: <b>{topicLabel}</b></span>
                    <A sm href={cHref(c, 'catalogue')}>Clear filter</A>
                </div>
            )}
            <Card title="Services" icon="tag" sub="Prices: SELLING PRICE at entry tier, ZAR ex VAT, converted with BW_FX">
                <DataTable<Row> name={`${c.iso3}_country_sprints`} server={table} only={['table']} csvHref={`${cHref(c, 'catalogue')}?${qs.toString()}`} filters={['cat', 'type', 'avail']}
                    cols={[
                        { k: 'code', l: 'Code', r: (x) => <Link className="font-mono text-controlled-700 hover:underline" href={cHref(c, `service/${encodeURIComponent(x.code)}`)}>{x.code}</Link> },
                        { k: 'name', l: 'Sprint', r: (x) => <Link className="text-controlled-700 hover:underline" href={cHref(c, `service/${encodeURIComponent(x.code)}`)}>{x.name}</Link> },
                        { k: 'cat', l: 'Category' }, { k: 'type', l: 'Type' }, { k: 'entry', l: 'Entry tier' },
                        { k: 'price', l: 'From (ex VAT)', num: true, r: (x) => (x.price ? money(x.price) : <span className="text-ink-400">—</span>), v: (x) => x.price ?? 0 },
                        { k: 'avail', l: 'Availability', r: (x) => <StatusChip s={x.avail} /> },
                        { l: '', r: (x) => (x.price ? <B sm v="pri" onClick={() => add(x)}>Add</B> : '') },
                    ]} />
            </Card>
            <Cols n={3}>
                <Card title="Need Help Choosing?">
                    <p className="mb-2 text-[0.82rem]">Speak to a TBCA Advisor for tailored guidance on the right Sprint for your market.</p>
                    <A v="pri" href={cHref(c, 'quote')}>Ask a Question →</A>
                </Card>
                <Card title="Price & Fees">
                    <p className="mb-2 text-[0.82rem]">All pricing and fees are suppressed until service permission and price resolution. This country is resolver-complete: prices shown are catalogue prices.</p>
                    <Link className="text-[0.85rem] text-controlled-700 hover:underline" href={corHref('ledger/T', c.iso3, c.iso3 === 'ZAF' ? 'BWA' : 'ZAF')}>View fee transparency →</Link>
                </Card>
                <Card title="Evidence-Backed Services">
                    <p className="mb-2 text-[0.82rem]">Each service is supported by verified sources and current evidence.</p>
                    <Link className="text-[0.85rem] text-controlled-700 hover:underline" href={cHref(c, 'evidence')}>View evidence panel →</Link>
                </Card>
            </Cols>
        </CountryPage>
    );
}
