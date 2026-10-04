import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowRight, BadgeCheck, CheckCircle2, Clock, FileText, Lock, MapPin, PlayCircle, Rocket, ShieldCheck, Star } from 'lucide-react';
import { StatBand } from '@/Components/Blocks';
import { Button, ButtonLink } from '@/Components/ui/Button';
import Icon from '@/Components/Marketplace/MkIcon';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { usePrice } from '@/lib/money';
import { cn } from '@/lib/cn';
import type { MkListing, MkProvider, Option } from '@/types/marketplace';

interface Props {
    content: {
        features: { icon: string; title: string; body: string }[];
        stats: { value: string; label: string; icon: string }[];
        categories: { key: string; icon: string; title: string; body: string; count: string }[];
        guardrails: { title: string; body: string }[];
        why: string[];
        workflow: { title: string; body: string }[];
        milestones: string[];
    };
    featured: MkListing[];
    matched: { name: string; slug: string; rating: number; match: number; days: number; cost: number }[];
    options: { categories: Option[]; skills: string[]; budgets: Option[]; deadlines: Option[]; industries: Option[]; stages: Option[]; complexity: Option[] };
    spotlight: MkProvider | null;
}

export default function Landing({ content, featured, matched, options, spotlight }: Props) {
    const price = usePrice();
    const form = useForm({ title: '', description: '', industry: '', stage: '', complexity: '', category: '', skills: [] as string[], budget: '', deadline: '' });
    const ack = form.data.title !== '' || form.data.category !== '';

    const toggleSkill = (s: string) => form.setData('skills', form.data.skills.includes(s) ? form.data.skills.filter((x) => x !== s) : [...form.data.skills, s]);

    return (
        <>
            <Head title="Marketplace – Find Trusted Specialists" />

            {/* ---------------------------------------------- Hero (MP01) */}
            <section className="relative overflow-hidden border-b border-parchment-400 bg-white">
                <div className="container-tbca grid gap-10 py-12 lg:grid-cols-12 lg:py-16">
                    <div className="lg:col-span-6">
                        <p className="text-[0.75rem] font-semibold tracking-[0.16em] text-gold-700 uppercase">TBCA Marketplace</p>
                        <h1 className="mt-3 font-serif text-[2.4rem] leading-[1.08] font-bold text-ink-900 sm:text-[3rem]">
                            Find Trusted Specialists.
                            <br />
                            Deliver <span className="text-gold-600">Exceptional Outcomes.</span>
                        </h1>
                        <p className="mt-5 max-w-xl text-[0.9375rem] leading-relaxed text-ink-600">
                            TBCA Marketplace connects you with verified experts and firms across Africa to deliver high-quality work — on time, on budget, and to our standards.
                            You brief. We manage. Specialists deliver. You succeed.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link href="/marketplace/brief" className="flex items-center gap-3 rounded-[6px] bg-gold-500 px-5 py-3 text-ink-900 shadow-sm transition-colors hover:bg-gold-400">
                                <FileText className="size-6" aria-hidden="true" />
                                <span>
                                    <span className="block font-serif text-base font-bold">Submit Marketplace Brief</span>
                                    <span className="block text-xs">Tell us what you need</span>
                                </span>
                            </Link>
                            <Link href="/marketplace/how-it-works" className="flex items-center gap-3 rounded-[6px] border border-ink-300 px-5 py-3 text-ink-900 transition-colors hover:border-ink-900">
                                <PlayCircle className="size-6" aria-hidden="true" />
                                <span>
                                    <span className="block font-serif text-base font-bold">How Marketplace Works</span>
                                    <span className="block text-xs text-ink-500">See the process in 2 minutes</span>
                                </span>
                            </Link>
                        </div>
                        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
                            {content.features.map((f) => (
                                <li key={f.title} className="flex items-start gap-2">
                                    <Icon name={f.icon} className="mt-0.5 size-6 shrink-0 text-gold-600" />
                                    <span>
                                        <span className="block text-xs font-bold text-ink-900">{f.title}</span>
                                        <span className="block text-[0.6875rem] text-ink-500">{f.body}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="relative lg:col-span-6">
                        <div className="absolute inset-0 motif-grid opacity-40" aria-hidden="true" />
                        <div className="relative mx-auto max-w-md">
                            {spotlight && (
                                <Link href={`/marketplace/providers/${spotlight.slug}`} className="flex gap-4 rounded-[10px] border border-parchment-400 bg-white p-5 shadow-raised">
                                    <span className="flex size-20 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-800 to-ink-950 font-serif text-2xl font-bold text-gold-400" aria-hidden="true">
                                        {spotlight.name.slice(0, 1)}
                                    </span>
                                    <span className="min-w-0">
                                        <span className="flex items-center gap-1.5 font-semibold text-ink-900">
                                            Verified Specialist <BadgeCheck className="size-4 text-gold-600" aria-hidden="true" />
                                        </span>
                                        <span className="block text-sm text-ink-600">Financial Modelling Expert · {spotlight.name}</span>
                                        <span className="block text-sm text-ink-500">{spotlight.city}, {spotlight.country}</span>
                                        <span className="block text-sm text-ink-500">98% Success Score · {spotlight.engagementsCount} Projects</span>
                                        <span className="mt-1 flex items-center gap-1 text-sm">
                                            <Star className="size-4 fill-gold-500 text-gold-500" aria-hidden="true" /> {spotlight.rating} ({spotlight.reviewsCount} reviews)
                                        </span>
                                    </span>
                                </Link>
                            )}
                            <div className="mt-5 grid grid-cols-2 gap-3">
                                {content.categories.slice(0, 5).map((c) => (
                                    <Link key={c.key} href={`/marketplace/services?category=${c.key}`} className="flex items-center gap-2.5 rounded-[8px] border border-parchment-400 bg-white px-3 py-2.5 shadow-sm hover:border-gold-400">
                                        <Icon name={c.icon} className="size-5 text-gold-600" />
                                        <span>
                                            <span className="block text-xs font-semibold text-ink-900">{c.title}</span>
                                            <span className="block text-[0.6875rem] text-ink-500">{c.count} Specialists</span>
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <StatBand stats={content.stats} />

            {/* ---------------------------------------------- Categories */}
            <section className="bg-parchment-100 py-12">
                <div className="container-tbca">
                    <div className="flex flex-wrap items-end justify-between gap-3">
                        <h2 className="font-serif text-2xl font-bold text-ink-900">Popular Service Categories</h2>
                        <Link href="/marketplace/services" className="inline-flex items-center gap-1 text-sm font-semibold text-gold-700 hover:text-gold-800">
                            View all categories <ArrowRight className="size-4" aria-hidden="true" />
                        </Link>
                    </div>
                    <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                        {content.categories.map((c) => (
                            <li key={c.key}>
                                <Link href={`/marketplace/services?category=${c.key}`} className="flex h-full flex-col rounded-[8px] border border-parchment-400 bg-white p-4 transition-colors hover:border-gold-400">
                                    <Icon name={c.icon} className="size-7 text-gold-600" />
                                    <span className="mt-3 font-semibold text-ink-900">{c.title}</span>
                                    <span className="mt-1 flex-1 text-xs text-ink-500">{c.body}</span>
                                    <span className="mt-3 text-xs font-semibold text-ink-700">{c.count} Specialists</span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </section>

            {/* ---------------------------------------------- Governed workflow (dark section from FE page) */}
            <section className="relative overflow-hidden bg-ink-950 py-12 text-parchment-100">
                <div className="pointer-events-none absolute inset-0 motif-glow opacity-60" aria-hidden="true" />
                <div className="container-tbca relative">
                    <div className="grid gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-7">
                            <h2 className="font-serif text-2xl font-bold sm:text-3xl">
                                The Marketplace for Vetted Specialists, <span className="text-gold-400">Governed Briefs &amp; Assured Delivery</span>
                            </h2>
                            <p className="mt-3 text-sm text-ink-200">Submit a brief. We match you with vetted specialists. We govern the work, verify the evidence, and secure the payout.</p>
                            <ol className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                                {content.workflow.map((w, i) => (
                                    <li key={w.title} className="rounded-[8px] border border-ink-700 bg-ink-900/70 p-3">
                                        <span className="flex size-6 items-center justify-center rounded-full border border-gold-500 text-xs font-bold text-gold-400">{i + 1}</span>
                                        <p className="mt-2 text-sm font-semibold text-gold-300">{w.title}</p>
                                        <p className="text-xs text-ink-300">{w.body}</p>
                                    </li>
                                ))}
                            </ol>
                        </div>
                        <div className="grid gap-4 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-1">
                            <div className="rounded-[8px] border border-gold-600/40 bg-ink-900/80 p-5">
                                <h3 className="flex items-center gap-2 text-sm font-bold text-gold-400"><ShieldCheck className="size-4" aria-hidden="true" /> Marketplace Guardrails</h3>
                                <ul className="mt-3 space-y-2 text-xs text-ink-200">
                                    {content.guardrails.map((g) => (
                                        <li key={g.title} className="flex gap-2">
                                            <CheckCircle2 className="size-4 shrink-0 text-gold-500" aria-hidden="true" />
                                            <span><strong className="text-parchment-100">{g.title}</strong> — {g.body}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <div className="rounded-[8px] border border-gold-600/40 bg-ink-900/80 p-5">
                                <h3 className="text-sm font-bold text-gold-400">Why Use TBCA Marketplace?</h3>
                                <ul className="mt-3 space-y-2 text-xs text-ink-200">
                                    {content.why.map((w) => (
                                        <li key={w} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-gold-500" aria-hidden="true" />{w}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------- Quick brief + matched providers */}
            <section className="bg-parchment-200 py-12">
                <div className="container-tbca grid gap-6 lg:grid-cols-12">
                    <form
                        className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-8"
                        onSubmit={(e) => {
                            e.preventDefault();
                            form.post('/marketplace/brief/start');
                        }}
                    >
                        <h2 className="text-sm font-bold tracking-wide text-gold-700 uppercase">1. Submit Your Business Brief</h2>
                        <div className="mt-4 grid gap-4 md:grid-cols-2">
                            <Field label="Brief Title" error={form.errors.title}>
                                {(id) => <Input id={id} maxLength={120} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="e.g. Financial Model for Renewable Energy Project" />}
                            </Field>
                            <Field label="Industry / Sector">
                                {(id) => <Select id={id} options={options.industries} placeholder="Select industry" value={form.data.industry} onChange={(e) => form.setData('industry', e.target.value)} />}
                            </Field>
                            <Field label="Describe Your Requirements" hint={`${form.data.description.length} / 1500`} className="md:col-span-2">
                                {(id) => <Textarea id={id} maxLength={1500} value={form.data.description} onChange={(e) => form.setData('description', e.target.value)} placeholder="Provide a clear summary of the work you need done..." />}
                            </Field>
                            <Field label="Business Stage">
                                {(id) => <Select id={id} options={options.stages} placeholder="Select stage" value={form.data.stage} onChange={(e) => form.setData('stage', e.target.value)} />}
                            </Field>
                            <Field label="Project Complexity">
                                {(id) => <Select id={id} options={options.complexity} placeholder="Select complexity" value={form.data.complexity} onChange={(e) => form.setData('complexity', e.target.value)} />}
                            </Field>
                        </div>

                        <fieldset className="mt-5">
                            <legend className="text-sm font-bold tracking-wide text-gold-700 uppercase">2. Service Category</legend>
                            <div className="mt-2 grid gap-2 sm:grid-cols-3">
                                {options.categories.slice(0, 6).map((c) => (
                                    <button key={c.value} type="button" aria-pressed={form.data.category === c.value} onClick={() => form.setData('category', c.value)}
                                        className={cn('rounded-[6px] border px-3 py-2 text-left text-xs font-semibold', form.data.category === c.value ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-400 hover:border-gold-300')}>
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                        </fieldset>

                        <div className="mt-5 grid gap-5 md:grid-cols-3">
                            <fieldset>
                                <legend className="text-sm font-bold tracking-wide text-gold-700 uppercase">3. Required Skills</legend>
                                <div className="mt-2 space-y-1.5">
                                    {options.skills.map((s) => <Checkbox key={s} label={s} checked={form.data.skills.includes(s)} onChange={() => toggleSkill(s)} />)}
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend className="text-sm font-bold tracking-wide text-gold-700 uppercase">4. Budget Band</legend>
                                <div className="mt-2 space-y-1.5">
                                    {options.budgets.map((b) => (
                                        <label key={b.value} className="flex items-center gap-2 text-sm text-ink-700">
                                            <input type="radio" name="budget" className="accent-gold-600" checked={form.data.budget === b.value} onChange={() => form.setData('budget', b.value)} /> {b.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                            <fieldset>
                                <legend className="text-sm font-bold tracking-wide text-gold-700 uppercase">5. Deadline</legend>
                                <div className="mt-2 space-y-1.5">
                                    {options.deadlines.map((d) => (
                                        <label key={d.value} className="flex items-center gap-2 text-sm text-ink-700">
                                            <input type="radio" name="deadline" className="accent-gold-600" checked={form.data.deadline === d.value} onChange={() => form.setData('deadline', d.value)} /> {d.label}
                                        </label>
                                    ))}
                                </div>
                            </fieldset>
                        </div>
                        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-parchment-300 pt-4">
                            <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" /> Submitting a brief is not an Authority to Proceed. You approve scope and fees first.</p>
                            <Button type="submit" disabled={form.processing || !ack} trailingIcon="arrow-right">Submit Brief</Button>
                        </div>
                    </form>

                    <div className="space-y-4 lg:col-span-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold tracking-wide text-gold-700 uppercase">6. Matched Providers</h2>
                                <Link href="/marketplace/providers" className="text-xs font-semibold text-gold-700">View All →</Link>
                            </div>
                            <ul className="mt-3 space-y-3">
                                {matched.map((m) => (
                                    <li key={m.slug} className="rounded-[6px] border border-parchment-300 p-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-ink-900">{m.name}</span>
                                            <span className="text-xs font-bold text-verified-700">{m.match}%</span>
                                        </div>
                                        <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-500">
                                            <span className="flex items-center gap-1"><BadgeCheck className="size-3.5 text-verified-500" aria-hidden="true" /> Vetted · <Star className="size-3 fill-gold-500 text-gold-500" aria-hidden="true" /> {m.rating}</span>
                                            <span>{m.days} days · {price(m.cost)}</span>
                                        </div>
                                        <Link href={`/marketplace/providers/${m.slug}`} className="mt-2 inline-block text-xs font-semibold text-gold-700 hover:underline">View Profile</Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-risk-500/30 bg-risk-50 p-5 text-xs text-risk-700">
                            <p className="font-bold">No-Circumvention Notice</p>
                            <p className="mt-1">All communication &amp; payments must remain on the TBCA platform. Circumvention will result in account suspension and legal action.</p>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5 text-xs text-ink-600">
                            <p className="text-sm font-bold text-ink-900">Payout Control</p>
                            <ul className="mt-2 space-y-1.5">
                                <li className="flex gap-2"><Clock className="size-3.5 text-gold-600" aria-hidden="true" /> Payment held in trust until QA pass</li>
                                <li className="flex gap-2"><CheckCircle2 className="size-3.5 text-gold-600" aria-hidden="true" /> Release on your acceptance</li>
                                <li className="flex gap-2"><MapPin className="size-3.5 text-gold-600" aria-hidden="true" /> Disputes handled by TBCA</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* ---------------------------------------------- Featured services */}
            {featured.length > 0 && (
                <section className="bg-white py-12">
                    <div className="container-tbca">
                        <div className="flex flex-wrap items-end justify-between gap-3">
                            <h2 className="font-serif text-2xl font-bold text-ink-900">Featured Marketplace Services</h2>
                            <Link href="/marketplace/services" className="text-sm font-semibold text-gold-700">Browse all services →</Link>
                        </div>
                        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {featured.map((l) => (
                                <li key={l.slug}>
                                    <Link href={`/marketplace/services/${l.slug}`} className="flex h-full flex-col rounded-[8px] border border-parchment-400 p-4 hover:border-gold-400">
                                        <span className="text-[0.6875rem] font-semibold tracking-wide text-gold-700 uppercase">{l.categoryLabel}</span>
                                        <span className="mt-1 font-semibold text-ink-900">{l.title}</span>
                                        <span className="mt-1 line-clamp-2 flex-1 text-xs text-ink-500">{l.summary}</span>
                                        <span className="mt-3 flex items-center justify-between text-sm">
                                            <span className="font-bold text-ink-900">{price(l.priceZar ?? 0)}{l.period ? ' / month' : ''}</span>
                                            <span className="flex items-center gap-1 text-xs text-ink-500"><Star className="size-3.5 fill-gold-500 text-gold-500" aria-hidden="true" /> {l.rating}</span>
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            )}

            {/* ---------------------------------------------- CTA */}
            <section className="bg-ink-950 py-10">
                <div className="container-tbca flex flex-wrap items-center justify-between gap-6 rounded-[10px] border border-gold-600/40 p-6">
                    <div className="flex items-center gap-4">
                        <Rocket className="size-10 text-gold-500" aria-hidden="true" />
                        <div>
                            <p className="font-serif text-2xl font-bold text-parchment-100">Ready to Get Expert Work Done – <span className="text-gold-400">The Right Way?</span></p>
                            <p className="text-sm text-ink-300">Submit your brief now or talk to a TBCA advisor to scope your project.</p>
                        </div>
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <ButtonLink href="/marketplace/brief" trailingIcon="arrow-right">Submit Your Brief</ButtonLink>
                        <Button variant="outline-light" type="button" onClick={() => openAskQuestion({ subject: 'Marketplace brief scoping', section: 'marketplace' })}>Talk to TBCA</Button>
                        <ButtonLink href="/marketplace/providers/apply" variant="outline-light">Join Marketplace</ButtonLink>
                    </div>
                </div>
            </section>
        </>
    );
}
