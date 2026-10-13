import { Head, Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import SocialIcon from '@/Components/SocialIcons';
import CoverArt from '@/Components/Art/CoverArt';
import { BtnLink, Card, CheckItem, EventHero, KeyDetails, ResourceRows, Stage, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import type { EventFrame, WebinarChapter } from '@/types/webinars';

interface Props extends EventFrame {
    chapterList: WebinarChapter[];
    replayFilters: { tab: string; q: string };
    statusNote: string | null;
    shareUrl: string;
}

export default function ReplayLibrary({ event, chapterList, replayFilters, statusNote, shareUrl }: Props) {
    const [lead, gold] = splitTitle(event.title);
    const [q, setQ] = useState(replayFilters.q);
    const [copied, setCopied] = useState(false);
    const base = `/webinars/${event.slug}`;
    const go = (next: Partial<Props['replayFilters']>) => router.get(`${base}/replay`, { ...replayFilters, ...next }, { preserveScroll: true, preserveState: true, replace: true });
    const available = event.replayAvailable;
    const share = encodeURIComponent(shareUrl);
    const text = encodeURIComponent(`Replay: ${event.title}`);

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <KeyDetails event={event} title="Webinar Details" />
                    <Card tone="cream" title="Your Access" icon="lock" action={<span className={cn('rounded px-2 py-0.5 text-[0.6875rem] font-bold', available ? 'bg-verified-500 text-white' : 'bg-ink-200 text-ink-700')}>{available ? 'Full Access' : 'Not Yet Available'}</span>}>
                        {available ? (
                            <ul className="space-y-1.5">
                                <CheckItem>Watch full replay</CheckItem>
                                <CheckItem>Access session chapters</CheckItem>
                                <CheckItem>Download slides and resources</CheckItem>
                                <CheckItem>Share with your team</CheckItem>
                            </ul>
                        ) : <p className="text-[0.8125rem] text-ink-700">{event.stateLabel}. Registrants are notified if a replay is approved.</p>}
                    </Card>
                    <Card title="Share This Webinar" icon="share">
                        <p className="-mt-2 text-[0.75rem] text-ink-500">Share the replay page with colleagues or on social media.</p>
                        <div className="mt-2 flex">
                            <input readOnly value={shareUrl} aria-label="Replay link" className="h-9 min-w-0 flex-1 rounded-l-[6px] border border-parchment-500 px-2 text-[0.75rem]" />
                            <button type="button" onClick={() => { void navigator.clipboard?.writeText(shareUrl); setCopied(true); }} className="rounded-r-[6px] bg-ink-900 px-3 text-[0.75rem] font-semibold text-parchment-50">{copied ? 'Copied' : 'Copy'}</button>
                        </div>
                        <div className="mt-3 flex justify-between">
                            {([['linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${share}`], ['x', `https://x.com/intent/post?url=${share}&text=${text}`], ['facebook', `https://www.facebook.com/sharer/sharer.php?u=${share}`], ['whatsapp', `https://wa.me/?text=${text}%20${share}`]] as const).map(([n, h]) => (
                                <a key={n} href={h} target="_blank" rel="noreferrer" aria-label={`Share on ${n}`} className="flex size-10 items-center justify-center rounded-[8px] border border-parchment-400 hover:border-gold-500"><SocialIcon network={n} className="size-5" /></a>
                            ))}
                            <a href={`mailto:?subject=${text}&body=${share}`} aria-label="Share by email" className="flex size-10 items-center justify-center rounded-[8px] border border-parchment-400 hover:border-gold-500"><L.Mail className="size-5" /></a>
                        </div>
                    </Card>
                    <Card title="Related Resources" icon="file-text"><ResourceRows event={event} /></Card>
                </>
            }
        >
            <Head title={`Replay Library: ${event.title}`} />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], [lead.replace(/:$/, ''), base], ['Replay Library']]} eyebrow="Webinar Replay Library" title="Watch Again. Learn More. Take Action." gold={gold ? `${lead} ${gold}` : lead} lead="Access the full replay, session chapters, speaker insights and related resources. Revisit key moments or share with your team." />

            {!available && (
                <section className="rounded-[12px] border border-gold-300 bg-gold-50 p-5">
                    <h2 className="font-serif text-[1.25rem] font-bold text-ink-900">Replay status: {event.stateLabel}</h2>
                    <p className="mt-1 text-[0.875rem] text-ink-700">
                        {event.upcoming || event.live
                            ? 'This event has not finished. After the session the recording goes through the TBCA W3 review. A replay is a new publication and never auto-publishes.'
                            : statusNote ?? 'The recording is in W3 review. We publish it only after every mandatory item is resolved, and we notify registrants when it is approved.'}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        <BtnLink href={`${base}/resources/brief`} download>Download the Event Brief</BtnLink>
                        <BtnLink href="/webinars/replays" tone="outline">Browse Other Replays</BtnLink>
                    </div>
                </section>
            )}

            {available && (
                <>
                    {statusNote && <p className="flex gap-2 rounded-[10px] border border-controlled-500/25 bg-controlled-50 p-3 text-[0.8125rem] text-ink-700"><L.Info className="size-5 shrink-0 text-controlled-500" aria-hidden="true" />{statusNote}</p>}
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex flex-wrap gap-1 rounded-[8px] border border-parchment-400 bg-parchment-200 p-1" role="tablist">
                            {([['all', `All Replays (${event.chapters.length})`], ['full', 'Full Sessions (1)'], ['topics', `Key Topics (${event.chapters.length})`], ['clips', 'Speaker Clips (4)']] as const).map(([k, l]) => (
                                <button key={k} type="button" role="tab" aria-selected={replayFilters.tab === k} onClick={() => go({ tab: k })} className={cn('rounded-[6px] px-3.5 py-2 text-[0.8125rem] font-semibold', replayFilters.tab === k ? 'bg-gold-500 text-ink-900' : 'text-ink-600')}>{l}</button>
                            ))}
                        </div>
                        <form className="relative min-w-[14rem] flex-1" onSubmit={(e) => { e.preventDefault(); go({ q }); }}>
                            <label htmlFor="replay-q" className="sr-only">Search chapters</label>
                            <L.Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-400" aria-hidden="true" />
                            <input id="replay-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search chapters, topics or speakers..." className="h-10 w-full rounded-[6px] border border-parchment-500 bg-white pr-2 pl-9 text-[0.8125rem]" />
                        </form>
                    </div>

                    <section className="grid gap-4 rounded-[12px] border border-parchment-400 bg-white p-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
                        <Link href={`${base}/replay/watch`} className="group relative block" aria-label="Watch full replay">
                            <Stage event={event} badge={<span className="rounded bg-risk-500 px-2 py-0.5 text-[0.6875rem] font-bold text-white">FULL REPLAY</span>}>
                                <span className="rounded bg-ink-950/80 px-2 py-0.5 text-[0.75rem] font-semibold text-white">{event.replayDuration}</span>
                            </Stage>
                            <L.CirclePlay className="absolute top-1/2 left-1/2 size-16 -translate-x-1/2 -translate-y-1/2 text-white/90 transition-transform group-hover:scale-110" aria-hidden="true" />
                        </Link>
                        <div>
                            <h2 className="font-serif text-[1.5rem] leading-tight font-bold text-ink-900">{lead}{gold && <><br />{gold}</>}</h2>
                            <p className="mt-2 text-[0.875rem] text-ink-600">Watch the full webinar replay, including opening remarks, key insights, live Q&A and closing session.</p>
                            <p className="mt-3 flex flex-wrap gap-4 text-[0.8125rem] text-ink-700">
                                <span className="flex items-center gap-1"><L.CalendarDays className="size-4" aria-hidden="true" />{event.dateLong}</span>
                                <span className="flex items-center gap-1"><L.Eye className="size-4" aria-hidden="true" />{event.views.toLocaleString('en-ZA')} views</span>
                            </p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <BtnLink href={`${base}/replay/watch`} size="lg" icon="play">Watch Full Replay</BtnLink>
                                <button type="button" disabled title="Replays are streaming only. Downloads are not permitted under the recording access policy." className={btnClass('outline', 'lg')}><L.Download className="size-5" aria-hidden="true" />Download Recording</button>
                            </div>
                            <p className="mt-2 text-[0.6875rem] text-ink-500">Streaming only. Slides and resources can be downloaded from Related Resources.</p>
                        </div>
                    </section>

                    <section>
                        <div className="mb-3 flex items-center justify-between">
                            <div>
                                <h2 className="font-serif text-[1.375rem] font-bold text-ink-900">Key Topics and Chapters</h2>
                                <p className="text-[0.8125rem] text-ink-500">Jump to specific topics or watch short clips from the session.</p>
                            </div>
                            <button type="button" onClick={() => go({ tab: 'all', q: '' })} className="text-[0.8125rem] font-semibold text-gold-700">View All Chapters</button>
                        </div>
                        {chapterList.length === 0 ? (
                            <p className="rounded-[10px] border border-parchment-400 bg-white p-6 text-center text-[0.875rem] text-ink-500">{replayFilters.tab === 'full' ? 'The full session is shown above.' : 'No chapters match your search.'}</p>
                        ) : (
                            <ul className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-4">
                                {chapterList.map((c) => (
                                    <li key={c.n} className="overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
                                        <div className="relative aspect-[16/7]">
                                            <CoverArt seed={`${event.slug}-${c.n}`} category={c.n % 2 ? 'ai-automation' : 'business-management'} className="absolute inset-0 h-full w-full" />
                                            <span className="absolute bottom-1.5 left-1.5 rounded bg-ink-950/80 px-1.5 text-[0.6875rem] font-semibold text-white">{c.start}</span>
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{c.n}. {c.title}</p>
                                            <div className="mt-2 flex items-center justify-between text-[0.75rem] text-ink-500">
                                                <span className="flex items-center gap-1"><L.Eye className="size-3.5" aria-hidden="true" />{c.views} views</span>
                                                <Link href={`${base}/replay/watch?chapter=${c.n}`} className={btnClass('outline', 'sm')}>Watch <L.ArrowRight className="size-3.5" aria-hidden="true" /></Link>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </>
            )}
        </WebinarShell>
    );
}

ReplayLibrary.layout = null;
