import { Head, Link } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { ArrowLink, DarkHero, TrustBand } from '@/Components/Advisory/ui';

interface V { slug: string; num?: string; name: string; icon?: string; body: string; pricing: string; commitment: string; ideal: string; href: string }

export default function Ways({ vehicles, enterprise }: { vehicles: V[]; enterprise: V }) {
    return (
        <>
            <Head title="All Ways to Work with TBCA" />
            <DarkHero
                crumbs={[{ label: 'Services', href: '/services' }, { label: 'Ways to Work with TBCA' }]}
                title="All Ways to Work with TBCA"
                tagline="One need. Many ways. You choose what fits."
                intro="Different commercial structures serve the same capability depending on your context, timing, budget and how you prefer to work. Explore each option below."
                box={{ title: 'How to use this page', items: ['Learn what each way offers and when it fits best.', 'Compare pricing model, commitment and what you receive.', 'Use Find the Right Service for a recommendation.'], footer: <ButtonLink href="/services/resolver/1" trailingIcon="arrow-right">Find the Right Service</ButtonLink> }}
            />
            <section className="container-tbca py-8">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h2 className="font-serif text-xl font-semibold text-ink-900">The 12 execution vehicles and 1 enterprise relationship mode</h2>
                    <ArrowLink href="/services/choice-comparison">Compare All Options</ArrowLink>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
                    {vehicles.map((v) => (
                        <article key={v.slug} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
                            <div className="flex gap-2.5">
                                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded bg-ink-900 text-gold-400"><AdvIcon name={v.icon} /></span>
                                <h3 className="text-sm font-semibold text-ink-900">{v.num} {v.name}</h3>
                            </div>
                            <p className="mt-2 flex-1 text-xs text-ink-600">{v.body}</p>
                            <dl className="mt-3 space-y-0.5 text-[0.6875rem]">
                                <div className="flex justify-between gap-2"><dt className="text-ink-400">Pricing model</dt><dd className="text-right text-ink-800">{v.pricing}</dd></div>
                                <div className="flex justify-between gap-2"><dt className="text-ink-400">Commitment</dt><dd className="text-right text-ink-800">{v.commitment}</dd></div>
                                <div className="flex justify-between gap-2"><dt className="text-ink-400">Ideal for</dt><dd className="text-right text-ink-800">{v.ideal}</dd></div>
                            </dl>
                            <Link href={`/services/ways-to-work-with-tbca/${v.slug}`} className="mt-3 rounded border border-parchment-500 py-1.5 text-center text-xs font-semibold hover:border-gold-500">View Details →</Link>
                        </article>
                    ))}
                    <article className="flex flex-col rounded-[8px] border border-gold-400 bg-gold-50 p-4 sm:col-span-2 lg:col-span-2">
                        <div className="flex gap-2.5">
                            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded bg-gold-500 text-ink-900"><AdvIcon name="building-2" /></span>
                            <h3 className="text-sm font-semibold text-ink-900">{enterprise.name}</h3>
                        </div>
                        <p className="mt-2 flex-1 text-xs text-ink-600">{enterprise.body}</p>
                        <p className="mt-2 text-[0.6875rem] text-ink-700">{enterprise.pricing} · {enterprise.commitment} · {enterprise.ideal}</p>
                        <Link href={enterprise.href} className="mt-3 rounded border border-gold-500 py-1.5 text-center text-xs font-semibold">Learn More →</Link>
                    </article>
                </div>
            </section>
            <TrustBand items={[['We recommend by fit, not margin', 'You see every viable option with equal visibility.'], ['Professional boundaries first', 'We will route you to Partners where required.'], ['Transparent pricing', 'Prices are clear, itemised and upfront.'], ['Secure & private', 'Your data and decisions are protected.'], ['Phase 1 – South Africa', 'ZAR source pricing.'], ['Human review', 'Available on every vehicle']]} />
        </>
    );
}
