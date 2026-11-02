import { Hero, Panel, PillLink, ProtoFrame, SvcRail, type SvcCard } from '@/Components/Aiim/ProtoLibrary';
import { Dl, useMoney } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { AiimPageProps } from '@/types/aiim';
import type { ReportProps } from './Quote';

export const STATUS_LABEL: Record<string, string> = {
    draft: 'Draft', changes_requested: 'Changes requested', quoted: 'Quoted', paid: 'Paid', accepted: 'Accepted', in_production: 'In production', delivered: 'Delivered',
};

export function StatusPill({ status }: { status: string }) {
    const tone = status === 'delivered' ? 'bg-verified-50 text-verified-700' : ['in_production', 'paid'].includes(status) ? 'bg-controlled-50 text-controlled-700' : 'bg-attested-50 text-attested-700';
    return <span className={cn('rounded-full px-2 py-0.5 text-[0.72rem] font-semibold whitespace-nowrap', tone)}>{STATUS_LABEL[status] ?? status}</span>;
}

/** Delivery stages (prototype Page 38) with how far this report has gone. */
export function Stages({ r }: { r: ReportProps }) {
    const bw = r.scope.startsWith('Botswana');
    const stages = ['Order confirmed', bw ? 'Agents draft from BW-1.0 registers' : 'Agents draft from the country registers', 'Analyst review (human)', 'Source manifest attached', 'Delivered to workspace and WhatsApp'];
    const done = r.status === 'delivered' ? 5 : r.status === 'in_production' ? 1 : r.paid || r.status === 'paid' ? 1 : 0;
    const on = r.status === 'delivered' ? -1 : r.status === 'in_production' ? 2 : r.paid ? 1 : 0;
    return (
        <ol className="grid gap-0">
            {stages.map((s, i) => (
                <li key={s} className="relative flex items-center gap-3 py-2 ps-1 text-[0.86rem]">
                    <span className={cn('grid size-6 shrink-0 place-items-center rounded-full border-2 text-[0.7rem] font-bold', i < done ? 'border-verified-500 bg-verified-500 text-white' : i === on ? 'border-gold-500 bg-gold-100 text-gold-800' : 'border-parchment-500 bg-white text-ink-400')}>{i < done ? '✓' : i + 1}</span>
                    <span className={cn(i < done ? 'text-ink-800' : i === on ? 'font-semibold text-ink-900' : 'text-ink-400')}>{s}</span>
                </li>
            ))}
        </ol>
    );
}

/** Page 38: Report Delivery for one report. */
export default function Delivery({ report: r, rail }: AiimPageProps & { report: ReportProps; rail: SvcCard[] }) {
    const money = useMoney();
    return (
        <ProtoFrame title="Report Delivery" crumbs={[{ label: 'Workspace', href: '/aiim/workspace' }, { label: 'Reports', href: '/aiim/workspace/reports' }, { label: r.reference }]}>
            <Hero eyebrow="Page 38" title="Report Delivery" lead={r.title} />
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="grid content-start gap-4">
                    <Panel title="Your report" right={<StatusPill status={r.status} />}>
                        <Dl rows={[
                            ['Report', <span key="r" className="font-mono">{r.reference}</span>], ['Quote', r.quoteReference ?? '—'], ['Format', `${r.typeName} (${r.typeCode})`],
                            ['Scope', `${r.scope} · ${r.sectors}`], ['Includes', r.modules.join(' · ')], ['Order', r.orderReference ?? '—'],
                            ['Payment', r.paid ? 'Paid' : 'Pending'], ['Amount', `${money(r.total)} incl. VAT`], ...(r.deliveredAt ? [['Delivered', `${r.deliveredAt}${r.delivery?.email ? ` to ${r.delivery.email}` : ''}`] as [string, string]] : []),
                        ]} />
                        {r.status === 'quoted' && <div className="mt-3"><PillLink href={`/aiim/reports/${r.reference}/quote`}>Open quotation</PillLink></div>}
                    </Panel>
                    <Panel title="Delivery stages"><Stages r={r} /></Panel>
                </div>
                <div className="grid content-start gap-4"><SvcRail title="After delivery" items={rail} /></div>
            </div>
        </ProtoFrame>
    );
}
