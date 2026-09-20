import { Head, Link } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ConfidenceChip } from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    countries: { slug: string; name: string; region: string; status: string; grade: string }[];
    sectors: { slug: string; name: string; icon: string }[];
}

const SIGNALS = [
    { name: 'Regulatory change', body: 'New or amended regulation affecting a monitored market or sector.' },
    { name: 'Tender and procurement', body: 'Published tenders matching a monitored sector or corridor.' },
    { name: 'Project milestone', body: 'Stage change on a monitored project, sponsor or asset.' },
    { name: 'Funding activity', body: 'Announced facilities, instruments and mandates in scope.' },
    { name: 'Risk movement', body: 'Sovereign, currency, regulatory or counterparty risk change.' },
    { name: 'Counterparty alert', body: 'Screening alert on a monitored entity, routed through review.' },
];

export default function AiimWatchlists({ countries, sectors }: Props) {
    return (
        <>
            <Head title="Watchlists — AIIM" />

            <PageHeader
                eyebrow="Saved countries, sectors, entities and monitored signals"
                title="Watchlists"
                lead="What Changed, and Whether It Matters."
                intro="Watchlists monitor the markets, sectors and entities you care about, and surface only material change. Counterparty alerts pass through review before any client notification."
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'AIIM', href: '/aiim' },
                    { label: 'Workspace', href: '/aiim/workspace' },
                    { label: 'Watchlists' },
                ]}
                aside={{
                    title: 'Alert Discipline',
                    body: 'Alerts are reviewed for materiality before notification. Screening hits never reach a client unreviewed.',
                    items: [
                        'Materiality assessed before notification',
                        'Counterparty alerts route to reviewer',
                        'Source and date on every signal',
                        'Review status visible in the portal',
                    ],
                    icon: 'radar',
                }}
            />

            <Section tone="parchment">
                <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
                    <div>
                        <SectionHeading title="Monitored Markets" />
                        <ul className="mt-6 space-y-2">
                            {countries.slice(0, 6).map((country) => (
                                <Card as="li" key={country.slug} hover className="p-4">
                                    <Link href={`/aiim/country/${country.slug}`} className="flex items-center justify-between gap-3">
                                        <span className="min-w-0">
                                            <span className="block text-[0.875rem] font-semibold text-ink-900">
                                                {country.name}
                                            </span>
                                            <span className="block text-[0.75rem] text-ink-500">{country.status}</span>
                                        </span>
                                        <ConfidenceChip grade={country.grade} />
                                    </Link>
                                </Card>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <SectionHeading title="Monitored Sectors" />
                        <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                            {sectors.slice(0, 8).map((sector) => (
                                <Card as="li" key={sector.slug} hover className="p-3.5">
                                    <Link href={`/aiim/sector/${sector.slug}`} className="flex items-center gap-3">
                                        <Icon name={sector.icon} className="size-5 shrink-0 text-gold-600" />
                                        <span className="text-[0.8125rem] font-medium text-ink-900">{sector.name}</span>
                                    </Link>
                                </Card>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            <Section tone="white">
                <SectionHeading title="Signal Types" lead="What a watchlist actually watches." />
                <ul className="mt-7 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {SIGNALS.map((signal) => (
                        <li key={signal.name} className="bg-white p-5">
                            <h3 className="text-[0.875rem] font-semibold text-ink-900">{signal.name}</h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{signal.body}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            <CtaBand
                title="Want alerts you can act on?"
                body="Subscriber and enterprise plans add monitoring, review and portfolio dashboards."
                primary={{ label: 'View Subscriptions', href: '/subscriptions' }}
                secondary={{ label: 'Enter Portal', href: '/portal' }}
            />
        </>
    );
}
