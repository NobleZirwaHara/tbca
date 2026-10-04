import type { ReactNode } from 'react';
import { Head, Link } from '@inertiajs/react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import DdIcon from './DdIcon';
import { Card, DdHero, NextStepBand, PriceSummary } from './Ui';
import type { DdQuotePageProps } from '@/types/due-diligence';

const LABELS: Record<string, string> = {
    inputs: 'Inputs', process: 'Process', deliverables: 'Deliverables', 'add-ons': 'Add-ons', recommendation: 'Recommendation',
    manifest: 'Fee Manifest', consent: 'Consent Gate', review: 'Order Review', checkout: 'Checkout',
};

/** Shared frame for the pre-payment quote journey (DD-018 to DD-027). */
export default function QuoteShell({
    page,
    title,
    subtitle,
    description,
    current,
    lifecycle = 'B',
    publicStage,
    children,
    aside,
    priceTitle,
    hidePrice = false,
    next,
    priceOverride,
}: {
    page: DdQuotePageProps;
    title: string;
    subtitle: string;
    description: string;
    current: number;
    lifecycle?: string;
    publicStage: string;
    children: ReactNode;
    aside?: ReactNode;
    priceTitle?: string;
    hidePrice?: boolean;
    next: string;
    priceOverride?: DdQuotePageProps['price'];
}) {
    const { quote, family, sku, price, step, steps, journey } = page;
    const base = `/due-diligence/quotes/${quote.reference}`;

    return (
        <>
            <Head title={title} />
            <DdHero
                crumbs={[{ label: 'Due Diligence', href: '/due-diligence' }, { label: family.name, href: `/due-diligence/${family.slug}` }, { label: title }]}
                title={title}
                subtitle={subtitle}
                description={description}
                chips={[
                    { label: 'Lifecycle Stage', value: lifecycle },
                    { label: 'Public Stage', value: publicStage },
                    { label: 'Case State', value: quote.caseState },
                    { label: 'Quote ID', value: quote.reference },
                ]}
                journey={journey}
                current={current}
            />

            <nav aria-label="Quote steps" className="border-b border-parchment-400 bg-white">
                <ol className="container-tbca flex gap-1 overflow-x-auto py-2">
                    {Object.entries(steps).map(([n, key]) => {
                        const num = Number(n);
                        const reached = num <= quote.step;
                        const active = key === step;
                        const cls = cn('flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium', active ? 'bg-ink-950 text-gold-300' : reached ? 'text-ink-700 hover:bg-parchment-200' : 'text-ink-300');
                        const inner = (
                            <>
                                <span className={cn('flex size-5 items-center justify-center rounded-full text-[0.625rem]', active ? 'bg-gold-500 text-ink-950' : reached ? 'bg-verified-500 text-white' : 'bg-parchment-300 text-ink-400')}>
                                    {reached && !active && num < quote.step ? <Check className="size-3" /> : num}
                                </span>
                                {LABELS[key]}
                            </>
                        );
                        return <li key={key}>{reached ? <Link href={`${base}/${key}`} className={cls} aria-current={active ? 'step' : undefined}>{inner}</Link> : <span className={cls}>{inner}</span>}</li>;
                    })}
                </ol>
            </nav>

            <section className="bg-parchment-100 py-8">
                <div className="container-tbca grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8 xl:col-span-9">{children}</div>
                    <aside className="space-y-4 lg:col-span-4 xl:col-span-3">
                        <Card title="Selected package">
                            <div className="flex items-center gap-3 rounded-[8px] border border-parchment-400 p-3">
                                <DdIcon name={family.icon} className="size-8 text-gold-700" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-ink-900">{sku.name}</p>
                                    <p className="font-mono text-xs text-ink-500">{sku.code}</p>
                                </div>
                                {quote.step <= 6 && (
                                    <Link href={`/due-diligence/pricing?family=${family.slug}&sku=${sku.code}`} className="rounded border border-parchment-400 px-2 py-0.5 text-[0.6875rem] hover:border-gold-500">Change</Link>
                                )}
                            </div>
                        </Card>
                        {!hidePrice && <Card><PriceSummary price={priceOverride ?? price} title={priceTitle} /></Card>}
                        {aside}
                    </aside>
                </div>
            </section>

            <NextStepBand trust items={[{ icon: 'Target', title: 'Next step', body: next }, { icon: 'Headphones', title: 'Need guidance?', body: 'Speak to a Due Diligence Specialist for tailored advice.' }]} />
        </>
    );
}
