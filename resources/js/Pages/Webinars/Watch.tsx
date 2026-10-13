import { Head, Link, router, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Modal } from '@/Components/ui/Kit';
import { BtnLink, Card, CheckItem, Crumbs, Eyebrow, ResourceRows, Stage, WebinarShell, btnClass } from '@/Components/Webinars/kit';
import type { EventFrame } from '@/types/webinars';

interface Props extends EventFrame {
    chapter: number;
    watched: number[];
    note: string;
    takeaways: string[];
    statusNote: string | null;
    feedbackGiven: boolean;
    quizDone: boolean;
}

const QUIZ: [string, string[]][] = [
    ['What must happen before TBCA publishes any webinar replay?', ['It publishes automatically after the event', 'It passes the W3 replay review', 'The presenter approves it alone']],
    ['Where should a case-specific legal, tax or financial question go?', ['To an appropriately qualified professional', 'To the live chat', 'To the replay comments']],
    ['How are prices shown during a TBCA webinar?', ['One spoken price for everyone', 'Prices are never shown', 'Through a link that resolves your country, currency and tax']],
];

export default function Watch({ event, chapter, watched, note, takeaways, statusNote, feedbackGiven, quizDone }: Props) {
    const base = `/webinars/${event.slug}`;
    const [side, setSide] = useState<'chapters' | 'transcript' | 'notes'>('chapters');
    const [below, setBelow] = useState<'takeaways' | 'actions' | 'sprints' | 'discussion'>('takeaways');
    const [quizOpen, setQuizOpen] = useState(false);
    const [answers, setAnswers] = useState<number[]>([-1, -1, -1]);
    const notes = useForm({ body: note });
    const current = event.chapters.find((c) => c.n === chapter) ?? event.chapters[0];
    const pct = Math.round((watched.length / Math.max(1, event.chapters.length)) * 100);
    const next = event.chapters.find((c) => !watched.includes(c.n));
    const steps: [string, boolean][] = [[`${watched.length} of ${event.chapters.length} chapters watched`, watched.length > 0], ['Notes added', note.length > 0], ['Complete quiz', quizDone], ['Download certificate', quizDone && feedbackGiven && !!event.cpd]];

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <Card tone="dark" title="Your Learning Progress">
                        <div className="flex items-center gap-4">
                            <svg viewBox="0 0 100 100" className="size-28 shrink-0" role="img" aria-label={`${pct}% completed`}>
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#23232a" strokeWidth="10" />
                                <circle cx="50" cy="50" r="42" fill="none" stroke="#d6a32e" strokeWidth="10" strokeDasharray={`${(pct / 100) * 264} 264`} transform="rotate(-90 50 50)" strokeLinecap="round" />
                                <text x="50" y="50" textAnchor="middle" fontSize="20" fontWeight="700" fill="#fff">{pct}%</text>
                                <text x="50" y="64" textAnchor="middle" fontSize="9" fill="#c9c9cf">Completed</text>
                            </svg>
                            <ul className="space-y-1.5">
                                {steps.map(([l, done]) => <li key={l} className="flex items-center gap-2 text-[0.8125rem] text-parchment-100">{done ? <L.CircleCheck className="size-4 text-verified-500" aria-hidden="true" /> : <L.Circle className="size-4 text-parchment-300" aria-hidden="true" />}{l}</li>)}
                            </ul>
                        </div>
                        {next ? <BtnLink href={`${base}/replay/watch?chapter=${next.n}`} className="mt-4 w-full" icon="play">Continue Watching</BtnLink> : <BtnLink href={`${base}/thank-you`} className="mt-4 w-full">All Chapters Watched: Give Feedback</BtnLink>}
                    </Card>
                    <Card title="Session Information">
                        <ul className="space-y-2 text-[0.8125rem] text-ink-700">
                            <li className="flex items-center gap-2"><L.CalendarDays className="size-4" aria-hidden="true" />{event.dateLong}</li>
                            <li className="flex items-center gap-2"><L.Clock className="size-4" aria-hidden="true" />{event.timeRange}</li>
                            <li className="flex items-center gap-2"><L.CirclePlay className="size-4" aria-hidden="true" />Replay Duration: {event.replayDuration}</li>
                            <li className="flex items-center gap-2"><L.Wifi className="size-4" aria-hidden="true" />{event.format}</li>
                            <li className="flex items-center gap-2"><L.Languages className="size-4" aria-hidden="true" />{event.languages}</li>
                        </ul>
                    </Card>
                    <Card title="Session Resources"><ResourceRows event={event} /></Card>
                    <Card title="Get Certified" icon="award">
                        <p className="text-[0.8125rem] text-ink-600">{event.cpd ? 'Complete the replay, quiz and feedback to receive your certificate of attendance.' : 'This webinar is not CPD eligible. The quiz is still available to test your understanding.'}</p>
                        <button type="button" onClick={() => setQuizOpen(true)} className={cn(btnClass('gold', 'md'), 'mt-3 w-full')}>Take Quiz and Get Certificate <L.ArrowRight className="size-4" aria-hidden="true" /></button>
                        {quizDone && !feedbackGiven && <BtnLink href={`${base}/thank-you`} tone="outline" className="mt-2 w-full">Complete Feedback</BtnLink>}
                        {quizDone && feedbackGiven && event.cpd && <a href={`${base}/certificate`} className={cn(btnClass('outline', 'md'), 'mt-2 w-full')}>Download Certificate</a>}
                    </Card>
                </>
            }
        >
            <Head title={`Watch Replay: ${event.title}`} />
            <div>
                <Crumbs items={[['Home', '/'], ['Webinars', '/webinars'], [event.title.split(':')[0], base], ['Replay Library', `${base}/replay`], ['Watch Replay']]} />
                <div className="mt-2"><Eyebrow>Webinar Replay</Eyebrow></div>
                <h1 className="mt-2 font-serif text-[1.75rem] leading-tight font-bold text-ink-900 sm:text-[2.25rem]">{event.title}</h1>
                <p className="mt-1 text-[0.9375rem] text-ink-600">Watch the full replay, follow the chapters, take notes and access all learning resources.</p>
                {statusNote && <p className="mt-2 flex gap-2 rounded-[8px] border border-controlled-500/25 bg-controlled-50 p-2.5 text-[0.8125rem] text-ink-700"><L.Info className="size-4 shrink-0 text-controlled-500" aria-hidden="true" />{statusNote}</p>}
                <p className="mt-2 text-[0.6875rem] text-ink-500">Replay version: approved and annotated. As at {event.dateLong}. General information only: case-specific regulated questions need a qualified professional.</p>
            </div>

            <div className="grid gap-4 2xl:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
                <div className="overflow-hidden rounded-[12px] bg-ink-950">
                    <Stage event={event} className="rounded-none" badge={<span className="rounded bg-ink-950/80 px-2 py-0.5 text-[0.75rem] font-semibold text-gold-400">Chapter {current.n}: {current.title}</span>} />
                    <div className="px-4 py-3 text-parchment-100">
                        <div className="relative h-1.5 rounded-full bg-ink-700" aria-hidden="true"><div className="absolute h-full rounded-full bg-gold-500" style={{ width: `${(current.n / event.chapters.length) * 100}%` }} /></div>
                        <div className="mt-2.5 flex items-center gap-4 text-[0.8125rem]">
                            <Link href={`${base}/replay/watch?chapter=${Math.max(1, current.n - 1)}`} aria-label="Previous chapter"><L.SkipBack className="size-5" /></Link>
                            <L.Pause className="size-5" aria-hidden="true" />
                            <Link href={`${base}/replay/watch?chapter=${Math.min(event.chapters.length, current.n + 1)}`} aria-label="Next chapter"><L.SkipForward className="size-5" /></Link>
                            <span className="tabular-nums">{current.start} / {event.replayDuration}</span>
                            <span className="flex-1" />
                            <L.Captions className="size-5" aria-hidden="true" /><L.Settings className="size-5" aria-hidden="true" /><L.Maximize className="size-5" aria-hidden="true" />
                        </div>
                    </div>
                </div>
                <div className="rounded-[12px] border border-parchment-400 bg-white">
                    <div className="grid grid-cols-3 border-b border-parchment-400" role="tablist">
                        {(['chapters', 'transcript', 'notes'] as const).map((t) => (
                            <button key={t} type="button" role="tab" aria-selected={side === t} onClick={() => setSide(t)} className={cn('py-2.5 text-[0.8125rem] font-semibold capitalize', side === t ? 'bg-gold-500 text-ink-900' : 'text-ink-600')}>{t === 'chapters' ? `Chapters (${event.chapters.length})` : t}</button>
                        ))}
                    </div>
                    {side === 'chapters' && (
                        <ol className="max-h-[26rem] divide-y divide-parchment-300 overflow-y-auto">
                            {event.chapters.map((c) => (
                                <li key={c.n}>
                                    <Link href={`${base}/replay/watch?chapter=${c.n}`} preserveScroll className={cn('flex items-center gap-3 px-3 py-2.5 hover:bg-parchment-100', c.n === current.n && 'bg-gold-50')}>
                                        <L.CirclePlay className={cn('size-5 shrink-0', watched.includes(c.n) ? 'text-verified-500' : 'text-ink-900')} aria-hidden="true" />
                                        <span className="w-4 text-[0.75rem] text-ink-500">{c.n}</span>
                                        <span className="min-w-0 flex-1"><span className="block text-[0.8125rem] font-semibold text-ink-900">{c.title}</span><span className="text-[0.6875rem] text-ink-500">{c.start} - {c.end}</span></span>
                                        {watched.includes(c.n) && <span className="sr-only">Watched</span>}
                                    </Link>
                                </li>
                            ))}
                        </ol>
                    )}
                    {side === 'transcript' && <p className="p-4 text-[0.8125rem] text-ink-600">The reviewed transcript is held internally under the recording access policy. Captions are available in the player. Request a transcript copy for accessibility needs through Help and Support.</p>}
                    {side === 'notes' && <p className="p-4 text-[0.8125rem] text-ink-600">{note || 'You have not added notes yet. Use Your Notes below the player.'}</p>}
                </div>
            </div>

            <section className="rounded-[12px] border border-parchment-400 bg-white p-4">
                <div className="flex flex-wrap gap-1 rounded-[8px] border border-parchment-400 bg-parchment-200 p-1" role="tablist">
                    {([['takeaways', 'Key Takeaways'], ['actions', 'Action Notes'], ['sprints', 'Related Sprints'], ['discussion', 'Discussion']] as const).map(([k, l]) => (
                        <button key={k} type="button" role="tab" aria-selected={below === k} onClick={() => setBelow(k)} className={cn('rounded-[6px] px-3.5 py-2 text-[0.8125rem] font-semibold', below === k ? 'bg-gold-500 text-ink-900' : 'text-ink-600')}>{l}</button>
                    ))}
                </div>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                    <div>
                        {below === 'takeaways' && <><h2 className="font-serif text-[1.125rem] font-bold text-ink-900">Key Takeaways from This Session</h2><ul className="mt-2 space-y-2">{takeaways.map((t) => <CheckItem key={t}>{t}</CheckItem>)}</ul></>}
                        {below === 'actions' && <><h2 className="font-serif text-[1.125rem] font-bold text-ink-900">Action Notes</h2><ul className="mt-2 space-y-2"><CheckItem done={false}>Map your next 90 days using the framework in chapter 3.</CheckItem><CheckItem done={false}>Download the financial model template and update it with your numbers.</CheckItem><CheckItem done={false}>Book a discovery call if you want help applying it.</CheckItem></ul></>}
                        {below === 'sprints' && <><h2 className="font-serif text-[1.125rem] font-bold text-ink-900">Related Sprints</h2><p className="mt-2 text-[0.8125rem] text-ink-600">Fixed-scope Sprints that apply the ideas in this session.</p><BtnLink href="/sprints" tone="outline" className="mt-3">Browse Sprints</BtnLink></>}
                        {below === 'discussion' && <><h2 className="font-serif text-[1.125rem] font-bold text-ink-900">Discussion</h2><p className="mt-2 text-[0.8125rem] text-ink-600">Replay comments are moderated before they appear. Ask a follow-up question through Help and Support, or join the next live session.</p><BtnLink href="/webinars?when=upcoming" tone="outline" className="mt-3">Upcoming Webinars</BtnLink></>}
                    </div>
                    <form className="rounded-[10px] border border-controlled-500/20 bg-controlled-50 p-4" onSubmit={(e) => { e.preventDefault(); notes.post(`${base}/replay/notes`, { preserveScroll: true }); }}>
                        <label htmlFor="replay-notes" className="flex items-center gap-2 font-serif text-[1.0625rem] font-bold text-ink-900"><L.FileText className="size-5 text-controlled-500" aria-hidden="true" />Your Notes</label>
                        <textarea id="replay-notes" rows={4} maxLength={2000} value={notes.data.body} onChange={(e) => notes.setData('body', e.target.value)} placeholder="Write your notes here..." className="mt-2 w-full rounded-[6px] border border-parchment-500 bg-white p-2.5 text-[0.8125rem]" />
                        <div className="mt-2 flex items-center justify-between text-[0.75rem] text-ink-500">
                            <span>{notes.data.body.length}/2000. Saved to your account or this browser session.</span>
                            <button type="submit" disabled={notes.processing || !notes.data.body} className={btnClass('gold', 'sm')}><L.Save className="size-4" aria-hidden="true" />Save Notes</button>
                        </div>
                    </form>
                </div>
            </section>

            <section className="flex flex-wrap items-center gap-4 rounded-[12px] border border-controlled-500/20 bg-controlled-50 p-4">
                <span className="flex size-11 items-center justify-center rounded-full bg-controlled-500 text-white"><L.CircleHelp className="size-6" aria-hidden="true" /></span>
                <div className="flex-1"><h2 className="font-serif text-[1.125rem] font-bold text-controlled-700">Test Your Understanding</h2><p className="text-[0.8125rem] text-ink-700">Take a short quiz to check your understanding{event.cpd ? ' and earn a certificate of attendance' : ''}.</p></div>
                <button type="button" onClick={() => setQuizOpen(true)} className={btnClass('outline', 'md')}>{quizDone ? 'Quiz Passed' : 'Start Quiz'} <L.ArrowRight className="size-4" aria-hidden="true" /></button>
            </section>

            <Modal open={quizOpen} onClose={() => setQuizOpen(false)} title="Replay Quiz" size="lg">
                <form onSubmit={(e) => { e.preventDefault(); router.post(`${base}/replay/quiz`, { answers }, { preserveScroll: true, onSuccess: () => setQuizOpen(false) }); }} className="space-y-4">
                    {QUIZ.map(([q, opts], qi) => (
                        <fieldset key={q}>
                            <legend className="text-[0.875rem] font-semibold text-ink-900">{qi + 1}. {q}</legend>
                            <div className="mt-2 space-y-1.5">
                                {opts.map((o, oi) => (
                                    <label key={o} className="flex items-center gap-2 text-[0.8125rem] text-ink-700">
                                        <input type="radio" name={`q${qi}`} checked={answers[qi] === oi} onChange={() => setAnswers(answers.map((a, i) => (i === qi ? oi : a)))} className="size-4 accent-gold-600" />{o}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                    ))}
                    <button type="submit" disabled={answers.includes(-1)} className={btnClass('gold', 'md')}>Submit Answers</button>
                </form>
            </Modal>
        </WebinarShell>
    );
}

Watch.layout = null;
