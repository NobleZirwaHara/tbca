import { Head, Link, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { cn } from '@/lib/cn';
import { BtnLink, Card, EventHero, KeyDetails, ResourceRows, StatTile, WebinarShell, btnClass, splitTitle } from '@/Components/Webinars/kit';
import type { EventFrame } from '@/types/webinars';

interface Props extends EventFrame {
    stats: { attendees: number; questions: number; pollPct: number; downloads: number };
    feedbackGiven: boolean;
    certificateReady: boolean;
}

const RELEVANCE = ['Not relevant', 'Somewhat relevant', 'Relevant', 'Very relevant', 'Extremely relevant'];
const VALUABLE = ['Expert insights', 'Live Q&A session', 'Practical tools and templates', 'Real-world case studies', 'Other'];
const RATING = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent'];

export default function ThankYou({ event, registration, stats, feedbackGiven, certificateReady }: Props) {
    const [lead, gold] = splitTitle(event.title);
    const base = `/webinars/${event.slug}`;
    const form = useForm<{ rating: number; relevance: string; valuable: string[]; topics: string; contact_ok: boolean }>({ rating: 0, relevance: '', valuable: [], topics: '', contact_ok: false });
    const ended = !event.upcoming && !event.live;

    return (
        <WebinarShell
            event={event}
            rail={
                <>
                    <KeyDetails event={event} title="Webinar Details" />
                    <Link href={`${base}/offers`} className="flex items-center gap-3 rounded-[10px] border border-gold-300 bg-gold-50 p-4 hover:bg-gold-100">
                        <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-900"><L.Star className="size-5" aria-hidden="true" /></span>
                        <span className="flex-1 text-[0.8125rem] text-ink-700"><strong className="block font-serif text-[1rem] text-ink-900">Next Step</strong>Complete the feedback form, then see the disclosed post-webinar offers and your resources.</span>
                        <L.ArrowRight className="size-6 text-gold-600" aria-hidden="true" />
                    </Link>
                    <Card title="Your Resources" icon="file-text"><ResourceRows event={event} /></Card>
                    <Card title="Your Certificate" icon="award">
                        <p className="text-[0.8125rem] text-ink-600">{certificateReady ? 'A certificate of attendance is available for this webinar.' : event.cpd ? 'Certificates are issued to attendees of CPD eligible events. Replay viewers can earn one by completing the quiz and feedback.' : 'This event is not CPD eligible. An attendance record is kept in your registration.'}</p>
                        {certificateReady ? <a href={`${base}/certificate`} className={cn(btnClass('gold', 'md'), 'mt-3')}><L.Download className="size-4" aria-hidden="true" />Download Certificate</a> : event.replayAvailable && event.cpd ? <BtnLink href={`${base}/replay/watch`} tone="outline" className="mt-3">Take the Replay Quiz</BtnLink> : null}
                    </Card>
                    <Card title="Stay Connected" icon="users">
                        <p className="text-[0.8125rem] text-ink-600">Join our next webinar or explore more resources.</p>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <BtnLink href="/webinars?when=upcoming" tone="dark" size="sm">View Upcoming Webinars</BtnLink>
                            <BtnLink href="/resources" tone="outline" size="sm">Explore Resources</BtnLink>
                        </div>
                    </Card>
                </>
            }
        >
            <Head title={`Thank You: ${event.title}`} />
            <EventHero crumbs={[['Home', '/'], ['Webinars', '/webinars'], [lead.replace(/:$/, ''), base], ['Post-Webinar']]} eyebrow={ended ? 'Webinar Completed' : 'Post-Webinar'} title="Thank You for Joining" gold={gold ? `${lead} ${gold}` : lead} lead="Your participation made this webinar a success. We appreciate your time, insights and thoughtful questions." />
            {!ended && <p className="rounded-[10px] border border-gold-300 bg-gold-50 p-4 text-[0.8125rem] text-ink-700">This session has not finished yet. The feedback form stays open after the event.</p>}

            <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <li><StatTile icon="users" value={stats.attendees} label="Live Attendees" sub="Your participation matters." tone="gold" /></li>
                <li><StatTile icon="message-circle" value={stats.questions} label="Questions Asked" sub="Great discussions and insights." tone="blue" /></li>
                <li><StatTile icon="bar-chart-3" value={`${stats.pollPct}%`} label="Poll Participation" sub="Your input shapes future topics." tone="green" /></li>
                <li><StatTile icon="download" value={stats.downloads} label="Resource Downloads" sub="Access practical tools and templates." tone="purple" /></li>
            </ul>

            <section className="rounded-[12px] border border-parchment-400 bg-white p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                        <span className="flex size-10 items-center justify-center rounded-[8px] bg-gold-500 text-ink-900"><L.ChartColumn className="size-5" aria-hidden="true" /></span>
                        <div>
                            <h2 className="font-serif text-[1.5rem] font-bold text-ink-900">We Value Your Feedback</h2>
                            <p className="text-[0.8125rem] text-ink-600">Please take a few minutes to complete this short feedback form. Your feedback helps us improve future webinars and tailor content to your needs.</p>
                        </div>
                    </div>
                    <span className="flex items-center gap-1 text-[0.8125rem] text-ink-600"><L.Clock className="size-4" aria-hidden="true" />2-3 minutes</span>
                </div>

                {feedbackGiven ? (
                    <div className="mt-4 flex items-center gap-3 rounded-[10px] border border-verified-500/30 bg-verified-50 p-4">
                        <L.CircleCheck className="size-7 text-verified-500" aria-hidden="true" />
                        <p className="text-[0.875rem] text-ink-800">Thank you, {registration?.name.split(' ')[0] ?? 'friend'}. Your feedback was received. <Link href={`${base}/offers`} className="font-semibold text-gold-700">See your next steps</Link>.</p>
                    </div>
                ) : (
                    <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); form.post(`${base}/feedback`, { preserveScroll: true }); }}>
                        <fieldset className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 p-3.5">
                            <legend className="sr-only">Overall rating</legend>
                            <span className="text-[0.875rem] font-semibold text-ink-900">1. Overall, how would you rate this webinar?</span>
                            <span className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((n) => (
                                    <label key={n} className="cursor-pointer" title={RATING[n - 1]}>
                                        <input type="radio" name="rating" value={n} checked={form.data.rating === n} onChange={() => form.setData('rating', n)} className="sr-only" />
                                        <L.Star className={cn('size-8', n <= form.data.rating ? 'fill-gold-400 text-gold-500' : 'text-parchment-500')} aria-hidden="true" />
                                        <span className="sr-only">{n} stars, {RATING[n - 1]}</span>
                                    </label>
                                ))}
                                <span className="ml-2 w-20 text-[0.8125rem] text-ink-700">{form.data.rating ? RATING[form.data.rating - 1] : 'Select'}</span>
                            </span>
                            {form.errors.rating && <p className="w-full text-[0.75rem] text-risk-500">Please choose a rating.</p>}
                        </fieldset>
                        <fieldset className="rounded-[8px] border border-parchment-400 p-3.5">
                            <legend className="px-1 text-[0.875rem] font-semibold text-ink-900">2. How relevant was the content to your work or business?</legend>
                            <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                                {RELEVANCE.map((r) => <label key={r} className="flex items-center gap-2 text-[0.8125rem] text-ink-700"><input type="radio" name="relevance" checked={form.data.relevance === r} onChange={() => form.setData('relevance', r)} className="size-4 accent-gold-600" />{r}</label>)}
                            </div>
                            {form.errors.relevance && <p className="text-[0.75rem] text-risk-500">Please choose one option.</p>}
                        </fieldset>
                        <fieldset className="rounded-[8px] border border-parchment-400 p-3.5">
                            <legend className="px-1 text-[0.875rem] font-semibold text-ink-900">3. What did you find most valuable? (Select all that apply)</legend>
                            <div className="mt-2 grid gap-2 sm:grid-cols-2">
                                {VALUABLE.map((v) => (
                                    <label key={v} className="flex items-center gap-2 text-[0.8125rem] text-ink-700">
                                        <input type="checkbox" checked={form.data.valuable.includes(v)} onChange={(e) => form.setData('valuable', e.target.checked ? [...form.data.valuable, v] : form.data.valuable.filter((x) => x !== v))} className="size-4 accent-gold-600" />{v}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <div className="rounded-[8px] border border-parchment-400 p-3.5">
                            <label htmlFor="fb-topics" className="text-[0.875rem] font-semibold text-ink-900">4. What topics would you like us to cover in future webinars?</label>
                            <textarea id="fb-topics" rows={3} maxLength={500} value={form.data.topics} onChange={(e) => form.setData('topics', e.target.value)} placeholder="Type your suggestions here..." className="mt-2 w-full rounded-[6px] border border-parchment-500 p-2.5 text-[0.8125rem]" />
                            <p className="text-right text-[0.6875rem] text-ink-400">{form.data.topics.length}/500</p>
                        </div>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <label className="flex items-center gap-2 text-[0.8125rem] text-ink-700"><input type="checkbox" checked={form.data.contact_ok} onChange={(e) => form.setData('contact_ok', e.target.checked)} className="size-4 accent-gold-600" />I am happy for TBCA to contact me about relevant future webinars, insights and resources.</label>
                            <button type="submit" disabled={form.processing} className={btnClass('gold', 'lg')}><L.Send className="size-5" aria-hidden="true" />Submit Feedback</button>
                        </div>
                    </form>
                )}
            </section>
        </WebinarShell>
    );
}

ThankYou.layout = null;
