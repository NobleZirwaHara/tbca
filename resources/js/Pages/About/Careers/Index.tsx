import { Head, Link, router } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { ArrowRight, CircleCheck, Gift, Image, MapPin, RotateCcw, Search, Star, Users } from 'lucide-react';
import { Input, Select } from '@/Components/ui/Form';
import { ButtonLink } from '@/Components/ui/Button';
import AboutHero from '@/Components/About/AboutHero';
import AboutIcon from '@/Components/About/AboutIcon';
import { cn } from '@/lib/cn';
import type { RoleSummary } from '@/types/about';

interface Props {
    roles: RoleSummary[];
    total: number;
    filters: Partial<Record<'q' | 'department' | 'location' | 'type', string>>;
    options: { departments: string[]; locations: string[]; types: string[] };
}

const benefits = ['Purpose-driven work with real impact', 'Continuous learning & development', 'Flexible & remote work options', 'Competitive remuneration', 'Diverse, inclusive & collaborative culture'];

export default function CareersIndex({ roles, total, filters, options }: Props) {
    const [q, setQ] = useState(filters.q ?? '');
    const apply = (patch: Record<string, string>) => router.get('/careers', { ...filters, ...patch }, { preserveState: true, preserveScroll: true, replace: true });
    const search = (e: FormEvent) => {
        e.preventDefault();
        apply({ q });
    };

    return (
        <>
            <Head title="Careers" />
            <AboutHero
                accent="purple"
                crumbs={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Careers' }]}
                title="Careers"
                lead="Build Africa's future. Build yours with TBCA."
                intro="At TBCA, we combine AI, human expertise and purpose to solve Africa's most complex challenges. If you are mission-driven, innovative and committed to excellence, you'll thrive here."
                aside={
                    <div className="flex items-start gap-4 rounded-[8px] border border-attested-500/30 bg-attested-50/50 p-5">
                        <Star className="size-9 shrink-0 text-attested-700" aria-hidden="true" />
                        <div>
                            <h2 className="font-semibold text-ink-900">Why Work at TBCA?</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">Work on high-impact projects across Africa. Learn, grow and lead with Africa&apos;s brightest minds. Make a measurable difference in people&apos;s lives.</p>
                            <Link href="/about/our-story" className="mt-2 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-attested-700">Our Culture & Values <ArrowRight className="size-3.5" aria-hidden="true" /></Link>
                        </div>
                    </div>
                }
            />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_19rem]">
                    <div className="space-y-4">
                        <form onSubmit={search} className="grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 md:grid-cols-[1.5fr_1fr_1fr_1fr_auto]">
                            <label className="relative">
                                <span className="sr-only">Search jobs</span>
                                <Search className="absolute top-3 left-3 size-4 text-ink-400" aria-hidden="true" />
                                <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search jobs by title, skill or keyword..." className="pl-9" />
                            </label>
                            <Select aria-label="Department" placeholder="All Departments" options={options.departments} value={filters.department ?? ''} onChange={(e) => apply({ department: e.target.value })} />
                            <Select aria-label="Location" placeholder="All Locations" options={options.locations} value={filters.location ?? ''} onChange={(e) => apply({ location: e.target.value })} />
                            <Select aria-label="Employment type" placeholder="All Employment Types" options={options.types} value={filters.type ?? ''} onChange={(e) => apply({ type: e.target.value })} />
                            <button type="button" onClick={() => router.get('/careers')} className="inline-flex items-center justify-center gap-1 text-xs font-semibold text-controlled-700">
                                <RotateCcw className="size-3.5" aria-hidden="true" /> Clear Filters
                            </button>
                        </form>

                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="font-semibold text-ink-900">Open Opportunities ({total})</h2>
                            {roles.length === 0 ? (
                                <p className="py-8 text-center text-sm text-ink-500">
                                    {total === 0 ? 'There are no approved vacancies open right now. Join our talent community to hear when roles open.' : 'No roles match these filters.'}
                                </p>
                            ) : (
                                <div className="mt-3 overflow-x-auto">
                                    <table className="w-full min-w-[640px] text-left text-[0.8125rem]">
                                        <thead className="text-xs text-ink-500"><tr><th className="py-2">Job Title</th><th className="py-2">Department</th><th className="py-2">Location</th><th className="py-2">Employment Type</th><th className="py-2"><span className="sr-only">Action</span></th></tr></thead>
                                        <tbody className="divide-y divide-parchment-300">
                                            {roles.map((r) => (
                                                <tr key={r.slug} className="hover:bg-parchment-100">
                                                    <td className="py-3"><Link href={`/careers/${r.slug}`} className="flex items-center gap-2 font-semibold text-ink-900 hover:text-violet-700"><AboutIcon name={r.icon} className="size-5 text-ink-600" />{r.title}</Link></td>
                                                    <td className="py-3 text-ink-700">{r.department}</td>
                                                    <td className="py-3 text-ink-700"><span className="flex items-center gap-1"><MapPin className="size-3.5" aria-hidden="true" />{r.location}</span></td>
                                                    <td className="py-3"><span className={cn('rounded px-2 py-0.5 text-xs font-semibold', r.employment_type === 'Full-time' ? 'bg-verified-50 text-verified-700' : 'bg-violet-50 text-violet-700')}>{r.employment_type}</span></td>
                                                    <td className="py-3 text-right"><Link href={`/careers/${r.slug}`} className="inline-flex items-center gap-1 font-semibold text-controlled-700">View Role <ArrowRight className="size-3.5" aria-hidden="true" /></Link></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-ink-500">
                            Only approved vacancies appear here. Already applied? <Link href="/careers/application-status" className="font-semibold text-violet-700 underline">Check your application status</Link>.
                        </p>
                    </div>
                    <aside className="space-y-4">
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Users className="size-6 text-controlled-700" aria-hidden="true" /> Join Our Talent Community</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">Don&apos;t see the right role? Join our talent community and we&apos;ll notify you when new opportunities match your profile.</p>
                            <ButtonLink href="/about/contact" variant="outline" size="sm" className="mt-3" trailingIcon="arrow-right">Join Talent Community</ButtonLink>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Gift className="size-6 text-verified-700" aria-hidden="true" /> Our Benefits</h2>
                            <ul className="mt-3 space-y-2">
                                {benefits.map((b) => <li key={b} className="flex items-start gap-2 text-[0.8125rem] text-ink-700"><CircleCheck className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />{b}</li>)}
                            </ul>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="flex items-center gap-2 font-semibold text-ink-900"><Image className="size-6 text-violet-700" aria-hidden="true" /> Life at TBCA</h2>
                            <p className="mt-1 text-[0.8125rem] text-ink-600">See what it&apos;s like to work at TBCA.</p>
                            <ButtonLink href="/newsroom" variant="outline" size="sm" className="mt-3" trailingIcon="arrow-right">View Culture Stories</ButtonLink>
                        </div>
                        <div className="rounded-[8px] border border-violet-200 bg-violet-50/50 p-5 text-[0.8125rem] text-ink-700">
                            Read how we handle your data in our <Link href="/candidate-privacy" className="font-semibold text-violet-700 underline">Candidate Privacy</Link> notice.
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
