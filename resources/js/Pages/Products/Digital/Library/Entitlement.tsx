import { useState } from 'react';
import { Link } from '@inertiajs/react';
import { CalendarDays, CircleCheck, Download, FileText, Globe, Headphones, KeyRound, Languages, Lock, RefreshCw, ShieldCheck, Wrench, Info } from 'lucide-react';
import LibraryShell, { HelpPanel, Reminders } from '@/Components/Products/Digital/LibraryShell';
import { DpCover, DpStatus, Meta } from '@/Components/Products/Digital/Ui';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import type { DpEntitlement, DpLicence, DpOption, DpVersion } from '@/Components/Products/Digital/types';

export default function Entitlement({
    entitlement: e,
    licence,
    blockReason,
    downloadable,
    formats,
    fileName,
    trail,
    history,
    updatesCount,
}: {
    entitlement: DpEntitlement;
    licence: DpLicence;
    blockReason: string | null;
    downloadable: DpVersion[];
    formats: DpOption[];
    fileName: string | null;
    trail: { label: string; at: string }[];
    history: { at: string; version: string; format: string; success: boolean; reason: string | null }[];
    updatesCount: number;
}) {
    const [showFormats, setShowFormats] = useState(false);
    const active = !blockReason;
    const dl = (format?: string, version?: number) => {
        const q = new URLSearchParams();
        if (format) q.set('format', format);
        if (version) q.set('version', String(version));
        return `/digital-products/library/${e.reference}/download${q.toString() ? `?${q}` : ''}`;
    };

    return (
        <LibraryShell
            entitlement={e}
            title="Product Entitlement and Download"
            crumb="Product Entitlement and Download"
            description={active ? 'Your payment is complete. You now have full access to your digital product.' : 'Your entitlement record and download access.'}
        >
            <div className="grid gap-4 xl:grid-cols-[1fr_300px_260px]">
                <div className="min-w-0 space-y-4">
                    <div className={`flex flex-wrap items-center gap-4 rounded-[8px] border p-4 ${active ? 'border-verified-500/30 bg-verified-50' : 'border-attested-500/30 bg-attested-50'}`}>
                        <CircleCheck className={`size-10 ${active ? 'text-verified-600' : 'text-attested-600'}`} aria-hidden="true" />
                        <div className="min-w-0 flex-1">
                            <p className="font-semibold text-ink-900">Entitlement {e.status === 'active' ? 'Active' : e.status.replace('_', ' ')}</p>
                            <p className="text-xs text-ink-600">{active ? 'Your digital product is ready to download and use.' : blockReason}</p>
                        </div>
                        <Meta label="Order Reference" value={e.orderReference} />
                        <Meta label="Entitlement ID" value={e.reference} />
                    </div>

                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <div className="grid gap-4 md:grid-cols-[150px_1fr]">
                            <DpCover name={e.product.name} type={e.product.type} tone={e.product.tone} />
                            <div>
                                <p className="font-serif text-lg font-semibold text-ink-900">{e.product.name}</p>
                                <p className="text-xs text-ink-600">{e.product.tagline}</p>
                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <Meta icon={KeyRound} label="Licence" value={e.licenceLabel} />
                                    <Meta icon={Languages} label="Language" value={e.languageLabel} />
                                    <Meta icon={Wrench} label="Maintenance" value={e.maintenanceStatus === 'active' ? 'Yes' : 'No'} />
                                    <Meta icon={RefreshCw} label="Version" value={e.version?.display} />
                                    <Meta icon={Globe} label="Jurisdiction" value={e.jurisdiction} />
                                    <Meta icon={RefreshCw} label="Updates Included" value={e.updatesIncluded} />
                                    <Meta icon={FileText} label="Format" value={e.format} />
                                    <Meta icon={CalendarDays} label="Purchased" value={e.purchasedAt} />
                                    <Meta icon={Headphones} label="Support" value={e.product.support} />
                                </div>
                            </div>
                        </div>
                        <dl className="mt-4 grid grid-cols-2 gap-3 rounded-[6px] border border-gold-200 bg-gold-50/60 p-3 sm:grid-cols-5">
                            <div><dt className="text-[0.6875rem] text-ink-500">Entitlement Status</dt><dd><DpStatus status={e.status} /></dd></div>
                            <div><dt className="text-[0.6875rem] text-ink-500">Payment Status</dt><dd className="text-xs font-semibold text-verified-700">{e.status === 'pending_payment' ? 'Pending' : 'Paid'}</dd></div>
                            <div><dt className="text-[0.6875rem] text-ink-500">Download Status</dt><dd className="text-xs font-semibold">{active ? 'Available' : 'Blocked'}</dd></div>
                            <div><dt className="text-[0.6875rem] text-ink-500">Currentness</dt><dd className="text-xs font-semibold">{e.version?.display}</dd></div>
                            <div>
                                <dt className="text-[0.6875rem] text-ink-500">Updates Available</dt>
                                <dd className="text-xs font-semibold">{updatesCount} <Link href={`/digital-products/library/${e.reference}/updates`} className="block text-[0.6875rem] text-gold-700 underline">View updates</Link></dd>
                            </div>
                        </dl>

                        <div className="mt-4 rounded-[6px] border border-parchment-400 p-3">
                            <h2 className="text-sm font-semibold text-ink-900">Download Your Product</h2>
                            <p className="text-xs text-ink-500">Choose your preferred file format. All files are virus-scanned and integrity-verified.</p>
                            {fileName && (
                                <div className="mt-3 flex flex-wrap items-center gap-3 rounded-[6px] bg-parchment-100 p-3">
                                    <FileText className="size-8 text-controlled-600" aria-hidden="true" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-ink-900">{fileName}</p>
                                        <p className="text-[0.6875rem] text-ink-500">{e.format} • {e.size} • Updated {e.version?.releasedAt}</p>
                                    </div>
                                    <div className="text-center">
                                        {active ? (
                                            <a href={dl()} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                                                <Download className="size-4" aria-hidden="true" /> Download Now
                                            </a>
                                        ) : (
                                            <span className="inline-flex h-10 items-center rounded-[4px] bg-parchment-300 px-5 text-sm text-ink-500">Download unavailable</span>
                                        )}
                                        <p className="mt-1 text-[0.625rem] text-ink-500">Secure download · Expiry: {e.accessExpires}</p>
                                    </div>
                                </div>
                            )}
                            <div className="mt-3 flex flex-wrap gap-2">
                                <button type="button" onClick={() => setShowFormats((s) => !s)} aria-expanded={showFormats} disabled={!active} className="h-8 rounded-[4px] border border-gold-500 px-3 text-xs font-semibold disabled:opacity-50">
                                    Download Other Formats ▾
                                </button>
                                {e.orderReference && (
                                    <a href={`/digital-products/order/${e.orderReference}/receipt`} className="inline-flex h-8 items-center gap-1.5 rounded-[4px] border border-gold-500 px-3 text-xs font-semibold">
                                        <Download className="size-3.5" aria-hidden="true" /> Download Receipt (PDF)
                                    </a>
                                )}
                            </div>
                            {showFormats && active && (
                                <ul className="mt-2 flex flex-wrap gap-2">
                                    {formats.map((f) => (
                                        <li key={f.code}>
                                            <a href={dl(f.code)} className="inline-flex h-8 items-center gap-1.5 rounded-[4px] bg-parchment-200 px-3 text-xs font-semibold hover:bg-gold-50">
                                                <Download className="size-3.5" aria-hidden="true" /> {f.code} <span className="font-normal text-ink-500">{f.note}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {downloadable.length > 1 && active && (
                                <p className="mt-3 text-xs text-ink-600">
                                    Also included in your entitlement:{' '}
                                    {downloadable.filter((v) => v.id !== e.version?.id).map((v) => (
                                        <a key={v.id} href={dl(undefined, v.id)} className="mr-2 font-semibold text-gold-700 underline">{v.display}</a>
                                    ))}
                                </p>
                            )}
                        </div>
                    </section>
                    <Notice tone="gold" icon={Info}>
                        <strong>Important:</strong> This product is subject to the TBCA Licence Terms. By downloading, you agree to the permitted uses and restrictions.
                    </Notice>
                    {history.length > 0 && (
                        <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Download history</h2>
                            <ul className="divide-y divide-parchment-300 text-xs">
                                {history.map((h, i) => (
                                    <li key={i} className="flex flex-wrap justify-between gap-2 py-1.5">
                                        <span>{h.at}</span>
                                        <span>{h.version} · {h.format}</span>
                                        <DpStatus status={h.success ? 'delivered' : 'blocked'} />
                                        {h.reason && <span className="w-full text-risk-600">{h.reason}</span>}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    )}
                </div>

                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Your Entitlement Summary</h2>
                        <LabelValues
                            rows={[
                                { label: 'Licence Class', value: e.licenceLabel },
                                { label: 'Authorised Entity', value: e.authorisedEntity ?? '—' },
                                { label: 'Permitted Use', value: licence.permitted_use },
                                { label: 'Prohibited Use', value: licence.not_allowed.slice(-2).join(', ') || 'Beyond scheduled rights' },
                                { label: 'Attribution', value: '© The Business Clinic.Africa™' },
                                { label: 'Licence Terms Version', value: `${e.termsVersion} (Accepted ${e.purchasedAt})` },
                            ]}
                        />
                        <Link href={`/digital-products/${e.product.slug}/disclosure`} className="mt-3 inline-flex h-8 items-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold">View Licence Terms</Link>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Version & Currency Covenant</h2>
                        <p className="flex gap-2 text-xs text-ink-700">
                            <CircleCheck className="size-4 shrink-0 text-verified-500" aria-hidden="true" />
                            You are licensed to use {e.version?.display} as at {e.version?.verifiedAt}. Check the Version Status page regularly to ensure you are working with the current controlled version.
                        </p>
                        <Link href={`/digital-products/library/${e.reference}/version-status`} className="mt-3 inline-flex h-8 items-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold">Check Version Status</Link>
                    </section>
                    <HelpPanel />
                </div>

                <div className="space-y-4">
                    <Reminders />
                    <p className="flex gap-2 rounded-[8px] border border-verified-500/30 bg-verified-50 p-3 text-xs text-verified-800">
                        <Lock className="size-5 shrink-0" aria-hidden="true" />
                        <span><strong className="block">100% Secure Download</strong>Your download is encrypted and protected. Each file carries a visible rights notice for identification.</span>
                    </p>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Audit Trail</h2>
                        <LabelValues rows={trail.map((t) => ({ label: t.label, value: t.at }))} />
                        <p className="mt-2 flex items-center gap-1 text-[0.6875rem] text-ink-500"><ShieldCheck className="size-3" aria-hidden="true" /> Events are immutable and logged.</p>
                    </section>
                </div>
            </div>
        </LibraryShell>
    );
}

Entitlement.layout = null;
