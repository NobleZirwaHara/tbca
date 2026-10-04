import { Link } from '@inertiajs/react';
import { CircleCheck, Download, ShieldAlert, ShieldCheck, TriangleAlert } from 'lucide-react';
import LibraryShell, { HelpPanel } from '@/Components/Products/Digital/LibraryShell';
import { DataTable, DpStatus, Meta } from '@/Components/Products/Digital/Ui';
import { LabelValues } from '@/Components/Products/Shared';
import type { DpEntitlement, DpVersion } from '@/Components/Products/Digital/types';

const STATE_COPY: Record<string, { tone: 'good' | 'warn' | 'bad'; title: string; body: string }> = {
    CURRENT: { tone: 'good', title: 'You are using the latest version.', body: 'Your acquired edition is the current controlled version.' },
    NO_DOWNLOAD_RECORDED: { tone: 'good', title: 'You hold the latest version.', body: 'No download is recorded yet — download the current edition from your entitlement.' },
    UPDATE_AVAILABLE_INCLUDED: { tone: 'warn', title: 'A newer controlled edition is available.', body: 'It is included in your entitlement. Check the current edition before new reliance.' },
    UPDATE_AVAILABLE_PAID: { tone: 'warn', title: 'A newer controlled edition is available.', body: 'It falls outside your update window. Activate Maintained Access to receive it.' },
    SUPERSEDED_SAFE: { tone: 'warn', title: 'Your version is superseded but safe.', body: 'A superseded version is not automatically unsafe. Check what changed.' },
    WITHDRAWN_UNSAFE: { tone: 'bad', title: 'Your version has been withdrawn as unsafe.', body: 'Do not rely on it. Download the replacement version or contact support.' },
    MAINTENANCE_ENDED: { tone: 'warn', title: 'Maintenance has ended.', body: 'You keep the right to use your acquired version; renew to receive updates.' },
    'REFUNDED/RIGHTS_CHANGED': { tone: 'bad', title: 'Rights changed.', body: 'This entitlement was refunded or revoked; no further downloads are available.' },
};

export default function VersionStatus({
    entitlement: e,
    state,
    nextReview,
    reviewCycle,
    history,
    downloads,
    pricing,
}: {
    entitlement: DpEntitlement;
    state: string;
    nextReview: string | null;
    reviewCycle: string;
    history: (DpVersion & { downloadable: boolean })[];
    downloads: { at: string; version: string; format: string }[];
    pricing: { lastReview: string | null; nextReview: string | null };
}) {
    const copy = STATE_COPY[state] ?? STATE_COPY.CURRENT;
    const Icon = copy.tone === 'good' ? ShieldCheck : copy.tone === 'bad' ? ShieldAlert : TriangleAlert;
    const tone = { good: 'text-verified-600', warn: 'text-attested-600', bad: 'text-risk-600' }[copy.tone];

    return (
        <LibraryShell entitlement={e} title="Version Status and Currency Covenant" crumb="Version Status and Currency Covenant" description="Stay current, maintain compliance and rely on accurate, controlled content.">
            <div className="grid gap-4 xl:grid-cols-[1fr_300px_260px]">
                <div className="min-w-0 space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-parchment-100 p-4">
                        <h2 className="mb-3 text-xs font-bold tracking-wide text-ink-900 uppercase">Current Status</h2>
                        <div className="grid gap-4 sm:grid-cols-4">
                            <p className="flex items-center gap-2 text-sm font-semibold text-ink-900"><Icon className={`size-10 shrink-0 ${tone}`} aria-hidden="true" />{copy.title}</p>
                            <Meta label="Your Version" value={<>{e.version?.display}<span className="block text-[0.6875rem] font-normal text-ink-500">Verified as at: {e.version?.verifiedAt}</span></>} />
                            <Meta label="Current Controlled Version" value={<>{e.currentVersion?.display}<span className="block text-[0.6875rem] font-normal text-ink-500">Released: {e.currentVersion?.releasedAt}</span></>} />
                            <Meta label="Next Review Date" value={<>{nextReview}<span className="block text-[0.6875rem] font-normal text-ink-500">Review Cycle: {reviewCycle}</span></>} />
                        </div>
                        <p className="mt-3 text-xs text-ink-600">{copy.body} <span className="font-mono text-[0.625rem] text-ink-400">[{state}]</span></p>
                        <div className="mt-4 border-t border-parchment-400 pt-3">
                            <h3 className="text-xs font-bold text-ink-900 uppercase">Your Covenant</h3>
                            <p className="text-xs text-ink-600">You agree to check the current controlled version before making decisions, acting or relying on this product. Continued reliance on superseded or withdrawn versions may increase risk and reduce defensibility.</p>
                            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-5">
                                <Meta label="Jurisdiction" value={e.jurisdiction} />
                                <Meta label="Licence" value={e.licenceLabel} />
                                <Meta label="Maintenance" value={e.maintenanceStatus === 'active' ? `Active until ${e.maintenanceUntil}` : 'Not active'} />
                                <Meta label="Updates Included" value={e.updatesIncluded} />
                                <Meta label="Support" value={e.product.support} />
                            </div>
                        </div>
                    </section>
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Version History</h2>
                        <DataTable
                            columns={['Version', 'Status', 'Released', 'Verified', 'Maintenance Until', "What's New", 'Actions']}
                            rows={history.map((v) => [
                                <strong key="v">{v.display}</strong>,
                                <DpStatus key="s" status={v.status} />,
                                v.releasedAt,
                                v.verifiedAt,
                                v.maintenanceUntil,
                                <span key="w" className="block max-w-72">{v.summary}</span>,
                                v.downloadable ? (
                                    <a key="a" href={`/digital-products/library/${e.reference}/download?version=${v.id}`} className="inline-flex h-7 items-center gap-1 rounded-[4px] bg-gold-500 px-2 text-[0.6875rem] font-semibold whitespace-nowrap">
                                        <Download className="size-3" aria-hidden="true" /> {v.status === 'current' ? 'Download Current' : 'Download'}
                                    </a>
                                ) : (
                                    <Link key="a" href={`/digital-products/library/${e.reference}/updates`} className="inline-flex h-7 items-center rounded-[4px] border border-gold-500 px-2 text-[0.6875rem] font-semibold">View Details</Link>
                                ),
                            ])}
                        />
                        {downloads.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-xs font-bold text-ink-900 uppercase">Holder / Download History</h3>
                                <ul className="mt-1 text-xs text-ink-600">{downloads.map((d, i) => <li key={i}>{d.at} — {d.version} ({d.format})</li>)}</ul>
                            </div>
                        )}
                    </section>
                </div>
                <section className="self-start rounded-[8px] border border-parchment-400 bg-white p-4">
                    <h2 className="mb-2 text-xs font-bold tracking-wide text-ink-900 uppercase">Version Summary</h2>
                    <LabelValues
                        rows={[
                            { label: 'Product', value: e.product.name },
                            { label: 'Licence', value: e.licenceLabel },
                            { label: 'Format', value: e.format },
                            { label: 'Language', value: e.languageLabel },
                            { label: 'Jurisdiction', value: e.jurisdiction },
                            { label: 'Version', value: e.version?.display },
                            { label: 'Released', value: e.version?.releasedAt },
                            { label: 'Verified', value: e.version?.verifiedAt },
                            { label: 'Maintenance Status', value: e.maintenanceStatus === 'active' ? 'Active' : 'Not Active' },
                            { label: 'Maintenance Valid Until', value: e.maintenanceUntil ?? '—' },
                            { label: 'Includes Updates', value: e.updatesIncluded },
                            { label: 'Support Level', value: e.product.support },
                        ]}
                    />
                    <Link href={`/digital-products/library/${e.reference}/maintained-access`} className="mt-3 flex h-10 items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold">View Maintenance & Updates</Link>
                </section>
                <div className="space-y-4">
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Currency Covenant</h2>
                        <p className="mb-2 flex gap-2"><CircleCheck className="size-4 text-verified-500" aria-hidden="true" /><span><strong className="block">This product is priced in ZAR.</strong>Prices may change in future releases.</span></p>
                        <LabelValues rows={[{ label: 'Source Currency', value: 'ZAR' }, { label: 'Display Currency', value: 'ZAR (incl. VAT)' }, { label: 'USD Availability', value: 'Available where approved' }, { label: 'Last Price Review', value: pricing.lastReview ?? '—' }, { label: 'Next Price Review', value: pricing.nextReview ?? '—' }]} />
                    </section>
                    <HelpPanel />
                    <section className="rounded-[8px] border border-parchment-400 bg-white p-4 text-xs">
                        <h2 className="mb-2 font-bold tracking-wide text-ink-900 uppercase">Important Reminders</h2>
                        <ul className="space-y-1">
                            {['Always check the current controlled version before use.', 'Maintain your covenant and retain proof of currency.', 'Updates are included while Maintenance is active.', 'Out-of-date versions may not be defensible.'].map((r) => <li key={r} className="flex gap-1.5"><CircleCheck className="size-3.5 shrink-0 text-gold-600" aria-hidden="true" />{r}</li>)}
                        </ul>
                    </section>
                </div>
            </div>
        </LibraryShell>
    );
}

VersionStatus.layout = null;
