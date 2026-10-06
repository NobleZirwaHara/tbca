import { Head, Link } from '@inertiajs/react';
import { AlertTriangle, ChevronRight } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import { StatusPill, type PolicySummary } from './Index';

interface Policy {
    slug: string;
    title: string;
    summary: string;
    status: string;
    updated: string;
    contact: string;
    sections: [string, string[]][];
}

export default function PolicyShow({ policy, related }: { policy: Policy; related: PolicySummary[] }) {
    return (
        <>
            <Head title={policy.title} />
            <PageHeader crumbs={[{ label: 'Home', href: '/' }, { label: 'Policies', href: '/policies' }, { label: policy.title }]} eyebrow="Policies" title={policy.title} intro={policy.summary} />
            <section className="bg-parchment-100 py-10">
                <div className="container-tbca grid gap-6 lg:grid-cols-[1fr_20rem]">
                    <article className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-6">
                        <div className="flex items-start gap-3 rounded-[6px] border border-attested-500/30 bg-attested-50 p-4" role="note">
                            <AlertTriangle className="size-5 shrink-0 text-attested-700" aria-hidden="true" />
                            <div className="text-[0.8125rem] text-ink-700">
                                <StatusPill status={policy.status} />
                                <p className="mt-1.5">This is placeholder wording based on how the platform currently works. It is not yet in force and will be replaced by the approved policy.</p>
                            </div>
                        </div>
                        <div className="mt-6 space-y-6">
                            {policy.sections.map(([heading, paras], i) => (
                                <section key={heading}>
                                    <h2 className="text-[1.0625rem] font-semibold text-ink-900">
                                        {i + 1}. {heading}
                                    </h2>
                                    {paras.length > 1 ? (
                                        <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[0.875rem] leading-relaxed text-ink-700">
                                            {paras.map((p) => (
                                                <li key={p}>{p}</li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-700">{paras[0]}</p>
                                    )}
                                </section>
                            ))}
                        </div>
                        <p className="mt-8 border-t border-parchment-300 pt-4 text-xs text-ink-500">
                            Draft prepared {policy.updated}. Questions: <a href={`mailto:${policy.contact}`} className="text-gold-700 underline">{policy.contact}</a>
                        </p>
                    </article>
                    <aside>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                            <h2 className="font-semibold text-ink-900">Other Policies</h2>
                            <ul className="mt-2 divide-y divide-parchment-300">
                                {related.map((r) => (
                                    <li key={r.slug}>
                                        <Link href={r.href} className="flex items-center justify-between gap-2 py-2 text-[0.8125rem] text-ink-800 hover:text-gold-700">
                                            {r.title} <ChevronRight className="size-4 shrink-0" aria-hidden="true" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <Link href="/policies" className="mt-3 inline-block text-[0.8125rem] font-semibold text-gold-700 hover:underline">All policies</Link>
                        </div>
                    </aside>
                </div>
            </section>
        </>
    );
}
