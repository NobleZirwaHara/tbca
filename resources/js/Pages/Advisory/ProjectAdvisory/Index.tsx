import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Scale, Target } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import EmbeddedServices, { type EmbeddedSection } from '@/Components/Embedded/EmbeddedServices';
import { DarkHero, LedgerBadge, TrustBand } from '@/Components/Advisory/ui';
import { usePrice } from '@/lib/money';

interface Svc { slug: string; code: string; name: string; price: number; icon: string; summary: string }
interface Props {
    services: Svc[];
    method: [string, string, string][];
    ledgers: Record<string, [string, string, string]>;
    sectors: { key: string; label: string; icon: string }[];
    embedded?: EmbeddedSection;
}

export default function PaIndex({ services, method, ledgers, sectors, embedded }: Props) {
    const price = usePrice();
    return (
        <>
            <Head title="Project Advisory" />
            <DarkHero
                title="Project Advisory."
                tagline="From Vision to Viable Impact."
                intro="End-to-end advisory for projects that create value, attract capital and deliver measurable impact. Strategy. Feasibility. Structuring. Implementation support."
                chips={[{ label: 'Human-Reviewed', sub: 'Expert Advisory' }, { label: 'Data-Driven', sub: 'Strategic Insights' }, { label: 'Bankable &', sub: 'Investor-Grade' }, { label: 'POPIA & ESG', sub: 'Compliant' }, { label: 'Africa (Active)', sub: '54 Countries' }]}
                box={{ title: 'Why Clients Choose TBCA', items: ['Published Method & Transparent Pricing', 'Your Work Product Is Portable', 'You Approve Before We Charge', 'Human Review Where Required', 'POPIA-Aware Data Controls', 'ESG-Integrated Advisory', 'Benchmark-Informed Methodology', 'Bankability & Investor-Readiness Process'] }}
            >
                <ButtonLink href="/project-advisory/discovery" trailingIcon="arrow-right">Request Advisory</ButtonLink>
                <ButtonLink href="/project-advisory/context" variant="outline-light" trailingIcon="arrow-right">Explore Your Project Path</ButtonLink>
            </DarkHero>

            <section className="container-tbca py-8">
                <div className="grid gap-4 rounded-[10px] border border-gold-500/50 bg-ink-950 p-5 text-parchment-100 lg:grid-cols-12">
                    <div className="flex gap-3 lg:col-span-5">
                        <Scale className="size-10 shrink-0 text-gold-400" aria-hidden="true" />
                        <div>
                            <h2 className="font-serif text-lg text-gold-400">Fee Transparency Covenant</h2>
                            <p className="text-sm text-ink-200">Before any commitment, we disclose method, TBCA professional fees (T), platform fees (P), external provider costs (X), statutory charges (S) and any authorised contingent economics (C) separately. You understand. You approve. You proceed.</p>
                        </div>
                    </div>
                    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-5 lg:col-span-7">
                        {Object.entries(ledgers).map(([l, [name, , desc]]) => (
                            <li key={l} className="border-l border-ink-700 pl-3 text-center">
                                <LedgerBadge l={l} />
                                <p className="mt-1 text-xs font-semibold text-gold-300">{name}</p>
                                <p className="text-[0.6875rem] text-ink-300">{desc}</p>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            <section className="container-tbca grid gap-5 pb-8 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <h2 className="font-serif text-2xl font-semibold text-ink-900">Our Core Project Advisory Services <span className="text-base font-normal text-ink-500">(TBCA Professional Fees - T Only)</span></h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                        {services.map((s) => (
                            <article key={s.slug} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4 hover:border-gold-400">
                                <div className="flex items-start gap-2.5">
                                    <AdvIcon name={s.icon} className="size-7 text-gold-600" />
                                    <h3 className="text-sm font-semibold text-ink-900">{s.name}</h3>
                                </div>
                                <p className="mt-3 font-serif text-xl font-bold text-gold-700">{price(s.price)}</p>
                                <p className="text-xs text-ink-500">Fee Code: {s.code}</p>
                                <p className="mt-2 flex-1 text-xs text-ink-600">{s.summary}</p>
                                <Link href={`/project-advisory/services/${s.slug}`} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">Learn more <ArrowRight className="size-3" /></Link>
                            </article>
                        ))}
                    </div>
                </div>
                <aside className="lg:col-span-3">
                    <div className="flex h-full flex-col items-center justify-center rounded-[10px] border border-gold-500 bg-ink-950 p-6 text-center text-parchment-100">
                        <h2 className="font-serif text-xl text-gold-400">Path-to-Close Cost Exposure</h2>
                        <Target className="my-4 size-12 text-gold-400" aria-hidden="true" />
                        <p className="text-sm text-ink-200">Explore your project journey, method path and full cost exposure across T, P, X, S and C.</p>
                        <ButtonLink href="/project-advisory/cost-exposure" className="mt-4 w-full">Start Now</ButtonLink>
                        <div className="mt-4 w-full space-y-1 border-t border-ink-800 pt-3 text-left text-xs">
                            {[['Readiness Diagnostic', '/project-advisory/readiness'], ['Sector Study Explorer', '/project-advisory/studies'], ['Engagement Options', '/project-advisory/engagement-options'], ['Evidence Library', '/project-advisory/evidence'], ['Contingent Fee Calculator', '/project-advisory/contingent-fee-calculator'], ['My Advisory Workspace', '/project-advisory/workspace']].map(([l, h]) => (
                                <Link key={h} href={h} className="block text-gold-300 hover:text-gold-200">{l} →</Link>
                            ))}
                        </div>
                    </div>
                </aside>
            </section>

            <section className="container-tbca pb-8">
                <h2 className="font-serif text-2xl font-semibold text-ink-900">Our Advisory Method <span className="text-base font-normal text-ink-500">- 8 Phases, One Outcome: Viable Impact</span></h2>
                <ol className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
                    {method.map(([t, b, icon], i) => (
                        <li key={t} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                            <div className="flex items-center gap-2"><span className="inline-flex size-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold">{i + 1}</span><AdvIcon name={icon} className="size-4 text-gold-600" /></div>
                            <p className="mt-2 text-sm font-semibold text-ink-900">{t}</p>
                            <p className="text-[0.6875rem] text-ink-500">{b}</p>
                        </li>
                    ))}
                </ol>
                <h2 className="mt-8 font-serif text-xl font-semibold text-ink-900">Sectors We Serve ({sectors.length})</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                    {sectors.map((s) => (
                        <Link key={s.key} href={`/project-advisory/studies?sector=${s.key}`} className="inline-flex items-center gap-2 rounded-full border border-parchment-500 bg-white px-3 py-1.5 text-sm hover:border-gold-500"><AdvIcon name={s.icon} className="size-4 text-gold-600" />{s.label}</Link>
                    ))}
                </div>
            </section>

            <section className="container-tbca pb-10">
                <div className="flex flex-col justify-between gap-4 rounded-[10px] border border-gold-500/50 bg-ink-950 p-6 text-parchment-100 md:flex-row md:items-center">
                    <div>
                        <p className="font-serif text-xl text-gold-400">Let&rsquo;s build something extraordinary together.</p>
                        <p className="text-sm text-ink-300">Speak to our team of specialists today.</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <ButtonLink href="/project-advisory/discovery" trailingIcon="arrow-right">Request Advisory</ButtonLink>
                        <ButtonLink href="/contact" variant="outline-light" icon="calendar-days">Book a Discovery Call</ButtonLink>
                    </div>
                </div>
            </section>
            <EmbeddedServices section={embedded} />
            <TrustBand items={[['Proven Track Record', 'Evidence-cleared experience only'], ['Capital Access', 'Strong network of lenders & investors'], ['Impact Focused', 'Sustainable & measurable impact'], ['Quality Assurance', 'Human-reviewed, accuracy assured'], ['Method Before Money', 'Understand before you commit'], ['Five-Ledger Transparency', 'T, P, X, S and C shown separately']]} />
        </>
    );
}
