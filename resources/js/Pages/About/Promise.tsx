import { Head } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero, { NoticeBand } from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import Seal from '@/Components/About/Seal';
import { ClaimInfoButton, ClaimStat } from '@/Components/About/ClaimEvidence';
import type { PublicClaim } from '@/types/about';

export default function OurPromise({ stats, cards }: { stats: PublicClaim[]; cards: PublicClaim[] }) {
    return (
        <>
            <Head title="Our Promise" />
            <AboutHero
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Our Promise' }]}
                title="Our Promise"
                lead="Our standards. Your confidence."
                intro="Every claim we make is backed by evidence, governed by our policies, and measured by impact. Click on any claim to see the proof."
                aside={<Seal className="mx-auto w-48 lg:mr-0 lg:ml-auto" />}
            />

            <section className="bg-parchment-100 py-10">
                <div className="container-tbca space-y-8">
                    {cards.length > 0 && (
                        <div className="grid gap-4 md:grid-cols-3">
                            {cards.map((c) => (
                                <ClaimInfoButton key={c.key} claim={c} className="block w-full rounded-[8px] border border-parchment-400 bg-white p-5 text-left text-ink-700 hover:border-gold-400">
                                    <span className="flex items-start gap-4">
                                        <AboutIcon name={c.icon} className="size-10 shrink-0 text-gold-600" />
                                        <span>
                                            <span className="flex items-center gap-2 text-[1.0625rem] font-semibold text-ink-900">
                                                {c.label} <Info className="size-4 text-ink-400" aria-hidden="true" />
                                            </span>
                                            <span className="mt-1 block text-[0.8125rem] text-ink-600">{c.description}</span>
                                        </span>
                                    </span>
                                </ClaimInfoButton>
                            ))}
                        </div>
                    )}

                    <div className="rounded-[10px] border border-parchment-400 bg-gold-50/30 p-5">
                        <h2 className="text-lg font-semibold text-ink-900">Our Impact at a Glance</h2>
                        <p className="mt-1 text-xs text-ink-500">
                            Figures render only while their evidence is current. Expired evidence shows “Under review” until it is re-verified.
                        </p>
                        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4 xl:grid-cols-8">
                            {stats.map((c) => (
                                <ClaimStat key={c.key} claim={c} />
                            ))}
                        </div>
                    </div>

                    <NoticeBand
                        icon="shield-check"
                        title="These numbers reflect more than activity — they reflect purpose."
                        action={
                            <div className="flex flex-wrap gap-2">
                                <ButtonLink href="/about/methodology" variant="outline" trailingIcon="arrow-right">View Our Methodology</ButtonLink>
                                <ButtonLink href="/about/corrections" variant="gold" trailingIcon="arrow-right">Explore Our Corrections Register</ButtonLink>
                            </div>
                        }
                    >
                        We are building Africa&apos;s most trusted ecosystem of thinkers, doers and leaders.
                    </NoticeBand>
                </div>
            </section>
        </>
    );
}
