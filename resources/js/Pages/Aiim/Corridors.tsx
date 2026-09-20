import { Head } from '@inertiajs/react';
import PageHeader from '@/Components/PageHeader';
import CtaBand from '@/Components/CtaBand';
import Card from '@/Components/ui/Card';
import Icon from '@/Components/ui/Icon';
import { Section, SectionHeading } from '@/Components/ui/Section';

const NODES = [
    { name: 'Ports', body: 'Throughput, berth availability, dwell time and handling cost indicators.', icon: 'ship' },
    { name: 'Rail', body: 'Gauge, capacity, operator, condition and interchange constraints.', icon: 'train-front' },
    { name: 'Roads', body: 'Primary corridors, condition, toll regime and seasonal restrictions.', icon: 'truck' },
    { name: 'Borders', body: 'Crossing points, customs regime, clearance time and documentation.', icon: 'flag' },
    { name: 'Airports', body: 'Cargo capability, freight routes and cold-chain availability.', icon: 'map-pin' },
    { name: 'Bottlenecks', body: 'Identified constraints with source, date and confidence grade.', icon: 'triangle-alert' },
];

const CORRIDORS = [
    { name: 'North–South Corridor', route: 'Durban — Gauteng — Beitbridge — Lusaka — Copperbelt', focus: 'Mining inputs, bulk freight and regional consumer goods.' },
    { name: 'Maputo Corridor', route: 'Gauteng — Komatipoort — Maputo Port', focus: 'Bulk minerals, agriculture and containerised export.' },
    { name: 'Trans-Kalahari Corridor', route: 'Gauteng — Lobatse — Walvis Bay', focus: 'Alternative Atlantic access for Southern African freight.' },
    { name: 'Nacala Corridor', route: 'Malawi — Northern Mozambique — Nacala Port', focus: 'Agricultural export and inbound fertiliser and fuel.' },
];

export default function AiimCorridors() {
    return (
        <>
            <Head title="Corridors — AIIM" />

            <PageHeader
                eyebrow="Trade corridors, ports, rail, roads and borders"
                title="Corridors"
                lead="How Goods Actually Move."
                intro="Corridor intelligence covers ports, rail, roads, border crossings, logistics performance and the bottlenecks that decide whether a trade route works in practice."
                crumbs={[{ label: 'Home', href: '/' }, { label: 'AIIM', href: '/aiim' }, { label: 'Corridors' }]}
                aside={{
                    title: 'What a Corridor Record Holds',
                    body: 'Each corridor node carries source, date, confidence and a next review date, the same as any other AIIM record.',
                    items: ['Node type and location', 'Capacity and performance indicators', 'Constraint and bottleneck notes', 'Source, date and confidence grade'],
                    icon: 'ship',
                    link: { label: 'How we source and verify', href: '/aiim/methodology' },
                }}
            />

            <Section tone="parchment">
                <SectionHeading title="Corridor Node Types" lead="What each corridor view covers." />
                <ul className="mt-7 grid gap-px overflow-hidden rounded-[6px] border border-parchment-400 bg-parchment-400 sm:grid-cols-2 lg:grid-cols-3">
                    {NODES.map((node) => (
                        <li key={node.name} className="bg-white p-5">
                            <Icon name={node.icon} className="size-5 text-gold-600" />
                            <h3 className="mt-3 text-[0.875rem] font-semibold text-ink-900">{node.name}</h3>
                            <p className="mt-1.5 text-[0.8125rem] leading-relaxed text-ink-600">{node.body}</p>
                        </li>
                    ))}
                </ul>
            </Section>

            <Section tone="white">
                <SectionHeading title="Southern African Corridors" lead="Phase 1 corridor coverage." />
                <ul className="mt-7 grid gap-5 sm:grid-cols-2">
                    {CORRIDORS.map((corridor) => (
                        <Card as="li" key={corridor.name} hover className="p-6">
                            <h3 className="font-serif text-[1.1875rem] font-semibold tracking-[-0.01em] text-ink-900">
                                {corridor.name}
                            </h3>
                            <p className="mt-2 text-[0.8125rem] font-medium text-gold-700">{corridor.route}</p>
                            <p className="mt-3 border-t border-parchment-300 pt-3 text-[0.875rem] leading-relaxed text-ink-600">
                                {corridor.focus}
                            </p>
                        </Card>
                    ))}
                </ul>
            </Section>

            <CtaBand
                title="Need a corridor assessed for your freight?"
                body="The Trade Corridor Brief covers ports, rail, road, border and logistics bottlenecks with cost indicators."
                primary={{ label: 'Request Trade Route Advisory', href: '/contact' }}
                secondary={{ label: 'View Reports Store', href: '/aiim/store' }}
            />
        </>
    );
}
