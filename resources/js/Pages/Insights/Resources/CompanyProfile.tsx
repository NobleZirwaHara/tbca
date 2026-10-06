import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CircleCheck, Clock, Download, MapPin } from 'lucide-react';
import PageHeader from '@/Components/PageHeader';
import type { Office } from '@/types/core-pages';

interface Props {
    identity: { statement: string; purpose: string; mission: string; story_intro: string };
    facts: { label: string; value: string }[];
    differentiators: { title: string; body: string }[];
    limitations: { title: string; body: string };
    offices: Office[];
    download: { href: string; size: string } | null;
}

export default function CompanyProfile({ identity, facts, differentiators, limitations, offices, download }: Props) {
    return (
        <>
            <Head title="Company Profile" />
            <PageHeader
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Resources', href: '/resources' }, { label: 'Company Profile' }]}
                eyebrow="Resources"
                title="Company Profile"
                lead="The Business Clinic.Africa™ at a glance."
                intro={identity.statement}
            >
                <div className="mt-7 flex flex-wrap items-center gap-3">
                    {download ? (
                        <a href={download.href} className="inline-flex h-11 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            <Download className="size-4" aria-hidden="true" /> Download Company Profile (PDF, {download.size})
                        </a>
                    ) : (
                        <span className="inline-flex h-11 cursor-not-allowed items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-5 text-sm font-semibold text-ink-500" aria-disabled="true">
                            <Clock className="size-4" aria-hidden="true" /> Download available soon
                        </span>
                    )}
                    <Link href="/contact" className="inline-flex h-11 items-center gap-2 rounded-[4px] border border-gold-600 px-5 text-sm text-ink-800 hover:text-gold-700">
                        Contact TBCA <ArrowRight className="size-4" aria-hidden="true" />
                    </Link>
                </div>
            </PageHeader>

            <section className="bg-parchment-100 py-10">
                <div className="container-tbca space-y-8">
                    <div className="grid gap-4 md:grid-cols-3">
                        {[
                            ['Who we are', identity.story_intro],
                            ['Our purpose', identity.purpose],
                            ['Our mission', identity.mission],
                        ].map(([t, b]) => (
                            <article key={t} className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                <h2 className="text-[1rem] font-semibold text-ink-900">{t}</h2>
                                <p className="mt-2 text-[0.875rem] leading-relaxed text-ink-600">{b}</p>
                            </article>
                        ))}
                    </div>

                    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        {facts.map((f) => (
                            <div key={f.label} className="rounded-[8px] border border-gold-300 bg-gold-50/60 p-4">
                                <dt className="text-[0.6875rem] font-semibold tracking-wide text-gold-700 uppercase">{f.label}</dt>
                                <dd className="mt-1 text-[0.9375rem] font-semibold text-ink-900">{f.value}</dd>
                            </div>
                        ))}
                    </dl>

                    <div>
                        <h2 className="text-[1.125rem] font-semibold text-ink-900">What sets TBCA apart</h2>
                        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                            {differentiators.map((d) => (
                                <li key={d.title} className="flex gap-2.5 rounded-[8px] border border-parchment-400 bg-white p-4">
                                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-gold-700" aria-hidden="true" />
                                    <span className="text-[0.8125rem]">
                                        <span className="block font-semibold text-ink-900">{d.title}</span>
                                        <span className="text-ink-600">{d.body}</span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h2 className="text-[1.125rem] font-semibold text-ink-900">Our offices</h2>
                        <ul className="mt-3 flex flex-wrap gap-2">
                            {offices.map((o) => (
                                <li key={o.slug} className="inline-flex items-center gap-1.5 rounded-full border border-parchment-400 bg-white px-3 py-1 text-[0.8125rem] text-ink-700">
                                    <MapPin className="size-3.5 text-gold-700" aria-hidden="true" />
                                    {o.city}, {o.country}
                                    {o.kind === 'head' && <span className="font-semibold text-gold-700">· Head Office</span>}
                                </li>
                            ))}
                        </ul>
                        <Link href="/contact#offices" className="mt-3 inline-flex items-center gap-1 text-[0.8125rem] font-semibold text-gold-700 hover:underline">
                            Addresses and maps <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    </div>

                    <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                        <h2 className="text-[0.9375rem] font-semibold text-ink-900">{limitations.title}</h2>
                        <p className="mt-1.5 text-[0.8125rem] text-ink-600">{limitations.body}</p>
                    </div>
                </div>
            </section>
        </>
    );
}
