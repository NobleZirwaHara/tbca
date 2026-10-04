import { Head, Link } from '@inertiajs/react';
import { Landmark } from 'lucide-react';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { CheckList, DarkHero, SERVICES_TRUST, TrustBand } from '@/Components/Advisory/ui';
import { FitBand, NotSureBox, WaysGrid, type Way } from '@/Components/Advisory/Ways';

interface Props {
    pillar: { slug: string; title: string; tagline: string; intro: string; why: string[]; achieve: { title: string; body: string; icon: string }[]; situations: string[] };
    capabilities: { slug: string; title: string; tagline: string }[];
    ways: Way[];
}

export default function Pillar({ pillar, capabilities, ways }: Props) {
    return (
        <>
            <Head title={pillar.title} />
            <DarkHero crumbs={[{ label: 'Services', href: '/services' }, { label: 'Capability Families', href: '/services/business-consultancy' }, { label: pillar.title }]} title={pillar.title} tagline={pillar.tagline} intro={pillar.intro} box={{ title: `Why start with ${pillar.title}?`, items: pillar.why }} />
            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-12">
                <section className="lg:col-span-7">
                    <h2 className="font-serif text-xl font-semibold text-ink-900">What we help you achieve</h2>
                    <div className="mt-3 grid grid-cols-2 gap-3 md:grid-cols-5">
                        {pillar.achieve.map((a) => (
                            <div key={a.title} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                                <AdvIcon name={a.icon} className="size-6 text-ink-800" />
                                <p className="mt-2 text-xs font-semibold text-ink-900">{a.title}</p>
                                <p className="text-[0.6875rem] text-ink-500">{a.body}</p>
                            </div>
                        ))}
                    </div>
                    <h2 className="mt-6 font-serif text-xl font-semibold text-ink-900">Typical situations</h2>
                    <CheckList className="mt-3 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3" items={pillar.situations} />
                    {capabilities.length > 0 && (
                        <>
                            <h2 className="mt-6 font-serif text-xl font-semibold text-ink-900">Capabilities in {pillar.title}</h2>
                            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                                {capabilities.map((c) => (
                                    <Link key={c.slug} href={`/services/capability/${c.slug}`} className="rounded-[8px] border border-parchment-400 bg-white p-3 hover:border-gold-400">
                                        <p className="text-sm font-semibold text-ink-900">{c.title}</p>
                                        <p className="text-xs text-ink-500">{c.tagline}</p>
                                    </Link>
                                ))}
                            </div>
                        </>
                    )}
                </section>
                <section className="lg:col-span-3">
                    <h2 className="font-serif text-xl font-semibold text-ink-900">Ways to work with us</h2>
                    <div className="mt-3">
                        <WaysGrid ways={ways} />
                    </div>
                </section>
                <aside className="space-y-4 lg:col-span-2">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Landmark className="size-4" />Professional note</p>
                        <p className="mt-1 text-xs text-ink-600">{pillar.title} is a professional advisory service. We recommend what fits your context. You decide, and you remain in control.</p>
                    </div>
                    <NotSureBox title={`Not sure if ${pillar.title} is the best fit?`} />
                </aside>
            </div>
            <FitBand />
            <TrustBand items={SERVICES_TRUST} />
        </>
    );
}
