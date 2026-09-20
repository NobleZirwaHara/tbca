import { Head } from '@inertiajs/react';
import { Star } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    identity: { statement: string; purpose: string; mission: string; story_intro: string };
    facts: { label: string; value: string; icon: string }[];
    principles: { title: string; body: string; icon: string }[];
}

export default function Story({ identity, facts, principles }: Props) {
    return (
        <>
            <Head title="Our Story" />

            <PageHeader
                title="Our Story"
                lead="Why We Exist. Who We Serve. How We Deliver."
                intro={identity.story_intro}
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'About TBCA', href: '/about' },
                    { label: 'Our Story' },
                ]}
            >
                <ul className="mt-9 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-4">
                    {facts.map((fact) => (
                        <li key={fact.label} className="flex items-start gap-3 bg-white p-4">
                            <Icon name={fact.icon} className="mt-0.5 size-5 shrink-0 text-gold-600" />
                            <div className="min-w-0">
                                <p className="text-[0.75rem] font-semibold text-ink-900">{fact.label}</p>
                                <p className="mt-0.5 text-[0.8125rem] leading-snug text-gold-700">{fact.value}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </PageHeader>

            <Section tone="parchment">
                <SectionHeading title="Our Guiding Principles" align="center" />

                <ul className="mt-9 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                    {principles.map((principle) => (
                        <Card as="li" key={principle.title} hover className="p-5">
                            <Icon name={principle.icon} className="size-6 text-gold-600" />
                            <h3 className="mt-3.5 text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {principle.title}
                            </h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{principle.body}</p>
                        </Card>
                    ))}
                </ul>

                <div className="mt-10 flex flex-col gap-5 rounded-[6px] border border-gold-300 bg-gold-50/60 p-6 md:flex-row md:items-center md:p-8">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-gold-500 text-ink-900">
                        <Star className="size-5 fill-current" aria-hidden="true" />
                    </span>
                    <p className="font-serif text-[1.0625rem] leading-snug text-ink-900 md:text-[1.1875rem]">
                        <span className="font-semibold">Our mission is simple: </span>
                        {identity.mission}
                    </p>
                </div>
            </Section>

            <Section tone="white">
                <ul className="grid gap-5 lg:grid-cols-3">
                    {[
                        { title: 'Understand Our Approach', body: 'Explore how we think, govern and operate.', cta: 'Our Methodology', href: '/about/methodology', icon: 'book-open' },
                        { title: 'Meet Our Team', body: 'Get to know the people behind TBCA.', cta: 'Meet TBCA', href: '/about/team', icon: 'users', featured: true },
                        { title: 'See How We Govern', body: 'Transparency, evidence and accountability.', cta: 'View Governance', href: '/about/governance', icon: 'shield-check' },
                    ].map((item) => (
                        <li
                            key={item.title}
                            className={
                                item.featured
                                    ? 'flex flex-col rounded-[6px] border border-gold-400 bg-gold-50/60 p-6'
                                    : 'flex flex-col rounded-[6px] border border-parchment-400 bg-white p-6'
                            }
                        >
                            <span className="inline-flex size-11 items-center justify-center rounded-full bg-ink-900 text-gold-400">
                                <Icon name={item.icon} className="size-5" />
                            </span>
                            <h3 className="mt-4 text-[1rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {item.title}
                            </h3>
                            <p className="mt-1.5 text-[0.875rem] leading-relaxed text-ink-600">{item.body}</p>
                            <ButtonLink
                                href={item.href}
                                variant={item.featured ? 'ink' : 'outline'}
                                size="sm"
                                className="mt-5 w-fit"
                                trailingIcon="arrow-right"
                            >
                                {item.cta}
                            </ButtonLink>
                        </li>
                    ))}
                </ul>
            </Section>

            <CtaBand
                title="Let us build something that lasts."
                body={identity.purpose}
                primary={{ label: 'Talk to TBCA', href: '/contact' }}
                secondary={{ label: 'Explore Services', href: '/services' }}
            />
        </>
    );
}
