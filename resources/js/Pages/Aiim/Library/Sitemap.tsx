import { Link } from '@inertiajs/react';
import { Hero, ProtoFrame, Section } from '@/Components/Aiim/ProtoLibrary';
import type { AiimPageProps } from '@/types/aiim';

interface Page { n?: number; route: string; title: string; url: string; closest: boolean }
interface Props extends AiimPageProps { mock: Page[]; added: Page[]; sectors: Page[]; units: Page[] }

function Tile({ p, tag }: { p: Page; tag: string }) {
    return (
        <Link href={p.url} className="flex min-w-0 flex-col gap-1 rounded-[10px] border border-parchment-400 bg-white p-3 hover:border-gold-400">
            <span className="flex items-center justify-between gap-2">
                <span className="text-[0.68rem] font-bold tracking-[0.1em] text-gold-700 uppercase">{tag}</span>
                {p.closest && <span className="rounded-full bg-parchment-200 px-1.5 text-[0.62rem] text-ink-500" title="Opens the closest app page">closest page</span>}
            </span>
            <span className="text-[0.84rem] font-semibold text-ink-900">{p.title}</span>
            <span className="truncate font-mono text-[0.68rem] text-ink-500">{p.url}</span>
        </Link>
    );
}

const grid = 'grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3';

/** Page index: every prototype page with its app URL. */
export default function Sitemap({ mock, added, sectors, units }: Props) {
    return (
        <ProtoFrame title="Page Index" crumbs={[{ label: 'Page index' }]}>
            <Hero eyebrow="Page index" title={`All ${mock.length} mock-up pages, plus the pages added to carry the full Botswana data`} lead="Each mock-up page is rebuilt for Botswana. Pages 55, 57 and 71 are not in the folder. Pages that need a reference you do not have yet (an order, quote or engagement) open the closest app page." />
            <Section title="Mock-up pages"><div className={grid}>{mock.map((p) => <Tile key={p.route} p={p} tag={`Page ${p.n}`} />)}</div></Section>
            <Section title="Added pages">
                <div className={grid}>
                    {added.map((p) => <Tile key={p.route} p={p} tag="New" />)}
                    {sectors.map((p) => <Tile key={p.route} p={p} tag="Sector" />)}
                    {units.map((p) => <Tile key={p.route} p={p} tag="Unit" />)}
                </div>
            </Section>
        </ProtoFrame>
    );
}
