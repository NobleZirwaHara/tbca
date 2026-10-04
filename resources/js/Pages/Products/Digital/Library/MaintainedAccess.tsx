import { Link, useForm, router } from '@inertiajs/react';
import { Bell, Check, CloudDownload, History, Info, Lock, RefreshCw, Scale, Headphones, Zap } from 'lucide-react';
import LibraryShell, { EntitlementSummary, HelpPanel } from '@/Components/Products/Digital/LibraryShell';
import { Chip } from '@/Components/Products/Digital/Ui';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import { formatZar } from '@/lib/money';
import type { DpEntitlement } from '@/Components/Products/Digital/types';

interface Plan {
    key: string;
    label: string;
    incl: number;
    period: string;
    renews: string;
}

export default function MaintainedAccess({ entitlement: e, plans }: { entitlement: DpEntitlement; plans: Plan[] }) {
    const form = useForm({ plan: 'annual', auto_renew: false, accept: false });
    const active = e.maintenanceStatus === 'active';
    const done = typeof window !== 'undefined' && window.location.search.includes('done=1');

    return (
        <LibraryShell entitlement={e} title="Maintained Access / Subscription Offer" crumb="Maintained Access / Subscription Offer" description="Keep your product current, supported and fully compliant with ongoing maintenance and updates.">
            {done && active && <Notice tone="good" title="Maintained Access active">Your entitlement now receives all new versions and corrections until {e.maintenanceUntil}.</Notice>}
            <div className="grid gap-4 xl:grid-cols-[1fr_340px_250px]">
                <div className="min-w-0 space-y-4">
                    <EntitlementSummary
                        e={e}
                        title="Your entitlement"
                        extra={[
                            { label: 'Purchased', value: e.purchasedAt },
                            { label: 'Order Reference', value: e.orderReference },
                            { label: 'Updates Included', value: e.updatesIncluded },
                            { label: 'Support', value: e.product.support },
                            { label: 'Maintenance Status', value: active ? <span className="font-semibold text-verified-700">Active</span> : <span className="font-semibold text-risk-600 underline">Not Active</span> },
                        ]}
                    />
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="font-serif text-lg font-semibold">Why Maintain Your Access?</h2>
                        <p className="text-xs text-ink-600">Your product remains powerful when it stays current. Maintained Access gives you continuous value.</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-4">
                            {[[RefreshCw, 'Stay Current', 'Receive all new versions, corrections and product improvements.'], [Scale, 'Remain Compliant', 'Keep aligned with South African regulations and best practice.'], [Headphones, 'Get Support', 'Access standard email support from our expert team.'], [CloudDownload, 'Always Available', 'Download the latest version any time from your library.']].map(([I, t, b]) => {
                                const Icon = I as typeof Scale;
                                return <div key={t as string} className="text-xs"><Icon className="mb-1 size-6 text-gold-600" aria-hidden="true" /><strong className="block text-ink-900">{t as string}</strong><span className="text-ink-600">{b as string}</span></div>;
                            })}
                        </div>
                        <div className="mt-4 grid gap-3 rounded-[6px] border border-verified-500/30 bg-verified-50 p-3 text-xs sm:grid-cols-3">
                            <p>Your Current Version<strong className="block text-sm">{e.version?.display}</strong>Verified as at {e.version?.verifiedAt}<Link href={`/digital-products/library/${e.reference}/version-status`} className="block font-semibold text-gold-700 underline">View version status →</Link></p>
                            <p>{active ? 'Maintenance Valid Until' : 'Updates Included Until'}<strong className="block text-sm">{active ? e.maintenanceUntil : e.updateUntil}</strong>Includes updates and standard support.</p>
                            <div>
                                Auto-Renew<strong className="block text-sm">{e.autoRenew ? 'On' : 'Off'}</strong>You choose when to renew.
                                <button type="button" disabled={!active} onClick={() => router.post(`/digital-products/library/${e.reference}/auto-renew`, {}, { preserveScroll: true })} className="mt-1 block rounded-[4px] border border-verified-600 bg-white px-2 py-1 font-semibold disabled:opacity-50">
                                    Manage Auto-Renew
                                </button>
                            </div>
                        </div>
                        <p className="mt-3 flex gap-2 text-[0.6875rem] text-ink-500"><Info className="size-3.5" aria-hidden="true" /> By activating Maintained Access, you agree to our Maintained Access Terms. You may cancel or switch plans at any time. Prefer a full content subscription? See <Link href="/subscriptions/maintained-content" className="font-semibold text-gold-700 underline">Maintained Content subscriptions</Link>.</p>
                    </section>
                </div>

                <form
                    onSubmit={(ev) => {
                        ev.preventDefault();
                        form.post(`/digital-products/library/${e.reference}/maintained-access`);
                    }}
                    className="space-y-3 rounded-[8px] border border-parchment-400 bg-white p-4"
                >
                    <h2 className="text-xs font-bold tracking-wide text-ink-900 uppercase">Choose your Maintained Access option</h2>
                    <p className="text-xs text-ink-500">Select the plan that fits your needs.</p>
                    <div className="grid grid-cols-2 gap-2" role="radiogroup">
                        {plans.map((p) => (
                            <button key={p.key} type="button" role="radio" aria-checked={form.data.plan === p.key} onClick={() => form.setData('plan', p.key)} className={cn('flex flex-col rounded-[8px] border p-3 text-left', form.data.plan === p.key ? 'border-gold-500 bg-gold-50 ring-1 ring-gold-500' : 'border-parchment-400')}>
                                <span className="flex items-center justify-between text-xs font-semibold">{p.label} {p.key === 'annual' && <Chip tone="gold">Most Popular</Chip>}</span>
                                <span className="mt-2 text-lg font-bold">{formatZar(p.incl)}<span className="text-xs font-normal"> / {p.period}</span></span>
                                <span className="text-[0.625rem] text-ink-500">(VAT inclusive)</span>
                                <ul className="mt-2 space-y-1 text-[0.6875rem]">
                                    {[p.key === 'annual' ? '12 months of updates' : 'Month-to-month flexibility', 'All new versions & corrections', 'Standard email support', 'Access to update history', 'Cancel anytime'].map((f) => <li key={f} className="flex gap-1"><Check className="size-3 text-verified-500" aria-hidden="true" />{f}</li>)}
                                </ul>
                                <span className="mt-2 text-[0.625rem] text-ink-500">{p.renews}</span>
                            </button>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 text-xs"><input type="checkbox" className="accent-gold-600" checked={form.data.auto_renew} onChange={(ev) => form.setData('auto_renew', ev.target.checked)} /> Renew automatically</label>
                    <label className="flex items-start gap-2 text-xs"><input type="checkbox" className="mt-0.5 accent-gold-600" checked={form.data.accept} onChange={(ev) => form.setData('accept', ev.target.checked)} /> I accept the Maintained Access Terms</label>
                    {Object.values(form.errors).map((er) => <p key={er} role="alert" className="text-xs text-risk-600">{er}</p>)}
                    <button type="submit" disabled={form.processing || !form.data.accept} className="flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 disabled:opacity-50">
                        <Lock className="size-4" aria-hidden="true" /> {active ? 'Extend Maintained Access' : 'Activate Maintained Access'}
                    </button>
                </form>

                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Maintained Access Summary</h2>
                        <LabelValues
                            rows={[
                                { label: 'Product', value: e.product.name },
                                { label: 'Current Licence', value: e.licenceLabel },
                                { label: 'Current Version', value: e.version?.display },
                                { label: 'Maintenance Status', value: active ? <span className="text-verified-700">Active ({e.maintenancePlan})</span> : <span className="text-risk-600">Not Active</span> },
                                { label: 'Includes Updates', value: e.updatesIncluded },
                                { label: 'Support Level', value: e.product.support },
                                { label: 'Next Update Check', value: 'Weekly' },
                            ]}
                        />
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">What You'll Receive</h2>
                        {[[Zap, 'Immediate activation', 'Access starts right after payment.'], [Bell, 'Update notifications', "We'll notify you of all new releases."], [CloudDownload, 'Download latest version', 'Always download the most current.'], [History, 'Full update history', 'View all changes and corrections.']].map(([I, t, b]) => {
                            const Icon = I as typeof Zap;
                            return <p key={t as string} className="mb-2 flex gap-2"><Icon className="size-4 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block text-ink-900">{t as string}</strong>{b as string}</span></p>;
                        })}
                    </section>
                    <HelpPanel />
                </div>
            </div>
        </LibraryShell>
    );
}

MaintainedAccess.layout = null;
