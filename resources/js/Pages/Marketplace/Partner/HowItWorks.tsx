import { Head } from '@inertiajs/react';
import { FileCheck, Scale, ShieldCheck, Users } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button, ButtonLink } from '@/Components/ui/Button';
import { openAskQuestion } from '@/Components/AskQuestion';
import { PIcon } from '@/Components/Marketplace/PartnerKit';

interface Props {
    arrangements: { code: string; title: string; lead: string; icon: string; rows: [string, string][] }[];
    process: { title: string; body: string }[];
}

export default function HowItWorks({ arrangements, process }: Props) {
    return (
        <div className="bg-parchment-100">
            <Head title="How Partner Engagements Work" />
            <div className="container-tbca py-8 md:py-10">
                <Breadcrumbs items={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'How Partner Engagements Work' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="lg:col-span-7">
                        <h1 className="font-serif text-3xl font-bold text-ink-900 md:text-[2.5rem]">How Partner Engagements Work</h1>
                        <p className="mt-2 text-lg text-gold-700">Three approved engagement arrangements. One permission-controlled process.</p>
                        <p className="mt-3 text-sm leading-relaxed text-ink-600">
                            Partner Services connects you with qualified professional firms and experts where regulated permission, professional authority, or specialist skills are required. We follow a
                            structured, gate-controlled process that protects you, your project and all parties.
                        </p>
                    </div>
                    <div className="rounded-[8px] border border-gold-400/60 bg-white p-5 lg:col-span-5">
                        <p className="flex items-center gap-2 font-semibold text-ink-900"><ShieldCheck className="size-5 text-gold-600" aria-hidden="true" />Permission First. Always.</p>
                        <p className="mt-2 text-[0.8125rem] text-ink-600">
                            Partner Services is a permission vehicle, not a freelancer directory. Every engagement is governed by professional boundaries, jurisdictional rules and conflict clearance before any work or payment can proceed.
                        </p>
                    </div>
                </div>

                <div className="mt-8 grid gap-6 lg:grid-cols-12">
                    <section className="lg:col-span-9">
                        <h2 className="mb-4 text-sm font-bold tracking-wide text-ink-900 uppercase">The Three Engagement Arrangements</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {arrangements.map((a) => (
                                <article key={a.code} className="rounded-[8px] border border-parchment-400 bg-white p-5">
                                    <div className="flex items-start gap-3">
                                        <span className="rounded-[4px] bg-gold-600 px-2 py-1 text-sm font-bold text-white">{a.code}</span>
                                        <PIcon name={a.icon} className="size-8 text-gold-600" />
                                        <div>
                                            <h3 className="font-semibold text-ink-900">{a.title}</h3>
                                            <p className="text-xs text-ink-500">{a.lead}</p>
                                        </div>
                                    </div>
                                    <dl className="mt-4 space-y-3 border-t border-parchment-300 pt-4">
                                        {a.rows.map(([k, v]) => (
                                            <div key={k}>
                                                <dt className="text-xs font-semibold text-ink-800">{k}</dt>
                                                <dd className="text-xs text-ink-500">{v}</dd>
                                            </div>
                                        ))}
                                    </dl>
                                </article>
                            ))}
                        </div>
                        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            {[
                                [ShieldCheck, 'Regulated Access', 'Permission-led routing across professions and jurisdictions.'],
                                [Users, 'Verified Professionals', 'Current evidence for firms and practitioners. Panel active is not matter eligible.'],
                                [Scale, 'Conflict Before Money', 'No fees, no work, no full access until conflict clearance is complete.'],
                                [FileCheck, 'Commercial Clarity', 'T/P separation with exact contracting parties and remuneration status.'],
                            ].map(([I, t, b]) => {
                                const Ico = I as typeof Scale;
                                return (
                                    <div key={t as string} className="flex gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                                        <Ico className="size-6 shrink-0 text-gold-600" aria-hidden="true" />
                                        <div><p className="text-sm font-semibold text-ink-900">{t as string}</p><p className="text-xs text-ink-500">{b as string}</p></div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                    <aside className="space-y-4 lg:col-span-3">
                        <div className="rounded-[8px] bg-ink-950 p-5 text-parchment-100">
                            <h2 className="mb-4 font-semibold text-gold-400">Our Engagement Process</h2>
                            <ol className="space-y-3">
                                {process.map((p, i) => (
                                    <li key={p.title} className="flex gap-3">
                                        <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-900">{i + 1}</span>
                                        <div><p className="text-[0.8125rem] font-semibold">{p.title}</p><p className="text-[0.6875rem] text-ink-300">{p.body}</p></div>
                                    </li>
                                ))}
                            </ol>
                            <p className="mt-4 text-xs font-semibold text-gold-400">No conflict clearance. No money. No work. No exceptions.</p>
                        </div>
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-5 text-sm">
                            <p className="font-semibold text-ink-900">Need help choosing the right arrangement?</p>
                            <p className="mt-1 text-xs text-ink-500">Speak to our team for a free guidance session.</p>
                            <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => openAskQuestion({ subject: 'Which partner arrangement fits my matter?', section: 'Partner Services' })}>Ask a Human Advisor</Button>
                            <ButtonLink href="/partner-services/choose-service" size="sm" className="mt-2 w-full">Request Partner Review</ButtonLink>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
