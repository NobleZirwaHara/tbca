import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Info } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import QuoteShell from '@/Components/DueDiligence/QuoteShell';
import DdIcon from '@/Components/DueDiligence/DdIcon';
import { Card, rand } from '@/Components/DueDiligence/Ui';
import type { DdAddon, DdQuotePageProps } from '@/types/due-diligence';

interface Props extends DdQuotePageProps {
    addons: DdAddon[];
    externalCosts: { item: string; range: string; payable: string }[];
    selectedAddons: string[];
}

/** DD-021 Add-Ons and External Costs. Toggling re-prices server side (preview), saving persists. */
export default function AddOns(props: Props) {
    const { quote, addons, externalCosts, selectedAddons } = props;
    const [busy, setBusy] = useState(false);
    const url = `/due-diligence/quotes/${quote.reference}/add-ons`;

    const toggle = (code: string) => {
        const next = selectedAddons.includes(code) ? selectedAddons.filter((c) => c !== code) : [...selectedAddons, code];
        router.get(url, { preview: 1, addons: next }, { preserveScroll: true, preserveState: true, replace: true, only: ['price', 'selectedAddons'] });
    };
    const save = () => {
        setBusy(true);
        router.post(url, { addons: selectedAddons }, { onFinish: () => setBusy(false) });
    };

    return (
        <QuoteShell
            page={props}
            title="Add-Ons and External Costs"
            subtitle="Enhance your scope if needed. All external costs are passed through at cost."
            description="Select optional add-ons to strengthen your due diligence. External costs are never hidden and are approved separately before any work begins."
            current={1}
            publicStage="1 Product or Proposal"
            priceTitle="Current price summary (ex VAT)"
            next="Review your add-ons and external costs, then proceed to final recommendation."
            aside={<Button type="button" size="lg" className="w-full" trailingIcon="arrow-right" disabled={busy} onClick={save}>Continue / Accept Scope</Button>}
        >
            <div className="grid gap-5 2xl:grid-cols-12">
                <Card title="Optional Add-Ons (Board-provisional pricing)" className="2xl:col-span-7">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left text-xs">
                            <thead className="text-ink-500"><tr>{['Add-On', 'What it includes', "When it's useful", 'Timeline impact', 'Fee*', 'Select'].map((h) => <th key={h} className="px-2 py-2">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                {addons.map((a) => (
                                    <tr key={a.code} className={selectedAddons.includes(a.code) ? 'bg-gold-50' : undefined}>
                                        <td className="px-2 py-2 font-semibold"><span className="flex items-center gap-2"><DdIcon name={a.icon} className="size-4 text-gold-600" />{a.name}</span></td>
                                        <td className="px-2 py-2 text-ink-600">{a.includes}</td>
                                        <td className="px-2 py-2 text-ink-600">{a.useful}</td>
                                        <td className="px-2 py-2">{a.timeline}</td>
                                        <td className="px-2 py-2 font-semibold whitespace-nowrap">From {rand(a.zar)}</td>
                                        <td className="px-2 py-2"><input type="checkbox" className="size-4 accent-gold-600" aria-label={`Add ${a.name}`} checked={selectedAddons.includes(a.code)} onChange={() => toggle(a.code)} /></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">* Board-provisional fees exclude VAT. Final pricing confirmed during quote acceptance.</p>
                </Card>
                <Card title="Common External Costs (At Cost)" className="2xl:col-span-5">
                    <table className="w-full text-left text-xs">
                        <thead className="text-ink-500"><tr><th className="py-2">External Cost Item</th><th>Typical Range (ex VAT)</th><th>Payable To</th></tr></thead>
                        <tbody className="divide-y divide-parchment-300">{externalCosts.map((e) => <tr key={e.item}><td className="py-2 font-medium">{e.item}</td><td>{e.range}</td><td>{e.payable}</td></tr>)}</tbody>
                    </table>
                    <p className="mt-3 rounded bg-gold-50 p-2 text-[0.6875rem] text-ink-600">All external costs are variable and charged at actual cost. You will approve each item before payment.</p>
                </Card>
            </div>
            <div className="flex gap-3 rounded-[10px] border border-controlled-500/30 bg-controlled-50 p-4">
                <Info className="size-5 shrink-0 text-controlled-600" aria-hidden="true" />
                <div>
                    <p className="text-sm font-semibold">Important</p>
                    <p className="text-xs text-ink-600">Add-ons and external costs are optional. You can proceed with the core scope without selecting any add-ons. We will notify you and obtain approval before incurring any external costs.</p>
                </div>
            </div>
        </QuoteShell>
    );
}
