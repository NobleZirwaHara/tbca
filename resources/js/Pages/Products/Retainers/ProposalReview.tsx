import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, CalendarDays, Clock, Download, FileText, Lock, RefreshCw, ShieldCheck, UserRound, Wallet, X, AlertTriangle, Gauge } from 'lucide-react';
import { PageTitle, Notice, CheckList, LabelValues } from '@/Components/Products/Shared';
import { Stepper, StatusPill } from '@/Components/ui/Kit';
import type { RetProposal } from '@/Components/Products/Retainers/types';
import { fmtDate, zar } from '@/Components/Products/Retainers/ui';

const HOLDS: Record<string, string> = {
    CAPACITY_HOLD: 'The exact adviser pool does not currently have headroom for this allowance. Our Delivery team will re-test capacity; you will be notified when a proposal can be issued.',
    BELOW_FLOOR: 'The requested allowance and fee combination falls below the approved price floor. We will come back with a redesigned or repriced option.',
    RET_NOT_CERTIFIED: 'This Retainer has not completed the C1–C5 Capacity Test, so it cannot be offered yet.',
    EXCLUSION_HOLD: 'The exclusion register must be acknowledged before a proposal can be issued.',
    DISCLOSURE_HOLD: 'The utilisation economics disclosure must be acknowledged before a proposal can be issued.',
};

export default function ProposalReview({ proposal: p, retainer }: { proposal: RetProposal; retainer: string | null }) {
    const s = p.service;
    const issued = p.status === 'issued';

    return (
        <>
            <Head title={`Proposal ${p.reference}`} />
            <PageTitle
                crumbs={[{ label: 'Retainers', href: '/retainers' }, { label: s.name, href: `/retainers/${s.slug}` }, { label: `Proposal ${p.reference}` }, { label: 'Review & Acceptance' }]}
                title="Proposal Review & Acceptance"
                lead="Review the details of your Retainer proposal. Accept to activate your Retainer."
                chips={<StatusPill status={p.status} />}
                aside={<Stepper className="w-72" steps={['Request', 'Review proposal', 'Sign']} current={2} />}
            />
            <div className="container-tbca grid gap-5 py-8 lg:grid-cols-[1fr_320px]">
                <div className="min-w-0 space-y-5">
                    {p.status === 'hold' && (
                        <Notice tone="warn" icon={AlertTriangle} title={`Request received — held for review (${p.hold_reason})`}>
                            {HOLDS[p.hold_reason ?? ''] ?? 'Your request is under review.'} No money or capacity promise has been created.
                        </Notice>
                    )}
                    {p.status === 'expired' && <Notice tone="bad" title="This proposal has expired">After expiry, we re-scope and re-price based on current capacity and market conditions. Please submit a new request.</Notice>}
                    {p.status === 'declined' && <Notice tone="bad" title="Proposal declined">No commitment was created.</Notice>}
                    {p.status === 'signed' && retainer && (
                        <Notice tone="good" title="Agreement signed">
                            Retainer {retainer} has been created. <Link href={`/retainers/account/${retainer}`} className="font-semibold text-gold-700 underline">Open your Retainer</Link>
                        </Notice>
                    )}

                    <div className="flex flex-wrap items-center gap-x-8 gap-y-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4">
                        <div className="flex flex-1 items-start gap-3">
                            <Clock className="size-6 shrink-0 text-gold-700" aria-hidden="true" />
                            <div>
                                <p className="text-sm font-semibold text-ink-900">{p.valid_until ? `This proposal is valid until ${fmtDate(p.valid_until, { day: 'numeric', month: 'long', year: 'numeric' })}` : 'Proposal not yet issued'}</p>
                                <p className="text-xs text-ink-600">After expiry, we will re-scope and re-price based on current capacity and market conditions.</p>
                            </div>
                        </div>
                        <div className="text-xs">
                            <p className="text-ink-500">Proposal ID</p>
                            <p className="font-semibold text-ink-900">{p.reference}</p>
                            {p.hash && <p className="text-[0.625rem] text-ink-400">v{p.version} · #{p.hash}</p>}
                        </div>
                        <div className="text-xs">
                            <p className="text-ink-500">Prepared for</p>
                            <p className="font-semibold text-ink-900">{p.organisation}</p>
                        </div>
                    </div>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">1. Retainer Summary</h2>
                            <div className="mt-3 flex items-start gap-3">
                                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-parchment-200 text-ink-700"><UserRound className="size-6" aria-hidden="true" /></span>
                                <div>
                                    <p className="text-[0.6875rem] text-ink-400 uppercase">{s.category_label} Retainer</p>
                                    <p className="font-semibold text-ink-900">{s.name}</p>
                                    <p className="text-xs text-ink-500">{s.summary}</p>
                                </div>
                            </div>
                            <dl className="mt-4 grid grid-cols-2 gap-3 text-xs">
                                {[
                                    [Gauge, 'Allowance', `${p.allowance_qty} Hours / month`],
                                    [CalendarDays, 'Start Date (Proposed)', fmtDate(p.start_date)],
                                    [ShieldCheck, 'Service Level', `${p.service_level} · ${s.response_window} response`],
                                    [RefreshCw, 'Billing Cycle', 'Monthly in advance'],
                                    [UserRound, 'Preferred Owner Model', p.owner_model],
                                    [Wallet, 'Capacity reserved', p.reserved_units ? `${p.reserved_units}h until ${fmtDate(p.reservation_expires_at)}` : 'Not reserved'],
                                ].map(([Icon, l, v]) => {
                                    const I = Icon as typeof Gauge;
                                    return (
                                        <div key={l as string} className="flex gap-2">
                                            <I className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                            <div><dt className="text-ink-400">{l as string}</dt><dd className="font-semibold text-ink-900">{v as string}</dd></div>
                                        </div>
                                    );
                                })}
                            </dl>
                        </section>
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">2. Commercial Summary</h2>
                            <LabelValues
                                className="mt-2"
                                rows={[
                                    { label: 'Monthly Fee (excl. VAT)', value: zar(p.monthly_fee_zar) },
                                    { label: 'VAT (15%)', value: zar(p.vat_zar) },
                                    { label: 'Monthly Fee (incl. VAT)', value: zar(p.fee_incl_vat), strong: true },
                                    { label: 'Minimum Term', value: `${s.min_term_months} Months` },
                                    { label: 'Notice Period', value: `${s.notice_days} Days` },
                                    { label: 'Overage Rate', value: `${zar(p.overage_rate_zar)} / hour` },
                                    { label: 'Unused Allowance Rollover', value: `Up to ${p.rollover_cap_pct}%` },
                                ]}
                            />
                            <div className="mt-2 flex items-center justify-between rounded-[4px] bg-gold-50 px-3 py-2 text-sm font-bold text-ink-900">
                                <span>First Payment (incl. VAT)</span>
                                <span>{zar(p.fee_incl_vat)}</span>
                            </div>
                            <p className="mt-1 text-[0.6875rem] text-ink-400">Platform and payment-method fees are shown at checkout.</p>
                        </section>
                    </div>

                    <section>
                        <h2 className="text-sm font-semibold text-ink-900">5. Key Terms</h2>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                            {[
                                ['Capacity is Reserved', 'Your Retainer secures dedicated human capacity. Hours are limited to your allowance.'],
                                ['Subject to Utilisation Rules', 'Utilisation above 75% is monitored. Continued high use may affect service level.'],
                                ['No Unused Refunds', `Unused hours are not refunded. Up to ${p.rollover_cap_pct}% may roll forward.`],
                                ['Change Control', 'Scope changes require written agreement and may affect pricing.'],
                                ['Termination', `Either party may terminate with ${s.notice_days} days written notice.`],
                            ].map(([t, b]) => (
                                <div key={t} className="rounded-[8px] border border-parchment-400 bg-white p-3">
                                    <p className="text-[0.8125rem] font-semibold text-ink-900">{t}</p>
                                    <p className="mt-1 text-xs text-ink-600">{b}</p>
                                </div>
                            ))}
                        </div>
                    </section>

                    <div className="grid gap-5 xl:grid-cols-2">
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="text-sm font-semibold text-ink-900">6. Documents</h2>
                            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                                {['Retainer Agreement (Draft)', 'Service Level Agreement', 'Scope of Services', 'Data Processing Addendum'].map((doc) => (
                                    <li key={doc}>
                                        <button type="button" onClick={() => window.print()} className="flex w-full items-center gap-2 rounded-[6px] border border-parchment-400 p-2.5 text-left text-xs hover:border-gold-500">
                                            <FileText className="size-4 text-ink-500" aria-hidden="true" />
                                            <span className="flex-1"><span className="block font-semibold text-ink-900">{doc}</span><span className="text-ink-400">PDF • Updated {fmtDate(p.issued_at)}</span></span>
                                            <Download className="size-4 text-ink-500" aria-label="Download" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </section>
                        <section className="rounded-[8px] border border-gold-200 bg-gold-50/60 p-4">
                            <h2 className="text-sm font-semibold text-ink-900">7. Notes from TBCA</h2>
                            <p className="mt-2 text-[0.8125rem] text-ink-700">This proposal is based on the information provided: “{String(p.request.description ?? '')}”. We look forward to supporting your objectives.</p>
                        </section>
                    </div>
                </div>

                <aside className="space-y-4">
                    <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="text-sm font-semibold text-ink-900">3. What&apos;s Included</h2>
                        <CheckList className="mt-3" tone="gold" items={s.inclusions} />
                        <Link href={`/retainers/${s.slug}`} className="mt-2 inline-block text-xs font-semibold text-gold-700">See full scope details →</Link>
                        <h2 className="mt-5 text-sm font-semibold text-ink-900">4. Exclusions (Not Included)</h2>
                        <ul className="mt-2 space-y-1.5">
                            {s.exclusions.map((e) => (
                                <li key={e.code} className="flex gap-2 text-xs text-ink-700"><X className="size-3.5 shrink-0 text-risk-500" aria-hidden="true" />{e.category}</li>
                            ))}
                        </ul>
                        <Link href={`/retainers/${s.slug}/exclusions`} className="mt-2 inline-block text-xs font-semibold text-gold-700">View full exclusion register →</Link>
                    </div>
                    <div className="rounded-[8px] border border-gold-200 bg-gold-50 p-4">
                        <h2 className="text-sm font-semibold text-ink-900">Next Steps</h2>
                        <ol className="mt-3 space-y-2 text-xs text-ink-700">
                            {['Review this proposal in full.', 'Accept to activate your Retainer.', 'Make payment to confirm.', 'Access your Retainer dashboard.'].map((x, i) => (
                                <li key={x} className="flex items-center gap-2"><span className="flex size-5 items-center justify-center rounded-full bg-gold-500 text-[0.6875rem] font-bold text-ink-900">{i + 1}</span>{x}</li>
                            ))}
                        </ol>
                    </div>
                </aside>
            </div>

            <div className="sticky bottom-0 z-20 border-t border-parchment-400 bg-white/95 py-3 backdrop-blur">
                <div className="container-tbca flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/retainers/proposal-request?service=${s.slug}`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900">
                        <ArrowLeft className="size-4" aria-hidden="true" /> Back: Edit Request
                    </Link>
                    <div className="flex flex-wrap items-center gap-2">
                        {(issued || p.status === 'hold') && (
                            <button type="button" onClick={() => window.confirm('Decline this proposal? No commitment will be created.') && router.post(`/retainers/proposal/${p.reference}/decline`)} className="inline-flex h-10 items-center rounded-[4px] border border-parchment-500 px-4 text-sm text-ink-700">
                                Decline
                            </button>
                        )}
                        <button type="button" onClick={() => router.post('/saved', { item_type: 'retainer-proposal', item_key: p.reference, label: `Proposal ${p.reference}`, url: `/retainers/proposal/${p.reference}` }, { preserveScroll: true })} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-gold-500 px-4 text-sm font-semibold text-ink-900">
                            <Bookmark className="size-4" aria-hidden="true" /> Save for Later
                        </button>
                        {p.status === 'accepted' ? (
                            <Link href={`/retainers/agreement/${p.reference}`} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900">
                                Continue to Agreement <ArrowRight className="size-4" aria-hidden="true" />
                            </Link>
                        ) : (
                            <button type="button" disabled={!issued} onClick={() => router.post(`/retainers/proposal/${p.reference}/accept`)} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-50">
                                Accept Proposal &amp; Continue <ArrowRight className="size-4" aria-hidden="true" />
                            </button>
                        )}
                    </div>
                </div>
                <p className="container-tbca mt-1 flex items-center justify-end gap-1 text-[0.6875rem] text-ink-400"><Lock className="size-3" aria-hidden="true" />Secure acceptance with e-signature</p>
            </div>
        </>
    );
}
