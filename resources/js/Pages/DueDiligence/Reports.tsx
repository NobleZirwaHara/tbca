import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { BoundaryNote, DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    positioning: { trust_line: string; boundary: string; intro: string };
    reportTemplates: { type: string; sections: string }[];
    portalAreas: { area: string; info: string }[];
    caseStatuses: { status: string; meaning: string; control: string }[];
}

const DASHBOARDS = [
    { name: 'Sales', metrics: 'Visitors, leads, checkout starts, paid orders, conversion rate, revenue by package and enterprise requests.' },
    { name: 'Operations', metrics: 'Cases by status, service levels due, overdue cases, incomplete intake, vendor failures, QA queue and delivered reports.' },
    { name: 'Risk', metrics: 'High-risk cases, sanctions hits, PEP hits, adverse media hits, unresolved UBO cases and false-positive disputes.' },
    { name: 'Finance', metrics: 'Revenue, vendor cost, gross margin, refunds, failed payments, subscription renewals and enterprise invoices.' },
    { name: 'Vendor Performance', metrics: 'API uptime, cost per run, error rate, average response time and coverage gaps by country.' },
    { name: 'Monitoring', metrics: 'Active monitored subjects, alerts received, alerts reviewed, client notifications and renewal status.' },
];

export default function DueDiligenceReports({ positioning, reportTemplates, portalAreas, caseStatuses }: Props) {
    return (
        <>
            <Head title="Reports and Dashboards — Due Diligence" />

            <PageHeader
                eyebrow="Entitled reports, portfolio dashboards and management views"
                title="Reports and Dashboards"
                lead="Approved Final Reports Only."
                intro="Reports are downloadable from the client portal. Email and messaging notify you that a report is ready; they never carry the result. Only the approved final version is client visible."
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Due Diligence', href: '/due-diligence' },
                    { label: 'Reports and Dashboards' },
                ]}
                aside={{
                    title: 'Delivery Rule',
                    body: 'Sensitive results are not disclosed in messages or email. Notification states only that a portal action is available.',
                    items: [
                        'Approved final version only',
                        'Version and limitation notice attached',
                        'Portal download with access log',
                        'Dispute and correction route available',
                    ],
                    icon: 'lock',
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Report Templates" lead="Minimum sections by report type." />
                <div className="mt-7">
                    <DataTable
                        columns={['Report Type', 'Minimum Sections']}
                        rows={reportTemplates.map((r) => [r.type, r.sections])}
                        caption="Due Diligence report templates"
                    />
                </div>
            </Section>

            <Section tone="white">
                <SectionHeading title="Dashboard Catalogue" lead="What management can see." />
                <ul className="mt-7 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {DASHBOARDS.map((dashboard) => (
                        <li key={dashboard.name} className="bg-white p-5">
                            <h3 className="text-[0.875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {dashboard.name}
                            </h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{dashboard.metrics}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section tone="parchment">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-12">
                    <div className="lg:col-span-6">
                        <SectionHeading title="Your Portal Areas" />
                        <ul className="mt-7 space-y-2.5">
                            {portalAreas.map((area) => (
                                <Card as="li" key={area.area} className="p-4">
                                    <p className="text-[0.875rem] font-semibold text-ink-900">{area.area}</p>
                                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">{area.info}</p>
                                </Card>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-6">
                        <SectionHeading title="Case Status Labels" lead="What you will see on a case." />
                        <div className="mt-7">
                            <DataTable
                                columns={['Status', 'Meaning']}
                                rows={caseStatuses.map((s) => [s.status, s.meaning])}
                                caption="Case statuses"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-10">
                    <BoundaryNote body={positioning.boundary} />
                </div>
            </Section>

            <CtaBand
                title="Need portfolio-level reporting?"
                body="Enterprise dashboards cover portfolio, suppliers, cases, risk distribution, service levels and alert metrics."
                primary={{ label: 'Request Enterprise Screening', href: '/due-diligence/enterprise' }}
                secondary={{ label: 'Enter Portal', href: '/portal' }}
            />
        </>
    );
}
