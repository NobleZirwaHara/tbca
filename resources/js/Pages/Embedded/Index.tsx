import { Head, Link } from '@inertiajs/react';
import EmbeddedServices, { type EmbeddedSection } from '@/Components/Embedded/EmbeddedServices';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { cn } from '@/lib/cn';

interface Props {
    section: EmbeddedSection | null;
    modules: { key: string; label: string; count: number; href: string }[];
    total: number;
}

export default function EmbeddedIndex({ section, modules, total }: Props) {
    const heading = section ? `${section.label}: Embedded Services` : 'Embedded Services';

    return (
        <>
            <Head title={heading} />
            <div className="container-tbca pt-8">
                <Breadcrumbs
                    items={[
                        { label: 'Home', href: '/' },
                        { label: 'Embedded Services', href: '/embedded-services' },
                        ...(section ? [{ label: section.label }] : []),
                    ]}
                />
                <h1 className="text-[2rem] font-semibold text-ink-900">{heading}</h1>
                <p className="mt-2 max-w-3xl text-[0.9375rem] text-ink-600">
                    {total} fixed-price services that run inside TBCA modules. Each sells as Basic, Standard or Premium (prices excluding VAT) and is delivered through the Client Portal.
                </p>
                <nav aria-label="Host modules" className="mt-6 flex flex-wrap gap-2">
                    {modules.map((m) => (
                        <Link
                            key={m.key}
                            href={m.href}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-[0.8125rem]',
                                section?.module === m.key ? 'border-ink-900 bg-ink-900 text-parchment-100' : 'border-parchment-400 bg-white text-ink-700 hover:border-gold-500',
                            )}
                        >
                            {m.label} <span className="text-[0.75rem] opacity-70">{m.count}</span>
                        </Link>
                    ))}
                </nav>
            </div>
            {section ? (
                <EmbeddedServices section={section} title={`${section.total} services`} pageSize={24} showViewAll={false} />
            ) : (
                <p className="container-tbca py-10 text-sm text-ink-600">Choose a module above to see its embedded services.</p>
            )}
        </>
    );
}
