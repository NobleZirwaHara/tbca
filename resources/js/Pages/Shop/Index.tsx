import { useMemo, useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import SprintCard from '@/Components/SprintCard';
import { Section, SectionHeading } from '@/Components/ui/Section';
import { cn } from '@/lib/cn';
import type { SharedProps, Sprint } from '@/types';

export default function ShopIndex({ sprints }: { sprints: Sprint[]; categories: Record<string, number> }) {
    const { context } = usePage<SharedProps>().props;
    const [active, setActive] = useState<string>('All');

    const categories = useMemo(
        () => ['All', ...Array.from(new Set(sprints.map((s) => s.category)))],
        [sprints],
    );

    const visible = active === 'All' ? sprints : sprints.filter((s) => s.category === active);

    return (
        <>
            <Head title="Online Shop" />

            <PageHeader
                eyebrow="Sell Sprints, products, subscriptions and retainers"
                title="Online Shop"
                lead="Fixed Scope. Fixed Price. Bankable Output."
                intro="Every Sprint is a governed product with a defined scope, turnaround, named delivery owner and quality gate. You buy it like a product and receive it through the client portal."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Online Shop' }]}
                aside={{
                    title: 'What Every Sprint Includes',
                    body: 'One product code maps across page, commerce, CRM, finance, portal and delivery. Nothing is delivered outside the controlled architecture.',
                    items: [
                        'Defined scope, inputs and turnaround',
                        'Named delivery owner and service level',
                        'Human review before release',
                        'Portal delivery with version history',
                    ],
                    icon: 'shopping-bag',
                }}
            />

            <Section tone="parchment">
                <div className="flex flex-wrap items-end justify-between gap-5">
                    <SectionHeading title="Sprint Catalogue" lead={`${sprints.length} governed products`} />

                    <div className="flex flex-wrap gap-2">
                        {categories.map((category) => (
                            <button
                                key={category}
                                type="button"
                                onClick={() => setActive(category)}
                                className={cn(
                                    'h-9 rounded-[4px] border px-3.5 text-[0.8125rem] font-medium transition-colors',
                                    active === category
                                        ? 'border-gold-500 bg-gold-500 text-ink-900'
                                        : 'border-parchment-400 bg-white text-ink-600 hover:border-gold-300 hover:text-ink-900',
                                )}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {visible.map((sprint) => (
                        <li key={sprint.code}>
                            <SprintCard sprint={sprint} currency={context.currency} />
                        </li>
                    ))}
                </ul>
            </Section>

            <CtaBand
                title="Not sure which Sprint fits?"
                body="Run the Business Health Score and receive a recommended Sprint sequence based on your highest-priority gaps."
                primary={{ label: 'Start Diagnostic', href: '/diagnostics' }}
                secondary={{ label: 'Request Quote', href: '/contact' }}
            />
        </>
    );
}
