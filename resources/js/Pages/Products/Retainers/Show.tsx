import { Head, Link } from '@inertiajs/react';
import { AlertCircle, ArrowRight, BarChart3, CheckCircle2, Clock, FileSignature, Headphones, HelpCircle, Lock, RefreshCw, Scale, ShieldCheck, TrendingUp, UserCheck, UserRound, Users, X, BadgeCheck, MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import { PageTitle, TrustRow, CheckList } from '@/Components/Products/Shared';
import { Tag } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import type { RetService, RetServiceFull } from '@/Components/Products/Retainers/types';
import { zar } from '@/Components/Products/Retainers/ui';

const STATE_COPY: Record<string, { ok: boolean; text: string }> = {
    ELIGIBLE: { ok: true, text: 'Proposal request permitted — not an instant purchase.' },
    DRAFT_NOT_CERTIFIED: { ok: false, text: 'This Retainer has not yet passed the C1–C5 Capacity Test. Proposals are not available.' },
    C1_C5_INCOMPLETE: { ok: false, text: 'Capacity definition incomplete. Proposals are blocked.' },
    BELOW_FLOOR_BLOCKED: { ok: false, text: 'Pricing under review (below approved floor). Proposals are blocked.' },
    CAPACITY_UNKNOWN: { ok: false, text: 'Capacity not yet measured. New commitments unavailable.' },
    CAPACITY_DATA_STALE: { ok: false, text: 'Capacity data is being refreshed. New commitments temporarily unavailable.' },
    CAPACITY_CEILING_REACHED: { ok: false, text: 'Capacity ceiling reached for this adviser pool. Register interest instead.' },
};

function Card({ icon: Icon, title, children, link }: { icon: typeof Clock; title: string; children: ReactNode; link?: { href: string; label: string } }) {
    return (
        <section className="flex flex-col rounded-[8px] border border-parchment-400 bg-white p-4">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                <Icon className="size-4 text-gold-600" aria-hidden="true" />
                {title}
            </h2>
            <div className="mt-3 flex-1 text-[0.8125rem] text-ink-700">{children}</div>
            {link && (
                <Link href={link.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-gold-700 hover:underline">
                    {link.label} <ArrowRight className="size-3" aria-hidden="true" />
                </Link>
            )}
        </section>
    );
}

export default function Show({ service: s, alternatives }: { service: RetServiceFull; alternatives: RetService[] }) {
    const state = STATE_COPY[s.sale_state] ?? { ok: false, text: s.sale_state };
    const owner = s.owner ?? {};

    return (
        <>
            <Head title={s.name} />
            <PageTitle
                crumbs={[{ label: 'Home', href: '/' }, { label: 'Retainers', href: '/retainers' }, { label: s.name }]}
                title={s.name}
                chips={<Tag>Proposal Only</Tag>}
                lead={s.description ?? s.summary}
            />

            <div className="container-tbca grid gap-6 py-8 lg:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    <ul className="grid gap-3 text-xs text-ink-700 sm:grid-cols-2 xl:grid-cols-4">
                        {[
                            [Users, 'Reserved Human Capacity', 'Not Unlimited Consulting'],
                            [FileSignature, 'Proposal & Agreement Based', 'Not Instant Checkout'],
                            [AlertCircle, 'Capacity Subject to', 'C1–C5 Test'],
                            [UserRound, 'Dedicated Account Owner', '& Named Adviser'],
                        ].map(([Icon, a, b]) => {
                            const I = Icon as typeof Users;
                            return (
                                <li key={a as string} className="flex items-center gap-2">
                                    <I className="size-5 text-gold-600" aria-hidden="true" />
                                    <span>
                                        {a as string}
                                        <br />
                                        {b as string}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>

                    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        <Card icon={Clock} title="Capacity (What You Get)" link={{ href: `/retainers/${s.slug}/utilisation-economics`, label: 'Learn how hours are used' }}>
                            <p className="text-2xl font-bold text-ink-900">
                                {s.allowance_qty} {s.allowance_unit === 'HOUR' ? 'Hours' : s.allowance_unit}
                            </p>
                            <p className="text-xs text-ink-500">per calendar month</p>
                            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs">
                                <div>
                                    <dt className="text-ink-400 uppercase">Unit</dt>
                                    <dd className="font-semibold">{s.allowance_unit}</dd>
                                </div>
                                <div>
                                    <dt className="text-ink-400 uppercase">Period</dt>
                                    <dd className="font-semibold capitalize">{s.period}</dd>
                                </div>
                            </dl>
                            <p className="mt-2 text-[0.6875rem] text-ink-400 uppercase">Unit definition</p>
                            <p className="text-xs">{s.unit_definition}</p>
                        </Card>
                        <Card icon={CheckCircle2} title="Scope (Included)" link={{ href: `/retainers/${s.slug}/exclusions`, label: 'See full scope details' }}>
                            <CheckList items={s.inclusions} />
                        </Card>
                        <Card icon={X} title="Exclusions (Not Included)" link={{ href: `/retainers/${s.slug}/exclusions`, label: 'View full exclusion register' }}>
                            <ul className="space-y-2">
                                {s.exclusions.slice(0, 6).map((e) => (
                                    <li key={e.code} className="flex gap-2 text-[0.8125rem]">
                                        <X className="mt-0.5 size-3.5 shrink-0 text-risk-500" aria-hidden="true" />
                                        {e.category}
                                    </li>
                                ))}
                            </ul>
                        </Card>
                        <Card icon={UserRound} title="Capacity Owner" link={{ href: '/about', label: 'About our adviser model' }}>
                            <div className="flex items-center gap-3">
                                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-ink-700 to-ink-900 text-base font-bold text-gold-300" aria-hidden="true">
                                    {(owner.name ?? 'TBCA')
                                        .split(' ')
                                        .map((p) => p[0])
                                        .join('')
                                        .slice(0, 2)}
                                </span>
                                <div>
                                    <p className="text-[0.6875rem] text-ink-400">{s.owner_model_label}</p>
                                    <p className="font-semibold text-ink-900">{owner.name}</p>
                                    <p className="text-xs text-ink-500">
                                        {owner.title}
                                        <br />
                                        {owner.practice}
                                    </p>
                                </div>
                            </div>
                            <p className="mt-3 text-[0.6875rem] text-ink-400 uppercase">Seniority model</p>
                            <p className="text-xs font-medium">{owner.seniority}</p>
                        </Card>
                        <Card icon={ShieldCheck} title="Service Level" link={{ href: '/retainers/compare', label: 'More on service levels' }}>
                            <p className="text-xs text-ink-500">Response Window</p>
                            <p className="text-lg font-bold text-ink-900">{s.response_window}</p>
                            <p className="text-xs">Adviser response to requests within the service window.</p>
                        </Card>
                        <Card icon={RefreshCw} title="Unused Allowance" link={{ href: `/retainers/${s.slug}/utilisation-economics`, label: 'See rollover rules' }}>
                            <p className="text-xs text-ink-500">{s.unused_rule === 'CAPPED_ROLL_FORWARD' ? 'Capped Roll-Forward' : s.unused_rule}</p>
                            <p className="text-lg font-bold text-ink-900">{s.unused_label}</p>
                            <p className="text-xs">of unused allowance rolls forward one period only.</p>
                        </Card>
                        <Card icon={TrendingUp} title="Overage Treatment" link={{ href: `/retainers/${s.slug}/utilisation-economics`, label: 'See overage rules' }}>
                            <p className="text-xs text-ink-500">Pre-Approved Rate</p>
                            <p className="text-lg font-bold text-ink-900">{zar(s.overage_rate_zar)}</p>
                            <p className="text-xs">per additional hour. Approval required before work begins.</p>
                        </Card>
                        <Card icon={BarChart3} title="Utilisation Economics" link={{ href: `/retainers/${s.slug}/utilisation-economics`, label: 'View utilisation economics' }}>
                            <p>Understand the utilisation conflict, your choices and alternatives. Neutral guidance.</p>
                        </Card>
                    </div>

                    <section className="grid gap-5 rounded-[8px] border border-gold-200 bg-gold-50/60 p-5 md:grid-cols-[1fr_1fr_auto_1fr] md:items-center">
                        <div>
                            <h2 className="text-sm font-semibold text-ink-900">How This Retainer Compares</h2>
                            <p className="mt-1 text-xs text-ink-600">Retainers give you reserved capacity and predictability. Pay-per-use gives you flexibility without a monthly commitment.</p>
                            <Link href="/retainers/compare" className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-gold-700">
                                See full comparison <ArrowRight className="size-3" aria-hidden="true" />
                            </Link>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-ink-900">{s.name}</p>
                            <CheckList className="mt-2" items={['Reserved capacity', 'Predictable monthly access', 'Priority response']} />
                        </div>
                        <span className="mx-auto flex size-10 items-center justify-center rounded-full border border-gold-400 text-xs font-bold text-gold-700">vs</span>
                        <div>
                            <p className="text-sm font-semibold text-ink-900">{s.name.replace(' Retainer', '')} (Pay-Per-Use)</p>
                            <CheckList className="mt-2" items={['No monthly commitment', 'Use as you need', 'Rates vary by scope']} />
                        </div>
                    </section>

                    {alternatives.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold text-ink-900">Related Retainers</h2>
                            <ul className="mt-3 grid gap-3 sm:grid-cols-3">
                                {alternatives.map((a) => (
                                    <li key={a.slug}>
                                        <Link href={`/retainers/${a.slug}`} className="block rounded-[8px] border border-parchment-400 bg-white p-3 hover:border-gold-500">
                                            <p className="text-[0.8125rem] font-semibold text-ink-900">{a.name}</p>
                                            <p className="text-xs text-ink-500">From {zar(a.price_zar)} /month</p>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}

                    <TrustRow
                        items={[
                            { icon: UserRound, title: 'Account Owner', body: 'One accountable owner.' },
                            { icon: Lock, title: 'Trusted & Secure', body: 'Bank-grade security & POPIA-ready.' },
                            { icon: UserCheck, title: 'Human Review', body: 'Expert review at every step.' },
                            { icon: BadgeCheck, title: 'Verified Information', body: 'From trusted public & private sources.' },
                            { icon: MessageCircle, title: 'Ask a Question', body: 'Get help from our experts.' },
                        ]}
                    />
                </div>

                <aside className="space-y-4 lg:sticky lg:top-4 lg:self-start">
                    <div className="overflow-hidden rounded-[8px] border border-parchment-400 bg-white">
                        <div className="bg-ink-950 p-5 text-parchment-100">
                            <p className="text-xs text-gold-400 uppercase">From</p>
                            <p className="mt-1 flex items-baseline gap-2">
                                <span className="text-3xl font-bold">{s.custom_pricing ? 'Custom' : zar(s.price_zar)}</span>
                                {!s.custom_pricing && <span className="text-sm text-ink-300">/month</span>}
                                <span className="ml-auto text-xs text-ink-300">excl. VAT</span>
                            </p>
                            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-300">
                                <CheckCircle2 className="size-3.5 text-verified-500" aria-hidden="true" /> Pricing subject to proposal &amp; agreement
                            </p>
                        </div>
                        <div className="space-y-3 p-4">
                            {state.ok ? (
                                <Link href={`/retainers/${s.slug}/exclusions`} className="flex h-11 items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                    Request Proposal <ArrowRight className="size-4" aria-hidden="true" />
                                </Link>
                            ) : (
                                <p role="status" className="rounded-[6px] border border-attested-500/30 bg-attested-50 p-3 text-xs text-attested-700">
                                    {state.text}
                                </p>
                            )}
                            <Link href="/retainers/compare" className="flex h-11 items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-50">
                                <Scale className="size-4" aria-hidden="true" /> Compare Alternatives
                            </Link>
                            <ul className="space-y-1.5 text-xs text-ink-600">
                                {['Proposal based', 'Capacity subject to C1–C5 Test', 'No instant checkout', 'Subject to TBCA capacity availability'].map((x) => (
                                    <li key={x} className="flex gap-2">
                                        <CheckCircle2 className="size-3.5 shrink-0 text-gold-600" aria-hidden="true" /> {x}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/retainers/allowance-sizing" className="inline-flex items-center gap-1 text-xs font-semibold text-gold-700">
                                How retainer pricing works <ArrowRight className="size-3" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">Fit Guidance</h2>
                        <p className="mt-1 text-xs text-ink-500">Best for organisations that need:</p>
                        <CheckList className="mt-2" items={['Regular access to senior strategic guidance', 'Independent advisory support', 'Executive and board-level alignment', 'Ongoing decision support and reviews']} />
                        <button type="button" onClick={() => openAskQuestion({ subject: `Is the ${s.name} right for us?`, section: 'retainers' })} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 text-[0.8125rem] font-semibold text-ink-900 hover:bg-gold-50">
                            <Headphones className="size-4" aria-hidden="true" /> Speak to an Expert
                        </button>
                    </div>
                    <div className="flex gap-3 rounded-[8px] border border-gold-200 bg-gold-50 p-4 text-xs text-ink-700">
                        <HelpCircle className="size-5 shrink-0 text-gold-600" aria-hidden="true" />
                        <p>
                            <span className="block text-sm font-semibold text-ink-900">Important</span>
                            This page is a summary. Full terms, exclusions and rules apply. Review before you request a proposal.
                        </p>
                    </div>
                </aside>
            </div>
        </>
    );
}
