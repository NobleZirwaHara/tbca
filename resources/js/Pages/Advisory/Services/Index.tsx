import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import { ChevronRight, Stethoscope } from 'lucide-react';
import { ButtonLink, Button } from '@/Components/ui/Button';
import { Select } from '@/Components/ui/Form';
import AdvIcon from '@/Components/Advisory/AdvIcon';
import { ArrowLink, DarkHero } from '@/Components/Advisory/ui';
import { Link } from '@inertiajs/react';

interface Props {
    clusters: { title: string; icon: string; body: string; link: string; href: string }[];
    featured: { title: string; body: string; href: string }[];
    needs: { key: string; title: string }[];
    categories: Record<string, string>;
    sprintCount: number;
}

const ROLES = ['Founder / Owner', 'Executive / Director', 'Finance Lead', 'Operations Lead', 'Project Sponsor', 'Public Sector Official', 'Investor'];

export default function ServicesIndex({ clusters, featured, needs, categories, sprintCount }: Props) {
    const [need, setNeed] = useState('');
    const [role, setRole] = useState('');
    const [category, setCategory] = useState('');

    function findServices() {
        if (category) {
            router.get('/services/a-z', { letter: category });
            return;
        }
        router.get('/services/resolver/1', need ? { need } : {});
    }

    return (
        <>
            <Head title="Services" />
            <DarkHero
                title="Services"
                tagline="Complete Advisory. Intelligent Execution. Measurable Growth."
                intro="Explore the full spectrum of TBCA services, tools and platforms designed to help you Diagnose, Plan, Fund, Execute and Scale with confidence."
                chips={[
                    { label: 'South Africa', sub: 'Active Market' },
                    { label: 'English &', sub: 'Afrikaans' },
                    { label: 'ZAR (Source)', sub: '& USD' },
                    { label: 'Human-Reviewed', sub: 'Outputs' },
                    { label: `${sprintCount.toLocaleString('en-ZA')}`, sub: 'Governed Sprints' },
                ]}
            >
                <ButtonLink href="/services/a-z">A-Z Service Category</ButtonLink>
                <ButtonLink href="/digital-products" variant="outline-light">
                    Tools, Templates & Calculators
                </ButtonLink>
                <ButtonLink href="/services/relationship" variant="outline-light">
                    Dashboards
                </ButtonLink>
            </DarkHero>

            <div className="container-tbca -mt-6 relative z-10">
                <div className="grid gap-4 lg:grid-cols-12">
                    <section className="rounded-[10px] border border-gold-600/60 bg-ink-900 p-5 text-parchment-100 lg:col-span-5" aria-labelledby="finder">
                        <h2 id="finder" className="font-serif text-lg text-gold-400">
                            Find the Right Service
                        </h2>
                        <div className="mt-3 space-y-3 text-sm">
                            <label className="block">
                                <span className="text-xs text-ink-200">What do you need help with?</span>
                                <Select value={need} onChange={(e) => setNeed(e.target.value)} placeholder="Select your primary need" options={needs.map((n) => ({ value: n.key, label: n.title }))} className="mt-1" />
                            </label>
                            <label className="block">
                                <span className="text-xs text-ink-200">Which best describes you?</span>
                                <Select value={role} onChange={(e) => setRole(e.target.value)} placeholder="Select your role" options={ROLES} className="mt-1" />
                            </label>
                            <label className="block">
                                <span className="text-xs text-ink-200">Choose a category</span>
                                <Select value={category} onChange={(e) => setCategory(e.target.value)} placeholder="All Categories" options={Object.entries(categories).map(([l, n]) => ({ value: l, label: `${l} — ${n}` }))} className="mt-1" />
                            </label>
                            <Button type="button" className="w-full" trailingIcon="arrow-right" onClick={findServices}>
                                Find Recommended Services
                            </Button>
                        </div>
                    </section>
                    <section className="grid grid-cols-2 gap-3 rounded-[10px] border border-ink-800 bg-ink-950 p-5 text-parchment-100 sm:grid-cols-3 lg:col-span-7">
                        {[
                            ['Our Service Promise', 'AI precision, human judgement and disciplined execution to deliver real outcomes for real businesses.'],
                            ['54 Countries', 'Architecture Ready'],
                            ['100+', 'Business Tools, Templates & Calculators'],
                            ['24/7', 'Digital Platform Availability'],
                            ['Bank-Grade', 'Security & Compliance'],
                            ['Due Diligence', 'Verified, Consent-led and Human Reviewed'],
                        ].map(([t, s]) => (
                            <div key={t}>
                                <p className="font-serif text-base font-semibold text-gold-400">{t}</p>
                                <p className="text-xs text-ink-300">{s}</p>
                            </div>
                        ))}
                    </section>
                </div>
            </div>

            <section className="container-tbca grid gap-6 py-10 lg:grid-cols-12">
                <div className="lg:col-span-9">
                    <h2 className="font-serif text-2xl font-semibold text-ink-900">Explore by Service Cluster</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {clusters.map((c) => (
                            <article key={c.title} className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4 transition hover:border-gold-300 hover:shadow-card">
                                <div className="flex gap-3">
                                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-[6px] bg-ink-900 text-gold-400">
                                        <AdvIcon name={c.icon} />
                                    </span>
                                    <div>
                                        <h3 className="text-sm font-semibold text-ink-900">{c.title}</h3>
                                        <p className="mt-1 text-xs leading-relaxed text-ink-600">{c.body}</p>
                                    </div>
                                </div>
                                <ArrowLink href={c.href} className="mt-3">
                                    {c.link}
                                </ArrowLink>
                            </article>
                        ))}
                    </div>
                </div>
                <aside className="lg:col-span-3">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="font-serif text-lg font-semibold text-ink-900">Featured Services</h2>
                        <ul className="mt-2 divide-y divide-parchment-300">
                            {featured.map((f) => (
                                <li key={f.title}>
                                    <Link href={f.href} className="flex items-center justify-between gap-2 py-3 hover:text-gold-700">
                                        <span>
                                            <span className="block text-sm font-semibold text-ink-900">{f.title}</span>
                                            <span className="block text-xs text-ink-500">{f.body}</span>
                                        </span>
                                        <ChevronRight className="size-4 text-ink-400" />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                        <ArrowLink href="/services/ways-to-work-with-tbca">View All Services</ArrowLink>
                    </div>
                    <div className="mt-4 space-y-2 rounded-[8px] border border-parchment-400 bg-white p-4 text-sm">
                        <p className="font-semibold text-ink-900">Capability families</p>
                        <ArrowLink href="/services/business-consultancy">Business Consultancy</ArrowLink>
                        <br />
                        <ArrowLink href="/services/management-consultancy">Management Consultancy</ArrowLink>
                    </div>
                </aside>
            </section>

            <section className="container-tbca pb-12">
                <div className="flex flex-col items-start justify-between gap-4 rounded-[10px] border border-gold-600/50 bg-ink-950 p-6 text-parchment-100 md:flex-row md:items-center">
                    <div className="flex items-center gap-3">
                        <Stethoscope className="size-9 text-gold-400" aria-hidden="true" />
                        <div>
                            <h2 className="font-serif text-xl text-gold-400">Not sure where to start?</h2>
                            <p className="text-sm text-ink-200">Take a quick Diagnostic or speak to a TBCA expert for a personalised recommendation.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <ButtonLink href="/services/not-sure-which" trailingIcon="arrow-right">
                            Start a Diagnostic
                        </ButtonLink>
                        <ButtonLink href="/contact" variant="outline-light" icon="calendar-days">
                            Book a Consultation
                        </ButtonLink>
                    </div>
                </div>
            </section>
        </>
    );
}
