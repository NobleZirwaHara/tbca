import { Link } from '@inertiajs/react';
import { ShoppingCart } from 'lucide-react';
import { DataTable, type Col } from '@/Components/Industries/Kit';
import { AddButton, Hero, HeroChip, Panel, PillLink, ProtoFrame, Section, SvcPrice, type SvcCard, type SvcStatus } from '@/Components/Aiim/ProtoLibrary';
import { cn } from '@/lib/cn';
import type { AiimPageProps } from '@/types/aiim';
import type { ServerTableData } from '@/types/industries';

interface Row { Code: string; Service: string; Module: string; Subcategory: string; 'Entry tier': string; From: number | null; Delivery: string; 'AAI now': number | null; 'AAI H2': number | null; status: SvcStatus; internal: boolean; entry: string; ep: number | null }
interface Props extends AiimPageProps {
    cat: string;
    cats: { cat: string; n: number; section: string | null }[];
    total: number;
    counts: { internal: number; aiim: number };
    journey: { title: string; count: number; items: SvcCard[] }[] | null;
    section: string | null;
    table: ServerTableData<Row>;
}

const chip = (on: boolean) => cn('rounded-full border px-2.5 py-1 text-[0.74rem]', on ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-400 bg-white text-ink-600 hover:border-gold-400');

/** Embedded services: the 581-service catalogue by module, priced from the app's Sprint records. */
export default function Services({ cat, cats, total, counts, journey, section, table }: Props) {
    const card = (r: Row): SvcCard => ({ code: r.Code, name: r.Service, et: r['Entry tier'], db: r.Delivery, a0: r['AAI now'], from: r.From, entry: r.entry, ep: r.ep, status: r.status, internal: r.internal });
    const cols: Col<Row>[] = [
        { k: 'Code', l: 'Code', r: (x) => <Link href={`/aiim/services/${x.Code}`} className="font-mono text-controlled-700 hover:underline">{x.Code}</Link> },
        { k: 'Service', l: 'Service', clip: true },
        { k: 'Module', l: 'Module' },
        { k: 'Subcategory', l: 'Subcategory' },
        { k: 'Entry tier', l: 'Entry tier' },
        { k: 'From', l: 'From', num: true, r: (x) => <SvcPrice s={card(x)} /> },
        { k: 'Delivery', l: 'Delivery' },
        { k: 'AAI now', l: 'AAI now', num: true, r: (x) => (x['AAI now'] === null ? '—' : `${x['AAI now']}%`) },
        { k: 'AAI H2', l: 'AAI H2', num: true, r: (x) => (x['AAI H2'] === null ? '—' : `${x['AAI H2']}%`) },
        { k: 'internal', l: 'Saleable', r: (x) => (x.internal ? <span className="rounded-full bg-ink-50 px-2 py-0.5 text-[0.7rem] text-ink-500">Internal</span> : <span className="rounded-full bg-verified-50 px-2 py-0.5 text-[0.7rem] font-semibold text-verified-700">Embedded</span>) },
        { l: '', r: (x) => <AddButton s={card(x)} /> },
    ];

    return (
        <ProtoFrame title="Embedded Services" crumbs={[{ label: 'Services', href: '/aiim/services' }, ...(cat ? [{ label: cat }] : [])]}>
            <Hero
                eyebrow="Embedded services · Batch 4D v3"
                title={`${total} embedded services and internal operations`}
                lead="Every AIIM page carries the matching services from this register. Prices are the app's Sprint prices in ZAR, VAT-exclusive (VAT 15 % stated separately), shown in your chosen currency; delivery time and the automation index (AAI now, 12 months, 36 months) come from the governed D04 tables."
                meta={<><HeroChip>{total - counts.internal} embedded + {counts.internal} internal</HeroChip><HeroChip>{counts.aiim} in AIIM</HeroChip><HeroChip>CC-07 price authority</HeroChip></>}
                actions={<PillLink href="/basket"><ShoppingCart className="size-3.5" />Basket</PillLink>}
            />
            <div className="my-4 flex flex-wrap gap-1.5">
                <Link href="/aiim/services" preserveScroll className={chip(!cat)}>All · {total}</Link>
                {cats.map((c) => <Link key={c.cat} href={`/aiim/services?cat=${encodeURIComponent(c.cat)}`} preserveScroll className={chip(cat === c.cat)}>{c.cat} · {c.n}</Link>)}
            </div>
            {section && <p className="mb-2 text-[0.84rem] text-ink-600">These services are also sold in the <Link href={section} className="font-semibold text-controlled-700 hover:underline">{cat} section</Link> of the site.</p>}
            {journey && (
                <Section title="AIIM services by journey" sub="The 162 AIIM services grouped by where they appear on the platform.">
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {journey.map((g) => (
                            <Panel key={g.title} title={g.title} right={<span className="font-mono text-[0.75rem] text-ink-500">{g.count}</span>}>
                                <ul className="grid gap-2">
                                    {g.items.map((s) => (
                                        <li key={s.code}>
                                            <Link href={`/aiim/services/${s.code}`} className="flex items-start justify-between gap-2 rounded-[8px] border border-parchment-400 p-2.5 hover:border-gold-400">
                                                <span className="min-w-0"><b className="block text-[0.8rem] text-ink-900">{s.name}</b><span className="text-[0.68rem] text-ink-500"><span className="font-mono">{s.code}</span> · {s.db}</span></span>
                                                <span className="text-[0.8rem]"><SvcPrice s={s} /></span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                                {g.count > 5 && <p className="mt-2 text-[0.72rem] text-ink-400">+ {g.count - 5} more in the table below</p>}
                            </Panel>
                        ))}
                    </div>
                </Section>
            )}
            <Section title={`${cat || 'All modules'} — ${table.total} services`}>
                <div className="rounded-[12px] border border-parchment-400 bg-white p-4">
                    <DataTable name="embedded-services" cols={cols} server={table} filters={['Module', 'Entry tier', 'Delivery']} only={['table']} compact />
                </div>
            </Section>
        </ProtoFrame>
    );
}
