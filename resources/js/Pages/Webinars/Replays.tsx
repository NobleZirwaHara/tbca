import { Head, Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { BtnLink, EventCover, EventHero, StateChip, WebinarShell } from '@/Components/Webinars/kit';
import type { WebinarEvent } from '@/types/webinars';

interface Props {
    replays: WebinarEvent[];
    filters: { q: string; state: string };
}

export default function Replays({ replays, filters }: Props) {
    const [q, setQ] = useState(filters.q);
    const go = (next: Partial<Props['filters']>) => router.get('/webinars/replays', { ...filters, ...next }, { preserveScroll: true, preserveState: true, replace: true });

    return (
        <WebinarShell>
            <Head title="Webinar Replay Library" />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], ['Replay Library']]} eyebrow="Replay Library" title="Watch Again. Learn More." gold="Take Action." lead="Every replay here has passed TBCA W3 review. Edited and corrected replays say so, and replays still under review are shown honestly." />

            <div className="flex flex-wrap items-center gap-2">
                <div className="flex gap-1 rounded-[8px] border border-parchment-400 bg-parchment-200 p-1" role="tablist">
                    {([['all', 'All'], ['available', 'Available to Watch'], ['review', 'Under Review or Withheld']] as const).map(([k, l]) => (
                        <button key={k} type="button" role="tab" aria-selected={filters.state === k} onClick={() => go({ state: k })} className={cn('rounded-[6px] px-3.5 py-2 text-[0.8125rem] font-semibold', filters.state === k ? 'bg-gold-500 text-ink-900' : 'text-ink-600')}>{l}</button>
                    ))}
                </div>
                <form className="relative min-w-[14rem] flex-1" onSubmit={(e) => { e.preventDefault(); go({ q }); }}>
                    <label htmlFor="replays-q" className="sr-only">Search replays</label>
                    <L.Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                    <input id="replays-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search replays, topics or speakers..." className="h-10 w-full rounded-[6px] border border-parchment-500 bg-white pr-2 pl-9 text-[0.8125rem]" />
                </form>
            </div>

            {replays.length === 0 ? (
                <p className="rounded-[10px] border border-parchment-400 bg-white p-8 text-center text-ink-500">No replays match your search.</p>
            ) : (
                <ul className="grid gap-4 sm:grid-cols-2 2xl:grid-cols-3">
                    {replays.map((w) => (
                        <li key={w.slug} className="flex flex-col overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
                            <Link href={`/webinars/${w.slug}/replay`}><EventCover event={w} className="aspect-[16/8]" /></Link>
                            <div className="flex flex-1 flex-col p-4">
                                <div className="flex items-center justify-between gap-2"><span className="text-[0.6875rem] font-bold text-gold-700 uppercase">{w.categoryLabel}</span><StateChip event={w} /></div>
                                <h2 className="mt-1.5 font-serif text-[1.0625rem] font-bold text-ink-900">{w.title}</h2>
                                <p className="mt-1 text-[0.75rem] text-ink-500">{w.speaker} | {w.dateLong}{w.replayDuration ? ` | ${w.replayDuration}` : ''}</p>
                                {w.note && <p className="mt-2 rounded-[6px] bg-parchment-200 p-2 text-[0.75rem] text-ink-700">{w.note}</p>}
                                <div className="mt-auto pt-4">
                                    {w.replayAvailable ? <BtnLink href={`/webinars/${w.slug}/replay/watch`} size="sm" icon="play" className="w-full">Watch Replay</BtnLink> : <BtnLink href={`/webinars/${w.slug}/replay`} tone="outline" size="sm" className="w-full">View Status</BtnLink>}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </WebinarShell>
    );
}

Replays.layout = null;
