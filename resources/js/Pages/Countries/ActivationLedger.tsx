import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { Frame } from '@/Components/Countries/Shell';
import { LedgerTiles, OutlookTable, outlookTotals } from '@/Components/Countries/Ledger';
import { ActionButton, BUCKETS, Card, Flag, Kpi, Note, StateBadge, Table } from '@/Components/Countries/ui';
import type { Country, Outlook } from '@/types/countries';

interface Row extends Country {
    scope: string;
    limitation: string;
    version: string;
}

export default function ActivationLedger({ counts, rows, za, outlook }: { counts: Record<string, any>; rows: Row[]; za: Country; outlook: Outlook | null }) {
    const [bucket, setBucket] = useState<string>('');
    const visible = bucket ? rows.filter((r) => r.bucket === bucket) : rows;
    const o = outlook ? outlookTotals(outlook) : null;

    return (
        <Frame
            title="Country Activation Public Ledger"
            lead="The state TBCA can prove — not an expansion roadmap. No queue positions, readiness percentages, target dates or colour-only signals."
            crumbs={[{ label: 'Countries', href: '/countries' }, { label: 'Activation Ledger' }]}
            right={
                <>
                    <Card title="Current Controlled Public State">
                        <p className="text-[0.8125rem] text-ink-700">
                            South Africa: controlled country environment, subject to service-by-service resolver permission. Other {counts.shell} African country objects: shells / non-activated. Current sellable African directional corridors: {counts.sellable_corridors} until pair-specific evidence and release gates pass.
                        </p>
                    </Card>
                    <Card title="Key Actions">
                        <div className="space-y-2">
                            <ActionButton label="View Country Profile" href={`/countries/${za.slug}`} primary />
                            <ActionButton label="View Activation Detail" href={`/countries/${za.slug}/activation`} />
                            <ActionButton label="View Evidence Manifest" href={`/countries/${za.slug}/registers/manifest`} />
                            <ActionButton label="Download Public Ledger" href={`/countries/${za.slug}/brief/activation`} download />
                        </div>
                    </Card>
                </>
            }
        >
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <Kpi label="Country objects" value={counts.total} caption="One schema, 54 instances" icon="globe" />
                <Kpi label="Activated" value={counts.activated} caption="Release certificate held (scope-limited)" icon="shield-check" tone="good" />
                <Kpi label="Shells" value={counts.shell} caption="No transaction; no numeric price" icon="layers" />
                <Kpi label="Sellable directional corridors" value={counts.sellable_corridors} caption={`Raw theoretical topology ${counts.raw_topology.toLocaleString()} (not a target)`} icon="link" />
            </div>

            <Card
                title="Public Activation Ledger (54 country objects)"
                action={
                    <select aria-label="Filter by state" value={bucket} onChange={(e) => setBucket(e.target.value)} className="h-8 rounded border border-parchment-500 px-2 text-xs">
                        <option value="">All states</option>
                        {BUCKETS.map((b) => <option key={b.key} value={b.key}>{b.label}</option>)}
                    </select>
                }
            >
                <Table
                    dense
                    columns={['Country', 'Programme status', 'Activation status', 'Service scope', 'Evidence as of', 'Limitations', 'Version', 'Certificate']}
                    rows={visible.map((r) => [
                        <Link href={`/countries/${r.slug}`} className="flex items-center gap-2 font-medium text-ink-900 hover:text-gold-700"><Flag iso={r.iso2} />{r.name} <span className="text-ink-400">({r.iso2})</span></Link>,
                        r.programme_status,
                        <StateBadge bucket={r.bucket} label={r.state_label} />,
                        r.scope,
                        r.last_reviewed,
                        <span className="text-xs">{r.limitation}</span>,
                        <span className="font-mono text-xs">{r.version}</span>,
                        r.release_certificate ?? '—',
                    ])}
                />
            </Card>

            {outlook && o && (
                <>
                    <h2 className="text-lg font-semibold text-ink-900">South Africa — 12-Month Outlook by Ledger (Model Basis)</h2>
                    <LedgerTiles totals={o.totals} series={o.series} />
                    <OutlookTable outlook={outlook} />
                    <Note>All amounts are model basis estimates with current evidence. They are not prices: a numeric price is only ever returned by the Country Resolver with a signed ResolvedPricePermit.</Note>
                </>
            )}
            <button type="button" className="sr-only" onClick={() => router.reload()}>Refresh</button>
        </Frame>
    );
}
