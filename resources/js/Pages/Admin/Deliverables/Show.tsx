import { Head, Link } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Panel, SimpleTable, StatusPill, Tag } from '@/Components/ui/Kit';
import { DELIVERABLES_NAV, DeliverablesIcon, Facts } from '@/Components/Deliverables/AdminParts';

type Text = string | null;

interface TierRow {
    tier: 'basic' | 'standard' | 'premium';
    extent: Text;
    pages: Text;
    page_unit: Text;
    delivery: Text;
    csat_min: number | null;
    uplift: Text;
    video: Text;
    visuals: Text;
}

interface Props {
    register: Record<string, Text>;
    derived: {
        format_code: Text;
        loop_id: Text;
        automation_family: Text;
        owner_blueprint: Text;
        trigger: Text;
        workflow: string[];
        safeguard_codes: string[];
        tiers: TierRow[];
        market_median: Text;
    };
    columns: Record<string, string>;
    safeguards: { code: string; name: string; rule: string; oss_stage: string | null; loop_control: string | null }[];
    missingSafeguards: string[];
    loop: { loop_id: string; family: string; task: string; owning_blueprint: string | null; sprints: number } | null;
    formatStandard: { code: string; format: string; basic: Text; standard: Text; premium: Text; unit: Text; consultingStandard: Text } | null;
    sprints: { code: string; name: Text; batch: Text; population: Text; status: string; match: string; href: string | null }[];
    products: { product_type: string; typeLabel: string; product_code: string; product_name: Text; product_url: Text; scope: string; match_method: string; note: Text }[];
}

const TIER_LABEL = { basic: 'Basic', standard: 'Standard', premium: 'Premium' } as const;

/** Splits "A; B; C" or "A · B · C" lists for reading; the stored text is unchanged. */
const parts = (t: Text, sep: RegExp) => (t ? t.split(sep).map((s) => s.trim()).filter(Boolean) : []);

function Bullets({ items }: { items: string[] }) {
    if (items.length === 0) return <span className="text-ink-400">Not stated</span>;
    return (
        <ul className="list-disc space-y-1 ps-4">
            {items.map((i, n) => (
                <li key={n}>{i}</li>
            ))}
        </ul>
    );
}

export default function DeliverableShow({ register: d, derived: x, columns, safeguards, missingSafeguards, loop, formatStandard, sprints, products }: Props) {
    const csat = (v: number | null) => (v === null ? '' : `${Math.round(v * 1000) / 10}%`);

    return (
        <ConsoleLayout
            area="Registry of Deliverables"
            areaIcon={DeliverablesIcon}
            groups={DELIVERABLES_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Deliverables', href: '/admin/deliverables' }, { label: d.ref ?? '' }]}
            title={d.name ?? ''}
            badge={<Tag tone="neutral">{d.ref}</Tag>}
            description={`${d.tab}${d.family ? ` / ${d.family}` : ''}`}
        >
            <Head title={`${d.ref} ${d.name}`} />

            <div className="grid gap-5 xl:grid-cols-2 [&>*]:min-w-0">
                <Panel title="Deliverable">
                    <Facts
                        rows={[
                            [columns.format_class, `${d.format_class}${d.format_detail && d.format_detail !== d.format_class ? `: ${d.format_detail}` : ''}${x.format_code ? ` (${x.format_code})` : ''}`],
                            [columns.description, d.description],
                            [columns.audience, d.audience],
                            [columns.client_problem, d.client_problem],
                            [columns.sprint_type, d.sprint_type],
                            [columns.source, d.source],
                            [columns.linked_sprint_codes, d.linked_sprint_codes],
                            [columns.v2_status, d.v2_status],
                        ]}
                    />
                </Panel>
                <Panel title="Key issues to be included">
                    <div className="text-[0.8125rem] text-ink-800">
                        <Bullets items={parts(d.key_issues, /;\s*/)} />
                    </div>
                </Panel>
            </div>

            <Panel title="Depth and length by package" className="mt-5">
                <SimpleTable
                    columns={['', ...x.tiers.map((t) => TIER_LABEL[t.tier])]}
                    rows={[
                        ['Extent of detail', ...x.tiers.map((t) => <p className="min-w-56 text-xs">{t.extent}</p>)],
                        ['Length', ...x.tiers.map((t) => <span className="whitespace-nowrap">{t.pages ? `${t.pages} ${t.page_unit ?? ''}` : ''}</span>)],
                        ['Delivery', ...x.tiers.map((t) => t.delivery)],
                        ['CSAT minimum', ...x.tiers.map((t) => csat(t.csat_min))],
                        ['Catalogue package', ...(['basic', 'standard', 'premium'] as const).map((t) => <p className="min-w-56 text-xs">{d[`package_${t}`]}</p>)],
                        ['Depth uplift (Issue 2.0)', ...x.tiers.map((t) => <p className="min-w-56 text-xs">{t.uplift}</p>)],
                        ['HeyGen video', ...x.tiers.map((t) => <p className="min-w-56 text-xs">{t.video}</p>)],
                        ['Infogram visuals', ...x.tiers.map((t) => <p className="min-w-56 text-xs">{t.visuals}</p>)],
                    ]}
                />
            </Panel>

            <div className="mt-5 grid gap-5 xl:grid-cols-2 [&>*]:min-w-0">
                <Panel title="What starts delivery">
                    <Facts
                        rows={[
                            ['Trigger', x.trigger],
                            ['Payment-trigger loop', x.loop_id],
                            ['Loop family', loop?.family ?? null],
                            ['Owning blueprint', loop?.owning_blueprint ?? x.owner_blueprint],
                            ['Loop task', loop?.task ?? null],
                            [columns.catalogue_delivery, d.catalogue_delivery],
                        ]}
                    />
                </Panel>
                <Panel title="Workflow after payment">
                    {x.workflow.length === 0 ? (
                        <p className="text-[0.8125rem] text-ink-400">No workflow stated.</p>
                    ) : (
                        <ol className="space-y-1.5 text-[0.8125rem] text-ink-800">
                            {x.workflow.map((s, i) => (
                                <li key={i} className="flex gap-2">
                                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold-500 text-[0.6875rem] font-bold text-ink-900">{i + 1}</span>
                                    <span className="min-w-0 [overflow-wrap:anywhere]">{s}</span>
                                </li>
                            ))}
                        </ol>
                    )}
                </Panel>
            </div>

            <Panel title="Consultancy benchmark comparison" className="mt-5">
                <Facts
                    rows={[
                        [columns.consulting_standard, d.consulting_standard],
                        ['Page standard for this format (size M)', formatStandard ? `Basic ${formatStandard.basic} | Standard ${formatStandard.standard} | Premium ${formatStandard.premium} ${formatStandard.unit ?? ''}` : null],
                        [columns.beyond_benchmark, d.beyond_benchmark],
                        ['Market median price', x.market_median],
                        [columns.catalogue_price, d.catalogue_price],
                    ]}
                />
            </Panel>

            <Panel title={`Automated safeguards (${x.safeguard_codes.length})`} className="mt-5">
                <SimpleTable
                    columns={['Code', 'Safeguard', 'Rule (fail-closed)', 'OSS stage', 'Loop or control']}
                    empty="No safeguards listed."
                    rows={safeguards.map((s) => [
                        <span className="font-mono text-xs">{s.code}</span>,
                        <span className="whitespace-nowrap">{s.name}</span>,
                        <p className="min-w-72 text-xs">{s.rule}</p>,
                        <span className="text-xs whitespace-nowrap">{s.oss_stage}</span>,
                        <span className="text-xs whitespace-nowrap">{s.loop_control}</span>,
                    ])}
                />
                {missingSafeguards.length > 0 && <p className="mt-2 text-xs text-risk-700">Listed on the row but not in the Safeguards sheet: {missingSafeguards.join(', ')}</p>}
            </Panel>

            <div className="mt-5 grid gap-5 xl:grid-cols-2 [&>*]:min-w-0">
                <Panel title="Automation and acceptance">
                    <Facts
                        rows={[
                            [columns.automation_route, d.automation_route],
                            [columns.ai_depth, d.ai_depth],
                            [columns.acceptance, <Bullets items={parts(d.acceptance, /\s·\s/)} />],
                        ]}
                    />
                </Panel>
                <Panel title="Scope boundaries">
                    <Facts
                        rows={[
                            [columns.companion_assets, d.companion_assets],
                            [columns.client_inputs, d.client_inputs],
                            [columns.exclusions, d.exclusions],
                            [columns.add_ons, d.add_ons],
                            [columns.next_offer, d.next_offer],
                        ]}
                    />
                </Panel>
            </div>

            {products.length > 0 && (
                <Panel title={`Other products in the app (${products.length})`} className="mt-5">
                    <SimpleTable
                        columns={['Product type', 'Code', 'Product', 'How it was matched']}
                        rows={products.map((p) => [
                            p.typeLabel,
                            <span className="font-mono text-xs whitespace-nowrap">{p.product_code === '*' ? 'All' : p.product_code}</span>,
                            p.product_url ? (
                                <Link href={p.product_url} className="text-gold-700 hover:underline">
                                    {p.product_name}
                                </Link>
                            ) : (
                                p.product_name
                            ),
                            <span className="text-xs">
                                {p.match_method}
                                {p.note ? `: ${p.note}` : ''}
                            </span>,
                        ])}
                    />
                </Panel>
            )}

            <Panel title={`Sprints in the crosswalk (${sprints.length})`} className="mt-5">
                <SimpleTable
                    columns={['Sprint code', 'Sprint name', 'Batch', 'Population', 'Crosswalk status', 'App Sprint']}
                    empty="This deliverable is an Issue 1.0 design deliverable with no catalogue Sprint."
                    rows={sprints.map((s) => [
                        <span className="font-mono text-xs whitespace-nowrap">{s.code}</span>,
                        s.name,
                        s.batch,
                        s.population,
                        <span className="text-xs">{s.status}</span>,
                        s.href ? (
                            <Link href={s.href} className="text-xs text-gold-700 hover:underline">
                                Open Sprint page
                            </Link>
                        ) : (
                            <StatusPill status={s.match === 'unmatched' ? 'Not in app' : 'Not published'} tone="neutral" />
                        ),
                    ])}
                />
            </Panel>
        </ConsoleLayout>
    );
}

DeliverableShow.layout = null;
