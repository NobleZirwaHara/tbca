/* Country Pack Reader: all 636 blocks of the BW-1.0 Word pack (prototype pages-intel.js #/c/{ISO}/pack). */
import { useMemo, useState } from 'react';
import { Card } from '@/Components/Industries/Kit';
import { CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { blockText, BwOnly, DocBlockView, slug, type BwOnlyData, type DocBlock } from '@/Components/CountryHub/IntelData';
import { cn } from '@/lib/cn';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Props {
    base: CountryBase;
    bwOnly: BwOnlyData | null;
    shelf?: HubShelf;
    blocks?: DocBlock[];
}

export default function Pack({ base, bwOnly, shelf, blocks = [] }: Props) {
    const [q, setQ] = useState('');
    const toc = useMemo(() => blocks.filter((b) => b.t === 'p' && /Heading [12]/.test(b.s ?? '')), [blocks]);
    const texts = useMemo(() => blocks.map((b) => blockText(b).toLowerCase()), [blocks]);
    if (bwOnly && shelf) return <BwOnly base={base} pageKey="pack" data={bwOnly} shelf={shelf} />;
    const needle = q.toLowerCase();
    const shown = (b: DocBlock, i: number) => !needle || texts[i].includes(needle) || (b.t === 'p' && (b.s === 'Heading 1' || b.s === 'Heading 2'));
    const go = (x: string) => document.getElementById(`h-${slug(x)}`)?.scrollIntoView({ behavior: 'smooth' });
    return (
        <CountryPage base={base} pageKey="pack" noRight>
            <CountryHead base={base} pageKey="pack" title="AIIM Botswana Country Pack — Issue BW-1.0" desc="Every paragraph and every table of the 225 KB Word pack, in reading order (636 blocks: 413 paragraphs, 223 tables)." />
            <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
                <aside aria-label="Country pack contents" className="min-w-0 rounded-[6px] border border-parchment-400 bg-white p-2 text-[0.8rem] lg:sticky lg:top-24 lg:max-h-[calc(100vh-7rem)] lg:overflow-auto">
                    {toc.map((h, i) => (
                        <button key={i} type="button" onClick={() => go(String(h.x))}
                            className={cn('block w-full rounded-[4px] px-2 py-1 text-left leading-snug text-ink-700 hover:bg-parchment-200 hover:text-gold-700', h.s === 'Heading 2' ? 'pl-[1.1rem] text-[0.74rem]' : 'font-semibold')}>
                            {h.x}
                        </button>
                    ))}
                </aside>
                <Card>
                    <div className="mb-2">
                        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search the country pack…" aria-label="Search the country pack"
                            className="h-8 w-full max-w-[320px] rounded-[4px] border border-parchment-500 bg-white px-2 text-[0.78rem]" />
                    </div>
                    <div className="min-w-0">{blocks.map((b, i) => <DocBlockView key={i} b={b} hidden={!shown(b, i)} />)}</div>
                </Card>
            </div>
        </CountryPage>
    );
}
