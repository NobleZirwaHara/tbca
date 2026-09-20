import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { DataTable } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { Section, SectionHeading } from '@/Components/ui/Section';

interface Props {
    pillars: { number: number; title: string; body: string; icon: string }[];
    systemsOfRecord: { object: string; system: string; rule: string }[];
    decisions: { decision: string; position: string }[];
}

export default function Governance({ pillars, systemsOfRecord, decisions }: Props) {
    return (
        <>
            <Head title="Governance" />

            <PageHeader
                title="Governance"
                lead="How We Operate With Integrity, Accountability and Care"
                intro="Our governance framework ensures we act responsibly, protect our clients and stakeholders, and continuously improve through oversight, evidence and human authority."
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'About TBCA', href: '/about' },
                    { label: 'Governance' },
                ]}
                aside={{
                    title: 'Governed. Transparent. Accountable.',
                    body: 'Every engagement is governed by our policies, professional boundaries, evidence-controlled claims and human authority.',
                    items: [
                        'Board-approved policies, reviewed regularly',
                        'Role-based, least-privilege access',
                        'Recorded decisions, approvals and changes',
                        'Public and transparent correction of material errors',
                    ],
                    icon: 'shield-check',
                    link: { label: 'Our Methodology', href: '/about/methodology' },
                }}
            />

            <Section tone="parchment">
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
                    {pillars.map((pillar) => (
                        <Card as="li" key={pillar.number} hover className="flex flex-col p-5" id={pillar.title.toLowerCase().replace(/[^a-z]+/g, '-')}>
                            <Icon name={pillar.icon} className="size-6 text-gold-600" />
                            <h2 className="mt-3.5 text-[0.9375rem] leading-snug font-semibold tracking-[-0.01em] text-ink-900">
                                {pillar.number}. {pillar.title}
                            </h2>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{pillar.body}</p>
                        </Card>
                    ))}
                </ul>
            </Section>

            <Section tone="white" id="security">
                <SectionHeading
                    title="Systems of Record"
                    lead="One authoritative system per data object."
                    body="No route may bypass the authoritative system for its record type. This is what makes evidence traceable."
                />
                <div className="mt-8">
                    <DataTable
                        columns={['Data Object', 'Authoritative System', 'Non-Negotiable Rule']}
                        rows={systemsOfRecord.map((s) => [s.object, s.system, s.rule])}
                        caption="System-of-record architecture"
                    />
                </div>
            </Section>

            <Section tone="parchment" id="privacy">
                <SectionHeading title="Architecture Decisions" lead="The positions that hold the platform together." />
                <div className="mt-8">
                    <DataTable
                        columns={['Decision', 'Required Position']}
                        rows={decisions.map((d) => [d.decision, d.position])}
                        caption="Architecture decisions"
                    />
                </div>
            </Section>

            <CtaBand
                title="Need our governance evidence for your file?"
                body="Evidence is independent, controlled and available on request."
                primary={{ label: 'Request Evidence', href: '/contact' }}
                secondary={{ label: 'View Certifications', href: '/about/certifications' }}
            />
        </>
    );
}
