import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import KpFrame, { KpItemCard, SectionHeading, type KpCard, type KpShared } from '@/Components/Kp/KpFrame';
import { BtnLink, EventCover, Ico, StateChip } from '@/Components/Webinars/kit';
import type { WebinarEvent } from '@/types/webinars';

interface Props extends KpShared {
    featured: KpCard[];
    latest: KpCard[];
    numbers: { value: string; label: string; icon: string }[];
    counts: { items: number; published: number; series: number };
    events: WebinarEvent[];
}

export default function Home({ sections, themes, featured, latest, numbers, counts, events }: Props) {
    return (
        <KpFrame
            sections={sections}
            crumbs={[['Home', '/'], ['KP Thought Leadership']]}
            title="KP Thought Leadership."
            gold="Ideas. Insights. Impact."
            lead="Strategic perspectives from Kruger Phiri, Founder and Managing Partner of The Business Clinic.Africa, on business, investment, leadership, innovation and Africa's transformation."
            actions={
                <>
                    <BtnLink href="/kp-thought-leadership/articles" size="lg" icon="file-text">Explore the Article Library</BtnLink>
                    <BtnLink href="/kp-thought-leadership/book" tone="ghostDark" size="lg" icon="calendar-days">Book KP to Speak</BtnLink>
                </>
            }
            aside={
                <div className="rounded-[12px] border border-gold-600/60 bg-ink-950/80 p-6 text-center">
                    <p className="font-serif text-[4rem] leading-none font-bold text-gold-500">KP</p>
                    <p className="mt-2 font-serif tracking-[0.3em] text-gold-400">KRUGER PHIRI</p>
                    <p className="mt-1 text-[0.75rem] text-parchment-300">FCCA | Founder & Managing Partner</p>
                    <Link href="/kp-thought-leadership/about-kruger-phiri" className="mt-4 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-400">About Kruger Phiri <L.ArrowRight className="size-4" aria-hidden="true" /></Link>
                </div>
            }
        >
            <Head title="KP Thought Leadership" />

            <ul className="grid gap-3 rounded-[12px] border border-gold-300 bg-ink-950 p-5 sm:grid-cols-3 lg:grid-cols-5">
                {numbers.map((n) => (
                    <li key={n.label} className="flex items-center gap-3">
                        <Ico name={n.icon} className="size-7 text-gold-500" />
                        <span><span className="block font-serif text-2xl font-bold text-parchment-50">{n.value}</span><span className="text-[0.75rem] text-parchment-300">{n.label}</span></span>
                    </li>
                ))}
            </ul>

            <section>
                <SectionHeading title="Explore the Section" sub="Everything Kruger Phiri publishes, says and teaches, in one place." />
                <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                    {sections.slice(1).map((s) => (
                        <li key={s.href}>
                            <Link href={s.href} className="flex h-full flex-col rounded-[10px] border border-parchment-400 bg-white p-4 hover:border-gold-500">
                                <span className="flex size-10 items-center justify-center rounded-full bg-gold-100 text-gold-700"><Ico name={s.icon} className="size-5" /></span>
                                <span className="mt-2 font-semibold text-ink-900">{s.label}</span>
                                <span className="text-[0.75rem] text-ink-500">{s.body}</span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            <section>
                <SectionHeading title="Featured Insights" more={['View all articles', '/kp-thought-leadership/articles']} />
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{featured.map((i) => <KpItemCard key={i.slug} item={i} />)}</ul>
            </section>

            <section>
                <SectionHeading title="Browse by Theme" />
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    {themes.map((t) => (
                        <li key={t.slug}>
                            <Link href={`/kp-thought-leadership/themes/${t.slug}`} className="flex h-full gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 hover:border-gold-500">
                                <Ico name={t.icon} className="size-6 shrink-0 text-gold-600" />
                                <span><span className="block font-semibold text-ink-900">{t.label}</span><span className="text-[0.75rem] text-ink-500">{t.blurb}</span></span>
                            </Link>
                        </li>
                    ))}
                </ul>
            </section>

            {events.length > 0 && (
                <section>
                    <SectionHeading title="Hear KP Live" more={['All events', '/kp-thought-leadership/events']} />
                    <ul className="grid gap-4 md:grid-cols-3">
                        {events.map((e) => (
                            <li key={e.slug} className="overflow-hidden rounded-[10px] border border-parchment-400 bg-white">
                                <EventCover event={e} className="aspect-[16/7]" />
                                <div className="p-4">
                                    <StateChip event={e} />
                                    <Link href={`/webinars/${e.slug}`} className="mt-2 block font-serif font-bold text-ink-900 hover:text-gold-700">{e.title}</Link>
                                    <p className="text-[0.75rem] text-ink-500">{e.dateLong} | {e.timeRange}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            )}

            <section>
                <SectionHeading title="Latest Additions" more={['Open the library', '/kp-thought-leadership/articles']} />
                <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{latest.map((i) => <KpItemCard key={i.slug} item={i} compact />)}</ul>
                <p className="mt-3 text-[0.75rem] text-ink-500">{counts.items} entries in {counts.series} series. Entries marked &ldquo;Article pending from KP&rdquo; are published as Kruger Phiri releases each article.</p>
            </section>

            <section className="grid gap-4 rounded-[12px] bg-ink-950 p-6 text-parchment-100 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
                <div>
                    <h2 className="font-serif text-[1.5rem] font-bold text-parchment-50">Receive New Insight When It Publishes</h2>
                    <p className="text-[0.875rem] text-parchment-300">Subscribe to the KP newsletter or invite Kruger Phiri to speak to your board, conference or team.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <BtnLink href="/kp-thought-leadership/newsletter" icon="mail">Subscribe</BtnLink>
                    <BtnLink href="/kp-thought-leadership/book" tone="ghostDark" icon="calendar-days">Book KP</BtnLink>
                </div>
            </section>
            <p className="text-[0.75rem] text-ink-500">Published insight reflects the author&rsquo;s professional view. It is not advice for a specific business, transaction or jurisdiction.</p>
        </KpFrame>
    );
}
