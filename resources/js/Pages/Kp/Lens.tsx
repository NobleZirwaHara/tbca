import { Link, router } from '@inertiajs/react';
import * as L from 'lucide-react';
import { useState } from 'react';
import { BtnLink, Ico } from '@/Components/Webinars/kit';
import { BASE, Box, Empty, InsightCard, KpPage, Select, ThemeCover, type KpCard, type KpShared } from '@/Components/Kp/kit';
import { cn } from '@/lib/cn';

interface Props extends KpShared {
    mode: 'country' | 'sector';
    current: { slug: string; name: string; region: string | null; capital: string | null; currency: string | null; iso2: string | null; packStatus: string; intro?: string | null; blurb?: string | null; complexity?: string | null; regulatory?: string | null };
    options: { value: string; label: string }[];
    facts: { label: string; value: string; year: number | null; source: string; status: string }[];
    sections: string[];
    insights: KpCard[];
    deepLink: string;
}

const KEYS: Record<'country' | 'sector', [string, string, string][]> = {
    country: [['trending-up', 'Growth Outlook', 'Growth drivers and constraints, from verified sources only.'], ['coins', 'Investment Opportunities', 'Sectors and projects open to investors.'], ['building-2', 'Doing Business', 'Regulation, licensing and business environment.'], ['shield', 'Key Risks', 'Currency, political and regulatory risk.'], ['globe', 'Market Access', 'Trade blocs and export corridors.']],
    sector: [['trending-up', 'Market Size & Growth', 'Size, growth and adoption, once sourced.'], ['lightbulb', 'Key Trends', 'What is shifting in the sector.'], ['target', 'Opportunities', 'Where value is being created.'], ['triangle-alert', 'Challenges & Risks', 'What holds the sector back.'], ['scale', 'Regulation & Policy', 'Rules that shape the sector.']],
};

/** KP-SCR-016 Country Lens and KP-SCR-017 Sector Lens. Placeholder figures are labelled and never presented as verified. */
export default function Lens({ screen, kpNav, mode, current, options, facts, sections, insights, deepLink }: Props) {
    const [section, setSection] = useState(sections[0]);
    const country = mode === 'country';
    const unverified = facts.some((f) => f.status !== 'verified');
    return (
        <KpPage
            screen={screen}
            kpNav={kpNav}
            crumbs={[[country ? 'Country Lens' : 'Sector Lens'], [current.name]]}
            head={`${current.name} ${country ? 'Country' : 'Sector'} Lens`}
            title={country ? 'Country Lens' : 'Sector Lens'}
            subtitle={country ? "Focused insights on Africa's markets, opportunities and risks." : 'Sector intelligence for better decisions across Africa.'}
            intro="Understand the context. Make better decisions. Build with confidence."
            left={
                <nav aria-label="Lens sections" className="rounded-[10px] border border-parchment-400 bg-white p-2">
                    <ul className="space-y-0.5">{sections.map((s) => <li key={s}><button type="button" aria-current={s === section ? 'true' : undefined} onClick={() => setSection(s)} className={cn('w-full rounded-[6px] px-3 py-2 text-left text-[0.8125rem]', s === section ? 'bg-gold-100 font-semibold text-gold-800' : 'hover:bg-parchment-200')}>{s}</button></li>)}</ul>
                    <Link href={country ? `${BASE}/sectors/financial-services` : `${BASE}/africa/kenya`} className="mt-2 block border-t border-parchment-300 px-3 pt-2 text-[0.75rem] font-semibold text-gold-700">Switch to {country ? 'Sector' : 'Country'} Lens</Link>
                </nav>
            }
            rail={
                <>
                    <Field2 label={country ? 'Select Country / Territory' : 'Select Sector'}>
                        <Select value={current.slug} onChange={(e) => router.get(`${BASE}/${country ? 'africa' : 'sectors'}/${e.target.value}`)} options={options} />
                    </Field2>
                    <Box title={`${current.name} at a Glance`} icon={country ? 'globe' : 'layers'}>
                        <dl className="space-y-2">
                            {facts.map((f) => (
                                <div key={f.label} className="text-[0.75rem]">
                                    <dt className="text-ink-500">{f.label}{f.year ? ` (${f.year})` : ''}</dt>
                                    <dd className="flex items-center justify-between gap-2 font-semibold text-ink-900">{f.value}<span className={cn('rounded-full px-1.5 py-0.5 text-[0.625rem] font-semibold', f.status === 'verified' ? 'bg-verified-50 text-verified-700' : 'bg-attested-50 text-attested-700')}>{f.status === 'verified' ? 'Verified' : 'Placeholder'}</span></dd>
                                </div>
                            ))}
                        </dl>
                        {unverified && <p className="mt-3 text-[0.6875rem] text-ink-500">Figures marked Placeholder are not yet verified and must not be relied on. They are replaced with sourced values as the country pack is completed.</p>}
                    </Box>
                    <Box title={`Download ${country ? 'Country' : 'Sector'} Brief`} tone="cream">
                        <p className="text-[0.8125rem]">A one-page snapshot of {current.name}.</p>
                        <BtnLink href={`${BASE}/lens/${mode}/${current.slug}/brief`} tone="outline" className="mt-2" icon="download" download>Download Brief</BtnLink>
                    </Box>
                    <Box title={`Have a ${country ? 'Country' : 'Sector'} Question?`}>
                        <p className="text-[0.8125rem]">Ask the KP Knowledge Assistant, or ask our team for tailored insight.</p>
                        <BtnLink href={`${BASE}/ask?q=${encodeURIComponent(`Opportunities in ${current.name}`)}`} className="mt-2 w-full" icon="arrow-right">Ask a Question</BtnLink>
                    </Box>
                </>
            }
        >
            <div className="grid overflow-hidden rounded-[10px] border border-parchment-400 bg-white md:grid-cols-[18rem_minmax(0,1fr)]">
                <ThemeCover theme={country ? 'markets-growth' : 'technology-ai'} seed={current.slug} label={current.name} className="aspect-[16/10] md:aspect-auto" />
                <div className="p-5">
                    <h2 className="font-serif text-[1.5rem] font-bold text-ink-900">{current.name}</h2>
                    {current.region && <p className="text-[0.875rem] font-semibold text-gold-700">{current.region}</p>}
                    <p className="mt-2 text-[0.875rem] text-ink-700">{country ? `Capital: ${current.capital ?? 'n/a'}. Currency: ${current.currency ?? 'n/a'}. Country pack status: ${current.packStatus}.` : (current.intro ?? current.blurb)}</p>
                    {!country && <p className="mt-1 text-[0.8125rem] text-ink-600">Complexity class {current.complexity}. Regulatory intensity: {current.regulatory}. Catalogue: {current.packStatus}.</p>}
                    <BtnLink href={deepLink} tone="outline" size="sm" className="mt-3" icon="arrow-right">View Full {country ? 'Country Profile' : 'Industry Page'}</BtnLink>
                </div>
            </div>

            <section>
                <h2 className="mb-1 font-serif text-[1.25rem] font-bold text-ink-900">{section === sections[0] ? 'Key Insights' : section}</h2>
                <p className="mb-3 text-[0.8125rem] text-ink-600">{section === sections[0] ? 'What KP looks at first for this lens.' : `The ${section.toLowerCase()} view fills from approved, sourced material. Until then, use the full ${country ? 'country profile' : 'industry page'} linked above.`}</p>
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                    {KEYS[mode].map(([i, t, b]) => <li key={t} className="rounded-[10px] border border-parchment-400 bg-white p-3"><Ico name={i} className="size-6 text-gold-600" /><p className="mt-2 text-[0.8125rem] font-bold text-ink-900">{t}</p><p className="text-[0.6875rem] text-ink-600">{b}</p><Link href={deepLink} className="mt-2 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-gold-700">Explore <L.ArrowRight className="size-3" /></Link></li>)}
                </ul>
            </section>

            <section>
                <h2 className="mb-3 font-serif text-[1.25rem] font-bold text-ink-900">Latest Insights on {current.name}</h2>
                {insights.length ? <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{insights.map((i) => <InsightCard key={i.slug} item={i} />)}</div> : <Empty>No KP insights on {current.name} yet. Browse <Link href={`${BASE}/insights`} className="font-semibold text-gold-700">all insights</Link>.</Empty>}
            </section>
        </KpPage>
    );
}

function Field2({ label, children }: { label: string; children: React.ReactNode }) {
    return <label className="block text-[0.75rem] font-semibold text-ink-700">{label}{children}</label>;
}
