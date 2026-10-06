import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, Download, FileText, Link2, Mail, MapPin, Phone, Quote, Share2, Tag, User } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import AboutIcon from '@/Components/About/AboutIcon';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import type { NewsCard } from '@/types/about';

interface Release extends NewsCard {
    location: string | null;
    body: string[];
    quote: string | null;
    quote_by: string | null;
}

export default function PressRelease({ release, related }: { release: Release; related: NewsCard[] }) {
    const [copied, setCopied] = useState(false);
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const enc = encodeURIComponent(url);
    const title = encodeURIComponent(release.title);
    const shares = [
        { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${enc}` },
        { label: 'X', href: `https://twitter.com/intent/tweet?url=${enc}&text=${title}` },
        { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${enc}` },
        { label: 'WhatsApp', href: `https://wa.me/?text=${title}%20${enc}` },
        { label: 'Email', href: `mailto:?subject=${title}&body=${enc}` },
    ];

    return (
        <>
            <Head title={release.title} />
            <section className="bg-white py-8">
                <div className="container-tbca">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Newsroom', href: '/newsroom' }, { label: release.category_label }]} />
                    <div className="grid gap-8 lg:grid-cols-[1fr_20rem]">
                        <article>
                            <Link href="/newsroom" className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-violet-700"><ArrowLeft className="size-4" aria-hidden="true" /> Back to Newsroom</Link>
                            <div className="mt-4 grid gap-6 xl:grid-cols-[1fr_17rem]">
                                <div>
                                    <p className="text-xs font-bold tracking-[0.14em] text-violet-700 uppercase">{release.category_label}</p>
                                    <h1 className="mt-2 font-serif text-[2rem] leading-tight font-semibold text-ink-900 md:text-[2.5rem]">{release.title}</h1>
                                    <span className="mt-4 block h-0.5 w-14 bg-violet-600" aria-hidden="true" />
                                    {release.subtitle && <p className="mt-4 text-lg text-ink-700">{release.subtitle}</p>}
                                    <p className="mt-4 flex flex-wrap gap-4 text-[0.8125rem] text-ink-600">
                                        <span className="flex items-center gap-1"><CalendarDays className="size-4" aria-hidden="true" />{fmtDate(release.published_at)}</span>
                                        <span className="flex items-center gap-1"><Tag className="size-4" aria-hidden="true" />{release.category_label}</span>
                                        {release.location && <span className="flex items-center gap-1"><MapPin className="size-4" aria-hidden="true" />{release.location}</span>}
                                    </p>
                                    <div className="mt-6 space-y-4 text-[0.9375rem] leading-relaxed text-ink-800">
                                        {release.body.map((p, i) => <p key={i}>{p}</p>)}
                                        <p className="text-center font-semibold">###</p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex aspect-[4/3] items-center justify-center rounded-[8px] bg-gradient-to-br from-ink-950 via-controlled-700 to-ink-900 text-gold-300">
                                        <AboutIcon name={release.icon} className="size-16" />
                                    </div>
                                    {release.quote && (
                                        <figure className="rounded-[8px] border border-parchment-400 p-5">
                                            <Quote className="size-8 text-violet-700" aria-hidden="true" />
                                            <blockquote className="mt-2 text-[0.9375rem] text-ink-900">{release.quote}</blockquote>
                                            {release.quote_by && <figcaption className="mt-3 text-[0.8125rem] font-semibold text-violet-700">– {release.quote_by}</figcaption>}
                                        </figure>
                                    )}
                                    <Link href="/about" className="flex items-center gap-3 rounded-[8px] border border-violet-300 p-4 text-[0.8125rem] hover:bg-violet-50">
                                        <FileText className="size-6 text-violet-700" aria-hidden="true" />
                                        <span className="flex-1"><span className="block font-semibold text-violet-800">About TBCA</span><span className="text-ink-600">Learn more about our mission and impact.</span></span>
                                        <ArrowRight className="size-4 text-violet-700" aria-hidden="true" />
                                    </Link>
                                </div>
                            </div>
                            <p className="mt-6 rounded-[6px] bg-parchment-100 p-3 text-xs text-ink-500">
                                Factual statements in TBCA releases are bound to the Claim Register. If a fact later changes, the correction is listed in the <Link href="/about/corrections" className="underline">Corrections Register</Link>.
                            </p>
                            {related.length > 0 && (
                                <div className="mt-8 border-t border-parchment-300 pt-6">
                                    <h2 className="font-semibold text-violet-700">Related News</h2>
                                    <ul className="mt-4 grid gap-4 md:grid-cols-3">
                                        {related.map((r) => (
                                            <li key={r.slug}>
                                                <Link href={`/newsroom/${r.slug}`} className="group flex gap-3">
                                                    <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-[6px] bg-gradient-to-br from-ink-800 to-gold-700 text-gold-200"><AboutIcon name={r.icon} className="size-6" /></span>
                                                    <span>
                                                        <span className="block text-xs text-ink-500">{fmtDate(r.published_at)} • {r.category_label}</span>
                                                        <span className="block text-[0.8125rem] font-semibold text-ink-900 group-hover:text-violet-700">{r.title}</span>
                                                        <span className="text-xs text-violet-700">Read more →</span>
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </article>
                        <aside className="space-y-4">
                            <div className="rounded-[8px] border border-parchment-400 p-5">
                                <h2 className="flex items-center gap-2 font-semibold text-ink-900"><User className="size-5 text-violet-700" aria-hidden="true" /> Media Contacts</h2>
                                <p className="mt-1 text-xs text-ink-600">For media enquiries, interviews or additional information, please contact:</p>
                                <p className="mt-3 text-[0.875rem] font-semibold text-ink-900">Lerato Mokoena</p>
                                <p className="text-xs text-violet-700">Head: Communications</p>
                                <p className="mt-2 flex items-center gap-2 text-[0.8125rem]"><Phone className="size-4" aria-hidden="true" /> +27 60 801 1365</p>
                                <p className="mt-1 flex items-center gap-2 text-[0.8125rem]"><Mail className="size-4" aria-hidden="true" /> media@thebusinessclinic.africa</p>
                                <Link href="/newsroom/media-contact" className="mt-3 flex items-center justify-center gap-1 rounded-[4px] border border-violet-400 py-2 text-[0.8125rem] font-semibold text-violet-700">View All Contacts <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
                            </div>
                            <div className="rounded-[8px] border border-parchment-400 p-5">
                                <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Download className="size-5 text-violet-700" aria-hidden="true" /> Press Release Downloads</h2>
                                <button type="button" onClick={() => window.print()} className="mt-3 flex w-full items-center justify-between rounded-[4px] border border-parchment-400 p-3 text-[0.8125rem] hover:bg-parchment-100">
                                    <span className="flex items-center gap-2"><FileText className="size-4 text-risk-500" aria-hidden="true" /> Press Release (PDF)</span>
                                    <Download className="size-4 text-controlled-700" aria-hidden="true" />
                                </button>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">Prints a clean PDF of this release. Key facts sheets are issued by the communications team on request.</p>
                            </div>
                            <div className="rounded-[8px] border border-parchment-400 p-5">
                                <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Share2 className="size-5 text-violet-700" aria-hidden="true" /> Share This Release</h2>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {shares.map((s) => (
                                        <li key={s.label}><a href={s.href} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center rounded-full border border-parchment-400 px-3 text-xs font-semibold text-ink-700 hover:border-violet-400">{s.label}</a></li>
                                    ))}
                                    <li>
                                        <button type="button" onClick={() => { void navigator.clipboard?.writeText(url); setCopied(true); }} className="inline-flex h-9 items-center gap-1 rounded-full border border-parchment-400 px-3 text-xs font-semibold text-ink-700">
                                            <Link2 className="size-3.5" aria-hidden="true" /> {copied ? 'Copied' : 'Copy link'}
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
        </>
    );
}
