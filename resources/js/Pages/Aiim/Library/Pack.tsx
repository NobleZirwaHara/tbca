import { FileText } from 'lucide-react';
import { useMemo } from 'react';
import { Hero, PackBlocks, PackLoading, ProtoFrame, type LibCountry, type PackBlock } from '@/Components/Aiim/ProtoLibrary';
import { cn } from '@/lib/cn';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    country: LibCountry;
    blocks: PackBlock[];
    stats: { blocks: number; tables: number; words: number } | null;
}

const level = (b: PackBlock) => (b.t !== 'p' ? 99 : b.s === 'Title' ? 0 : Number(/^Heading (\d)/.exec(b.s ?? '')?.[1] ?? 99));

/** Country Pack reader: the full BW-1.0 text, block by block, with a contents list. */
export default function Pack({ country, blocks, stats }: Props) {
    const toc = useMemo(() => blocks.filter((b) => level(b) < 99).map((b, i) => ({ id: `d${i}`, l: level(b), x: String(b.x ?? '').slice(0, 70) })), [blocks]);
    const crumbs = [{ label: country.name, href: `/aiim/country/${country.slug}` }, { label: `Country Pack ${country.packCode ?? ''}`.trim() }];

    if (!country.isBW) {
        return (
            <ProtoFrame title="Country Pack" crumbs={crumbs}>
                <Hero eyebrow={`Country Pack · ${country.name}`} title={`${country.name} Country Pack`} lead="The full country pack text, block by block, with live fact, opportunity and lead IDs." />
                <PackLoading country={country} what="country pack" />
            </ProtoFrame>
        );
    }

    return (
        <ProtoFrame title="Country Pack BW-1.0" crumbs={crumbs}>
            <div className="mb-4 flex gap-2 rounded-[10px] border border-gold-300 bg-gold-50 px-3 py-2 text-[0.82rem] text-ink-700">
                <FileText className="mt-0.5 size-3.5 shrink-0 text-gold-700" />
                <span>Full text of TBCA-AIIM-BW-1.0 rendered block by block: {stats?.blocks} blocks, {stats?.tables} tables, about {stats?.words.toLocaleString('en-US')} words. Fact IDs, opportunity IDs, leads and evidence markers are live links.</span>
            </div>
            <div className="grid gap-4 lg:grid-cols-[17rem_minmax(0,1fr)]">
                <nav aria-label="Contents" className="max-h-[80vh] overflow-y-auto rounded-[12px] border border-parchment-400 bg-white p-2 lg:sticky lg:top-4">
                    {toc.map((t) => (
                        <a key={t.id} href={`#${t.id}`} onClick={(e) => { e.preventDefault(); document.getElementById(t.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                            className={cn('block truncate rounded px-2 py-1 text-[0.76rem] hover:bg-parchment-200', t.l <= 1 ? 'font-semibold text-ink-900' : 'text-ink-600')} style={{ paddingLeft: 8 + Math.max(0, t.l - 1) * 12 }}>
                            {t.x}
                        </a>
                    ))}
                </nav>
                <article className="min-w-0 rounded-[12px] border border-parchment-400 bg-white p-5 sm:p-7"><PackBlocks blocks={blocks} ids /></article>
            </div>
        </ProtoFrame>
    );
}
