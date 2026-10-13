import { Head, Link, router, useForm, usePoll } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { Avatar, BtnLink, Card, Elapsed, Eyebrow, HelpCard, NoticeCards, Stage, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import type { LivePoll, LiveQuestion, LiveRoomProps } from '@/types/webinars';

/**
 * Shared live room for Live Session (Page 8), Live Q&A (Page 9) and Live Polls (Page 10).
 * Questions enter private moderation first (R16-02); polls and chat refresh every 10 seconds.
 */
export default function LiveRoom(props: LiveRoomProps & { view: 'session' | 'qa' | 'polls' }) {
    const { event, view, roomState, elapsed, liveAttendees, questions, polls, notices, isStaff } = props;
    const base = `/webinars/${event.slug}`;
    usePoll(10000, { only: ['chat', 'questions', 'questionCounts', 'polls', 'liveAttendees'] }, { autoStart: roomState === 'live' });
    const active = polls.find((p) => p.status === 'active');

    const topBar = (
        <div className="flex flex-wrap items-center gap-2 rounded-[10px] bg-ink-950 p-2.5 text-parchment-100">
            <span className={cn('rounded-[4px] px-3 py-1.5 text-[0.875rem] font-bold', roomState === 'live' ? 'bg-risk-500 text-white' : 'bg-ink-800 text-parchment-200')}>{roomState === 'live' ? 'LIVE' : roomState === 'ended' ? 'ENDED' : 'NOT STARTED'}</span>
            {roomState === 'live' && <span className="flex items-center gap-1.5 rounded-[4px] border border-ink-700 px-3 py-1.5 text-[0.8125rem]"><L.Timer className="size-4 text-risk-500" aria-hidden="true" /><Elapsed start={elapsed} /></span>}
            <span className="flex items-center gap-1.5 rounded-[4px] border border-ink-700 px-3 py-1.5 text-[0.8125rem]"><L.Users className="size-4" aria-hidden="true" />{liveAttendees}</span>
            <span className="flex min-w-0 flex-1 items-center gap-2 px-2 text-[0.875rem] font-semibold"><span className={cn('size-2.5 shrink-0 rounded-full', roomState === 'live' ? 'bg-risk-500' : 'bg-ink-500')} /><span className="truncate">{event.title}</span></span>
            <span className="hidden items-center gap-1.5 rounded-[4px] border border-ink-700 px-3 py-1.5 text-[0.8125rem] sm:flex"><L.SignalHigh className="size-4 text-verified-500" aria-hidden="true" />{roomState === 'live' ? 'Live' : 'Offline'}</span>
        </div>
    );

    const roomNotice =
        roomState === 'not_started' ? (
            <p className="rounded-[10px] border border-gold-300 bg-gold-50 p-4 text-[0.875rem] text-ink-700">The live room opens at {event.timeRange.split(' - ')[0]} SAST on {event.dateLong}. You can submit questions in advance; they go to the moderator first. <Link href={`${base}/pre-event`} className="font-semibold text-gold-700">Open Pre-Event Access</Link></p>
        ) : roomState === 'ended' ? (
            <p className="rounded-[10px] border border-parchment-400 bg-parchment-200 p-4 text-[0.875rem] text-ink-700">This session has ended. The recording is not a replay until it passes W3 review. <Link href={`${base}/thank-you`} className="font-semibold text-gold-700">Open the post-event page</Link> or <Link href={`${base}/replay`} className="font-semibold text-gold-700">check the replay status</Link>.</p>
        ) : null;

    const slide = (
        <div className="relative aspect-video overflow-hidden rounded-[10px] bg-parchment-50 p-4 sm:p-5">
            <span className="rounded-[4px] bg-gold-400 px-2 py-0.5 text-[0.6875rem] font-bold text-ink-900">Current Topic</span>
            <span className="absolute top-4 right-4 text-[0.6875rem] text-ink-500">Slide {props.slide[0]} of {props.slide[1]}</span>
            <p className="mt-2 max-w-[70%] font-serif text-[1.375rem] leading-tight font-bold text-ink-900">{props.currentTopic}</p>
            <ul className="mt-4 grid max-w-[80%] grid-cols-3 gap-3 text-center text-[0.6875rem] text-ink-700">
                {([[L.Sprout, 'Agriculture & Agro-Processing'], [L.Sun, 'Renewable Energy'], [L.Building2, 'Infrastructure & Logistics'], [L.Factory, 'Manufacturing'], [L.Wifi, 'Digital Economy'], [L.HeartPulse, 'Healthcare & Pharma']] as const).map(([I, t]) => (
                    <li key={t}><I className="mx-auto size-6 text-gold-600" aria-hidden="true" />{t}</li>
                ))}
            </ul>
        </div>
    );

    return (
        <WebinarShell event={event} wide={view !== 'session'} rail={view === 'session' ? <SessionRail {...props} /> : undefined}>
            <Head title={`${view === 'qa' ? 'Live Q&A' : view === 'polls' ? 'Live Polls' : 'Live Session'}: ${event.title}`} />
            {view === 'session' ? <SessionMain {...props} /> : (
                <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
                    <div className="min-w-0 space-y-4">
                        {topBar}
                        {roomNotice}
                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
                            <Stage event={event} />
                            {slide}
                        </div>
                        {view === 'qa' ? <QaBoard {...props} /> : <PollBoard {...props} />}
                    </div>
                    <aside className="space-y-4">{view === 'qa' ? <QaRail {...props} /> : <PollRail {...props} poll={active} />}</aside>
                </div>
            )}
            {view !== 'session' && <NoticeCards notices={notices} keys={['recording', 'offer', 'boundary']} />}
            {isStaff && <p className="text-[0.75rem] text-ink-500">Staff: moderate questions and polls in the <Link href={`/admin/webinars/${event.slug}/moderation`} className="font-semibold text-gold-700">Live Moderation Console</Link>.</p>}
        </WebinarShell>
    );
}

/* ------------------------------------------------------------------ */
/* Page 8: live session                                                */
/* ------------------------------------------------------------------ */

function SessionMain({ event, roomState, elapsed, liveAttendees, questionCounts, polls, notices }: LiveRoomProps) {
    const [lead, gold] = splitTitle(event.title);
    const base = `/webinars/${event.slug}`;
    const active = polls.some((p) => p.status === 'active');
    return (
        <>
            <div>
                <nav aria-label="Breadcrumb" className="text-[0.75rem] text-ink-500"><Link href="/webinars">Webinars</Link> / <Link href={base}>{lead.replace(/:$/, '')}</Link> / Live Session</nav>
                <div className="mt-2"><Eyebrow tone={roomState === 'live' ? 'live' : 'gold'}>{roomState === 'live' ? 'Live Now' : roomState === 'ended' ? 'Session Ended' : 'Starting Soon'}</Eyebrow></div>
                <h1 className="mt-2 font-serif text-[1.875rem] leading-tight font-bold text-ink-900 sm:text-[2.25rem]">{lead}{gold && <><br /><span className="text-gold-600">{gold}</span></>}</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">{event.tagline}</p>
            </div>
            {roomState !== 'live' && (
                <p className="rounded-[10px] border border-gold-300 bg-gold-50 p-4 text-[0.875rem] text-ink-700">
                    {roomState === 'not_started' ? `The live room opens at ${event.timeRange} on ${event.dateLong}.` : 'This session has ended. The recording enters W3 replay review and is never auto-published.'}{' '}
                    <Link href={roomState === 'ended' ? `${base}/thank-you` : `${base}/pre-event`} className="font-semibold text-gold-700">{roomState === 'ended' ? 'Go to the post-event page' : 'Open Pre-Event Access'}</Link>
                </p>
            )}
            <div className="overflow-hidden rounded-[12px] bg-ink-950">
                <Stage
                    event={event}
                    className="rounded-none"
                    badge={
                        <>
                            {roomState === 'live' && <span className="rounded-[4px] bg-risk-500 px-2.5 py-1 text-[0.8125rem] font-bold text-white">LIVE</span>}
                            {roomState === 'live' && <span className="rounded-[4px] bg-ink-950/80 px-2.5 py-1 text-[0.8125rem] font-bold text-white"><Elapsed start={elapsed} /></span>}
                            <span className="flex items-center gap-1 rounded-[4px] bg-ink-950/80 px-2.5 py-1 text-[0.8125rem] font-bold text-white"><L.Users className="size-4" aria-hidden="true" />{liveAttendees}</span>
                        </>
                    }
                />
                <div className="flex items-center gap-4 px-4 py-2.5 text-parchment-100" aria-hidden="true">
                    <L.Pause className="size-5" /><L.Volume2 className="size-5" />
                    <span className="h-1 w-28 rounded-full bg-gold-500" />
                    <span className="flex items-center gap-1.5 text-[0.8125rem]"><span className={cn('size-2 rounded-full', roomState === 'live' ? 'bg-risk-500' : 'bg-ink-500')} />{roomState === 'live' ? 'LIVE' : 'OFFLINE'}</span>
                    <span className="flex-1" />
                    <span className="rounded border border-parchment-200 px-1 text-[0.625rem] font-bold">HD</span><L.Captions className="size-5" /><L.Cast className="size-5" /><L.Maximize className="size-5" />
                </div>
            </div>
            <p className="text-[0.6875rem] text-ink-500">The live video plays in the provider window (Zoom). Captions are available in English; Afrikaans notices are human reviewed.</p>
            <ul className="grid gap-2 sm:grid-cols-3 xl:grid-cols-6">
                {([
                    [L.Users, String(liveAttendees), 'Live Attendees', null],
                    [L.MessageSquareText, String(questionCounts.all + questionCounts.answered), 'Questions', `${base}/live/qa`],
                    [L.ChartColumn, 'Live Poll', active ? 'Active' : 'None active', `${base}/live/polls`],
                    [L.FileText, 'Event Brief', 'Download', `${base}/resources/brief`],
                    [L.Link, 'Related Toolkits', 'View', '/tools/toolkits'],
                    [L.CalendarDays, 'Add to Calendar', 'Google | Outlook | Apple', `${base}/calendar.ics`],
                ] as const).map(([I, a, b, href]) => {
                    const inner = (
                        <>
                            <span className="flex items-center gap-2"><I className="size-6 text-gold-500" aria-hidden="true" /><span className="font-bold text-parchment-50">{a}</span></span>
                            <span className="mt-1 block text-[0.75rem] text-controlled-50">{b}</span>
                        </>
                    );
                    return (
                        <li key={a + b} className="rounded-[10px] border border-gold-700/50 bg-ink-950 p-3 text-center">
                            {href ? (href.includes('/resources/') || href.endsWith('.ics') ? <a href={href} className="flex flex-col items-center">{inner}</a> : <Link href={href} className="flex flex-col items-center">{inner}</Link>) : <div className="flex flex-col items-center">{inner}</div>}
                        </li>
                    );
                })}
            </ul>
            <NoticeCards notices={notices} keys={['recording', 'offer', 'boundary']} dark />
        </>
    );
}

function ChatPanel({ event, chat, canPost, roomState }: LiveRoomProps) {
    const form = useForm({ body: '' });
    return (
        <div>
            <ul className="max-h-[22rem] space-y-3 overflow-y-auto pr-1" aria-live="polite">
                {chat.map((m) => (
                    <li key={m.id} className="flex gap-2.5">
                        <Avatar name={m.name} />
                        <div className="min-w-0">
                            <p className="text-[0.8125rem]"><span className={cn('font-semibold', m.host ? 'text-gold-400' : 'text-controlled-50')}>{m.name}</span> <span className="text-[0.6875rem] text-parchment-300">{m.at}</span>{m.host && <span className="ml-1.5 rounded bg-gold-500 px-1.5 text-[0.625rem] font-bold text-ink-900">Host</span>}</p>
                            <p className="text-[0.8125rem] text-parchment-100">{m.body}</p>
                        </div>
                    </li>
                ))}
                {chat.length === 0 && <li className="text-[0.8125rem] text-parchment-300">No messages yet.</li>}
            </ul>
            {canPost && roomState !== 'ended' ? (
                <form className="mt-3 flex gap-2" onSubmit={(e) => { e.preventDefault(); form.post(`/webinars/${event.slug}/live/chat`, { preserveScroll: true, onSuccess: () => form.reset() }); }}>
                    <label className="sr-only" htmlFor="chat-body">Message</label>
                    <input id="chat-body" value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} maxLength={500} required placeholder="Type your question or message..." className="h-10 flex-1 rounded-[6px] border border-ink-700 bg-ink-900 px-3 text-[0.8125rem] text-parchment-50 placeholder:text-ink-300" />
                    <button type="submit" disabled={form.processing} className="text-gold-400" aria-label="Send message"><L.Send className="size-6" /></button>
                </form>
            ) : (
                <p className="mt-3 text-[0.75rem] text-parchment-300">{roomState === 'ended' ? 'Chat is closed.' : <>Sign in or register to chat. <Link href="/login" className="text-gold-400 underline">Sign in</Link></>}</p>
            )}
        </div>
    );
}

function SessionRail(props: LiveRoomProps) {
    const [tab, setTab] = useState<'chat' | 'qa' | 'polls'>('chat');
    const { event } = props;
    const base = `/webinars/${event.slug}`;
    return (
        <>
            <div className="rounded-[10px] border border-gold-700/50 bg-ink-950 p-3">
                <div className="grid grid-cols-3 gap-1 rounded-[8px] bg-ink-900 p-1" role="tablist">
                    {(['chat', 'qa', 'polls'] as const).map((t) => (
                        <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('rounded-[6px] py-2 text-[0.8125rem] font-semibold', tab === t ? 'bg-gold-500 text-ink-900' : 'text-parchment-200')}>{t === 'chat' ? 'Live Chat' : t === 'qa' ? 'Q&A' : 'Polls'}</button>
                    ))}
                </div>
                <div className="mt-3">
                    {tab === 'chat' && <ChatPanel {...props} />}
                    {tab === 'qa' && (
                        <div className="space-y-3">
                            <AskForm {...props} dark />
                            <Link href={`${base}/live/qa`} className="block text-center text-[0.8125rem] font-semibold text-gold-400">Open the full Q&A board</Link>
                        </div>
                    )}
                    {tab === 'polls' && (
                        <div className="space-y-3">
                            {props.polls.filter((p) => p.status === 'active').map((p) => <PollVote key={p.id} poll={p} slug={event.slug} canPost={props.canPost} dark />)}
                            {!props.polls.some((p) => p.status === 'active') && <p className="text-[0.8125rem] text-parchment-300">No poll is active right now.</p>}
                            <Link href={`${base}/live/polls`} className="block text-center text-[0.8125rem] font-semibold text-gold-400">Open Live Polls</Link>
                        </div>
                    )}
                </div>
            </div>
            <HelpCard />
            <Card tone="dark" title="Session Resources">
                <ul className="space-y-2.5 text-[0.8125rem]">
                    <li className="flex items-center justify-between gap-2 text-parchment-200"><span className="flex items-center gap-2"><L.FileText className="size-4 text-risk-500" aria-hidden="true" />Live Session Slides <span className="text-[0.6875rem] text-parchment-300">(available after review)</span></span><L.Lock className="size-4 text-gold-500" aria-label="Locked" /></li>
                    <li className="flex items-center justify-between gap-2 text-parchment-100"><span className="flex items-center gap-2"><L.FileText className="size-4 text-controlled-50" aria-hidden="true" />Event Brief</span><a href={`${base}/resources/brief`} className={btnClass('ghostDark', 'sm')}>Download</a></li>
                    <li className="flex items-center justify-between gap-2 text-parchment-100"><span className="flex items-center gap-2"><L.Layers className="size-4 text-verified-500" aria-hidden="true" />Recommended Toolkits</span><Link href="/tools/toolkits" className={btnClass('ghostDark', 'sm')}>View</Link></li>
                    <li className="flex items-center justify-between gap-2 text-parchment-100"><span className="flex items-center gap-2"><L.Link className="size-4 text-referenced-50" aria-hidden="true" />Related Services</span><Link href={`${base}/offers`} className={btnClass('ghostDark', 'sm')}>View</Link></li>
                </ul>
            </Card>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Page 9: Q&A                                                         */
/* ------------------------------------------------------------------ */

function AskForm({ event, canPost, questionCategories, dark }: LiveRoomProps & { dark?: boolean }) {
    const form = useForm({ category: 'General Question', body: '', anonymous: false });
    const field = dark ? 'border-ink-700 bg-ink-900 text-parchment-50 placeholder:text-ink-300' : 'border-parchment-500 bg-white text-ink-900';
    if (!canPost) {
        return (
            <p className={cn('text-[0.8125rem]', dark ? 'text-parchment-300' : 'text-ink-600')}>
                Register for this webinar or sign in to ask a question.{' '}
                {event.registrationOpen && <Link href={`/webinars/${event.slug}/register`} className="font-semibold text-gold-500 underline">Register</Link>}{' '}
                <Link href="/login" className="font-semibold text-gold-500 underline">Sign in</Link>
            </p>
        );
    }
    return (
        <form className="space-y-2.5" onSubmit={(e) => { e.preventDefault(); form.post(`/webinars/${event.slug}/live/questions`, { preserveScroll: true, onSuccess: () => form.reset('body') }); }}>
            <label className={cn('block text-[0.8125rem]', dark ? 'text-parchment-200' : 'text-ink-800')}>Select category
                <select value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} className={cn('mt-1 h-9 w-full rounded-[6px] border px-2 text-[0.8125rem]', field)}>
                    {questionCategories.map((c) => <option key={c.label}>{c.label}</option>)}
                </select>
            </label>
            <label className="block">
                <span className="sr-only">Your question</span>
                <textarea value={form.data.body} onChange={(e) => form.setData('body', e.target.value)} rows={4} maxLength={500} required placeholder="Type your question here... (be clear and concise)" className={cn('w-full rounded-[6px] border p-2.5 text-[0.8125rem]', field)} />
            </label>
            <div className={cn('flex items-center justify-between text-[0.75rem]', dark ? 'text-parchment-300' : 'text-ink-500')}>
                <label className="flex items-center gap-2"><input type="checkbox" checked={form.data.anonymous} onChange={(e) => form.setData('anonymous', e.target.checked)} className="size-4 accent-gold-600" />Ask anonymously</label>
                <span>{form.data.body.length}/500</span>
            </div>
            {form.errors.body && <p className="text-[0.75rem] text-risk-500">{form.errors.body}</p>}
            <button type="submit" disabled={form.processing} className={cn(btnClass('gold', 'lg'), 'w-full')}><L.Send className="size-5" aria-hidden="true" />Submit Question</button>
            <p className={cn('text-[0.6875rem]', dark ? 'text-parchment-300' : 'text-ink-500')}>Questions go privately to the moderator first. Do not include confidential or client-specific details.</p>
        </form>
    );
}

function QaBoard({ event, questions, questionCounts, qaFilters, questionCategories, isStaff, settings }: LiveRoomProps) {
    const [search, setSearch] = useState(qaFilters.search);
    const base = `/webinars/${event.slug}`;
    const go = (next: Partial<LiveRoomProps['qaFilters']>) => router.get(`${base}/live/qa`, { ...qaFilters, ...next }, { preserveScroll: true, preserveState: true, replace: true, only: ['questions', 'qaFilters', 'questionCounts'] });
    const tabs: [string, string, number][] = [['all', 'Live Questions', questionCounts.all], ['answered', 'Answered', questionCounts.answered], ['pinned', 'Pinned', questionCounts.pinned], ...(isStaff ? [['dismissed', 'Dismissed', questionCounts.dismissed] as [string, string, number]] : [])];
    const mod = (q: LiveQuestion, action: string) => router.post(`/admin/webinars/${event.slug}/questions/${q.id}`, { action }, { preserveScroll: true });

    return (
        <section className="rounded-[10px] border border-gold-700/50 bg-ink-950 p-3 text-parchment-100">
            <div className="flex flex-wrap items-center gap-2">
                <div className="flex flex-wrap gap-1" role="tablist">
                    {tabs.map(([k, l, n]) => (
                        <button key={k} type="button" role="tab" aria-selected={qaFilters.tab === k} onClick={() => go({ tab: k })} className={cn('rounded-[6px] px-3 py-2 text-[0.8125rem] font-semibold', qaFilters.tab === k ? 'bg-gold-500 text-ink-900' : 'text-parchment-200 hover:text-gold-300')}>{l} ({n})</button>
                    ))}
                </div>
                <span className="flex-1" />
                <form onSubmit={(e) => { e.preventDefault(); go({ search }); }} className="relative">
                    <label className="sr-only" htmlFor="qa-search">Search questions</label>
                    <L.Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-300" aria-hidden="true" />
                    <input id="qa-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search questions..." className="h-9 rounded-[6px] border border-ink-700 bg-ink-900 pr-2 pl-8 text-[0.8125rem] text-parchment-50" />
                </form>
                <label className="sr-only" htmlFor="qa-cat">Category</label>
                <select id="qa-cat" value={qaFilters.category} onChange={(e) => go({ category: e.target.value })} className="h-9 rounded-[6px] border border-ink-700 bg-ink-900 px-2 text-[0.8125rem] text-parchment-50">
                    <option value="">All Categories</option>
                    {questionCategories.map((c) => <option key={c.label}>{c.label}</option>)}
                </select>
            </div>
            <ul className="mt-3 divide-y divide-ink-800">
                {questions.length === 0 && <li className="py-6 text-center text-[0.8125rem] text-parchment-300">No questions here yet.</li>}
                {questions.map((q) => (
                    <li key={q.id} className="flex flex-wrap items-start gap-3 py-3">
                        <Avatar name={q.name} />
                        <div className="min-w-0 flex-1">
                            <p className="flex flex-wrap items-center gap-2 text-[0.8125rem]"><span className="font-semibold text-parchment-50">{q.name}</span><span className="text-parchment-300">{q.at}</span><span className="rounded-[4px] bg-verified-700 px-1.5 py-0.5 text-[0.6875rem] text-white">{q.category}</span>{q.priority && <span className="rounded bg-risk-500 px-1.5 text-[0.625rem] font-bold text-white">Priority</span>}{q.pinned && <L.Pin className="size-3.5 text-gold-400" aria-label="Pinned" />}{isStaff && q.status === 'pending' && <span className="rounded bg-attested-50 px-1.5 text-[0.625rem] font-bold text-attested-700">Awaiting moderation</span>}</p>
                            <p className="mt-1 text-[0.875rem] text-parchment-100">{q.body}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-1.5">
                            <button type="button" onClick={() => router.post(`${base}/live/questions/${q.id}/upvote`, {}, { preserveScroll: true })} className={btnClass('ghostDark', 'sm')} aria-label={`Upvote, ${q.upvotes} votes`}><L.ThumbsUp className="size-4" aria-hidden="true" />{q.upvotes}</button>
                            {isStaff && q.status !== 'dismissed' && (
                                <>
                                    <button type="button" onClick={() => mod(q, q.pinned ? 'unpin' : 'pin')} className={btnClass('ghostDark', 'sm')}><L.Pin className="size-4" aria-hidden="true" />{q.pinned ? 'Unpin' : 'Pin'}</button>
                                    {q.status === 'pending' ? (
                                        <button type="button" onClick={() => mod(q, 'approve')} className={btnClass('gold', 'sm')}>Approve</button>
                                    ) : q.status === 'approved' ? (
                                        <button type="button" onClick={() => mod(q, 'answer')} className={btnClass('gold', 'sm')}><L.Send className="size-4" aria-hidden="true" />Answer Live</button>
                                    ) : null}
                                    <button type="button" onClick={() => mod(q, 'dismiss')} className={btnClass('ghostDark', 'sm')} aria-label="Dismiss"><L.X className="size-4" /></button>
                                </>
                            )}
                            {isStaff && q.status === 'dismissed' && <button type="button" onClick={() => mod(q, 'restore')} className={btnClass('ghostDark', 'sm')}>Restore</button>}
                        </div>
                    </li>
                ))}
            </ul>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
                {isStaff && (
                    <div className="rounded-[8px] border border-ink-700 p-3">
                        <p className="font-serif font-bold text-parchment-50">Quick Moderation Actions</p>
                        <p className="mt-1 text-[0.75rem] text-parchment-300">Use Pin, Answer Live and Dismiss on each question, or open the moderation console.</p>
                        <BtnLink href={`/admin/webinars/${event.slug}/moderation`} tone="ghostDark" size="sm" className="mt-2">Open Console</BtnLink>
                    </div>
                )}
                {isStaff && (
                    <div className="rounded-[8px] border border-ink-700 p-3">
                        <p className="font-serif font-bold text-parchment-50">Live Q&A Settings</p>
                        <ul className="mt-2 space-y-1.5">
                            {settings.map((s) => (
                                <li key={s.key} className="flex items-center justify-between text-[0.75rem] text-parchment-200">
                                    {s.label}
                                    <button type="button" role="switch" aria-checked={s.on} aria-label={s.label} onClick={() => router.post(`/admin/webinars/${event.slug}/toggles`, { key: s.key, on: !s.on }, { preserveScroll: true })} className={cn('relative h-5 w-9 rounded-full', s.on ? 'bg-verified-500' : 'bg-ink-600')}><span className={cn('absolute top-0.5 size-4 rounded-full bg-white transition-all', s.on ? 'left-[1.125rem]' : 'left-0.5')} /></button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
                <div className={cn('rounded-[8px] border border-ink-700 p-3', !isStaff && 'lg:col-span-3')}>
                    <p className="font-serif font-bold text-parchment-50">Question Categories</p>
                    <ul className={cn('mt-2 gap-x-6 gap-y-1', !isStaff ? 'grid sm:grid-cols-3' : 'space-y-1')}>
                        {questionCategories.map((c, i) => (
                            <li key={c.label} className="flex items-center justify-between text-[0.75rem] text-parchment-200"><span className="flex items-center gap-2"><span className="size-2 rounded-full" style={{ background: ['#9a9aa5', '#2f9e66', '#3b6fb6', '#e08a2e', '#d0473a', '#7a4fa3', '#fff'][i] }} />{c.label}</span><span>{c.count}</span></li>
                        ))}
                    </ul>
                </div>
            </div>
        </section>
    );
}

function QaRail(props: LiveRoomProps) {
    const { guidelines, suggestions } = props;
    return (
        <>
            <Card tone="dark" title="Ask a Question" icon="message-circle"><AskForm {...props} dark /></Card>
            {suggestions.length > 0 && (
                <Card tone="dark" title="Similar Questions" action={<span className="rounded bg-ink-800 px-2 py-0.5 text-[0.6875rem] text-parchment-200">Answered</span>}>
                    <p className="-mt-1 mb-2 text-[0.75rem] text-parchment-300">Already answered in this session:</p>
                    <ul className="space-y-2">{suggestions.map((s) => <li key={s} className="rounded-[6px] border border-ink-700 px-3 py-2 text-[0.75rem] text-parchment-100">{s}</li>)}</ul>
                </Card>
            )}
            <Card tone="dark" title="Q&A Guidelines" icon="clipboard-check">
                <ul className="space-y-2">{guidelines.map((g) => <li key={g} className="flex gap-2 text-[0.8125rem] text-parchment-100"><L.CircleCheck className="size-4 shrink-0 text-gold-500" aria-hidden="true" />{g}</li>)}</ul>
            </Card>
        </>
    );
}

/* ------------------------------------------------------------------ */
/* Page 10: polls                                                      */
/* ------------------------------------------------------------------ */

function PollVote({ poll, slug, canPost, dark }: { poll: LivePoll; slug: string; canPost: boolean; dark?: boolean }) {
    const [choice, setChoice] = useState<number | null>(poll.myVote);
    return (
        <div>
            <p className={cn('font-serif text-[1.0625rem] leading-snug font-bold', dark ? 'text-parchment-50' : 'text-ink-900')}>{poll.question}</p>
            <ul className="mt-3 space-y-2.5">
                {poll.options.map((o, i) => (
                    <li key={o.label}>
                        <label className={cn('flex cursor-pointer items-center justify-between gap-2 text-[0.8125rem]', dark ? 'text-parchment-100' : 'text-ink-800')}>
                            <span className="flex items-center gap-2">
                                {poll.status === 'active' && canPost && <input type="radio" name={`poll-${poll.id}`} checked={choice === i} onChange={() => setChoice(i)} className="size-4 accent-gold-600" />}
                                {o.label}{poll.myVote === i && <span className="rounded bg-gold-500 px-1 text-[0.625rem] font-bold text-ink-900">Your vote</span>}
                            </span>
                            <span className="shrink-0">{o.pct}% ({o.votes})</span>
                        </label>
                        <div className={cn('mt-1 h-2.5 overflow-hidden rounded-full', dark ? 'bg-ink-800' : 'bg-parchment-300')}><div className="h-full rounded-full" style={{ width: `${o.pct}%`, background: ['#d6a32e', '#3b6fb6', '#2f9e66', '#7a4fa3', '#e08a2e'][i % 5] }} /></div>
                    </li>
                ))}
            </ul>
            <div className="mt-3 flex items-center justify-between gap-2">
                <span className={cn('text-[0.75rem]', dark ? 'text-parchment-300' : 'text-ink-500')}>Total Responses: {poll.total}</span>
                {poll.status === 'active' && canPost && (
                    <button type="button" disabled={choice === null || choice === poll.myVote} onClick={() => choice !== null && router.post(`/webinars/${slug}/live/polls/${poll.id}/vote`, { option: choice }, { preserveScroll: true })} className={btnClass('gold', 'md')}>
                        <L.RefreshCw className="size-4" aria-hidden="true" />{poll.myVote === null ? 'Submit Vote' : 'Change Vote'}
                    </button>
                )}
            </div>
            {poll.status === 'active' && !canPost && <p className="mt-2 text-[0.75rem] text-parchment-300">Register or sign in to vote.</p>}
        </div>
    );
}

function PollCard({ poll, children }: { poll: LivePoll; children?: ReactNode }) {
    const tone = { active: 'border-gold-500', upcoming: 'border-ink-700', closed: 'border-ink-700' }[poll.status];
    return (
        <div className={cn('flex flex-col rounded-[10px] border-2 bg-ink-950 p-4', tone)}>
            <span className={cn('self-start rounded-[4px] px-2 py-0.5 text-[0.6875rem] font-bold uppercase', poll.status === 'active' ? 'bg-gold-500 text-ink-900' : 'bg-ink-800 text-parchment-200')}>{poll.status} poll</span>
            <p className="mt-2 font-serif text-[1.0625rem] leading-snug font-bold text-parchment-50">{poll.question}</p>
            <ul className="mt-3 space-y-2">
                {poll.options.map((o, i) => (
                    <li key={o.label} className="text-[0.8125rem] text-parchment-100">
                        <div className="flex justify-between gap-2"><span>{poll.status === 'upcoming' ? <><L.Circle className="mr-1.5 inline size-4" aria-hidden="true" />{o.label}</> : o.label}</span>{poll.status !== 'upcoming' && <span>{o.pct}%</span>}</div>
                        {poll.status !== 'upcoming' && <div className="mt-1 h-2 overflow-hidden rounded-full bg-ink-800"><div className="h-full rounded-full" style={{ width: `${o.pct}%`, background: ['#d6a32e', '#3b6fb6', '#2f9e66', '#7a4fa3', '#e08a2e'][i % 5] }} /></div>}
                    </li>
                ))}
            </ul>
            <div className="mt-auto flex items-center justify-between gap-2 pt-3 text-[0.75rem] text-parchment-300">
                {poll.status === 'upcoming' ? <span className="flex items-center gap-1 text-gold-400"><L.Clock className="size-4" aria-hidden="true" />Launches when the host is ready</span> : <span className="flex items-center gap-1"><L.Users className="size-4" aria-hidden="true" />{poll.total} responses</span>}
                {children}
            </div>
        </div>
    );
}

function PollBoard({ event, polls, liveAttendees, questionCounts, isStaff }: LiveRoomProps) {
    const ordered = [...polls.filter((p) => p.status === 'active'), ...polls.filter((p) => p.status === 'upcoming'), ...polls.filter((p) => p.status === 'closed')].slice(0, 3);
    const responses = polls.reduce((a, p) => a + p.total, 0);
    const participation = liveAttendees ? Math.min(100, Math.round((Math.max(0, ...polls.map((p) => p.total)) / liveAttendees) * 100)) : 0;
    const [reacted, setReacted] = useState<string | null>(null);
    return (
        <>
            <section className="rounded-[10px] border border-gold-700/50 bg-ink-950 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="font-serif text-[1.375rem] font-bold text-parchment-50">Live Polls and Audience Engagement</h2>
                        <p className="text-[0.8125rem] text-parchment-300">Your input shapes the conversation. Participate in live polls and see real-time results.</p>
                    </div>
                    {isStaff && <BtnLink href={`/admin/webinars/${event.slug}/moderation?tab=polls`} icon="sparkles">New Poll (Host Only)</BtnLink>}
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-3">
                    {ordered.map((p) => <PollCard key={p.id} poll={p} />)}
                    {ordered.length === 0 && <p className="text-[0.8125rem] text-parchment-300">No polls for this session yet.</p>}
                </div>
            </section>
            <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[10px] border border-gold-700/50 bg-ink-950 p-4">
                    <h3 className="font-serif text-[1.0625rem] font-bold text-parchment-50">Audience Engagement</h3>
                    <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                        {([[L.Users, liveAttendees, 'Live Attendees'], [L.MessageSquare, questionCounts.all + questionCounts.answered, 'Live Questions'], [L.ChartColumn, `${participation}%`, 'Poll Participation'], [L.Vote, responses, 'Poll Responses']] as const).map(([I, v, l]) => (
                            <li key={l} className="rounded-[8px] border border-ink-700 p-2 text-center"><I className="mx-auto size-5 text-gold-500" aria-hidden="true" /><p className="text-lg font-bold text-parchment-50">{v}</p><p className="text-[0.6875rem] text-parchment-300">{l}</p></li>
                        ))}
                    </ul>
                </div>
                <div className="rounded-[10px] border border-gold-700/50 bg-ink-950 p-4">
                    <h3 className="font-serif text-[1.0625rem] font-bold text-parchment-50">Engagement Tools</h3>
                    <ul className="mt-3 grid grid-cols-4 gap-2">
                        {([[L.Hand, 'Raise Hand'], [L.Smile, 'Reactions'], [L.Share2, 'Share Slide'], [L.Download, 'Download Resources']] as const).map(([I, l]) => (
                            <li key={l}>
                                {l === 'Download Resources' ? (
                                    <a href={`/webinars/${event.slug}/resources/brief`} className="flex flex-col items-center rounded-[8px] border border-ink-700 p-2 text-center text-[0.6875rem] text-parchment-200 hover:border-gold-500"><I className="size-6 text-gold-500" aria-hidden="true" />{l}</a>
                                ) : (
                                    <button type="button" onClick={() => { if (l === 'Share Slide') void navigator.clipboard?.writeText(window.location.href); setReacted(l); }} className={cn('flex w-full flex-col items-center rounded-[8px] border p-2 text-center text-[0.6875rem] text-parchment-200', reacted === l ? 'border-gold-500' : 'border-ink-700 hover:border-gold-500')}><I className="size-6 text-gold-500" aria-hidden="true" />{reacted === l ? (l === 'Share Slide' ? 'Link copied' : 'Sent') : l}</button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}

function PollRail({ event, polls, canPost, poll }: LiveRoomProps & { poll?: LivePoll }) {
    return (
        <>
            <Card tone="dark" title="Live Poll" icon="bar-chart-3" action={poll ? <span className="rounded bg-verified-500 px-2 py-0.5 text-[0.6875rem] font-bold text-white">Active</span> : undefined}>
                {poll ? <PollVote poll={poll} slug={event.slug} canPost={canPost} dark /> : <p className="text-[0.8125rem] text-parchment-300">No poll is active right now. The host launches polls during the session.</p>}
            </Card>
            <Card tone="dark" title="Poll History">
                <ul className="space-y-2.5">
                    {polls.map((p) => (
                        <li key={p.id} className="flex items-start gap-2 text-[0.8125rem] text-parchment-100">
                            {p.status === 'active' ? <span className="mt-1 size-2.5 shrink-0 rounded-full bg-verified-500" /> : <L.CircleCheck className="mt-0.5 size-4 shrink-0 text-parchment-300" aria-hidden="true" />}
                            <span className="flex-1">{p.question}</span>
                            <span className="shrink-0 text-[0.6875rem] text-parchment-300">{p.status === 'closed' ? `Closed, ${p.total} responses` : p.status === 'active' ? 'Active' : 'Scheduled'}</span>
                        </li>
                    ))}
                </ul>
            </Card>
            <div className="flex gap-3 rounded-[10px] bg-gold-400 p-4 text-ink-900">
                <L.CircleCheck className="size-7 shrink-0" aria-hidden="true" />
                <p className="text-[0.8125rem]"><strong className="block font-serif text-[1rem]">Next Steps</strong>Stay engaged, ask questions and take part in polls. After the session you receive the recording (subject to approval) and additional resources.</p>
            </div>
        </>
    );
}
