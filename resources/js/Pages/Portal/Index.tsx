import { Head } from '@inertiajs/react';
import { LockKeyhole } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    areas: { name: string; body: string; icon: string }[];
    ddAreas: { area: string; info: string }[];
    dashboards: { name: string; metrics: string }[];
}

export default function PortalIndex({ areas, ddAreas, dashboards }: Props) {
    return (
        <>
            <Head title="Client Portal" />

            <PageHeader
                eyebrow="Secure access to orders, cases, projects, documents and support"
                title="Client Portal"
                lead="One Authenticated View of Everything You Have With TBCA."
                intro="The portal is a role-aware view over the authoritative systems behind the platform. You see your own organisation, orders, cases, projects, documents and tickets, and nothing else."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Client Portal' }]}
                aside={{
                    title: 'Access Controls',
                    body: 'Clients access only their own organisation. Staff and partners see only assigned records.',
                    items: [
                        'Role-based, least-privilege access',
                        'Multi-factor authentication for privileged roles',
                        'Access, change and export events logged',
                        'Sensitive results delivered in the portal only',
                    ],
                    icon: 'lock',
                }}
            />

            <Section tone="parchment">
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-7">
                        <SectionHeading title="What Lives in Your Portal" />

                        <ul className="mt-7 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2">
                            {areas.map((area) => (
                                <li key={area.name} className="bg-white p-5">
                                    <Icon name={area.icon} className="size-5 text-gold-600" />
                                    <h3 className="mt-3 text-[0.875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                        {area.name}
                                    </h3>
                                    <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{area.body}</p>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-5">
                        <Card className="p-6">
                            <span className="inline-flex size-11 items-center justify-center rounded-full bg-ink-900 text-gold-400">
                                <LockKeyhole className="size-5" aria-hidden="true" />
                            </span>

                            <h2 className="mt-4 font-serif text-[1.25rem] font-semibold tracking-[-0.015em] text-ink-900">
                                Client Login
                            </h2>
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">
                                Authentication is not yet wired in this build. Sign-in, multi-factor authentication and
                                entitlement checks arrive with the portal backend.
                            </p>

                            <form className="mt-6 space-y-3" onSubmit={(event) => event.preventDefault()}>
                                <label className="block">
                                    <span className="text-[0.75rem] font-semibold text-ink-700">Email address</span>
                                    <input
                                        type="email"
                                        disabled
                                        placeholder="you@company.com"
                                        className="mt-1.5 h-11 w-full rounded-[4px] border border-parchment-400 bg-parchment-100 px-3.5 text-[0.875rem] text-ink-500 placeholder:text-ink-400"
                                    />
                                </label>

                                <label className="block">
                                    <span className="text-[0.75rem] font-semibold text-ink-700">Password</span>
                                    <input
                                        type="password"
                                        disabled
                                        placeholder="••••••••"
                                        className="mt-1.5 h-11 w-full rounded-[4px] border border-parchment-400 bg-parchment-100 px-3.5 text-[0.875rem] text-ink-500 placeholder:text-ink-400"
                                    />
                                </label>

                                <Button type="submit" variant="gold" size="lg" className="w-full" disabled>
                                    Enter Portal
                                </Button>
                            </form>

                            <p className="mt-4 border-t border-parchment-300 pt-4 text-[0.75rem] leading-relaxed text-ink-500">
                                Need help in the meantime? Support requests create a ticket with a named owner and a
                                service level.
                            </p>

                            <ButtonLink href="/contact" variant="outline" size="sm" className="mt-3 w-full">
                                Get Support
                            </ButtonLink>
                        </Card>
                    </div>
                </div>
            </Section>

            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-6">
                        <SectionHeading title="Due Diligence Areas" lead="What a case shows you." />
                        <ul className="mt-7 space-y-2.5">
                            {ddAreas.map((area) => (
                                <Card as="li" key={area.area} className="p-4">
                                    <p className="text-[0.875rem] font-semibold text-ink-900">{area.area}</p>
                                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{area.info}</p>
                                </Card>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-6">
                        <SectionHeading title="Management Dashboards" lead="Available by role and entitlement." />
                        <ul className="mt-7 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2">
                            {dashboards.map((dashboard) => (
                                <li key={dashboard.name} className="bg-white p-4">
                                    <h3 className="text-[0.8125rem] font-semibold text-ink-900">{dashboard.name}</h3>
                                    <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-600">
                                        {dashboard.metrics}
                                    </p>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </Section>

            <CtaBand
                title="Not a client yet?"
                body="Start with a diagnostic or a Sprint. Your portal opens with your first order."
                primary={{ label: 'Explore Sprints', href: '/shop' }}
                secondary={{ label: 'Start Diagnostic', href: '/diagnostics' }}
            />
        </>
    );
}
