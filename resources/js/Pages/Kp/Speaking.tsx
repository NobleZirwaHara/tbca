import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import KpFrame, { KpItemCard, SectionHeading, type KpCard, type KpShared } from '@/Components/Kp/KpFrame';
import { BtnLink, Ico } from '@/Components/Webinars/kit';

interface Props extends KpShared {
    engagements: { key: string; label: string; icon: string; body: string }[];
    topics: string[];
    media: KpCard[];
}

export default function Speaking({ sections, engagements, topics, media }: Props) {
    return (
        <KpFrame
            sections={sections}
            crumbs={[['Home', '/'], ['KP Thought Leadership', '/kp-thought-leadership'], ['Speaking & Media']]}
            eyebrow="Speaking & Media"
            title="Invite Kruger Phiri"
            gold="to Speak, Brief or Advise."
            lead="Keynotes, panels, boardroom briefings, advisory sessions and media interviews on business, capital, governance, AI and Africa's growth."
            actions={<><BtnLink href="/kp-thought-leadership/book" size="lg" icon="calendar-days">Send a Request</BtnLink><BtnLink href="/kp-thought-leadership/downloads" tone="ghostDark" size="lg" icon="download">Media Kit</BtnLink></>}
        >
            <Head title="Speaking and Media | KP Thought Leadership" />
            <section>
                <SectionHeading title="Ways to Engage" />
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {engagements.map((e) => (
                        <li key={e.key}>
                            <Link href={`/kp-thought-leadership/book?type=${e.key}`} className="flex h-full gap-3 rounded-[12px] border border-parchment-400 bg-white p-5 hover:border-gold-500">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-100 text-gold-700"><Ico name={e.icon} className="size-5" /></span>
                                <span><span className="block font-serif text-[1.125rem] font-bold text-ink-900">{e.label}</span><span className="text-[0.8125rem] text-ink-600">{e.body}</span><span className="mt-2 flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700">Request <L.ArrowRight className="size-4" aria-hidden="true" /></span></span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>
            <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
                <div className="rounded-[12px] bg-ink-950 p-6 text-parchment-100">
                    <h2 className="font-serif text-[1.375rem] font-bold text-parchment-50">Speaking Topics</h2>
                    <ul className="mt-3 space-y-2">{topics.map((t) => <li key={t} className="flex gap-2 text-[0.875rem]"><L.CircleCheck className="size-4 shrink-0 text-gold-500" aria-hidden="true" />{t}</li>)}</ul>
                </div>
                <div className="rounded-[12px] border border-parchment-400 bg-white p-6">
                    <h2 className="font-serif text-[1.375rem] font-bold text-ink-900">How Requests Work</h2>
                    <ol className="mt-3 space-y-3 text-[0.875rem] text-ink-700">
                        {['Send the request with topic, audience, date and format.', 'TBCA confirms availability, format and any fee.', 'A briefing call agrees the outcomes, audience and run-sheet.', 'Claims, statistics and guest disclosures are checked before the event.'].map((s, i) => (
                            <li key={s} className="flex gap-3"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[0.75rem] font-bold text-ink-900">{i + 1}</span>{s}</li>
                        ))}
                    </ol>
                </div>
            </section>
            <section>
                <SectionHeading title="Interviews, Keynotes and Media" more={['Podcasts and videos', '/kp-thought-leadership/podcasts']} />
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{media.map((m) => <KpItemCard key={m.slug} item={m} compact />)}</ul>
            </section>
        </KpFrame>
    );
}
