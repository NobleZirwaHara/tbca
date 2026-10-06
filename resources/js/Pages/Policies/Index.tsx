import { Head, Link } from '@inertiajs/react';
import { ArrowRight, FileText } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';

export interface PolicySummary {
    slug: string;
    title: string;
    href: string;
    group: string;
    summary: string;
    status: string;
}

export default function PoliciesIndex({ policies, groups }: { policies: PolicySummary[]; groups: string[] }) {
    return (
        <>
            <Head title="Policies" />
            <PageHeader
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Policies' }]}
                eyebrow="Policies"
                title="Platform Policies"
                lead="Every policy that governs TBCA, in one place."
                intro="Read how we handle your data, payments, refunds and the use of our platforms. Policies marked as draft are pending client approval and may change before they take effect."
                aside={{
                    title: 'Questions about a policy?',
                    body: 'Email Consult@thebusinessclinic.africa and we will route your question to the right functional lead.',
                    icon: 'file-text',
                    link: { label: 'Contact TBCA', href: '/contact' },
                }}
            />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca space-y-8">
                    {groups.map((g) => {
                        const items = policies.filter((p) => p.group === g);
                        if (!items.length) return null;
                        return (
                            <div key={g}>
                                <h2 className="text-[1.125rem] font-semibold text-ink-900">{g}</h2>
                                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                    {items.map((p) => (
                                        <li key={p.slug}>
                                            <Link href={p.href} className="group flex h-full flex-col rounded-[8px] border border-parchment-400 bg-white p-5 hover:border-gold-500">
                                                <span className="flex items-start gap-3">
                                                    <FileText className="mt-0.5 size-5 shrink-0 text-gold-700" aria-hidden="true" />
                                                    <span className="text-[0.9375rem] font-semibold text-ink-900">{p.title}</span>
                                                </span>
                                                <span className="mt-2 text-[0.8125rem] text-ink-600">{p.summary}</span>
                                                <span className="mt-auto flex items-center justify-between gap-2 pt-4">
                                                    <StatusPill status={p.status} />
                                                    <ArrowRight className="size-4 text-gold-700 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </section>
        </>
    );
}

export function StatusPill({ status }: { status: string }) {
    const draft = status.toLowerCase().startsWith('draft');
    return (
        <span className={`rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold ${draft ? 'bg-attested-50 text-attested-700' : 'bg-verified-50 text-verified-700'}`}>
            {status}
        </span>
    );
}
