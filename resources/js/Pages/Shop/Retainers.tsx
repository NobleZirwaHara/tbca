import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { BoundaryNote } from '@/Components/Blocks';

interface Desk {
    name: string;
    summary: string;
    sla: string;
    icon: string;
}

export default function Retainers({ desks }: { desks: Desk[] }) {
    return (
        <>
            <Head title="Retainers" />

            <PageHeader
                eyebrow="Sell ongoing advisory, procurement, DD and project desks"
                title="Retainers"
                lead="Standing Capacity With a Named Owner."
                intro="A retainer gives you continuing access to a defined desk: a named lead, an agreed service level, a monthly cadence and a delivery record you can audit. Capacity is reserved rather than negotiated case by case."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Retainers' }]}
                aside={{
                    title: 'What a Retainer Guarantees',
                    body: 'Reserved capacity, a named accountable lead, an agreed response time and a monthly delivery record.',
                    items: [
                        'Named lead and escalation path',
                        'Agreed service levels',
                        'Monthly reporting cadence',
                        'Auditable delivery record',
                    ],
                    icon: 'briefcase',
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Retainer Desks" lead="Choose the standing capability you need." />

                <ul className="mt-8 grid gap-5 sm:grid-cols-2">
                    {desks.map((desk) => (
                        <Card as="li" key={desk.name} hover className="flex flex-col p-6">
                            <span className="inline-flex size-11 items-center justify-center rounded-[5px] bg-ink-900 text-gold-400">
                                <Icon name={desk.icon} className="size-[18px]" />
                            </span>

                            <h3 className="mt-4 font-serif text-[1.1875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {desk.name}
                            </h3>
                            <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">{desk.summary}</p>

                            <p className="mt-5 border-t border-parchment-300 pt-4 text-[0.8125rem] text-ink-500">
                                <span className="font-semibold text-ink-900">Service level: </span>
                                {desk.sla}
                            </p>
                        </Card>
                    ))}
                </ul>

                <div className="mt-10">
                    <BoundaryNote body="Retainer work follows the same professional boundaries as all TBCA engagements. Regulated opinions and sign-off are provided by qualified professionals appointed under their own mandate." />
                </div>
            </Section>

            <CtaBand
                title="Need standing capacity rather than one-off work?"
                body="Tell us the volume, cadence and risk profile, and we will scope a desk and service level."
                primary={{ label: 'Request Proposal', href: '/contact' }}
                secondary={{ label: 'View Service Levels', href: '/contact' }}
            />
        </>
    );
}
