import { Link, useForm } from '@inertiajs/react';
import * as L from 'lucide-react';
import { BtnLink, Ico, btnClass } from '@/Components/Webinars/kit';
import { BASE, Box, Field, H2, Input, KpPage, Select, ThemeCover, type KpShared } from '@/Components/Kp/kit';

interface Props extends KpShared {
    formats: [string, string, string, string, string][];
    topics: [string, string, string][];
    appearances: [string, string, string, string, string][];
    focusAreas: [string, string, string][];
}

/** KP-SCR-012 Speaking & Media. Appearances display as listed in KP's design until each asset is verified. */
export default function Speaking({ screen, kpNav, formats, topics, appearances, focusAreas }: Props) {
    const form = useForm({ format: formats[0][0], event: '', date: '', audience: '', topic: topics[0][0], recording: false, name: '', email: '' });
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[['Speaking & Media']]}
            title="Speaking & Media"
            subtitle="Ideas that challenge. Perspectives that build. Impact that lasts."
            intro="Kruger Phiri speaks on strategy, capital, governance and execution across Africa: conferences, panels, media interviews, podcasts and broadcasts."
            rail={
                <>
                    <Box title="About Kruger Phiri">
                        <p className="text-[0.8125rem]">Founder of The Business Clinic.Africa. Strategic advisor focused on building scalable businesses, mobilising capital and executing with impact across Africa.</p>
                        <ul className="mt-3 space-y-2">{focusAreas.slice(0, 4).map(([t, b, i]) => <li key={t} className="flex gap-2"><Ico name={i} className="mt-0.5 size-4 shrink-0 text-gold-600" /><span className="text-[0.75rem]"><span className="block font-semibold text-ink-900">{t}</span>{b}</span></li>)}</ul>
                        <Link href={`${BASE}/about`} className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">View Full Profile <L.ArrowRight className="size-3.5" /></Link>
                    </Box>
                    <Box title="Book Kruger for Your Event" tone="cream">
                        <p className="text-[0.8125rem]">Bring clarity, challenge and practical insight to your audience.</p>
                        <div className="mt-3 grid gap-2">
                            <BtnLink href={`${BASE}/work-with-kruger`} icon="arrow-right">Check Availability</BtnLink>
                            <a href="#enquiry" className={btnClass('outline')}>Submit Speaking Request</a>
                        </div>
                    </Box>
                </>
            }
        >
            <ul className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 sm:grid-cols-2 xl:grid-cols-5">
                {formats.map(([k, t, b, i, cta]) => (
                    <li key={k} className="flex gap-2.5">
                        <Ico name={i} className="mt-0.5 size-6 shrink-0 text-gold-600" />
                        <span>
                            <span className="block text-[0.8125rem] font-bold text-ink-900">{t}</span>
                            <span className="block text-[0.6875rem] text-ink-600">{b}</span>
                            {k === 'topics' ? <a href="#topics" className="mt-1 inline-block text-[0.75rem] font-semibold text-gold-700">{cta}</a> : <a href="#enquiry" onClick={() => form.setData('format', k)} className="mt-1 inline-block text-[0.75rem] font-semibold text-gold-700">{cta}</a>}
                        </span>
                    </li>
                ))}
            </ul>

            <section id="topics">
                <H2>Featured Speaking Topics</H2>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {topics.map(([t, b, i]) => <li key={t} className="rounded-[10px] border border-parchment-400 bg-white p-4 text-center"><Ico name={i} className="mx-auto size-8 text-gold-600" /><p className="mt-2 font-serif font-bold text-ink-900">{t}</p><p className="mt-1 text-[0.75rem] text-ink-600">{b}</p></li>)}
                </ul>
            </section>

            <section>
                <H2 sub="As listed in KP's design. Each appearance shows a recording or link once TBCA verifies the asset.">Recent Appearances & Media</H2>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {appearances.map(([type, title, body, date, where]) => (
                        <li key={title} className="overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
                            <ThemeCover theme="leadership-people" seed={title} label={title} className="aspect-[16/8]"><span className="absolute top-2 left-2 rounded-[4px] bg-gold-500 px-2 py-0.5 text-[0.625rem] font-bold text-ink-900 uppercase">{type}</span></ThemeCover>
                            <div className="p-3">
                                <p className="font-serif font-bold text-ink-900">{title}</p>
                                <p className="text-[0.75rem] text-ink-600">{body}</p>
                                <p className="mt-2 flex items-center justify-between text-[0.6875rem] text-ink-500"><span>{date} | {where}</span><span className="rounded-full bg-parchment-200 px-2 py-0.5">Verification pending</span></p>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            <Box id="enquiry" title="Speaking and Media Enquiry" icon="mic">
                <form className="grid gap-3 sm:grid-cols-2" onSubmit={(e) => { e.preventDefault(); form.post(`${BASE}/speaking-media`, { preserveScroll: true, onSuccess: () => form.reset('event', 'audience', 'date') }); }}>
                    <Field label="Format" error={form.errors.format}><Select value={form.data.format} onChange={(e) => form.setData('format', e.target.value)} options={formats.filter((f) => f[0] !== 'topics').map((f) => ({ value: f[0], label: f[1] }))} /></Field>
                    <Field label="Topic" error={form.errors.topic}><Select value={form.data.topic} onChange={(e) => form.setData('topic', e.target.value)} options={[...topics.map((t) => t[0]), 'Other (describe in event details)']} /></Field>
                    <Field label="Event or programme name" error={form.errors.event}><Input required value={form.data.event} onChange={(e) => form.setData('event', e.target.value)} /></Field>
                    <Field label="Date" error={form.errors.date}><Input type="date" required value={form.data.date} onChange={(e) => form.setData('date', e.target.value)} /></Field>
                    <Field label="Audience" error={form.errors.audience} hint="Who attends and roughly how many."><Input required value={form.data.audience} onChange={(e) => form.setData('audience', e.target.value)} /></Field>
                    <label className="flex items-center gap-2 self-end pb-2 text-[0.8125rem]"><input type="checkbox" className="size-4 accent-gold-600" checked={form.data.recording} onChange={(e) => form.setData('recording', e.target.checked)} />The session will be recorded or broadcast</label>
                    <Field label="Your name" error={form.errors.name}><Input required value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} /></Field>
                    <Field label="Email" error={form.errors.email}><Input type="email" required value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} /></Field>
                    <p className="text-[0.75rem] text-ink-500 sm:col-span-2">An enquiry is not a confirmation. Founder capacity, fee and recording rights are agreed in writing first.</p>
                    <div><button type="submit" disabled={form.processing} className={btnClass('gold')}>Send Enquiry</button></div>
                </form>
            </Box>
        </KpPage>
    );
}
