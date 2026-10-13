import { Head, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { cn } from '@/lib/cn';
import KpFrame, { type KpShared } from '@/Components/Kp/KpFrame';
import { btnClass } from '@/Components/Webinars/kit';

interface Props extends KpShared {
    mode: 'newsletter' | 'book';
    engagements: { key: string; label: string; icon: string; body: string }[];
    preset: string;
}

const input = 'h-10 w-full rounded-[6px] border border-parchment-500 bg-white px-3 text-[0.875rem] focus:border-gold-500 focus:outline-none';

export default function Connect({ sections, themes, mode, engagements, preset }: Props) {
    const news = useForm({ name: '', email: '', themes: [] as string[], frequency: 'monthly', consent: false, subject: 'KP newsletter subscription', section: 'kp' });
    const book = useForm({
        name: '', email: '', phone: '', organisation: '', engagement: engagements.some((e) => e.key === preset) ? preset : engagements[0].key,
        date: '', audience: '', format: 'in-person', details: '', subject: 'KP engagement request', section: 'kp',
    });
    const isBook = mode === 'book';

    return (
        <KpFrame
            sections={sections}
            crumbs={[['Home', '/'], ['KP Thought Leadership', '/kp-thought-leadership'], [isBook ? 'Book KP' : 'Newsletter']]}
            eyebrow={isBook ? 'Book Kruger Phiri' : 'KP Newsletter'}
            title={isBook ? 'Request a Keynote, Briefing or Session' : 'Receive New Insight When It Publishes'}
            lead={isBook ? 'Tell us about your event or the decision you face. TBCA confirms availability, format and any fee before anything is booked.' : 'Choose the themes you care about. We send new articles, event invitations and replays. You can unsubscribe at any time.'}
        >
            <Head title={`${isBook ? 'Book KP' : 'Newsletter'} | KP Thought Leadership`} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
                {isBook ? (
                    <form className="space-y-4 rounded-[12px] border border-parchment-400 bg-white p-6" onSubmit={(e) => { e.preventDefault(); book.post('/forms/kp-engagement', { preserveScroll: true, onSuccess: () => book.reset('details', 'date', 'audience') }); }}>
                        <fieldset>
                            <legend className="mb-2 text-[0.875rem] font-semibold text-ink-900">Type of engagement</legend>
                            <div className="grid gap-2 sm:grid-cols-3">
                                {engagements.map((e) => (
                                    <label key={e.key} className={cn('cursor-pointer rounded-[8px] border p-3 text-[0.8125rem]', book.data.engagement === e.key ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                        <input type="radio" name="engagement" className="sr-only" checked={book.data.engagement === e.key} onChange={() => book.setData('engagement', e.key)} />
                                        <span className="block font-semibold text-ink-900">{e.label}</span>
                                        <span className="text-[0.75rem] text-ink-500">{e.body}</span>
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Full name *<input required className={cn(input, 'mt-1')} value={book.data.name} onChange={(e) => book.setData('name', e.target.value)} autoComplete="name" /></label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Email *<input required type="email" className={cn(input, 'mt-1')} value={book.data.email} onChange={(e) => book.setData('email', e.target.value)} autoComplete="email" /></label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Phone<input className={cn(input, 'mt-1')} value={book.data.phone} onChange={(e) => book.setData('phone', e.target.value)} autoComplete="tel" /></label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Organisation *<input required className={cn(input, 'mt-1')} value={book.data.organisation} onChange={(e) => book.setData('organisation', e.target.value)} autoComplete="organization" /></label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Preferred date<input type="date" className={cn(input, 'mt-1')} value={book.data.date} onChange={(e) => book.setData('date', e.target.value)} /></label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Format
                                <select className={cn(input, 'mt-1')} value={book.data.format} onChange={(e) => book.setData('format', e.target.value)}>
                                    <option value="in-person">In person</option><option value="virtual">Virtual</option><option value="hybrid">Hybrid</option>
                                </select>
                            </label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800 sm:col-span-2">Audience and size<input className={cn(input, 'mt-1')} placeholder="e.g. 200 SME owners, board of 9" value={book.data.audience} onChange={(e) => book.setData('audience', e.target.value)} /></label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800 sm:col-span-2">Topic and details *<textarea required rows={4} className="mt-1 w-full rounded-[6px] border border-parchment-500 p-3 text-[0.875rem]" value={book.data.details} onChange={(e) => book.setData('details', e.target.value)} /></label>
                        </div>
                        <button type="submit" disabled={book.processing} className={btnClass('gold', 'lg')}><L.Send className="size-5" aria-hidden="true" />Send Request</button>
                    </form>
                ) : (
                    <form className="space-y-4 rounded-[12px] border border-parchment-400 bg-white p-6" onSubmit={(e) => { e.preventDefault(); news.post('/forms/newsletter', { preserveScroll: true, onSuccess: () => news.reset() }); }}>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Name<input className={cn(input, 'mt-1')} value={news.data.name} onChange={(e) => news.setData('name', e.target.value)} autoComplete="name" /></label>
                            <label className="text-[0.8125rem] font-semibold text-ink-800">Email *<input required type="email" className={cn(input, 'mt-1')} value={news.data.email} onChange={(e) => news.setData('email', e.target.value)} autoComplete="email" /></label>
                        </div>
                        <fieldset>
                            <legend className="mb-2 text-[0.875rem] font-semibold text-ink-900">Themes</legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {themes.map((t) => (
                                    <label key={t.slug} className="flex items-center gap-2 text-[0.8125rem] text-ink-700">
                                        <input type="checkbox" className="size-4 accent-gold-600" checked={news.data.themes.includes(t.slug)} onChange={(e) => news.setData('themes', e.target.checked ? [...news.data.themes, t.slug] : news.data.themes.filter((x) => x !== t.slug))} />{t.label}
                                    </label>
                                ))}
                            </div>
                        </fieldset>
                        <label className="block text-[0.8125rem] font-semibold text-ink-800">Frequency
                            <select className={cn(input, 'mt-1')} value={news.data.frequency} onChange={(e) => news.setData('frequency', e.target.value)}><option value="new">Each new article</option><option value="monthly">Monthly digest</option></select>
                        </label>
                        <label className="flex items-start gap-2 text-[0.8125rem] text-ink-700"><input required type="checkbox" className="mt-0.5 size-4 accent-gold-600" checked={news.data.consent} onChange={(e) => news.setData('consent', e.target.checked)} />I agree to receive the KP newsletter and accept the <a href="/policies" className="text-gold-700 underline">Privacy Policy</a>. I can unsubscribe at any time.</label>
                        <button type="submit" disabled={news.processing} className={btnClass('gold', 'lg')}><L.Mail className="size-5" aria-hidden="true" />Subscribe</button>
                    </form>
                )}
                <aside className="space-y-4">
                    <div className="rounded-[12px] bg-ink-950 p-5 text-parchment-100">
                        <p className="font-serif text-[1.125rem] font-bold text-parchment-50">{isBook ? 'What Happens Next' : 'What You Receive'}</p>
                        <ul className="mt-2 space-y-2 text-[0.8125rem]">
                            {(isBook ? ['A reference number straight away', 'Confirmation of availability, format and any fee', 'A briefing call to agree outcomes and run-sheet'] : ['New articles by Kruger Phiri', 'Invitations to KP webinars and sessions', 'Approved replays and downloads']).map((t) => <li key={t} className="flex gap-2"><L.CircleCheck className="size-4 shrink-0 text-gold-500" aria-hidden="true" />{t}</li>)}
                        </ul>
                    </div>
                    <div className="rounded-[12px] border border-parchment-400 bg-white p-5 text-[0.8125rem] text-ink-600">
                        Manage all your communication choices in the <a href="/resources/preferences" className="font-semibold text-gold-700">Preference Centre</a>.
                    </div>
                </aside>
            </div>
        </KpFrame>
    );
}
