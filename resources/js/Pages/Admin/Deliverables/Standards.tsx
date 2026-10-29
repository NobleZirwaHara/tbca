import { Head } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { DELIVERABLES_NAV, DeliverablesIcon } from '@/Components/Deliverables/AdminParts';

interface Standard {
    code: string | null;
    parameter: string;
    basic: string | null;
    standard: string | null;
    premium: string | null;
    unit: string | null;
    value: number | null;
    basis: string | null;
}

interface Props {
    tiers: Standard[];
    tiersV2: Standard[];
    formats: Standard[];
    sizes: Standard[];
    csatRules: string[];
    countryDeliverables: string[];
    countries: { iso3: string; country: string; region: string | null; wave: string | null; packStatus: string | null; statuses: { status: string; n: number }[] }[];
}

function TierTable({ rows }: { rows: Standard[] }) {
    return (
        <SimpleTable
            columns={['Parameter', 'Basic (Clinic Starter)', 'Standard (Growth Sprint)', 'Premium (Board Ready Sprint)', 'Basis']}
            rows={rows.map((r) => [
                <span className="font-medium text-ink-900">{r.parameter}</span>,
                <p className="min-w-40 text-xs">{r.basic}</p>,
                <p className="min-w-40 text-xs">{r.standard}</p>,
                <p className="min-w-40 text-xs">{r.premium}</p>,
                <span className="text-xs text-ink-500">{r.basis}</span>,
            ])}
        />
    );
}

export default function Standards({ tiers, tiersV2, formats, sizes, csatRules, countryDeliverables, countries }: Props) {
    return (
        <ConsoleLayout
            area="Registry of Deliverables"
            areaIcon={DeliverablesIcon}
            groups={DELIVERABLES_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Deliverables', href: '/admin/deliverables' }, { label: 'Standards and countries' }]}
            title="Deliverable Standards and Country Matrix"
            description="The design standards each package must meet, page standards and consulting standard by format, and the country deliverable set for all 54 countries."
        >
            <Head title="Deliverable Standards and Country Matrix" />

            <Panel title="Package standards (Issue 1.0)">
                <TierTable rows={tiers} />
            </Panel>

            <Panel title="Package standards added in Issue 2.0" className="mt-5">
                <TierTable rows={tiersV2} />
            </Panel>

            <Panel title="Page standards and consulting standard by format" className="mt-5">
                <SimpleTable
                    columns={['Code', 'Format', 'Basic', 'Standard', 'Premium', 'Unit', 'Consulting standard applied']}
                    rows={formats.map((f) => [
                        <span className="font-mono text-xs">{f.code}</span>,
                        <span className="whitespace-nowrap">{f.parameter}</span>,
                        f.basic,
                        f.standard,
                        f.premium,
                        <span className="text-xs whitespace-nowrap">{f.unit}</span>,
                        <p className="min-w-72 text-xs">{f.basis}</p>,
                    ])}
                />
            </Panel>

            <div className="mt-5 grid gap-5 xl:grid-cols-2 [&>*]:min-w-0">
                <Panel title="Size multiplier for page ranges">
                    <SimpleTable columns={['Size', 'Multiplier', 'Meaning']} rows={sizes.map((s) => [<span className="font-mono text-xs">{s.code}</span>, s.value, s.parameter])} />
                </Panel>
                <Panel title="Customer satisfaction rules">
                    <ul className="list-disc space-y-1.5 ps-4 text-[0.8125rem] text-ink-700">
                        {csatRules.map((r) => (
                            <li key={r}>{r}</li>
                        ))}
                    </ul>
                </Panel>
            </div>

            <Panel title={`Country matrix (${countries.length} countries)`} className="mt-5">
                <p className="mb-3 text-[0.8125rem] text-ink-500">Country deliverable set: {countryDeliverables.join(', ')}.</p>
                <SimpleTable
                    columns={['ISO3', 'Country', 'AU region', 'Wave', 'Pack status', 'Deliverable status']}
                    rows={countries.map((c) => [
                        <span className="font-mono text-xs">{c.iso3}</span>,
                        <span className="whitespace-nowrap">{c.country}</span>,
                        c.region,
                        <span className="whitespace-nowrap">{c.wave}</span>,
                        c.packStatus ? <StatusPill status={c.packStatus} tone={c.packStatus === 'Not started' ? 'neutral' : 'info'} /> : null,
                        <span className="text-xs">
                            {c.statuses.map((s) => `${s.n === countryDeliverables.length ? 'All' : s.n}: ${s.status}`).join('; ')}
                        </span>,
                    ])}
                />
            </Panel>
        </ConsoleLayout>
    );
}

Standards.layout = null;
