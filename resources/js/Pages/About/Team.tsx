import { useMemo, useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Clock, RotateCcw, ShieldCheck, User as UserIcon } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';

interface Leader {
    slug: string;
    name: string;
    post_nominal: string;
    role: string;
    practice: string;
    state: string;
    reviewed: string;
    summary: string;
}

interface Props {
    leadership: Leader[];
    directory: { label: string; practice: string; state: string }[];
    states: { state: string; body: string; tone: string }[];
}

const STATE_ICON: Record<string, typeof ShieldCheck> = {
    'Verified Current': ShieldCheck,
    'Pending Review': Clock,
    'Controlled Placeholder': UserIcon,
};

const STATE_TONE: Record<string, string> = {
    'Verified Current': 'text-verified-700 border-verified-500/40 bg-verified-50',
    'Pending Review': 'text-attested-700 border-attested-500/40 bg-attested-50',
    'Controlled Placeholder': 'text-ink-600 border-parchment-400 bg-parchment-200',
};

export default function Team({ leadership, directory, states }: Props) {
    const [query, setQuery] = useState('');
    const [practice, setPractice] = useState('All');

    const practices = useMemo(
        () => ['All', ...Array.from(new Set(directory.map((item) => item.practice)))],
        [directory],
    );

    const visible = directory.filter((item) => {
        const matchesPractice = practice === 'All' || item.practice === practice;
        const matchesQuery =
            query === '' ||
            item.practice.toLowerCase().includes(query.toLowerCase()) ||
            item.label.toLowerCase().includes(query.toLowerCase());

        return matchesPractice && matchesQuery;
    });

    return (
        <>
            <Head title="Our Team" />

            <PageHeader
                title="Our Team"
                lead="Verified current team and practice leadership."
                intro="Our people combine intelligent advisory, AI-powered systems, robotic automation and human authority to help organisations make better decisions and achieve measurable impact across Africa."
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'About TBCA', href: '/about' },
                    { label: 'Our Team' },
                ]}
                aside={{
                    title: 'How Profiles Publish',
                    body: 'Team profiles publish only from approved records. A role catalogue does not prove occupancy.',
                    items: states.map((state) => `${state.state}: ${state.body}`),
                    icon: 'user-check',
                }}
            />

            <Section tone="parchment">
                <div className="flex flex-col gap-3 rounded-[6px] border border-parchment-400 bg-white p-4 sm:flex-row sm:items-center">
                    <label className="flex-1">
                        <span className="sr-only">Search the team directory</span>
                        <input
                            type="search"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                            placeholder="Search team by role, practice or keyword..."
                            className="h-10 w-full rounded-[4px] border border-parchment-400 px-3.5 text-[0.875rem] text-ink-900 placeholder:text-ink-400 focus:border-gold-500 focus:outline-none"
                        />
                    </label>

                    <label className="sm:w-56">
                        <span className="sr-only">Filter by practice</span>
                        <select
                            value={practice}
                            onChange={(event) => setPractice(event.target.value)}
                            className="h-10 w-full rounded-[4px] border border-parchment-400 bg-white px-3 text-[0.875rem] text-ink-700 focus:border-gold-500 focus:outline-none"
                        >
                            {practices.map((item) => (
                                <option key={item} value={item}>
                                    {item === 'All' ? 'All practices' : item}
                                </option>
                            ))}
                        </select>
                    </label>

                    <button
                        type="button"
                        onClick={() => {
                            setQuery('');
                            setPractice('All');
                        }}
                        className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-parchment-400 px-3.5 text-[0.8125rem] font-medium text-ink-600 transition-colors hover:border-gold-300 hover:text-ink-900"
                    >
                        <RotateCcw className="size-3.5" aria-hidden="true" />
                        Clear Filters
                    </button>
                </div>

                <div className="mt-10">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-700">
                        Leadership
                    </p>

                    <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {leadership.map((leader) => (
                            <Card as="li" key={leader.slug} hover className="flex gap-4 p-5">
                                <span className="inline-flex size-16 shrink-0 items-center justify-center rounded-full bg-parchment-300 text-ink-400">
                                    <UserIcon className="size-7" aria-hidden="true" />
                                </span>

                                <div className="min-w-0">
                                    <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                        {leader.name}
                                        {leader.post_nominal && (
                                            <span className="ml-1 text-[0.75rem] font-medium text-ink-500">
                                                {leader.post_nominal}
                                            </span>
                                        )}
                                    </h2>
                                    <p className="mt-0.5 text-[0.8125rem] text-gold-700">{leader.role}</p>
                                    <p className="mt-0.5 text-[0.75rem] text-ink-500">{leader.practice}</p>

                                    <StateChip state={leader.state} className="mt-3" />

                                    <ButtonLink
                                        href={`/about/team/${leader.slug}`}
                                        variant="outline"
                                        size="sm"
                                        className="mt-3"
                                        trailingIcon="arrow-right"
                                    >
                                        View Profile
                                    </ButtonLink>
                                </div>
                            </Card>
                        ))}
                    </ul>
                </div>

                <div className="mt-12 grid gap-8 lg:grid-cols-12">
                    <div className="lg:col-span-9">
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-700">
                            Team Directory
                        </p>

                        <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {visible.map((member, index) => (
                                <Card as="li" key={`${member.practice}-${index}`} className="flex gap-3 p-4">
                                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-parchment-300 text-ink-400">
                                        <UserIcon className="size-5" aria-hidden="true" />
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[0.8125rem] leading-snug font-semibold text-ink-900">
                                            {member.label}
                                        </p>
                                        <p className="mt-0.5 text-[0.75rem] text-ink-500">{member.practice}</p>
                                        <StateChip state={member.state} className="mt-2" />
                                    </div>
                                </Card>
                            ))}
                        </ul>

                        {visible.length === 0 && (
                            <Card className="mt-5 p-8 text-center">
                                <p className="text-[0.875rem] text-ink-600">No profiles match that filter.</p>
                            </Card>
                        )}
                    </div>

                    <div className="lg:col-span-3">
                        <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.16em] text-gold-700">
                            Profile Record States
                        </p>

                        <ul className="mt-5 space-y-3">
                            {states.map((state) => {
                                const StateIcon = STATE_ICON[state.state] ?? UserIcon;

                                return (
                                    <Card as="li" key={state.state} className="flex gap-3 p-4">
                                        <StateIcon className="mt-0.5 size-5 shrink-0 text-gold-600" aria-hidden="true" />
                                        <div className="min-w-0">
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{state.state}</p>
                                            <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-600">
                                                {state.body}
                                            </p>
                                        </div>
                                    </Card>
                                );
                            })}
                        </ul>
                    </div>
                </div>
            </Section>

            <CtaBand
                title="We are building Africa's most trusted ecosystem of thinkers, doers and leaders."
                body="Our team is our advantage. Our governance is your assurance."
                primary={{ label: 'View Governance', href: '/about/governance' }}
                secondary={{ label: 'Contact TBCA', href: '/contact' }}
            />
        </>
    );
}

function StateChip({ state, className }: { state: string; className?: string }) {
    const Chip = STATE_ICON[state] ?? UserIcon;

    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-[3px] border px-2 py-[3px] text-[0.6875rem] font-semibold',
                STATE_TONE[state] ?? STATE_TONE['Controlled Placeholder'],
                className,
            )}
        >
            <Chip className="size-3" aria-hidden="true" />
            {state}
        </span>
    );
}
