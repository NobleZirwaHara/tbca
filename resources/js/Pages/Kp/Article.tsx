import { Head, Link } from '@inertiajs/react';
import * as L from 'lucide-react';
import KpFrame, { KpItemCard, type KpCard, type KpShared } from '@/Components/Kp/KpFrame';
import { BtnLink, Ico } from '@/Components/Webinars/kit';

interface Props extends KpShared {
    item: KpCard & { body: string[]; readMinutes: number | null };
    series: { slug: string; title: string } | null;
    related: KpCard[];
    author: { name: string; post_nominal: string; role: string; summary: string };
}

export default function Article({ sections, item, series, related, author }: Props) {
    const pending = item.status === 'pending';
    return (
        <KpFrame
            sections={sections}
            crumbs={[['Home', '/'], ['KP Thought Leadership', '/kp-thought-leadership'], ['Article Library', '/kp-thought-leadership/articles'], [item.title]]}
            eyebrow={`${item.formatLabel} | ${item.themeLabel}`}
            title={item.title}
            lead={item.summary ?? undefined}
        >
            <Head title={`${item.title} | KP Thought Leadership`} />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <article className="rounded-[12px] border border-parchment-400 bg-white p-6">
                    <div className="flex flex-wrap items-center gap-3 border-b border-parchment-300 pb-4 text-[0.8125rem] text-ink-600">
                        <span className="inline-flex items-center gap-1.5"><Ico name={item.icon} className="size-4 text-gold-600" />{item.formatLabel}</span>
                        <Link href={`/kp-thought-leadership/themes/${item.theme}`} className="font-semibold text-gold-700">{item.themeLabel}</Link>
                        {series && <Link href={`/kp-thought-leadership/series/${series.slug}`} className="inline-flex items-center gap-1"><L.Layers className="size-4" aria-hidden="true" />{series.title}</Link>}
                        {item.published && <span>{item.published}</span>}
                        {item.readMinutes && <span>{item.readMinutes} min read</span>}
                    </div>
                    {pending ? (
                        <div className="mt-6 rounded-[10px] border border-attested-500/40 bg-attested-50 p-5">
                            <p className="flex items-center gap-2 font-serif text-[1.25rem] font-bold text-ink-900"><L.Hourglass className="size-5 text-attested-500" aria-hidden="true" />Article pending from KP</p>
                            <p className="mt-2 text-[0.875rem] text-ink-700">This entry holds the place for an article by Kruger Phiri. The full text will appear here when it is published. Subscribe to be told when it goes live.</p>
                            <div className="mt-4 flex flex-wrap gap-2">
                                <BtnLink href="/kp-thought-leadership/newsletter" icon="mail">Notify Me</BtnLink>
                                <BtnLink href="/kp-thought-leadership/articles" tone="outline">Back to the Library</BtnLink>
                            </div>
                        </div>
                    ) : (
                        <div className="prose mt-6 max-w-none text-[1rem] leading-relaxed text-ink-800">
                            {item.body.map((p) => <p key={p.slice(0, 40)} className="mt-4">{p}</p>)}
                        </div>
                    )}
                    <p className="mt-6 border-t border-parchment-300 pt-4 text-[0.75rem] text-ink-500">Published insight reflects the author&rsquo;s professional view. It is not advice for a specific business, transaction or jurisdiction.</p>
                </article>
                <aside className="space-y-4">
                    <section className="rounded-[12px] bg-ink-950 p-5 text-parchment-100">
                        <p className="font-serif text-[1.125rem] font-bold text-parchment-50">{author.name}, {author.post_nominal}</p>
                        <p className="text-[0.75rem] text-gold-400">{author.role}</p>
                        <p className="mt-2 text-[0.8125rem] text-parchment-200">{author.summary}</p>
                        <Link href="/kp-thought-leadership/about-kruger-phiri" className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-400">Full profile <L.ArrowRight className="size-4" aria-hidden="true" /></Link>
                    </section>
                    <section className="rounded-[12px] border border-parchment-400 bg-white p-5">
                        <p className="font-serif font-bold text-ink-900">Take the Next Step</p>
                        <ul className="mt-2 space-y-2 text-[0.8125rem]">
                            <li><Link href="/kp-thought-leadership/book" className="text-gold-700">Book an advisory session with KP</Link></li>
                            <li><Link href="/webinars?speaker=Kruger%20Phiri" className="text-gold-700">Join a webinar with KP</Link></li>
                            <li><Link href="/services" className="text-gold-700">Explore TBCA services</Link></li>
                        </ul>
                    </section>
                </aside>
            </div>
            {related.length > 0 && (
                <section>
                    <h2 className="mb-3 font-serif text-[1.5rem] font-bold text-ink-900">More on {item.themeLabel}</h2>
                    <ul className="grid gap-4 sm:grid-cols-3">{related.map((r) => <KpItemCard key={r.slug} item={r} compact />)}</ul>
                </section>
            )}
        </KpFrame>
    );
}
