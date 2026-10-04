import type { FormEvent } from 'react';
import { useForm } from '@inertiajs/react';
import { ArrowRight, Lock } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { cn } from '@/lib/cn';

export interface BriefOptions {
    categories: string[];
    sub_categories: string[];
    project_types: string[];
    industries: string[];
    countries: string[];
    value_bands: string[];
    durations: string[];
    outcomes: string[];
    [key: string]: string[];
}

/** Mirrors App\Http\Controllers\Shop\BriefController::OPTIONS for the product-page entry form. */
export const BRIEF_OPTIONS: BriefOptions = {
    categories: ['Business Advisory', 'Technology Solutions', 'Finance & Valuation', 'Compliance & Legal Support', 'ESG & Sustainability', 'Marketing & Research'],
    sub_categories: ['Business Valuation', 'Cybersecurity & Information Security', 'ESG Reporting', 'Market Research', 'Financial Modelling', 'Process Improvement'],
    project_types: ['One-off Project', 'Phased Project', 'Ongoing Support'],
    industries: ['Manufacturing', 'Financial Services', 'Agriculture', 'Mining', 'Energy', 'ICT', 'Healthcare', 'Retail', 'Professional Services', 'Public Sector'],
    countries: ['South Africa', 'Botswana', 'Namibia', 'Kenya', 'Nigeria', 'Ghana', 'Zambia'],
    value_bands: ['Under ZAR 100,000', 'ZAR 100,000 - ZAR 250,000', 'ZAR 250,000 - ZAR 500,000', 'ZAR 500,000 - ZAR 1,000,000', 'Over ZAR 1,000,000'],
    durations: ['Under 2 Weeks', '2 - 4 Weeks', '1 - 3 Months', '3 - 6 Months', '6+ Months'],
    outcomes: ['Identify security vulnerabilities and risks', 'Provide actionable mitigation plan', 'Improve compliance posture', 'Independent valuation report', 'Investor-ready evidence pack'],
};

/** Step 1 "Define Your Need" of the A5 Marketplace Brief (OS-014 / OS-032). */
export default function BriefStepOne({ data, options = BRIEF_OPTIONS, product, compact = false }: { data: Record<string, unknown>; options?: BriefOptions; product?: string; compact?: boolean }) {
    const str = (k: string, d = '') => (typeof data[k] === 'string' ? (data[k] as string) : d);
    const form = useForm({
        product: product ?? '',
        title: str('title'),
        category: str('category', 'Business Advisory'),
        sub_category: str('sub_category'),
        project_type: str('project_type', 'One-off Project'),
        summary: str('summary'),
        industry: str('industry', 'Manufacturing'),
        country: str('country', 'South Africa'),
        value_band: str('value_band', 'ZAR 250,000 - ZAR 500,000'),
        start_date: str('start_date'),
        duration: str('duration', '2 - 4 Weeks'),
        delivery_location: str('delivery_location', 'Remote'),
        outcomes: (Array.isArray(data.outcomes) ? data.outcomes : []) as string[],
        outcome_other: str('outcome_other'),
    });
    const e = form.errors as Record<string, string | undefined>;
    const submit = (ev: FormEvent) => {
        ev.preventDefault();
        form.post('/shop/marketplace-brief/1', { preserveScroll: true });
    };
    const toggle = (o: string) => form.setData('outcomes', form.data.outcomes.includes(o) ? form.data.outcomes.filter((x) => x !== o) : [...form.data.outcomes, o]);

    return (
        <form onSubmit={submit} noValidate className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
                <Field label="Brief Title" error={e.title} required>{(id) => <Input id={id} value={form.data.title} invalid={!!e.title} onChange={(x) => form.setData('title', x.target.value)} />}</Field>
                <Field label="Category" error={e.category} required>{(id) => <Select id={id} options={options.categories} value={form.data.category} onChange={(x) => form.setData('category', x.target.value)} />}</Field>
                <Field label="Project Summary" error={e.summary} required hint={`${form.data.summary.length} / 1000 characters`} className="md:col-span-2">
                    {(id) => <Textarea id={id} maxLength={1000} value={form.data.summary} invalid={!!e.summary} onChange={(x) => form.setData('summary', x.target.value)} />}
                </Field>
                {!compact && <Field label="Sub-Category" error={e.sub_category}>{(id) => <Select id={id} placeholder="Select..." options={options.sub_categories} value={form.data.sub_category} onChange={(x) => form.setData('sub_category', x.target.value)} />}</Field>}
                <Field label="Project Type" error={e.project_type} required>{(id) => <Select id={id} options={options.project_types} value={form.data.project_type} onChange={(x) => form.setData('project_type', x.target.value)} />}</Field>
                <Field label="Industry" error={e.industry} required>{(id) => <Select id={id} options={options.industries} value={form.data.industry} onChange={(x) => form.setData('industry', x.target.value)} />}</Field>
                <Field label="Country / Region" error={e.country} required>{(id) => <Select id={id} options={options.countries} value={form.data.country} onChange={(x) => form.setData('country', x.target.value)} />}</Field>
                <Field label="Estimated Project Value (Excl. VAT)" error={e.value_band}>{(id) => <Select id={id} options={options.value_bands} value={form.data.value_band} onChange={(x) => form.setData('value_band', x.target.value)} />}</Field>
                <Field label="Desired Start Date" error={e.start_date}>{(id) => <Input id={id} type="date" value={form.data.start_date} onChange={(x) => form.setData('start_date', x.target.value)} />}</Field>
                {!compact && <Field label="Estimated Duration" error={e.duration}>{(id) => <Select id={id} options={options.durations} value={form.data.duration} onChange={(x) => form.setData('duration', x.target.value)} />}</Field>}
                <fieldset className="md:col-span-2">
                    <legend className="text-[0.8125rem] font-medium text-ink-800">Preferred Delivery Location</legend>
                    <div className="mt-1.5 flex flex-wrap gap-2">
                        {['Remote', 'On-site', 'Hybrid'].map((l) => (
                            <button key={l} type="button" aria-pressed={form.data.delivery_location === l} onClick={() => form.setData('delivery_location', l)}
                                className={cn('h-9 rounded-[4px] border px-4 text-xs font-semibold', form.data.delivery_location === l ? 'border-gold-500 bg-gold-50 text-gold-800' : 'border-parchment-500 text-ink-700')}>
                                {l}
                            </button>
                        ))}
                    </div>
                </fieldset>
                {!compact && (
                    <fieldset className="md:col-span-2">
                        <legend className="text-[0.8125rem] font-medium text-ink-800">Desired Outcomes</legend>
                        <div className="mt-1.5 grid gap-2 sm:grid-cols-2">
                            {options.outcomes.map((o) => <Checkbox key={o} label={o} checked={form.data.outcomes.includes(o)} onChange={() => toggle(o)} />)}
                        </div>
                        <Input className="mt-2" aria-label="Other outcome" placeholder="Describe other outcomes..." value={form.data.outcome_other} onChange={(x) => form.setData('outcome_other', x.target.value)} />
                    </fieldset>
                )}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="flex items-center gap-1.5 text-xs text-ink-500"><Lock className="size-3.5" aria-hidden="true" /> Your information is secure and will only be shared with shortlisted providers under strict confidentiality.</p>
                <Button type="submit" disabled={form.processing}>Save & Continue <ArrowRight className="size-4" /></Button>
            </div>
        </form>
    );
}
