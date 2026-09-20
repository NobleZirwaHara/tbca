import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { Section, SectionHeading } from '@/Components/ui/Section';

const PANELS = [
    { name: 'Saved Searches', body: 'Stored queries with the filters, entitlement and date they were run.', icon: 'search' },
    { name: 'Watchlists', body: 'Monitored countries, sectors, entities, opportunities and signals.', icon: 'eye' },
    { name: 'Alerts', body: 'Regulatory change, tender, project, funding and risk notifications.', icon: 'bell' },
    { name: 'Downloads', body: 'Purchased briefs and exports with version and limitation notice.', icon: 'download' },
    { name: 'Subscriptions', body: 'Plan, entitlement status, renewal date and team seats.', icon: 'key' },
    { name: 'Advisory Requests', body: 'Requests routed to a TBCA advisor with a named owner.', icon: 'briefcase' },
];

export default function AiimWorkspace({
    roles,
    curationStages,
}: {
    roles: { role: string; use: string; entitlement: string; control: string }[];
    curationStages: { stage: string; treatment: string }[];
}) {
    return (
        <>
            <Head title="Workspace — AIIM" />

            <PageHeader
                eyebrow="Saved searches, alerts, downloads and advisory requests"
                title="Investor Workspace"
                lead="Your Research, Kept and Monitored."
                intro="The workspace keeps what you have looked at, what you have saved and what you are monitoring, so research compounds rather than restarting each session."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'AIIM', href: '/aiim' }, { label: 'Workspace' }]}
                aside={{
                    title: 'Access Requirements',
                    body: 'Saving, comparing and alerting require an authenticated account with a CRM contact and recorded consent.',
                    items: [
                        'Authenticated account required',
                        'Consent recorded and withdrawable',
                        'Entitlement validated per request',
                        'Team roles for enterprise workspaces',
                    ],
                    icon: 'user-check',
                    link: { label: 'Enter the client portal', href: '/portal' },
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Workspace Panels" />
                <ul className="mt-7 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {PANELS.map((panel) => (
                        <li key={panel.name} className="bg-white p-5">
                            <Icon name={panel.icon} className="size-5 text-gold-600" />
                            <h3 className="mt-3 text-[0.875rem] font-semibold text-ink-900">{panel.name}</h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{panel.body}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section tone="white">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-7">
                        <SectionHeading title="Roles and Entitlements" />
                        <div className="mt-6">
                            <DataTable
                                columns={['Role', 'Permitted Use', 'Entitlement']}
                                rows={roles.map((r) => [r.role, r.use, r.entitlement])}
                                caption="AIIM workspace roles"
                            />
                        </div>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionHeading title="Curation Lifecycle" lead="What happens behind your workspace." />
                        <ol className="mt-6 space-y-2.5">
                            {curationStages.map((stage, index) => (
                                <Card as="li" key={stage.stage} className="flex gap-3 p-3.5">
                                    <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-full border border-gold-400 text-[0.75rem] font-semibold text-gold-700">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{stage.stage}</p>
                                        <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-600">
                                            {stage.treatment}
                                        </p>
                                    </div>
                                </Card>
                            ))}
                        </ol>
                    </div>
                </div>
            </Section>

            <CtaBand
                title="Upgrade to the TBCA investor desk"
                body="Team workspaces, bulk data, API entitlement, dashboards and a named account manager."
                primary={{ label: 'Request Proposal', href: '/contact' }}
                secondary={{ label: 'Enter Portal', href: '/portal' }}
            />
        </>
    );
}
