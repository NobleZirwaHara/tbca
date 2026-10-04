import { useForm } from '@inertiajs/react';
import { AlertTriangle, CheckCircle2, Info, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import { Card } from '@/Components/DueDiligence/Ui';
import type { DdQuotePageProps } from '@/types/due-diligence';

interface Props extends DdQuotePageProps {
    included: string[];
    notIncluded: string[];
    limitations: string[];
    criteria: Record<string, string>;
}

/** DD-020 Deliverables and Limitations. */
export default function Deliverables(props: Props) {
    const { quote, sku, included, notIncluded, limitations, criteria } = props;
    const form = useForm<{ criteria: Record<string, boolean> }>({ criteria: Object.fromEntries(Object.keys(criteria).map((k) => [k, false])) });
    const allTicked = Object.values(form.data.criteria).every(Boolean);
    const submit = () => form.post(`/due-diligence/quotes/${quote.reference}/deliverables`, { preserveScroll: true });

    const List = ({ items, icon }: { items: string[]; icon: 'ok' | 'no' | 'warn' }) => (
        <ul className="space-y-1.5">
            {items.map((t) => (
                <li key={t} className="flex gap-2 text-[0.8125rem] text-ink-700">
                    {icon === 'ok' && <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-verified-500" aria-hidden="true" />}
                    {icon === 'no' && <XCircle className="mt-0.5 size-4 shrink-0 text-risk-500" aria-hidden="true" />}
                    {icon === 'warn' && <AlertTriangle className="mt-0.5 size-4 shrink-0 text-attested-500" aria-hidden="true" />}
                    {t}
                </li>
            ))}
        </ul>
    );

    return (
        <QuoteShell
            page={props}
            title="Deliverables and Limitations"
            subtitle="Confirm what is and is not delivered under your selected package."
            description="Please review the deliverables, exclusions and known limitations before you proceed."
            current={1}
            publicStage="1 Product or Proposal"
            next="Add optional services and external costs if required, then proceed to payment and onboarding."
            aside={
                <>
                    <Button type="button" size="lg" className="w-full" trailingIcon="arrow-right" disabled={!allTicked || form.processing} onClick={submit}>Continue / Accept Scope</Button>
                    {!allTicked && <p className="text-center text-xs text-ink-500">Tick every acceptance criterion to continue.</p>}
                    <Button type="button" variant="outline" className="w-full" onClick={() => openAskQuestion({ subject: `Deliverables question ${quote.reference}`, section: 'due-diligence' })}>Request Human Assistance</Button>
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-3">
                <Card title="1. Included Deliverables"><p className="mb-2 text-xs text-ink-500">You will receive the following outputs and services.</p><List items={included} icon="ok" /></Card>
                <Card title="2. Not Included"><p className="mb-2 text-xs text-ink-500">These items are excluded from this package.</p><List items={notIncluded} icon="no" /></Card>
                <Card title="3. Known Limitations"><p className="mb-2 text-xs text-ink-500">Please review the limitations that may affect results.</p><List items={limitations} icon="warn" /></Card>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
                <Card title="4. Acceptance Criteria">
                    <p className="mb-3 text-xs text-ink-500">By proceeding, you confirm the following.</p>
                    <div className="space-y-2">
                        {Object.entries(criteria).map(([k, label]) => (
                            <Checkbox key={k} label={label} checked={form.data.criteria[k]} onChange={(e) => form.setData('criteria', { ...form.data.criteria, [k]: e.target.checked })} />
                        ))}
                    </div>
                    {Object.keys(form.errors).length > 0 && <p className="mt-2 text-xs text-risk-500">Confirm each acceptance criterion to continue.</p>}
                    <div className="mt-4 flex gap-2 rounded-[8px] bg-parchment-100 p-3 text-xs text-ink-600">
                        <Info className="size-4 shrink-0 text-attested-600" aria-hidden="true" />
                        <span><strong className="text-ink-900">Important.</strong> This report is an independent risk assessment to inform decision-making. It is not a guarantee of future performance or compliance. Use alongside your own professional advice where required.</span>
                    </div>
                </Card>
                <Card title="5. Report Configuration">
                    <dl className="divide-y divide-parchment-300 text-[0.8125rem]">
                        {[
                            ['Report Format', 'PDF Report + Portal Access'],
                            ['Review Level', `${sku.coverage} (${sku.reviewLevel})`],
                            ['Access Period', '90 days from delivery'],
                            ['Data Retention', '12 months (then purged)'],
                            ['Re-run Policy', 'New quote if scope changes'],
                            ['Monitoring', 'Not included in this package'],
                        ].map(([k, v]) => <div key={k} className="flex justify-between gap-3 py-2"><dt className="text-ink-500">{k}</dt><dd className="text-right font-medium">{v}</dd></div>)}
                    </dl>
                </Card>
            </div>
        </QuoteShell>
    );
}
