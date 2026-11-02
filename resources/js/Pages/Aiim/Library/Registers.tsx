import { Link } from '@inertiajs/react';
import { Database } from 'lucide-react';
import { AddButton, CtaBand, DataMeta, Hero, PackLoading, Panel, PillLink, ProtoFrame, Rich, Section, SvcPrice, type LibCountry, type SvcCard } from '@/Components/Aiim/ProtoLibrary';
import type { AiimPageProps } from '@/types/aiim';

interface Sheet { sheet: string; rows: number; cols: number; h: string[] }
interface Props extends AiimPageProps {
    country: LibCountry;
    index: Sheet[];
    totals: { rows: number; cells: number; sheets: number };
    readme: string[];
    services: SvcCard[];
}

function SheetCard({ s, slug }: { s: Sheet; slug: string }) {
    return (
        <Link href={`/aiim/country/${slug}/registers/${s.sheet}`} className="flex min-w-0 flex-col gap-1 rounded-[12px] border border-parchment-400 bg-white p-3 hover:border-gold-400">
            <span className="flex items-start justify-between gap-2"><b className="truncate font-mono text-[0.78rem] text-ink-900">{s.sheet}</b><span className="shrink-0 font-mono text-[0.7rem] text-ink-500">{s.rows.toLocaleString('en-US')} × {s.cols}</span></span>
            <span className="line-clamp-2 text-[0.74rem] text-ink-500">{s.h.join(' · ')}</span>
        </Link>
    );
}

/** Data Room: the 62-sheet Deep Registers workbook, one card per sheet. */
export default function Registers({ country, index, totals, readme, services }: Props) {
    const bw = index.filter((s) => s.sheet.startsWith('BW_'));
    const i2 = index.filter((s) => s.sheet.startsWith('I2_'));
    const [exp, api] = [services.find((s) => s.code === 'AAB-EMB-218'), services.find((s) => s.code === 'AAB-EMB-219')];
    const grid = (list: Sheet[]) => <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">{list.map((s) => <SheetCard key={s.sheet} s={s} slug={country.slug} />)}</div>;

    return (
        <ProtoFrame title="Data Room" crumbs={[{ label: country.name, href: `/aiim/country/${country.slug}` }, { label: 'Data Room' }]}>
            <Hero
                eyebrow={country.isBW ? 'Data Room · TBCA AIIM Botswana Deep Registers BW-1.0' : `Data Room · ${country.name}`}
                title={country.isBW ? '62 sheets, every cell browsable' : `${country.name} registers`}
                lead={country.isBW
                    ? `Start with BW_Summary, BW_Validator and BW_Priority. ${totals.rows.toLocaleString('en-US')} rows and ${totals.cells.toLocaleString('en-US')} cells, searchable, sortable and filterable. The Issue 2.0 continental catalogue (I2_*) is carried over in full.`
                    : 'The country registers open when the country pack is loaded. The Issue 2.0 continental catalogue (I2_*) covers all 54 countries and is open now.'}
                meta={country.isBW ? <DataMeta /> : undefined}
                actions={<>
                    {exp && <AddButton s={exp} size="sm" ctx={`${country.name} registers`} label={<><Database className="size-3.5" />Export entitled records</>} />}
                    {api && api.status === 'priced' && <AddButton s={api} size="sm" ctx={country.name} label="API feed" tone="dark" />}
                </>}
            />
            {!country.isBW && <PackLoading country={country} what="country registers" />}
            {readme.length > 0 && (
                <Section title="Workbook README"><Panel>{readme.map((r, i) => <p key={i} className="my-1 text-[0.86rem] text-ink-700"><Rich text={r} /></p>)}</Panel></Section>
            )}
            {bw.length > 0 && <Section title={`Botswana registers (BW_*) — ${bw.length} sheets`}>{grid(bw)}</Section>}
            <Section title={`Issue 2.0 carry-over (I2_*) — ${i2.length} sheets`}>{grid(i2)}</Section>
            <CtaBand title="Need the data in your own systems?" text="API access, enterprise feeds, white-label portals and data licensing are available for the Botswana registers.">
                {[exp, api].filter(Boolean).map((s) => (
                    <PillLink key={s!.code} href={`/aiim/services/${s!.code}`} tone="dark" size="md" className="whitespace-normal">{s!.name} · <SvcPrice s={s!} /></PillLink>
                ))}
                <PillLink href="/aiim/workspace/advisor-request" size="md">Speak to an Advisor</PillLink>
            </CtaBand>
        </ProtoFrame>
    );
}
