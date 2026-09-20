import { useState } from 'react';
import { Head } from '@inertiajs/react';
import { CalendarDays, Mail, MapPin, ShieldCheck, User as UserIcon } from 'lucide-react';
import PublicLayout from '@/Layouts/PublicLayout';
import type { ReactElement } from 'react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import CtaBand from '@/Components/CtaBand';
import { BoundaryNote } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ButtonLink } from '@/Components/ui/Button';
import { Section } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';

interface Member {
    slug: string;
    name: string;
    post_nominal: string;
    role: string;
    practice: string;
    state: string;
    reviewed: string;
    summary: string;
    bio: string[];
    highlights: string[];
    expertise: string[];
    qualifications: string[];
    languages: string[];
    email: string;
    location: string;
}

const TABS = ['Overview', 'Expertise', 'Qualifications', 'Credentials'] as const;

export default function MemberProfile({
    member,
    limitations,
}: {
    member: Member;
    limitations: { title: string; body: string };
}) {
    const [tab, setTab] = useState<(typeof TABS)[number]>('Overview');

    return (
        <>
            <Head title={member.name} />

            <div className="border-b border-parchment-400 bg-parchment-100">
                <div className="container-tbca py-8 md:py-12">
                    <Breadcrumbs
                        items={[
                            { label: 'Home', href: '/' },
                            { label: 'About TBCA', href: '/about' },
                            { label: 'Our Team', href: '/about/team' },
                            { label: member.name },
                        ]}
                    />

                    <div className="grid gap-8 lg:grid-cols-12 lg:gap-12">
                        <div className="lg:col-span-3">
                            <div className="flex aspect-square w-full max-w-[16rem] items-center justify-center rounded-[6px] bg-ink-900 text-gold-500/60">
                                <UserIcon className="size-20" strokeWidth={1} aria-hidden="true" />
                            </div>

                            <ButtonLink href="/contact" variant="gold" className="mt-5 w-full max-w-[16rem]" icon="mail">
                                Send Message
                            </ButtonLink>
                            <ButtonLink href="/contact" variant="outline" className="mt-2.5 w-full max-w-[16rem]" icon="calendar-days">
                                Request a Meeting
                            </ButtonLink>

                            <div className="mt-6 max-w-[16rem]">
                                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-700">
                                    Contact
                                </h2>
                                <ul className="mt-3 space-y-2.5 text-[0.8125rem]">
                                    <li className="flex items-start gap-2.5 text-ink-600">
                                        <Mail className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                        <span className="break-all">{member.email}</span>
                                    </li>
                                    <li className="flex items-start gap-2.5 text-ink-600">
                                        <MapPin className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                        {member.location}
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="lg:col-span-9">
                            <h1 className="font-serif text-[2.25rem] leading-[1.05] font-semibold tracking-[-0.02em] text-ink-900 md:text-[2.75rem]">
                                {member.name}
                                {member.post_nominal && (
                                    <span className="ml-2 text-[1.25rem] font-medium text-ink-500">
                                        {member.post_nominal}
                                    </span>
                                )}
                            </h1>

                            <p className="mt-2 font-serif text-[1.25rem] text-gold-700">{member.role}</p>

                            <p className="mt-5 max-w-2xl text-[0.9375rem] leading-relaxed text-ink-600">
                                {member.summary}
                            </p>

                            <div className="mt-6 flex flex-wrap gap-2.5">
                                <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-gold-300 bg-gold-50/60 px-2.5 py-1.5 text-[0.75rem] font-semibold text-gold-700">
                                    <Icon name="crown" className="size-3.5" />
                                    {member.practice}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-verified-500/40 bg-verified-50 px-2.5 py-1.5 text-[0.75rem] font-semibold text-verified-700">
                                    <ShieldCheck className="size-3.5" aria-hidden="true" />
                                    Profile {member.state}
                                </span>
                                <span className="inline-flex items-center gap-1.5 rounded-[3px] border border-parchment-400 bg-white px-2.5 py-1.5 text-[0.75rem] text-ink-600">
                                    <CalendarDays className="size-3.5" aria-hidden="true" />
                                    Reviewed {member.reviewed}
                                </span>
                            </div>

                            <ul className="mt-8 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-4">
                                {member.highlights.map((highlight) => (
                                    <li key={highlight} className="bg-white p-4">
                                        <Icon name="badge-check" className="size-5 text-gold-600" />
                                        <p className="mt-2.5 text-[0.75rem] leading-snug font-semibold text-ink-900">
                                            {highlight}
                                        </p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <Section tone="parchment">
                <div role="tablist" className="flex flex-wrap gap-1 border-b border-parchment-400">
                    {TABS.map((item) => (
                        <button
                            key={item}
                            type="button"
                            role="tab"
                            aria-selected={tab === item}
                            onClick={() => setTab(item)}
                            className={cn(
                                'relative px-4 py-3 text-[0.8125rem] font-semibold transition-colors',
                                tab === item ? 'text-gold-700' : 'text-ink-500 hover:text-ink-800',
                            )}
                        >
                            {item}
                            {tab === item && (
                                <span className="absolute inset-x-2 bottom-[-1px] h-[2px] bg-gold-600" aria-hidden="true" />
                            )}
                        </button>
                    ))}
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                    {tab === 'Overview' && (
                        <>
                            <Card className="p-6">
                                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    About {member.name.split(' ')[0]}
                                </h2>
                                <div className="prose-tbca mt-3 text-[0.875rem]">
                                    {member.bio.map((paragraph) => (
                                        <p key={paragraph.slice(0, 32)}>{paragraph}</p>
                                    ))}
                                </div>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    Core Expertise
                                </h2>
                                <ul className="mt-3 space-y-2">
                                    {member.expertise.map((item) => (
                                        <li key={item} className="flex gap-2.5 text-[0.8125rem] leading-relaxed text-ink-700">
                                            <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-gold-500" aria-hidden="true" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Card>

                            <Card className="p-6">
                                <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    Languages
                                </h2>
                                <ul className="mt-3 flex flex-wrap gap-2">
                                    {member.languages.map((language, index) => (
                                        <li
                                            key={language}
                                            className={cn(
                                                'rounded-[3px] border px-2.5 py-1.5 text-[0.75rem] font-medium',
                                                index === 0
                                                    ? 'border-gold-400 bg-gold-500 text-ink-900'
                                                    : 'border-gold-300 bg-gold-50/60 text-gold-700',
                                            )}
                                        >
                                            {language}
                                        </li>
                                    ))}
                                </ul>

                                <h2 className="mt-6 border-t border-parchment-300 pt-5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    Professional Boundary
                                </h2>
                                <p className="mt-2 text-[0.8125rem] leading-relaxed text-ink-600">{limitations.body}</p>
                            </Card>
                        </>
                    )}

                    {tab === 'Expertise' && (
                        <Card className="p-6 lg:col-span-3">
                            <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                Core Expertise
                            </h2>
                            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                                {member.expertise.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2.5 rounded-[5px] border border-parchment-400 p-3.5 text-[0.8125rem] leading-relaxed text-ink-700"
                                    >
                                        <Icon name="circle-check" className="mt-0.5 size-4 shrink-0 text-gold-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {tab === 'Qualifications' && (
                        <Card className="p-6 lg:col-span-3">
                            <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                Qualifications
                            </h2>
                            <ul className="mt-4 space-y-2.5">
                                {member.qualifications.map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-start gap-2.5 border-b border-parchment-300 pb-2.5 text-[0.875rem] leading-relaxed text-ink-700 last:border-0"
                                    >
                                        <Icon name="graduation-cap" className="mt-0.5 size-4 shrink-0 text-gold-600" />
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                    )}

                    {tab === 'Credentials' && (
                        <Card className="p-6 lg:col-span-3">
                            <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                Credential Record
                            </h2>
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">
                                This profile publishes from an approved record. Evidence was reviewed and is current to
                                the published date of {member.reviewed}. Supporting evidence is controlled and available
                                on request.
                            </p>

                            <div className="mt-6">
                                <BoundaryNote title={limitations.title} body={limitations.body} />
                            </div>
                        </Card>
                    )}
                </div>
            </Section>

            <CtaBand
                title={`Work with ${member.name.split(' ')[0]} and the TBCA team`}
                body="Book a discovery session or request a structured advisory mandate."
                primary={{ label: 'Request a Meeting', href: '/contact' }}
                secondary={{ label: 'Meet the Team', href: '/about/team' }}
            />
        </>
    );
}

MemberProfile.layout = (page: ReactElement) => <PublicLayout>{page}</PublicLayout>;
