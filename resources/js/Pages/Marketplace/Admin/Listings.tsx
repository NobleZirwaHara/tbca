import { Head, Link } from '@inertiajs/react';
import { StatusPill } from '@/Components/ui/Kit';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { zar } from '@/Components/Marketplace/ui';
import { ActionMenu, FilterSelect, KpiRow, QueryTabs, SearchBox, Table, td } from '@/Components/Marketplace/AdminKit';
import type { MkListing, RegisterNav } from '@/types/marketplace';

interface Props { nav: RegisterNav; listings: MkListing[]; counts: Record<string, number>; query: { tab: string; kind: string; q: string } }

const URL = '/admin/marketplace/listings';
const transitions: Record<string, { key: string; label: string; danger?: boolean; needsNote?: boolean }[]> = {
    pending: [{ key: 'published', label: 'Approve & Publish' }, { key: 'rejected', label: 'Reject', danger: true, needsNote: true }],
    published: [{ key: 'suspended', label: 'Suspend Listing', danger: true, needsNote: true }],
    suspended: [{ key: 'published', label: 'Reinstate' }, { key: 'rejected', label: 'Reject', danger: true, needsNote: true }],
    rejected: [{ key: 'pending', label: 'Return to Review' }],
};

export default function Listings({ nav, listings, counts, query }: Props) {
    const all = Object.values(counts).reduce((a, b) => a + b, 0);

    return (
        <AdminShell nav={nav} crumbs={[{ label: 'Marketplace', href: '/admin/marketplace' }, { label: 'Listing Moderation' }]} title="Listing Moderation" description="Approve, suspend or reject marketplace and partner service listings. Suspended or rejected listings disappear from the catalogue immediately.">
            <Head title="Listing Moderation" />
            <KpiRow items={[{ label: 'All Listings', value: all }, { label: 'Published', value: counts.published ?? 0, tone: 'good' }, { label: 'Pending Moderation', value: counts.pending ?? 0, tone: 'warn' }, { label: 'Suspended', value: counts.suspended ?? 0, tone: 'bad' }, { label: 'Rejected', value: counts.rejected ?? 0 }]} />
            <div className="mt-5 rounded-[8px] border border-parchment-400 bg-white p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <QueryTabs url={URL} query={query} tabs={{ all: 'All', pending: 'Pending', published: 'Published', suspended: 'Suspended', rejected: 'Rejected' }} counts={{ all, ...counts }} />
                    <div className="flex flex-wrap items-end gap-3"><FilterSelect url={URL} query={query} name="kind" label="Type" options={['fixed', 'recurring', 'partner']} /><SearchBox url={URL} query={query} placeholder="Search listings…" /></div>
                </div>
                <div className="mt-4">
                    <Table head={['Listing', 'Type', 'Category', 'Provider', 'Price', 'Rating', 'Status', 'Actions']} empty={listings.length === 0}>
                        {listings.map((l) => (
                            <tr key={l.slug}>
                                <td className={td}><Link href={l.kind === 'partner' ? `/partner-services/services/${l.slug}` : `/marketplace/services/${l.slug}`} className="font-semibold text-ink-900 hover:underline">{l.title}</Link><p className="text-xs text-ink-500">{l.slug}</p></td>
                                <td className={td}>{l.kind}</td><td className={td}>{l.categoryLabel}</td><td className={td}>{l.provider?.name ?? '—'}</td>
                                <td className={td}>{l.priceZar ? `${zar(l.priceZar)}${l.period ? '/mo' : ''}` : 'Quote'}</td><td className={td}>{l.rating ?? '—'} ({l.reviewsCount})</td>
                                <td className={td}><StatusPill status={l.status} /></td>
                                <td className={td}><ActionMenu url={`${URL}/${l.slug}/status`} actions={transitions[l.status] ?? []} /></td>
                            </tr>
                        ))}
                    </Table>
                </div>
            </div>
        </AdminShell>
    );
}

Listings.layout = null;
