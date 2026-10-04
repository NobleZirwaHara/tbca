import { Head } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, BadgeCheck, Quote, Star } from 'lucide-react';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import InstitutionMark from '@/Components/About/InstitutionMark';
import { ClaimInfoButton } from '@/Components/About/ClaimEvidence';
import { cn } from '@/lib/cn';
import type { PublicClaim, PublicInstitution, PublicTestimonial } from '@/types/about';

interface Props {
    testimonials: PublicTestimonial[];
    rating: { average: number; count: number } | null;
    stats: PublicClaim[];
    institutions: PublicInstitution[];
}

const PER_PAGE = 5;

export default function Testimonials({ testimonials, rating, stats, institutions }: Props) {
    const [page, setPage] = useState(0);
    const pages = Math.max(1, Math.ceil(testimonials.length / PER_PAGE));
    const visible = testimonials.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

    return (
        <>
            <Head title="What Our Clients Say" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Testimonials' }]}
                title="What Our Clients Say"
                lead="Real impact. Verified voices. Trusted results."
                intro="We are proud to partner with changemakers across Africa. Here's what they say about working with TBCA."
                aside={
                    rating && (
                        <div className="flex items-center gap-4 rounded-[8px] border border-gold-300 bg-gold-50/50 p-5">
                            <span className="inline-flex size-14 shrink-0 items-center justify-center rounded-full bg-gold-600 text-white">
                                <Star className="size-7" aria-hidden="true" />
                            </span>
                            <div>
                                <p className="font-semibold text-ink-900">Rated Excellent</p>
                                <p className="flex items-center gap-1 text-gold-500" aria-label={`${rating.average} out of 5`}>
                                    {Array.from({ length: 5 }).map((_, i) => (
                                        <Star key={i} className="size-5 fill-current" aria-hidden="true" />
                                    ))}
                                    <span className="ml-2 text-sm font-semibold text-ink-800">{rating.average} / 5</span>
                                </p>
                                <p className="text-xs text-ink-500">Based on {rating.count} consented client testimonials</p>
                            </div>
                        </div>
                    )
                }
            />

            <section className="bg-parchment-100 py-10">
                <div className="container-tbca">
                    {testimonials.length === 0 ? (
                        <p className="rounded-[8px] border border-parchment-400 bg-white p-6 text-sm text-ink-500">No testimonials are currently published with active consent.</p>
                    ) : (
                        <div className="relative">
                            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                {visible.map((t) => (
                                    <li key={t.code} className="relative flex flex-col rounded-[8px] border border-parchment-400 bg-white p-5">
                                        <Quote className="absolute top-4 right-4 size-8 text-parchment-400" aria-hidden="true" />
                                        <p className="flex gap-0.5 text-gold-500" aria-label={`${t.rating} stars`}>
                                            {Array.from({ length: t.rating }).map((_, i) => (
                                                <Star key={i} className="size-4 fill-current" aria-hidden="true" />
                                            ))}
                                        </p>
                                        <blockquote className="mt-3 text-[0.875rem] leading-relaxed text-ink-800">{t.quote}</blockquote>
                                        <div className="mt-auto flex items-center gap-3 border-t border-parchment-300 pt-4">
                                            <span
                                                className={cn('inline-flex size-12 shrink-0 items-center justify-center rounded-full font-semibold', t.image ? 'bg-gradient-to-br from-gold-300 to-gold-600 text-ink-900' : 'bg-parchment-300 text-ink-500')}
                                                aria-hidden="true"
                                            >
                                                {t.name.split(' ').filter((p) => /^[A-Z]/.test(p)).slice(-2).map((p) => p[0]).join('')}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-[0.875rem] font-semibold text-ink-900">{t.name}</p>
                                                {t.role && <p className="text-xs text-ink-500">{t.role}</p>}
                                                {t.industry && <span className="mt-1 inline-block rounded border border-parchment-400 px-1.5 text-[0.6875rem] text-ink-600">{t.industry}</span>}
                                            </div>
                                        </div>
                                        <p className="mt-3 flex items-center gap-1 text-xs font-medium text-verified-700">
                                            <BadgeCheck className="size-3.5" aria-hidden="true" /> Verified Client
                                        </p>
                                    </li>
                                ))}
                            </ul>
                            {pages > 1 && (
                                <div className="mt-4 flex items-center justify-center gap-3">
                                    <button type="button" onClick={() => setPage((p) => (p - 1 + pages) % pages)} className="rounded-full border border-gold-400 p-2 text-gold-700" aria-label="Previous testimonials">
                                        <ArrowLeft className="size-4" />
                                    </button>
                                    {Array.from({ length: pages }).map((_, i) => (
                                        <button key={i} type="button" onClick={() => setPage(i)} className={cn('size-2 rounded-full', i === page ? 'bg-gold-500' : 'bg-parchment-400')} aria-label={`Page ${i + 1}`} />
                                    ))}
                                    <button type="button" onClick={() => setPage((p) => (p + 1) % pages)} className="rounded-full border border-gold-400 p-2 text-gold-700" aria-label="Next testimonials">
                                        <ArrowRight className="size-4" />
                                    </button>
                                </div>
                            )}
                            <p className="mt-3 text-center text-xs text-ink-500">
                                Each testimonial is published with recorded consent. These are individual client experiences, not guaranteed or typical results.
                            </p>
                        </div>
                    )}

                    <div className="mt-8 grid gap-6 rounded-[8px] border border-gold-300 bg-gold-50/40 p-5 lg:grid-cols-[1fr_1fr]">
                        <ul className="grid gap-4 sm:grid-cols-3">
                            {stats.map((c) => (
                                <li key={c.key} className="flex items-center gap-3">
                                    <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-gold-600">
                                        <AboutIcon name={c.icon} className="size-6" />
                                    </span>
                                    <div>
                                        <p className="flex items-center gap-1 text-xl font-bold text-gold-700">
                                            {c.state === 'under_review' ? <span className="text-sm text-ink-500">Under review</span> : c.value}
                                            <ClaimInfoButton claim={c} />
                                        </p>
                                        <p className="text-xs text-ink-600">{c.label}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        {institutions.length > 0 && (
                            <div className="border-parchment-400 lg:border-l lg:pl-6">
                                <p className="text-sm font-semibold text-ink-900">Institutions we work with</p>
                                <ul className="mt-3 flex flex-wrap items-center gap-6">
                                    {institutions.map((i) => (
                                        <li key={i.slug} title={i.name}>
                                            <InstitutionMark inst={i} />
                                            <span className="sr-only">{i.name}</span>
                                        </li>
                                    ))}
                                </ul>
                                <p className="mt-2 text-[0.6875rem] text-ink-500">Shown under recorded permission. Display does not imply endorsement.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}
