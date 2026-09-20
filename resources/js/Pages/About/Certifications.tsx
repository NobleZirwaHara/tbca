import { Head } from '@inertiajs/react';
import { Info } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { DefinitionRows } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import LedgerChip from '@/Components/ui/LedgerChip';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import type { LedgerCode } from '@/types';

interface Certification {
    name: string;
    subtitle: string;
    class: LedgerCode;
    icon: string;
    rows: { label: string; value: string }[];
    action: { label: string; href: string };
}

const ACTION_TONE: Record<LedgerCode, string> = {
    V: 'border-verified-500/50 text-verified-700 hover:bg-verified-50',
    A: 'border-attested-500/50 text-attested-700 hover:bg-attested-50',
    R: 'border-referenced-500/50 text-referenced-700 hover:bg-referenced-50',
    G: 'border-controlled-500/50 text-controlled-700 hover:bg-controlled-50',
};

const ROW_ICONS = ['scan-face', 'compass', 'history', 'file-check'];

export default function Certifications({
    certifications,
    disclosure,
    ledgerClasses,
}: {
    certifications: Certification[];
    disclosure: string;
    ledgerClasses: Record<string, { key: string; label: string; short: string }>;
}) {
    return (
        <>
            <Head title="Certifications & Verifications" />

            <PageHeader
                title="Certifications & Verifications"
                lead="Evidence-Backed Trust. Transparent. Current. Verifiable."
                intro="Our certifications, attestations and registrations reflect our commitment to global standards, African values and accountable delivery."
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'About TBCA', href: '/about' },
                    { label: 'Certifications & Verifications' },
                ]}
                aside={{
                    title: 'Evidence Classes',
                    body: 'Every trust item is classified by evidence class. We show how each claim is verified, attested or referenced.',
                    items: Object.values(ledgerClasses).map((entry) => entry.label),
                    icon: 'shield-check',
                }}
            />

            <Section tone="parchment">
                <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {certifications.map((certification) => (
                        <Card as="li" key={certification.name} hover className="flex flex-col p-6">
                            <div className="flex items-start justify-between gap-3">
                                <Icon name={certification.icon} className="size-8 text-gold-600" strokeWidth={1.3} />
                                <LedgerChip code={certification.class} />
                            </div>

                            <h2 className="mt-5 font-serif text-[1.125rem] leading-snug font-semibold tracking-[-0.01em] text-ink-900">
                                {certification.name}
                            </h2>
                            <p className="mt-1 text-[0.8125rem] leading-snug text-ink-500">{certification.subtitle}</p>

                            <div className="mt-5 border-t border-parchment-300 pt-4">
                                <DefinitionRows
                                    rows={certification.rows.map((row, index) => ({
                                        ...row,
                                        icon: ROW_ICONS[index % ROW_ICONS.length],
                                    }))}
                                />
                            </div>

                            <ButtonLink
                                href={certification.action.href}
                                variant="outline"
                                size="sm"
                                className={`mt-5 w-full ${ACTION_TONE[certification.class]}`}
                                trailingIcon="arrow-right"
                            >
                                {certification.action.label}
                            </ButtonLink>
                        </Card>
                    ))}
                </ul>

                <div className="mt-8 flex flex-col gap-5 rounded-[6px] border border-parchment-400 bg-white p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex gap-4">
                        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-ink-900 text-parchment-100">
                            <Info className="size-5" aria-hidden="true" />
                        </span>
                        <div>
                            <h2 className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-ink-900">
                                Important Disclosure
                            </h2>
                            <p className="mt-1.5 max-w-3xl text-[0.875rem] leading-relaxed text-ink-600">
                                {disclosure}
                            </p>
                        </div>
                    </div>

                    <ButtonLink href="/about/governance" variant="gold" trailingIcon="arrow-right" className="shrink-0">
                        More on Our Governance
                    </ButtonLink>
                </div>
            </Section>

            <CtaBand
                title="Need evidence for a procurement or onboarding file?"
                body="Evidence is independent, controlled and available on request. Tell us what your process requires."
                primary={{ label: 'Request Evidence', href: '/contact' }}
                secondary={{ label: 'View Governance', href: '/about/governance' }}
            />
        </>
    );
}
