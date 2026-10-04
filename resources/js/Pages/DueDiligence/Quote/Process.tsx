import { router } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { Button, ButtonLink } from '@/Components/ui/Button';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import DdIcon from '@/Components/DueDiligence/DdIcon';
import { Card, H2, IconRow, Ticks } from '@/Components/DueDiligence/Ui';
import type { DdIconItem, DdQuotePageProps } from '@/types/due-diligence';

interface Props extends DdQuotePageProps {
    process: DdIconItem[];
    stages: DdIconItem[];
    safeguards: DdIconItem[];
}

/** DD-019 Process. */
export default function Process(props: Props) {
    const { quote, family, sku, process, stages, safeguards } = props;
    const base = `/due-diligence/quotes/${quote.reference}`;

    return (
        <QuoteShell
            page={props}
            title="Process"
            subtitle={`How ${family.name} are run, reviewed and delivered.`}
            description="A structured, human-reviewed process that verifies identities, maps ownership, screens for risk and delivers clear, decision-ready findings."
            current={1}
            publicStage="1 Product or Proposal"
            hidePrice
            next="Review the deliverables next, then share required inputs when ready."
            aside={
                <>
                    <Card title="Process snapshot">
                        <Ticks items={['Lawful-purpose screening only', 'Human review before final release', 'External costs approved before commitment', 'Reports delivered through secure client portal']} />
                    </Card>
                    <Card title="Typical outputs"><div className="space-y-2">{family.receive.slice(0, 4).map((r) => <IconRow key={r.title} item={r} />)}</div></Card>
                    <Button type="button" size="lg" className="w-full" trailingIcon="arrow-right" onClick={() => router.post(`${base}/process`)}>Continue to Deliverables</Button>
                    <ButtonLink href={`${base}/inputs`} variant="outline" className="w-full">View Inputs Required</ButtonLink>
                    <p className="flex gap-2 rounded-[8px] bg-white p-3 text-xs text-ink-600"><Info className="size-4 shrink-0 text-controlled-600" aria-hidden="true" />Fee trigger: none on this screen. Final pricing and external costs are confirmed at quotation and consent stage.</p>
                </>
            }
        >
            <div>
                <H2 className="mb-3">1. How the process works</H2>
                <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                    {process.map((p, i) => (
                        <li key={p.title} className="rounded-[10px] border border-parchment-400 bg-white p-3 text-center">
                            <span className="mx-auto flex size-6 items-center justify-center rounded-full bg-gold-500 text-xs font-bold text-ink-950">{i + 1}</span>
                            <DdIcon name={p.icon} className="mx-auto mt-2 size-7 text-gold-600" />
                            <p className="mt-2 text-[0.8125rem] font-semibold">{p.title}</p>
                            <p className="mt-1 text-[0.6875rem] text-ink-500">{p.body}</p>
                        </li>
                    ))}
                </ol>
            </div>
            <div>
                <H2 className="mb-3">2. What happens at each stage</H2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{stages.map((s) => <Card key={s.title}><IconRow item={s} /></Card>)}</div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
                <Card title="3. Indicative turnaround (SLA) from receipt of complete, valid intake">
                    <dl className="grid gap-2 sm:grid-cols-3">
                        {[['Selected package', sku.timeline], ['Your estimate', props.price.turnaround], ['Review level', sku.reviewLevel]].map(([k, v]) => (
                            <div key={k} className="rounded bg-parchment-100 p-2"><dt className="text-xs text-ink-500">{k}</dt><dd className="text-sm font-semibold">{v}</dd></div>
                        ))}
                    </dl>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">Complex structures, jurisdictional restrictions or external data dependencies can extend timelines.</p>
                </Card>
                <Card title="4. Controls and safeguards"><div className="grid gap-2 sm:grid-cols-2">{safeguards.map((s) => <IconRow key={s.title} item={s} />)}</div></Card>
            </div>
        </QuoteShell>
    );
}
