import { Head, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { ButtonLink } from '@/Components/ui/Button';
import { Section, SectionHeading } from '@/Components/ui/Section';
import type { SharedProps } from '@/types';

interface Product {
    name: string;
    type: string;
    zar: number;
    usd: number;
    summary: string;
    icon: string;
}

export default function DigitalProducts({ products }: { products: Product[] }) {
    const { context } = usePage<SharedProps>().props;

    return (
        <>
            <Head title="Digital Products" />

            <PageHeader
                eyebrow="Sell toolkits, reports, templates and courses"
                title="Digital Products"
                lead="The Working Files Behind Our Engagements."
                intro="Templates, toolkits, guides and courses drawn from real delivery work. Each product carries an owner, a version and a review cycle, and maps to the Sprint that applies it in full."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Digital Products' }]}
                aside={{
                    title: 'Product Governance',
                    body: 'Digital products are governed like any other product code: one owner, one version register, one review cycle.',
                    items: ['Named product owner', 'Version and release note', 'Defined review cycle', 'Mapped to a related Sprint'],
                    icon: 'package-search',
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Catalogue" lead="Templates, toolkits, guides and courses." />

                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {products.map((product) => (
                        <Card as="li" key={product.name} hover className="flex flex-col p-5">
                            <div className="flex items-start justify-between gap-3">
                                <span className="inline-flex size-11 items-center justify-center rounded-[5px] bg-ink-900 text-gold-400">
                                    <Icon name={product.icon} className="size-[18px]" />
                                </span>
                                <span className="rounded-[3px] border border-parchment-400 px-2 py-1 text-[0.6875rem] font-semibold uppercase tracking-[0.06em] text-ink-500">
                                    {product.type}
                                </span>
                            </div>

                            <h3 className="mt-4 text-[0.9375rem] leading-snug font-semibold tracking-[-0.01em] text-ink-900">
                                {product.name}
                            </h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{product.summary}</p>

                            <div className="mt-auto flex items-center justify-between gap-3 border-t border-parchment-300 pt-4 mt-5">
                                <span className="text-[0.875rem] font-semibold text-gold-700">
                                    {context.currency === 'USD'
                                        ? `USD ${product.usd.toLocaleString()}`
                                        : `ZAR ${product.zar.toLocaleString()}`}
                                </span>
                                <ButtonLink href="/contact" variant="outline" size="sm">
                                    Add to Order
                                </ButtonLink>
                            </div>
                        </Card>
                    ))}
                </ul>
            </Section>

            <CtaBand
                title="Want the template applied, not just downloaded?"
                body="Every digital product maps to a Sprint where our team applies it to your business and a reviewer signs it off."
                primary={{ label: 'View Related Sprints', href: '/shop' }}
                secondary={{ label: 'Talk to TBCA', href: '/contact' }}
            />
        </>
    );
}
