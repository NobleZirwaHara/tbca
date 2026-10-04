import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import { Check, CircleCheck, Download, Info, Lock, ShieldCheck, Users } from 'lucide-react';
import LibraryShell, { EntitlementSummary, HelpPanel } from '@/Components/Products/Digital/LibraryShell';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { DpEntitlement, DpLicence, DpVersion } from '@/Components/Products/Digital/types';

export default function Upgrade({
    entitlement: e,
    targets,
    l5,
    versionUpgrade,
    pendingOrder,
}: {
    entitlement: DpEntitlement;
    targets: DpLicence[];
    l5: DpLicence;
    versionUpgrade: DpVersion | null;
    pendingOrder: string | null;
}) {
    const price = usePrice();
    const { url } = usePage<{ url: { path: string } }>().props;
    const [tab, setTab] = useState<'licence' | 'version'>('licence');
    const [to, setTo] = useState<string | null>(targets[0]?.code ?? null);
    const [processing, setProcessing] = useState(false);
    const chosen = targets.find((t) => t.code === to);
    const done = typeof window !== 'undefined' && window.location.search.includes('done=1');

    return (
        <LibraryShell entitlement={e} title="Licence / Update Upgrade" crumb="Licence / Update Upgrade" description="Expand your rights or access the latest version to keep your product current and fully compliant.">
            {done && !pendingOrder && <Notice tone="good" title="Upgrade applied">Your new licence terms now apply to entitlement {e.reference} ({e.licenceLabel}).</Notice>}
            {pendingOrder && <Notice tone="warn" title="Upgrade awaiting payment">Order {pendingOrder} has not been paid yet. Your licence changes only after payment is verified. <Link className="font-semibold underline" href={`/checkout/${pendingOrder}`}>Complete payment</Link></Notice>}
            <div className="grid gap-4 xl:grid-cols-[1fr_320px_250px]">
                <div className="min-w-0 space-y-4">
                    <EntitlementSummary e={e} />
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Available Upgrades</h2>
                        <div role="tablist" className="mb-3 flex gap-1 border-b border-parchment-400">
                            {(['licence', 'version'] as const).map((k) => (
                                <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={cn('-mb-px border-b-2 px-3 py-2 text-xs font-semibold', tab === k ? 'border-gold-500 text-ink-900' : 'border-transparent text-ink-500')}>
                                    {k === 'licence' ? 'Licence Upgrade' : 'Version Upgrade'}
                                </button>
                            ))}
                        </div>
                        {tab === 'licence' ? (
                            <div className="grid gap-3 md:grid-cols-3">
                                {targets.map((t) => (
                                    <div key={t.code} className={cn('flex flex-col rounded-[8px] border p-3', to === t.code ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                        <h3 className="text-sm font-semibold text-ink-900">Upgrade to {t.code} – <span className="text-gold-700">{t.name}</span></h3>
                                        <ul className="mt-2 space-y-1 text-[0.6875rem] text-ink-700">
                                            {t.allowed.map((a) => <li key={a} className="flex gap-1.5"><Check className="size-3.5 text-verified-500" aria-hidden="true" />{a}</li>)}
                                            <li className="flex gap-1.5"><Check className="size-3.5 text-verified-500" aria-hidden="true" />All {e.licence} rights included</li>
                                        </ul>
                                        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
                                            <p className="text-[0.6875rem] text-ink-500">Upgrade price (ex VAT)<span className="block text-base font-bold text-ink-900">{price(t.price ?? 0)}</span><span className="text-[0.625rem]">List {price(t.listPrice ?? 0)} less your {price(e.pricePaid)} credit</span></p>
                                            <button type="button" onClick={() => setTo(t.code)} aria-pressed={to === t.code} className={cn('h-8 rounded-[4px] border px-3 text-xs font-semibold', to === t.code ? 'border-gold-500 bg-gold-500' : 'border-gold-500')}>
                                                {to === t.code ? 'Selected' : 'Select Upgrade'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                <div className="flex flex-col rounded-[8px] border border-parchment-400 p-3">
                                    <h3 className="text-sm font-semibold text-ink-900">L5 – {l5.name}</h3>
                                    <ul className="mt-2 space-y-1 text-[0.6875rem] text-ink-700">{l5.allowed.map((a) => <li key={a} className="flex gap-1.5"><Check className="size-3.5 text-verified-500" aria-hidden="true" />{a}</li>)}</ul>
                                    <p className="mt-2 text-[0.6875rem] text-ink-500">{l5.review}</p>
                                    <button type="button" onClick={() => openAskQuestion({ subject: `L5 rights review for ${e.product.name} (${e.reference})`, section: 'digital-products' })} className="mt-auto h-8 rounded-[4px] border border-gold-500 text-xs font-semibold">Request Review</button>
                                </div>
                                {targets.length === 0 && <p className="text-xs text-ink-500 md:col-span-2">No retail licence upgrade is available from {e.licenceLabel} for this product.</p>}
                            </div>
                        ) : versionUpgrade ? (
                            <div className="rounded-[8px] border border-parchment-400 p-4 text-xs">
                                <p className="text-sm font-semibold">{versionUpgrade.display} — released {versionUpgrade.releasedAt}</p>
                                <p className="mt-1 text-ink-600">{versionUpgrade.summary}</p>
                                <p className="mt-2">This version falls outside your update window. Activate Maintained Access to receive it and every future correction.</p>
                                <Link href={`/digital-products/library/${e.reference}/maintained-access`} className="mt-3 inline-flex h-9 items-center rounded-[4px] bg-gold-500 px-4 font-semibold">Activate Maintained Access</Link>
                            </div>
                        ) : (
                            <p className="flex gap-2 text-xs text-verified-700"><CircleCheck className="size-4" aria-hidden="true" /> Your entitlement already includes the current controlled version. <Link href={`/digital-products/library/${e.reference}/updates`} className="font-semibold underline">Open updates</Link></p>
                        )}
                        <p className="mt-3 flex gap-2 rounded-[6px] bg-parchment-100 p-2 text-xs text-ink-600"><Info className="size-4 shrink-0" aria-hidden="true" /> Upgrades are effective immediately after payment. Your new licence terms will be applied to your entitlement.</p>
                    </section>
                </div>

                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Why Upgrade?</h2>
                        {[[Users, 'More Rights', 'Use the product across more entities or distribution channels.'], [Download, 'Stay Current', 'Access new versions, corrections and improvements.'], [ShieldCheck, 'Protect Your Position', 'Ensure ongoing compliance, accuracy and defensibility.']].map(([I, t, b]) => {
                            const Icon = I as typeof Users;
                            return <p key={t as string} className="mb-2 flex gap-2"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">{t as string}</strong>{b as string}</span></p>;
                        })}
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Selected Upgrade Summary</h2>
                        <LabelValues
                            rows={[
                                { label: 'Product', value: e.product.name },
                                { label: 'Current Licence', value: e.licenceLabel },
                                { label: 'New Licence', value: chosen ? `${chosen.code} – ${chosen.name}` : '—' },
                                { label: 'Effective Version', value: e.version?.display },
                                { label: 'Price (ex VAT)', value: chosen ? price(chosen.price ?? 0) : '—', strong: true },
                            ]}
                        />
                        <button
                            type="button"
                            disabled={!chosen || processing || Boolean(pendingOrder)}
                            onClick={() => router.post(`${url.path}`, { to }, { onStart: () => setProcessing(true), onFinish: () => setProcessing(false) })}
                            className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 disabled:opacity-50"
                        >
                            <Lock className="size-4" aria-hidden="true" /> Proceed to Checkout
                        </button>
                        <Link href={`/digital-products/${e.product.slug}/licence`} className="mt-2 flex h-10 items-center justify-center rounded-[4px] border border-parchment-500 text-sm font-semibold">Compare Licence Classes</Link>
                    </section>
                </div>

                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Your Version Status</h2>
                        <p className="flex gap-2"><CircleCheck className="size-4 text-verified-500" aria-hidden="true" />{e.updateAvailable ? 'A newer controlled edition is available.' : 'You are using the latest version.'}</p>
                        <p className="mt-2 rounded bg-verified-50 p-2">{e.version?.display}<span className="block text-ink-500">Verified as at {e.version?.verifiedAt}</span></p>
                        <Link href={`/digital-products/library/${e.reference}/version-status`} className="mt-2 inline-block font-semibold text-gold-700 underline">View version status →</Link>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Maintenance & Updates</h2>
                        <p className={e.maintenanceStatus === 'active' ? 'font-semibold text-verified-700' : 'font-semibold text-risk-600'}>● {e.maintenanceStatus === 'active' ? 'Active' : 'Not Active'}</p>
                        <p>{e.maintenanceStatus === 'active' ? `Valid until ${e.maintenanceUntil}` : `Updates until ${e.updateUntil}`}</p>
                        <p>Updates included: {e.updatesIncluded}</p>
                        <Link href={`/digital-products/library/${e.reference}/updates`} className="mt-2 inline-block font-semibold text-gold-700 underline">View all updates →</Link>
                    </section>
                    <HelpPanel />
                </div>
            </div>
        </LibraryShell>
    );
}

Upgrade.layout = null;
