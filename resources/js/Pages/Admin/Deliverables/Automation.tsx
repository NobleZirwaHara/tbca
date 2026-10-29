import { Head, Link } from '@inertiajs/react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Panel, SimpleTable } from '@/Components/ui/Kit';
import { DELIVERABLES_NAV, DeliverablesIcon, fmt } from '@/Components/Deliverables/AdminParts';

interface Props {
    loops: { loopId: string; family: string; task: string; blueprint: string | null; sprints: number; deliverables: number }[];
    triggers: { trigger: string; deliverables: number }[];
    safeguards: { code: string; name: string; rule: string; ossStage: string | null; loopControl: string | null; deliverables: number }[];
    specs: { element: string; heygen: string | null; infogram: string | null }[];
}

export default function Automation({ loops, triggers, safeguards, specs }: Props) {
    return (
        <ConsoleLayout
            area="Registry of Deliverables"
            areaIcon={DeliverablesIcon}
            groups={DELIVERABLES_NAV}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Deliverables', href: '/admin/deliverables' }, { label: 'Safeguards and loops' }]}
            title="Safeguards and Payment-Trigger Loops"
            description="What starts delivery when an order is paid, the loop that runs each family of Sprints, and the automated checks applied before release."
        >
            <Head title="Safeguards and Payment-Trigger Loops" />

            <Panel title="Payment-trigger loops">
                <p className="mb-3 text-[0.8125rem] text-ink-500">
                    The register proposes that EVT-006 Payment Confirmed starts one loop per family. In this app the paid order writes an order.payment_verified event to the integration ledger,
                    and that event now lists the deliverables and the loop for each Sprint bought.
                </p>
                <SimpleTable
                    columns={['Loop', 'Family', 'Loop task', 'Owning blueprint', 'Sprints (workbook)', 'Deliverables']}
                    rows={loops.map((l) => [
                        <span className="font-mono text-xs whitespace-nowrap">{l.loopId}</span>,
                        <span className="min-w-40 block">{l.family}</span>,
                        <p className="min-w-72 text-xs">{l.task}</p>,
                        <span className="text-xs whitespace-nowrap">{l.blueprint}</span>,
                        fmt(l.sprints),
                        <Link href={`/admin/deliverables?loop=${encodeURIComponent(l.loopId)}`} className="text-gold-700 hover:underline">
                            {fmt(l.deliverables)}
                        </Link>,
                    ])}
                />
            </Panel>

            <Panel title="Triggers that start delivery" className="mt-5">
                <SimpleTable
                    columns={['Trigger', 'Deliverables']}
                    rows={triggers.map((t) => [<span className="text-[0.8125rem]">{t.trigger}</span>, fmt(t.deliverables)])}
                />
            </Panel>

            <Panel title={`Automated safeguards (${safeguards.length})`} className="mt-5">
                <SimpleTable
                    columns={['Code', 'Safeguard', 'Rule (fail-closed)', 'OSS stage', 'Loop or control', 'Deliverables']}
                    rows={safeguards.map((s) => [
                        <span className="font-mono text-xs">{s.code}</span>,
                        <span className="min-w-36 block font-medium text-ink-900">{s.name}</span>,
                        <p className="min-w-72 text-xs">{s.rule}</p>,
                        <span className="text-xs whitespace-nowrap">{s.ossStage}</span>,
                        <span className="text-xs whitespace-nowrap">{s.loopControl}</span>,
                        fmt(s.deliverables),
                    ])}
                />
            </Panel>

            <Panel title="HeyGen and Infogram specification" className="mt-5">
                <SimpleTable
                    columns={['Element', 'HeyGen (AI video)', 'Infogram (data visualisation)']}
                    rows={specs.map((s) => [
                        <span className="font-medium whitespace-nowrap text-ink-900">{s.element}</span>,
                        <p className="min-w-64 text-xs">{s.heygen}</p>,
                        <p className="min-w-64 text-xs">{s.infogram}</p>,
                    ])}
                />
            </Panel>
        </ConsoleLayout>
    );
}

Automation.layout = null;
