import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import { BoundaryNote } from '@/Components/Blocks';
import Card from '@/Components/ui/Card';
import { Button } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';
import type { SharedProps } from '@/types';

interface Sku {
    sku: string;
    name: string;
    family: string;
    checks: string;
    review_rule: string;
    zar: number | null;
    usd: number | null;
    turnaround: string;
}

interface Props {
    positioning: { trust_line: string; boundary: string; intro: string };
    skus: Sku[];
    controls: { control: string; requirement: string }[];
    workflow: { step: number; event: string; action: string }[];
}

const PURPOSES = [
    'Supplier or vendor onboarding',
    'Investor or project sponsor assessment',
    'Employment or director appointment',
    'Procurement or tender evaluation',
    'Transaction counterparty assessment',
    'Regulatory or compliance onboarding',
];

export default function DueDiligenceStart({ positioning, skus, controls }: Props) {
    const { context } = usePage<SharedProps>().props;
    const [selectedSku, setSelectedSku] = useState<string>(skus[0]?.sku ?? '');
    const [purpose, setPurpose] = useState<string>('');
    const [consent, setConsent] = useState({ processing: false, purpose: false, limitations: false });

    const allConsented = consent.processing && consent.purpose && consent.limitations;
    const ready = allConsented && purpose !== '' && selectedSku !== '';

    return (
        <>
            <Head title="Start a Due Diligence Case" />

            <PageHeader
                eyebrow="Consent gate"
                title="Start a Due Diligence Case"
                lead={positioning.trust_line}
                intro="A case cannot proceed to verification without a selected product, a stated permitted purpose and recorded consent. This page is the consent gate."
                crumbs={[
                    { label: 'Home', href: '/' },
                    { label: 'Due Diligence', href: '/due-diligence' },
                    { label: 'Start a Case' },
                ]}
                aside={{
                    title: 'What Happens After Consent',
                    body: 'Payment or approved credit activates the case, the portal opens the correct intake and a delivery task and document folder are created.',
                    items: [
                        'Consent record linked to client and case',
                        'Case activation on payment or approved credit',
                        'Intake and evidence request opened',
                        'Vendor checks run only on validated intake',
                    ],
                    icon: 'shield-check',
                }}
            />

            <Section tone="parchment">
                <div className="grid gap-8 lg:grid-cols-12 lg:gap-10">
                    <div className="lg:col-span-7">
                        {/* Step 1 */}
                        <Card className="p-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-8 items-center justify-center rounded-full border border-gold-400 font-serif text-[0.8125rem] font-semibold text-gold-700">
                                    1
                                </span>
                                <h2 className="text-[1rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    Select the product
                                </h2>
                            </div>

                            <ul className="mt-5 space-y-2">
                                {skus.map((sku) => (
                                    <li key={sku.sku}>
                                        <button
                                            type="button"
                                            onClick={() => setSelectedSku(sku.sku)}
                                            className={cn(
                                                'flex w-full items-start gap-3 rounded-[5px] border p-3.5 text-left transition-colors',
                                                selectedSku === sku.sku
                                                    ? 'border-gold-500 bg-gold-50/60'
                                                    : 'border-parchment-400 hover:border-gold-300 hover:bg-parchment-100',
                                            )}
                                            aria-pressed={selectedSku === sku.sku}
                                        >
                                            <span
                                                className={cn(
                                                    'mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full border',
                                                    selectedSku === sku.sku
                                                        ? 'border-gold-600 bg-gold-500'
                                                        : 'border-parchment-500',
                                                )}
                                                aria-hidden="true"
                                            >
                                                {selectedSku === sku.sku && (
                                                    <Check className="size-2.5 text-ink-900" strokeWidth={3} />
                                                )}
                                            </span>

                                            <span className="min-w-0 flex-1">
                                                <span className="flex flex-wrap items-baseline justify-between gap-2">
                                                    <span className="text-[0.875rem] font-semibold text-ink-900">
                                                        {sku.name}
                                                    </span>
                                                    <span className="text-[0.8125rem] font-semibold text-gold-700">
                                                        {sku.zar === null
                                                            ? 'On application'
                                                            : context.currency === 'USD'
                                                              ? `USD ${sku.usd?.toLocaleString()}`
                                                              : `ZAR ${sku.zar.toLocaleString()}`}
                                                    </span>
                                                </span>
                                                <span className="mt-1 block text-[0.75rem] leading-relaxed text-ink-600">
                                                    {sku.checks}
                                                </span>
                                                <span className="mt-1.5 block text-[0.6875rem] text-ink-500">
                                                    {sku.turnaround} · Human review: {sku.review_rule}
                                                </span>
                                            </span>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </Card>

                        {/* Step 2 */}
                        <Card className="mt-5 p-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-8 items-center justify-center rounded-full border border-gold-400 font-serif text-[0.8125rem] font-semibold text-gold-700">
                                    2
                                </span>
                                <h2 className="text-[1rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    State the permitted purpose
                                </h2>
                            </div>

                            <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-600">
                                Purpose limitation applies. We collect and process only what the stated purpose requires.
                            </p>

                            <div className="mt-4 grid gap-2 sm:grid-cols-2">
                                {PURPOSES.map((item) => (
                                    <button
                                        key={item}
                                        type="button"
                                        onClick={() => setPurpose(item)}
                                        className={cn(
                                            'rounded-[5px] border px-3.5 py-2.5 text-left text-[0.8125rem] transition-colors',
                                            purpose === item
                                                ? 'border-gold-500 bg-gold-50/60 font-semibold text-ink-900'
                                                : 'border-parchment-400 text-ink-600 hover:border-gold-300 hover:bg-parchment-100',
                                        )}
                                        aria-pressed={purpose === item}
                                    >
                                        {item}
                                    </button>
                                ))}
                            </div>
                        </Card>

                        {/* Step 3 */}
                        <Card className="mt-5 p-6">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex size-8 items-center justify-center rounded-full border border-gold-400 font-serif text-[0.8125rem] font-semibold text-gold-700">
                                    3
                                </span>
                                <h2 className="text-[1rem] font-semibold tracking-[-0.01em] text-ink-900">
                                    Record consent
                                </h2>
                            </div>

                            <ul className="mt-5 space-y-3">
                                {[
                                    {
                                        key: 'processing' as const,
                                        label: 'I consent to the processing of personal and company data for this due diligence purpose, including disclosure to approved verification vendors.',
                                    },
                                    {
                                        key: 'purpose' as const,
                                        label: 'I confirm the stated purpose is lawful and that I am authorised to request this check on the named subject.',
                                    },
                                    {
                                        key: 'limitations' as const,
                                        label: 'I have read the service limitations and understand this is risk screening and decision preparation, not regulated professional advice.',
                                    },
                                ].map((item) => (
                                    <li key={item.key}>
                                        <label className="flex cursor-pointer gap-3 rounded-[5px] border border-parchment-400 p-3.5 transition-colors hover:bg-parchment-100">
                                            <input
                                                type="checkbox"
                                                checked={consent[item.key]}
                                                onChange={(event) =>
                                                    setConsent((state) => ({ ...state, [item.key]: event.target.checked }))
                                                }
                                                className="mt-0.5 size-4 shrink-0 accent-[var(--color-gold-500)]"
                                            />
                                            <span className="text-[0.8125rem] leading-relaxed text-ink-700">
                                                {item.label}
                                            </span>
                                        </label>
                                    </li>
                                ))}
                            </ul>

                            <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-parchment-300 pt-5">
                                <Button variant="gold" size="lg" disabled={!ready} trailingIcon="arrow-right">
                                    Continue to Checkout
                                </Button>
                                <p className="text-[0.75rem] text-ink-500">
                                    {ready
                                        ? 'Consent recorded. Checkout will activate the case and open intake.'
                                        : 'Select a product, state a purpose and record all three consents to continue.'}
                                </p>
                            </div>
                        </Card>
                    </div>

                    <div className="lg:col-span-5">
                        <SectionHeading title="Controls on Your Data" />
                        <ul className="mt-6 space-y-2.5">
                            {controls.map((control) => (
                                <Card as="li" key={control.control} className="p-4">
                                    <p className="text-[0.8125rem] font-semibold text-ink-900">{control.control}</p>
                                    <p className="mt-1 text-[0.75rem] leading-relaxed text-ink-600">
                                        {control.requirement}
                                    </p>
                                </Card>
                            ))}
                        </ul>

                        <div className="mt-6">
                            <BoundaryNote body={positioning.boundary} />
                        </div>
                    </div>
                </div>
            </Section>

            <CtaBand
                title="Not sure which check you need?"
                body="Tell us the subject, the decision you are making and the standard you must meet, and we will scope it."
                primary={{ label: 'Talk to TBCA', href: '/contact' }}
                secondary={{ label: 'View All Families', href: '/due-diligence' }}
            />
        </>
    );
}
