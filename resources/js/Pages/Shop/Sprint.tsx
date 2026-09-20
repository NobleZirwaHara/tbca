import { Head, usePage } from '@inertiajs/react';
import { Clock, UserCheck } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import SprintCard from '@/Components/SprintCard';
import { BoundaryNote, StepFlow } from '@/Components/Blocks';
import { ButtonLink } from '@/Components/ui/Button';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import LedgerChip from '@/Components/ui/LedgerChip';
import { Section, SectionHeading } from '@/Components/ui/Section';
import type { SharedProps, Sprint } from '@/types';

const delivery = [
    { step: 1, title: 'Order', body: 'Checkout creates an order, invoice and entitlement.' },
    { step: 2, title: 'Intake', body: 'The portal opens the correct intake and document request.' },
    { step: 3, title: 'Build', body: 'Analysts and AI tools produce the deliverable under scope.' },
    { step: 4, title: 'Review', body: 'A qualified reviewer applies the quality gate before release.' },
    { step: 5, title: 'Deliver', body: 'The approved version is delivered in your portal.' },
];

export default function SprintPage({ sprint, related }: { sprint: Sprint; related: Sprint[] }) {
    const { context } = usePage<SharedProps>().props;
    const price = context.currency === 'USD' ? `USD ${sprint.usd.toLocaleString()}` : `ZAR ${sprint.zar.toLocaleString()}`;

    return (
        <>
            <Head title={sprint.name} />

            <PageHeader
                eyebrow={sprint.category}
                title={sprint.name}
                lead={sprint.summary}
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Online Shop', href: '/shop' },
                    { label: sprint.name },
                ]}
                aside={{
                    title: `From ${price}`,
                    body: `Product code ${sprint.code}. Turnaround ${sprint.turnaround}. ${sprint.review} before release.`,
                    items: [
                        'Fixed scope and defined inputs',
                        'Named delivery owner and service level',
                        'Quality gate before portal delivery',
                        'Both ZAR and USD accepted',
                    ],
                    icon: 'receipt',
                }}
            >
                <div className="mt-7 flex flex-wrap items-center gap-3">
                    <ButtonLink href="/contact" variant="gold" size="lg" trailingIcon="arrow-right">
                        Start This Sprint
                    </ButtonLink>
                    <ButtonLink href="/contact" variant="outline" size="lg">
                        Request Quote
                    </ButtonLink>
                    <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-500">
                        <Clock className="size-4 text-ink-400" aria-hidden="true" />
                        {sprint.turnaround}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-[0.8125rem] text-ink-500">
                        <UserCheck className="size-4 text-ink-400" aria-hidden="true" />
                        {sprint.review}
                    </span>
                </div>
            </PageHeader>

            <Section tone="parchment">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
                    <div className="lg:col-span-7">
                        <SectionHeading title="What You Receive" />
                        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
                            {sprint.outputs.map((output) => (
                                <Card as="li" key={output} className="flex items-start gap-3 p-4">
                                    <Icon name="file-text" className="mt-0.5 size-5 shrink-0 text-gold-600" />
                                    <span className="text-[0.875rem] leading-relaxed font-medium text-ink-900">
                                        {output}
                                    </span>
                                </Card>
                            ))}
                        </ul>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionHeading title="Controls on This Product" />
                        <div className="mt-6 space-y-3">
                            <Card className="flex items-start justify-between gap-4 p-4">
                                <div>
                                    <p className="text-[0.875rem] font-semibold text-ink-900">Human review</p>
                                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">
                                        A qualified reviewer approves the output before it reaches your portal.
                                    </p>
                                </div>
                                <LedgerChip code="V" full={false} />
                            </Card>
                            <Card className="flex items-start justify-between gap-4 p-4">
                                <div>
                                    <p className="text-[0.875rem] font-semibold text-ink-900">AI assistance boundary</p>
                                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">
                                        AI assists with analysis and drafting within defined boundaries. It does not make
                                        independent approvals.
                                    </p>
                                </div>
                                <LedgerChip code="G" full={false} />
                            </Card>
                            <Card className="flex items-start justify-between gap-4 p-4">
                                <div>
                                    <p className="text-[0.875rem] font-semibold text-ink-900">Delivery record</p>
                                    <p className="mt-1 text-[0.8125rem] leading-relaxed text-ink-600">
                                        Every paid Sprint creates a delivery task, milestone and document folder.
                                    </p>
                                </div>
                                <LedgerChip code="A" full={false} />
                            </Card>
                        </div>
                    </div>
                </div>
            </Section>

            <Section tone="white">
                <SectionHeading title="How Delivery Runs" lead="Order to portal delivery." />
                <div className="mt-8">
                    <StepFlow steps={delivery} />
                </div>

                <div className="mt-10">
                    <BoundaryNote body="This Sprint supports decision preparation. It does not constitute legal, tax, audit, credit or regulated professional advice. Where licensed professional authority is required, TBCA prepares the review pack and refers the matter to a qualified professional." />
                </div>
            </Section>

            {related.length > 0 && (
                <Section tone="parchment">
                    <SectionHeading title="Related Sprints" lead={sprint.category} />
                    <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                        {related.map((item) => (
                            <li key={item.code}>
                                <SprintCard sprint={item} currency={context.currency} />
                            </li>
                        ))}
                    </ul>
                </Section>
            )}

            <CtaBand
                title={`Ready to start the ${sprint.name}?`}
                body="Checkout creates your order, opens intake and assigns a named delivery owner."
                primary={{ label: 'Start This Sprint', href: '/contact' }}
                secondary={{ label: 'Talk to TBCA', href: '/contact' }}
            />
        </>
    );
}
