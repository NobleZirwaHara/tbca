import { useState, type ReactNode } from 'react';
import { Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, CircleCheck, Clock, FileText, Headphones, Info, ShieldCheck } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import LedgerChip from '@/Components/ui/LedgerChip';
import AboutIcon from '@/Components/About/AboutIcon';
import { cn } from '@/lib/cn';
import type { PublicClaim } from '@/types/about';

export const fmtDate = (iso: string | null | undefined) =>
    iso ? new Date(iso).toLocaleDateString('en-ZA', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

/** Currentness chip for a claim: Current / Review due / Under review. */
export function ClaimStateChip({ claim, className }: { claim: PublicClaim; className?: string }) {
    const map = {
        current: { label: 'Current', tone: 'border-verified-500/30 bg-verified-50 text-verified-700' },
        review_due: { label: 'Review due', tone: 'border-attested-500/30 bg-attested-50 text-attested-700' },
        under_review: { label: 'Under review', tone: 'border-parchment-500 bg-parchment-200 text-ink-600' },
    }[claim.state];

    return (
        <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-semibold', map.tone, className)}>
            <Clock className="size-3" aria-hidden="true" />
            {map.label}
        </span>
    );
}

const tabs = [
    { key: 'overview', label: 'Overview' },
    { key: 'governance', label: 'Governance' },
    { key: 'policies', label: 'Policies' },
    { key: 'proof', label: 'Proof Points' },
    { key: 'documents', label: 'Documents' },
] as const;

function Bullets({ items, empty }: { items?: string[]; empty: string }) {
    if (!items || items.length === 0) return <p className="text-sm text-ink-400">{empty}</p>;

    return (
        <ul className="space-y-2.5">
            {items.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-[0.8125rem] text-ink-700">
                    <CircleCheck className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />
                    {item}
                </li>
            ))}
        </ul>
    );
}

/** Claim Evidence popover (mockup 28): fed entirely from the Claim Register record. */
export function ClaimEvidenceModal({ claim, open, onClose }: { claim: PublicClaim; open: boolean; onClose: () => void }) {
    const [tab, setTab] = useState<(typeof tabs)[number]['key']>('overview');
    const p = claim.popover ?? {};
    const overview = p.overview?.length
        ? p.overview
        : claim.evidence.map((e) => ({ title: e.title, body: `${e.type} · ${e.issuer}${e.reference_no ? ` · Ref ${e.reference_no}` : ''}` }));
    const metrics = p.metrics?.length
        ? p.metrics
        : [
              { value: claim.state === 'under_review' ? '—' : (claim.value ?? claim.label ?? '—'), label: claim.label ?? 'Claim', caption: claim.category },
              { value: String(claim.evidence.length), label: 'Verified evidence records', caption: null },
              { value: fmtDate(claim.expires), label: 'Evidence valid until', caption: claim.expires ? null : 'No expiry' },
          ];

    return (
        <Modal
            open={open}
            onClose={onClose}
            size="xl"
            title={
                <span className="flex items-center gap-3">
                    <ShieldCheck className="size-6 text-gold-600" aria-hidden="true" />
                    <span>
                        <span className="block font-serif text-xl">Claim Evidence</span>
                        <span className="block font-serif text-sm font-normal text-gold-700">{claim.label ?? claim.statement}</span>
                    </span>
                </span>
            }
        >
            <div className="rounded-[6px] border border-gold-300 bg-gold-50/40 p-3 text-[0.8125rem] text-ink-700">
                {claim.description ?? claim.statement} Below is the evidence that supports this claim.
                <div className="mt-2 flex flex-wrap items-center gap-2">
                    <LedgerChip code={claim.ledger} />
                    <ClaimStateChip claim={claim} />
                    <span className="font-mono text-[0.6875rem] text-ink-400">{claim.code}</span>
                    {claim.as_at && <span className="text-[0.6875rem] text-ink-500">Reviewed {fmtDate(claim.as_at)}</span>}
                </div>
                {claim.state === 'under_review' && (
                    <p className="mt-2 text-[0.75rem] font-medium text-attested-700">
                        The supporting evidence has expired. The figure is withheld until the evidence is re-verified.
                    </p>
                )}
                {claim.correction && (
                    <p className="mt-2 text-[0.75rem] text-ink-600">
                        Corrected under{' '}
                        <Link href="/about/corrections" className="font-semibold text-gold-700 underline">
                            {claim.correction.code}
                        </Link>
                        .
                    </p>
                )}
            </div>

            <div role="tablist" className="mt-4 flex gap-1 overflow-x-auto border-b border-parchment-400">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        type="button"
                        role="tab"
                        aria-selected={tab === t.key}
                        onClick={() => setTab(t.key)}
                        className={cn(
                            '-mb-px shrink-0 border-b-2 px-3 py-2 text-[0.8125rem] font-medium',
                            tab === t.key ? 'border-gold-500 text-gold-700' : 'border-transparent text-ink-500 hover:text-ink-900',
                        )}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            <div className="mt-4 grid gap-5 md:grid-cols-[1fr_15rem]">
                <div>
                    {tab === 'overview' && (
                        <ul className="divide-y divide-parchment-300">
                            {overview.map((o) => (
                                <li key={o.title} className="flex items-start gap-3 py-3 first:pt-0">
                                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-verified-500" aria-hidden="true" />
                                    <div>
                                        <p className="text-[0.8125rem] font-semibold text-ink-900">{o.title}</p>
                                        <p className="text-[0.8125rem] text-ink-600">{o.body}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    {tab === 'governance' && <Bullets items={p.governance ?? [`Approval authority recorded in the Claim Register (${claim.code}).`]} empty="No governance notes recorded." />}
                    {tab === 'policies' && <Bullets items={p.policies} empty="No additional policies are bound to this claim." />}
                    {tab === 'proof' && <Bullets items={p.proof_points ?? claim.evidence.map((e) => `${e.title} (${e.issuer})`)} empty="No proof points recorded." />}
                    {tab === 'documents' && (
                        <ul className="space-y-2">
                            {claim.evidence.map((e) => (
                                <li key={e.code} className="flex items-start gap-3 rounded-[6px] border border-parchment-400 p-3">
                                    <FileText className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
                                    <div className="min-w-0 flex-1 text-[0.8125rem]">
                                        <p className="font-semibold text-ink-900">{e.title}</p>
                                        <p className="text-ink-500">
                                            {e.code} · {e.type} · Issuer: {e.issuer}
                                        </p>
                                        <p className="text-ink-500">
                                            As at {fmtDate(e.as_at)} · {e.expiry ? `Valid until ${fmtDate(e.expiry)}` : 'No expiry'}
                                        </p>
                                    </div>
                                    <span
                                        className={cn(
                                            'rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold capitalize',
                                            e.expiry_status === 'expired' ? 'bg-risk-50 text-risk-700' : e.expiry_status === 'expiring_soon' ? 'bg-attested-50 text-attested-700' : 'bg-verified-50 text-verified-700',
                                        )}
                                    >
                                        {e.expiry_status.replace('_', ' ')}
                                    </span>
                                </li>
                            ))}
                            <li className="text-xs text-ink-400">Evidence is held by TBCA and available on request under confidentiality.</li>
                        </ul>
                    )}
                </div>

                <aside className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-4">
                    <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <BarChart3 className="size-4 text-gold-600" aria-hidden="true" /> At a Glance
                    </p>
                    <dl className="mt-3 space-y-3">
                        {metrics.map((m) => (
                            <div key={m.label}>
                                <dt className="text-xl font-bold text-ink-900">{m.value}</dt>
                                <dd className="text-xs text-ink-600">
                                    {m.label}
                                    {m.caption && <span className="block text-ink-400">{m.caption}</span>}
                                </dd>
                            </div>
                        ))}
                    </dl>
                    {claim.action && (
                        <Link href={claim.action.href} className="mt-4 inline-flex w-full items-center justify-center gap-1.5 rounded-[4px] border border-gold-500 px-3 py-2 text-xs font-semibold text-gold-700 hover:bg-gold-50">
                            {claim.action.label} <ArrowRight className="size-3.5" aria-hidden="true" />
                        </Link>
                    )}
                </aside>
            </div>

            <div className="mt-5 border-t border-parchment-300 pt-4">
                <p className="text-sm font-semibold text-ink-900">Need more information?</p>
                <p className="text-[0.8125rem] text-ink-600">Contact our Client Care team or use the Whistleblowing channel.</p>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    <Link href="/about/contact" className="inline-flex items-center justify-center gap-2 rounded-[4px] border border-gold-500 px-3 py-2 text-sm font-semibold text-gold-700 hover:bg-gold-50">
                        <Headphones className="size-4" aria-hidden="true" /> Contact Client Care
                    </Link>
                    <Link href="/whistleblowing" className="inline-flex items-center justify-center gap-2 rounded-[4px] bg-gold-600 px-3 py-2 text-sm font-semibold text-white hover:bg-gold-700">
                        <ShieldCheck className="size-4" aria-hidden="true" /> Whistleblowing Channel
                    </Link>
                </div>
            </div>
        </Modal>
    );
}

/** Small (i) trigger that opens the evidence popover for a claim. */
export function ClaimInfoButton({ claim, className, children }: { claim: PublicClaim; className?: string; children?: ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button
                type="button"
                onClick={() => setOpen(true)}
                className={cn('inline-flex items-center gap-1 rounded-full text-ink-400 hover:text-gold-700 focus-visible:ring-2 focus-visible:ring-gold-500 focus-visible:outline-none', className)}
                aria-label={`View evidence for ${claim.label ?? claim.statement}`}
            >
                {children ?? <Info className="size-4" aria-hidden="true" />}
            </button>
            {open && <ClaimEvidenceModal claim={claim} open={open} onClose={() => setOpen(false)} />}
        </>
    );
}

/** Evidence-backed statistic tile (Our Promise, testimonials band). Value is withheld while under review. */
export function ClaimStat({ claim, dark = false }: { claim: PublicClaim; dark?: boolean }) {
    return (
        <div className={cn('relative flex flex-col items-center rounded-[8px] border p-4 text-center', dark ? 'border-gold-500/40 bg-ink-900' : 'border-parchment-400 bg-white')}>
            <ClaimInfoButton claim={claim} className="absolute top-2 right-2" />
            <span className={cn('inline-flex size-12 items-center justify-center rounded-full', dark ? 'text-gold-400' : 'bg-gold-50 text-gold-600')}>
                <AboutIcon name={claim.icon} className="size-6" />
            </span>
            {claim.state === 'under_review' ? (
                <p className="mt-3 text-sm font-semibold text-ink-500">Under review</p>
            ) : (
                <p className={cn('mt-2 font-serif text-[1.75rem] leading-none font-bold', dark ? 'text-gold-400' : 'text-gold-600')}>{claim.value}</p>
            )}
            <p className={cn('mt-2 text-[0.875rem] font-semibold', dark ? 'text-parchment-100' : 'text-ink-900')}>{claim.label}</p>
            {claim.description && <p className={cn('mt-1 text-[0.75rem] leading-snug', dark ? 'text-ink-300' : 'text-ink-500')}>{claim.description}</p>}
            {claim.state === 'review_due' && <ClaimStateChip claim={claim} className="mt-2" />}
        </div>
    );
}

/** Ledger-enforced trust card (ISO V / POPIA A / Security G ...). The ledger comes from the register, never from styling. */
export function TrustClaimCard({ claim, rows }: { claim: PublicClaim; rows?: { label: string; value: string }[] }) {
    const tone = { V: 'border-verified-500 text-verified-700', A: 'border-attested-500 text-attested-700', R: 'border-referenced-500 text-referenced-700', G: 'border-controlled-500 text-controlled-700' }[claim.ledger];

    return (
        <article id={claim.key} className="flex scroll-mt-24 flex-col rounded-[8px] border border-parchment-400 bg-white p-5">
            <div className="flex items-start gap-4">
                <span className={cn('inline-flex size-14 shrink-0 items-center justify-center rounded-full border-2', tone)}>
                    <AboutIcon name={claim.icon} className="size-7" />
                </span>
                <div className="min-w-0">
                    <LedgerChip code={claim.ledger} />
                    <h3 className="mt-2 font-serif text-[1.25rem] leading-tight font-semibold text-ink-900">{claim.label}</h3>
                    {claim.description && <p className="mt-1 text-[0.8125rem] text-ink-600">{claim.description}</p>}
                </div>
            </div>
            <dl className="mt-4 space-y-2 border-t border-parchment-300 pt-4 text-[0.8125rem]">
                {(rows ?? []).map((r) => (
                    <div key={r.label} className="flex gap-1.5">
                        <dt className="font-semibold text-ink-800">{r.label}:</dt>
                        <dd className="text-ink-600">{r.value}</dd>
                    </div>
                ))}
                <div className="flex flex-wrap items-center gap-1.5">
                    <dt className="font-semibold text-ink-800">Currentness:</dt>
                    <dd className="flex items-center gap-2 text-ink-600">
                        {claim.expires ? `Valid until ${fmtDate(claim.expires)}` : `Reviewed ${fmtDate(claim.as_at)}`}
                        <ClaimStateChip claim={claim} />
                    </dd>
                </div>
            </dl>
            <div className="mt-auto flex items-center gap-2 pt-4">
                {claim.action && (
                    <Link href={claim.action.href} className={cn('inline-flex flex-1 items-center justify-center gap-1.5 rounded-[4px] border px-3 py-2 text-[0.8125rem] font-semibold hover:bg-parchment-100', tone)}>
                        {claim.action.label} <ArrowRight className="size-3.5" aria-hidden="true" />
                    </Link>
                )}
                <ClaimInfoButton claim={claim} className="rounded-[4px] border border-parchment-400 p-2">
                    <Info className="size-4" aria-hidden="true" />
                    <span className="sr-only">Evidence</span>
                </ClaimInfoButton>
            </div>
        </article>
    );
}
