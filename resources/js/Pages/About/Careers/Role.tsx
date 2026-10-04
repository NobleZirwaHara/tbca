import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Briefcase, Building2, CalendarDays, Clock, Mail, MapPin, Plane, Share2, Star, User } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Tabs } from '@/Components/ui/Kit';
import { ButtonLink } from '@/Components/ui/Button';
import AboutIcon from '@/Components/About/AboutIcon';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import type { SharedProps } from '@/types';
import type { RoleSummary } from '@/types/about';

interface Role extends RoleSummary {
    overview: string | null;
    impact: string | null;
    responsibilities: string[];
    requirements: string[];
    offer: string[];
    skills: string[];
    department_about: string | null;
}

export default function RoleDetail({ role }: { role: Role }) {
    const { auth } = usePage<SharedProps>().props;
    const [tab, setTab] = useState('overview');
    const [copied, setCopied] = useState(false);

    const share = async () => {
        const url = window.location.href;
        if (navigator.share) {
            await navigator.share({ title: role.title, url }).catch(() => undefined);
        } else {
            await navigator.clipboard?.writeText(url);
            setCopied(true);
        }
    };
    const save = () => {
        if (!auth.user) {
            router.visit('/login');
            return;
        }
        router.post('/saved', { item_type: 'vacancy', item_key: role.slug, label: role.title, url: `/careers/${role.slug}` }, { preserveScroll: true });
    };

    const list = (items: string[]) => (
        <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.875rem] text-ink-700">{items.map((i) => <li key={i}>{i}</li>)}</ul>
    );

    return (
        <>
            <Head title={role.title} />
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'About TBCA', href: '/about' }, { label: 'Careers', href: '/careers' }, { label: role.title }]} />
                    <div className="grid gap-6 lg:grid-cols-[1fr_21rem]">
                        <div className="space-y-5">
                            <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <Link href="/careers" className="inline-flex items-center gap-1 text-[0.8125rem] font-medium text-controlled-700"><ArrowLeft className="size-4" aria-hidden="true" /> Back to Careers</Link>
                                <div className="mt-4 flex flex-col gap-5 md:flex-row md:items-start">
                                    <span className="inline-flex size-20 shrink-0 items-center justify-center rounded-[10px] bg-violet-50 text-violet-700"><AboutIcon name={role.icon} className="size-10" /></span>
                                    <div className="flex-1">
                                        <h1 className="text-[1.75rem] font-bold text-ink-900 md:text-[2.125rem]">{role.title}</h1>
                                        <div className="mt-2 flex flex-wrap items-center gap-4 text-[0.8125rem] text-ink-700">
                                            <span className="rounded bg-verified-50 px-2 py-0.5 text-xs font-semibold text-verified-700">{role.employment_type}</span>
                                            <span className="flex items-center gap-1"><MapPin className="size-4" aria-hidden="true" />{role.location}</span>
                                            <span className="flex items-center gap-1"><Building2 className="size-4" aria-hidden="true" />{role.department}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2 md:w-44">
                                        {role.is_open ? (
                                            <Link href={`/careers/${role.slug}/apply`} className="inline-flex h-10 items-center justify-center rounded-[4px] bg-violet-700 text-sm font-semibold text-white hover:bg-violet-800">Apply Now</Link>
                                        ) : (
                                            <span className="inline-flex h-10 items-center justify-center rounded-[4px] bg-parchment-300 text-sm font-semibold text-ink-500">Applications closed</span>
                                        )}
                                        <button type="button" onClick={save} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-violet-300 text-sm font-medium text-violet-700"><Bookmark className="size-4" aria-hidden="true" /> Save Role</button>
                                        <button type="button" onClick={share} className="inline-flex h-10 items-center justify-center gap-1.5 rounded-[4px] border border-violet-300 text-sm font-medium text-violet-700"><Share2 className="size-4" aria-hidden="true" /> {copied ? 'Link copied' : 'Share Role'}</button>
                                    </div>
                                </div>
                                <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-parchment-300 pt-4 text-[0.8125rem] md:grid-cols-5">
                                    {[[Building2, 'Department', role.department], [User, 'Reports To', role.reports_to ?? '—'], [Briefcase, 'Employment Type', role.employment_type], [CalendarDays, 'Date Posted', fmtDate(role.posted_at)], [CalendarDays, 'Closing Date', fmtDate(role.closes_at)]].map(([Icon, label, value]) => {
                                        const I = Icon as typeof Building2;
                                        return (
                                            <div key={label as string} className="flex items-start gap-2">
                                                <I className="mt-0.5 size-5 shrink-0 text-ink-500" aria-hidden="true" />
                                                <div><dt className="font-semibold text-ink-900">{label as string}</dt><dd className="text-ink-600">{value as string}</dd></div>
                                            </div>
                                        );
                                    })}
                                </dl>
                            </div>

                            <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <Tabs
                                    value={tab}
                                    onChange={setTab}
                                    tabs={[{ key: 'overview', label: 'Role Overview' }, { key: 'responsibilities', label: 'Responsibilities' }, { key: 'requirements', label: 'Requirements' }, { key: 'offer', label: 'What We Offer' }, { key: 'about', label: 'About TBCA' }]}
                                />
                                <div className="pt-4">
                                    {tab === 'overview' && (
                                        <>
                                            <h2 className="font-semibold text-ink-900">Role Overview</h2>
                                            <p className="mt-2 text-[0.875rem] text-ink-700">{role.overview}</p>
                                            {role.impact && (
                                                <div className="mt-4 flex gap-3 rounded-[6px] bg-violet-50 p-4">
                                                    <Star className="size-5 shrink-0 text-violet-700" aria-hidden="true" />
                                                    <p className="text-[0.8125rem] text-ink-700"><span className="block font-semibold text-violet-800">Impact</span>{role.impact}</p>
                                                </div>
                                            )}
                                            <h2 className="mt-5 font-semibold text-ink-900">Key Responsibilities</h2>
                                            {list(role.responsibilities.slice(0, 6))}
                                            {role.responsibilities.length > 0 && (
                                                <button type="button" onClick={() => setTab('responsibilities')} className="mt-3 text-[0.8125rem] font-semibold text-controlled-700">View Full Responsibilities ↓</button>
                                            )}
                                        </>
                                    )}
                                    {tab === 'responsibilities' && <><h2 className="font-semibold text-ink-900">Responsibilities</h2>{list(role.responsibilities)}</>}
                                    {tab === 'requirements' && <><h2 className="font-semibold text-ink-900">Requirements</h2>{list(role.requirements)}</>}
                                    {tab === 'offer' && <><h2 className="font-semibold text-ink-900">What We Offer</h2>{list(role.offer)}</>}
                                    {tab === 'about' && (
                                        <p className="text-[0.875rem] text-ink-700">
                                            The Business Clinic.Africa™ is an AI-enabled advisory and project development platform. We combine human expertise, AI intelligence and robotic automation to help clients think bigger, move faster and achieve lasting impact. <Link href="/about" className="font-semibold text-violet-700 underline">Learn more about TBCA</Link>.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <aside className="space-y-4">
                            <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="font-semibold text-ink-900">At a Glance</h2>
                                <dl className="mt-3 space-y-2.5 text-[0.8125rem]">
                                    {[[Briefcase, 'Role', role.title], [Building2, 'Department', role.department], [MapPin, 'Location', role.location], [Clock, 'Employment Type', role.employment_type], [User, 'Experience Level', role.experience_level ?? '—'], [Plane, 'Travel', role.travel ?? '—']].map(([Icon, l, v]) => {
                                        const I = Icon as typeof Briefcase;
                                        return <div key={l as string} className="flex items-start gap-2"><I className="size-4 shrink-0 text-violet-600" aria-hidden="true" /><dt className="w-28 shrink-0 text-ink-500">{l as string}</dt><dd className="text-ink-900">{v as string}</dd></div>;
                                    })}
                                </dl>
                            </div>
                            {role.skills.length > 0 && (
                                <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                    <h2 className="font-semibold text-ink-900">Required Skills</h2>
                                    <ul className="mt-3 flex flex-wrap gap-2">{role.skills.map((s) => <li key={s} className="rounded-full border border-violet-300 px-2.5 py-0.5 text-xs text-violet-700">{s}</li>)}</ul>
                                </div>
                            )}
                            {role.department_about && (
                                <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                    <h2 className="font-semibold text-ink-900">About the Department</h2>
                                    <p className="mt-2 text-[0.8125rem] text-ink-600">{role.department_about}</p>
                                </div>
                            )}
                            <div className="rounded-[8px] border border-attested-500/25 bg-attested-50/50 p-5">
                                <h2 className="font-semibold text-ink-900">Need Help?</h2>
                                <p className="mt-1 text-[0.8125rem] text-ink-600">Have a question about this role or the application process?</p>
                                <a href="mailto:careers@thebusinessclinic.africa" className="mt-3 inline-flex items-center gap-1.5 rounded-[4px] border border-attested-500 px-3 py-1.5 text-[0.8125rem] font-semibold text-attested-700"><Mail className="size-4" aria-hidden="true" /> Contact Our Talent Team</a>
                            </div>
                        </aside>
                    </div>
                    <div className="mt-6 flex flex-col gap-3 rounded-[8px] border border-violet-200 bg-violet-50/60 p-5 md:flex-row md:items-center">
                        <Mail className="size-8 shrink-0 text-violet-700" aria-hidden="true" />
                        <p className="flex-1 text-[0.8125rem] text-ink-700"><span className="block font-semibold text-violet-800">Stay Updated on New Opportunities</span>Join our talent community and be the first to hear about new roles that match your skills and interests.</p>
                        <ButtonLink href="/careers" variant="outline" size="sm" trailingIcon="arrow-right">View All Roles</ButtonLink>
                    </div>
                </div>
            </section>
        </>
    );
}
