import { Head, Link } from '@inertiajs/react';
import { ButtonLink } from '@/Components/ui/Button';
import { SimpleTable } from '@/Components/ui/Kit';
import PublicLayout from '@/Layouts/PublicLayout';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { TechPortal } from '@/Components/Advisory/shells';
import { Card, CheckList, KV } from '@/Components/Advisory/ui';
import type { FeeLine, TechHeader } from '@/types/advisory';

interface Props { journey: JourneyState | null; engagement?: TechHeader | null; lines: FeeLine[]; summary: Record<string, string>; context: Record<string, string> | null }

const DELIVERABLES: [string, string, string, string][] = [
    ['Solution Architecture & Scoping', 'Detailed solution architecture, process mapping and scope documentation', 'Approved architecture document signed off', 'Gate 2'],
    ['Implementation Configuration', 'Platform setup, workflows, roles, permissions and configurations', 'System configured and tested in staging', 'Gate 4'],
    ['Data Migration & Integrations', 'Data migration plan, integrations with APIs and third-party systems', 'Data validated and integrations successfully tested', 'Gate 5'],
    ['Reporting & Dashboards', 'Custom dashboards, reports and KPIs configured', 'Reports and dashboards reviewed and approved', 'Gate 5'],
    ['User Training & Documentation', 'User training sessions and system documentation delivered', 'Training completed and materials accepted', 'Gate 7'],
    ['Go-Live & Hypercare Support', 'Go-live support and 30 days hypercare assistance', 'System live and stable. Hypercare support completed', 'Gate 8'],
];

function Body({ lines, summary, context, engagement }: Props) {
    const hasIntegration = lines.some((l) => l.item === 'Integration Build');
    return (
        <div className="grid gap-4 xl:grid-cols-12">
            <div className="space-y-4 xl:col-span-8">
                <Card num={1} title="Project Scope">
                    <KV rows={[['Solution', summary.tower ?? engagement?.tower ?? '—'], ['Engagement Type', 'Advisory + Implementation'], ['Organisation', context?.legal_name ?? engagement?.organisation ?? '—'], ['Primary Objective', context?.objective ?? 'Implement an integrated business system to streamline operations, improve data visibility and support scalable growth.'], ['Challenge', context?.challenge ?? '—'], ['Region', 'South Africa'], ['Estimated Timeline', summary.complexity ?? '—'], ['Auto-Renewal', 'No (support requires explicit S13 activation)']]} />
                </Card>
                <Card num={2} title="Deliverables">
                    <SimpleTable columns={['Deliverable', 'Description', 'Acceptance Criteria', 'Due Gate']} rows={DELIVERABLES.filter((d) => hasIntegration || !d[0].startsWith('Data Migration')).map((d) => [<b>{d[0]}</b>, d[1], d[2], d[3]])} />
                </Card>
                <div className="grid gap-4 md:grid-cols-3">
                    <Card num={3} title="Out of Scope"><CheckList tone="bad" items={['Third-party licence fees', 'Custom legacy system re-write', 'Hardware procurement', 'Physical infrastructure', 'Change orders & new scope']} /></Card>
                    <Card num={4} title="Assumptions"><CheckList items={['Client will provide timely access to data and stakeholders.', 'Infrastructure and internet connectivity are stable.', 'Third-party systems are available and supported.', 'Scope is based on information provided during discovery.']} /></Card>
                    <Card num={5} title="Success Metrics"><CheckList tone="gold" items={['Reduced manual work by at least 30%', 'Improved reporting accuracy and visibility', 'Faster decision-making with real-time dashboards', 'User adoption rate above 80% within 60 days']} /></Card>
                </div>
                <Card title="Key Risks & Mitigations"><SimpleTable columns={['Risk', 'Mitigation']} rows={[['Data quality issues', 'Data clean-up and validation plan'], ['Scope changes', 'Change control process (VAR gate)'], ['User adoption', 'Training and change management'], ['Integration delays', 'Early technical validation']]} /></Card>
            </div>
            <aside className="space-y-4 xl:col-span-4">
                <Card title="Engagement Summary"><KV rows={[['Solution', summary.tower ?? engagement?.tower ?? '—'], ['Engagement Type', 'Advisory + Implementation'], ['Timeline', summary.complexity ?? '—'], ['Delivery Model', 'Hybrid (Cloud + On-Premise)'], ['Region', 'South Africa']]} />
                    <p className="mt-3 text-xs text-ink-500">Next Step — Review scope and deliverables, then proceed to fees.</p>
                    {!engagement && <ButtonLink href="/technology-solutions/fees" className="mt-3 w-full" trailingIcon="arrow-right">Proceed to Fees</ButtonLink>}
                    <button type="button" onClick={() => window.print()} className="mt-2 w-full rounded border border-ink-300 py-2 text-sm">Download Scope (PDF)</button>
                    <Link href={engagement ? `/technology-solutions/workspace/${engagement.reference}/support` : '/services/proposal-request'} className="mt-2 block text-center text-xs underline">Request Changes</Link>
                </Card>
            </aside>
        </div>
    );
}

export default function Scope(props: Props) {
    if (props.engagement) {
        return (
            <TechPortal e={props.engagement} title="Scope & Deliverables" description="Clear scope. Defined deliverables. Measurable outcomes.">
                <Head title="Scope & Deliverables" />
                <Body {...props} />
            </TechPortal>
        );
    }
    return (
        <PublicLayout>
            <Head title="Scope & Deliverables" />
            <TechJourney step={4} journey={props.journey} title="Scope & Deliverables" sub="Clear scope. Defined deliverables. Measurable outcomes.">
                <Body {...props} />
            </TechJourney>
        </PublicLayout>
    );
}

Scope.layout = null;
