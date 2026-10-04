import type { ReactNode } from 'react';
import { Link, useForm } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Info, Lock, ShieldCheck } from 'lucide-react';
import PurchaseShell from '@/Components/Products/Digital/PurchaseShell';
import { DarkCard, TrustBand } from '@/Components/Products/Digital/Ui';
import { openAskQuestion } from '@/Components/AskQuestion';
import { LabelValues } from '@/Components/Products/Shared';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { DpProductDetail, DpVersion } from '@/Components/Products/Digital/types';
import { CloudDownload, FileText, Scale, UserCheck } from 'lucide-react';

type V = DpVersion & { selectable: boolean; note: string };

const NOTE_TONE: Record<string, string> = { current: 'bg-verified-500', superseded: 'bg-verified-400', historical: 'bg-attested-500', archived: 'bg-risk-500', withdrawn_unsafe: 'bg-risk-600' };

export default function Options({
    product,
    versions,
    selection,
}: {
    product: DpProductDetail;
    versions: V[];
    selection: { licence: string; licenceLabel: string; price: number; version_id: number | undefined; format: string; language: string };
}) {
    const price = usePrice();
    const form = useForm({ version_id: selection.version_id ?? 0, format: selection.format, language: selection.language });
    const chosen = versions.find((v) => v.id === form.data.version_id);
    const lang = product.languageOptions.find((l) => l.code === form.data.language);

    const Radio = ({ checked, disabled, onSelect, title, sub, aside }: { checked: boolean; disabled?: boolean; onSelect: () => void; title: string; sub?: string; aside?: ReactNode }) => (
        <button
            type="button"
            role="radio"
            aria-checked={checked}
            disabled={disabled}
            onClick={onSelect}
            className={cn('flex w-full items-center gap-3 rounded-[6px] border px-3 py-2.5 text-left', checked ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white', disabled && 'cursor-not-allowed opacity-50')}
        >
            <span className={cn('flex size-4 shrink-0 items-center justify-center rounded-full border', checked ? 'border-gold-600' : 'border-ink-300')}>{checked && <span className="size-2 rounded-full bg-gold-600" />}</span>
            <span className="min-w-0 flex-1">
                <span className="block text-[0.8125rem] font-semibold text-ink-900">{title}</span>
                {sub && <span className="block text-[0.6875rem] text-ink-500">{sub}</span>}
            </span>
            {aside}
        </button>
    );

    return (
        <PurchaseShell
            product={product}
            title={product.name}
            lead={product.tagline}
            step={2}
            crumbs={[
                { label: 'Digital Products', href: '/digital-products' },
                { label: product.name, href: `/digital-products/${product.slug}` },
                { label: `Licence (${selection.licenceLabel.replace(' – ', ' ')})`, href: `/digital-products/${product.slug}/licence` },
                { label: 'Version, Format & Language' },
            ]}
            meta={[
                { label: 'Licence Class', value: selection.licenceLabel },
                { label: 'Jurisdiction', value: product.jurisdiction },
                { label: 'Current Version', value: product.currentVersion?.display ?? '—' },
                { label: 'Verified as at', value: product.verifiedAt ?? '—' },
            ]}
            aside={
                <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold text-ink-500">Selected Licence</p>
                            <p className="text-sm font-semibold text-ink-900">{selection.licenceLabel}</p>
                        </div>
                        <Link href={`/digital-products/${product.slug}/licence`} className="text-xs font-semibold text-gold-700 underline">
                            Change
                        </Link>
                    </div>
                    <p className="mt-3 text-[0.6875rem] text-ink-500">Source Price (ZAR)</p>
                    <p className="font-serif text-2xl font-semibold">From {price(selection.price)}</p>
                    <p className="text-xs font-semibold text-verified-600">or USD Available</p>
                </div>
            }
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post(`/digital-products/${product.slug}/options`, { preserveScroll: true });
                }}
                className="space-y-4"
            >
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-bold tracking-wide text-ink-900 uppercase">Step 2 of 6: Choose version, format & language</h2>
                        <p className="text-xs text-ink-500">Select only from approved combinations. Unavailable options are disabled with reasons.</p>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-[6px] border border-gold-300 bg-gold-50 px-3 py-1.5 text-xs font-semibold text-ink-800">
                        <ShieldCheck className="size-4 text-gold-600" aria-hidden="true" /> All combinations are governed by TBCA Version Covenant
                    </span>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_1fr_1fr_300px]">
                    <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <legend className="sr-only">Version</legend>
                        <h3 className="flex items-center gap-1 font-semibold text-ink-900">1. Version <Info className="size-3.5 text-gold-600" aria-hidden="true" /></h3>
                        <p className="mb-3 text-xs text-ink-500">Choose the edition you want to download.</p>
                        <div className="space-y-2" role="radiogroup">
                            {versions.map((v) => (
                                <Radio
                                    key={v.id}
                                    checked={form.data.version_id === v.id}
                                    disabled={!v.selectable}
                                    onSelect={() => form.setData('version_id', v.id)}
                                    title={v.status === 'current' ? `${v.label} (Current)` : v.label}
                                    aside={
                                        <span className="flex items-center gap-1.5 text-[0.6875rem] text-ink-600">
                                            <span className={cn('size-2 rounded-full', NOTE_TONE[v.status] ?? 'bg-ink-300')} /> {v.note}
                                        </span>
                                    }
                                />
                            ))}
                        </div>
                        {form.errors.version_id && <p role="alert" className="mt-2 text-xs text-risk-600">{form.errors.version_id}</p>}
                        <p className="mt-3 flex gap-1.5 rounded-[6px] bg-verified-50 p-2 text-[0.6875rem] text-verified-700">
                            <Info className="size-3.5 shrink-0" aria-hidden="true" /> Current version includes all published updates and corrections.
                        </p>
                    </fieldset>

                    <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <legend className="sr-only">Format</legend>
                        <h3 className="flex items-center gap-1 font-semibold text-ink-900">2. Format <Info className="size-3.5 text-gold-600" aria-hidden="true" /></h3>
                        <p className="mb-3 text-xs text-ink-500">Choose the file format that works best for you.</p>
                        <div className="space-y-2" role="radiogroup">
                            {product.formatOptions.map((f) => (
                                <Radio
                                    key={f.code}
                                    checked={form.data.format === f.code}
                                    onSelect={() => form.setData('format', f.code)}
                                    title={f.code}
                                    sub={f.note}
                                    aside={f.code === product.format ? <span className="rounded border border-gold-400 px-1.5 text-[0.625rem] text-gold-800">Recommended</span> : undefined}
                                />
                            ))}
                        </div>
                        <p className="mt-3 flex gap-1.5 rounded-[6px] bg-verified-50 p-2 text-[0.6875rem] text-verified-700">
                            <Info className="size-3.5 shrink-0" aria-hidden="true" /> All formats are functionally equivalent in content.
                        </p>
                    </fieldset>

                    <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <legend className="sr-only">Language</legend>
                        <h3 className="flex items-center gap-1 font-semibold text-ink-900">3. Language <Info className="size-3.5 text-gold-600" aria-hidden="true" /></h3>
                        <p className="mb-3 text-xs text-ink-500">Select your preferred language.</p>
                        <div className="space-y-2" role="radiogroup">
                            {product.languageOptions.map((l) => (
                                <Radio
                                    key={l.code}
                                    checked={form.data.language === l.code}
                                    disabled={l.state !== 'approved'}
                                    onSelect={() => form.setData('language', l.code)}
                                    title={`${l.code} – ${l.label}`}
                                    sub={l.note}
                                    aside={l.state === 'review' ? <span className="rounded bg-attested-50 px-1.5 text-[0.625rem] font-bold text-attested-700">UAT</span> : undefined}
                                />
                            ))}
                        </div>
                        {form.errors.language && <p role="alert" className="mt-2 text-xs text-risk-600">{form.errors.language}</p>}
                        <p className="mt-3 flex gap-1.5 rounded-[6px] bg-attested-50 p-2 text-[0.6875rem] text-attested-700">
                            <Info className="size-3.5 shrink-0" aria-hidden="true" /> Afrikaans release requires human review and legal clearance.
                        </p>
                    </fieldset>

                    <DarkCard title="Your Selection">
                        <LabelValues
                            rows={[
                                { label: 'Product', value: product.name },
                                { label: 'Licence', value: selection.licenceLabel },
                                { label: 'Version', value: chosen ? (chosen.status === 'current' ? `${chosen.label} (Current)` : chosen.label) : '—' },
                                { label: 'Format', value: form.data.format },
                                { label: 'Language', value: `${form.data.language} – ${lang?.label ?? ''}` },
                                { label: 'Jurisdiction', value: product.jurisdiction },
                                { label: 'Verified as at', value: chosen?.verifiedAt ?? '—' },
                                { label: 'Source Price (ZAR)', value: `From ${price(selection.price)}`, strong: true },
                                { label: 'VAT Treatment', value: 'VAT-exclusive' },
                                { label: 'Currency Display', value: 'USD Available' },
                            ]}
                        />
                        <button type="submit" disabled={form.processing} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900 hover:bg-gold-400">
                            Continue to Disclosure <ArrowRight className="size-4" aria-hidden="true" />
                        </button>
                    </DarkCard>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Link href={`/digital-products/${product.slug}/licence`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-4 text-sm font-semibold">
                        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Licence
                    </Link>
                    <p className="text-xs text-ink-600">
                        <strong>Need a different combination?</strong>{' '}
                        <button type="button" className="font-semibold text-gold-700 underline" onClick={() => openAskQuestion({ subject: `Combination request: ${product.name}`, section: 'digital-products' })}>
                            Chat with TBCA for guidance →
                        </button>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-ink-500">
                        <Lock className="size-4" aria-hidden="true" /> Changes you make here will be reflected in your order review.
                    </p>
                </div>
                <TrustBand
                    items={[
                        { icon: ShieldCheck, title: 'Only approved combinations', body: 'Every option is tested and supported' },
                        { icon: CloudDownload, title: 'Instant access after payment', body: 'Download immediately after verification' },
                        { icon: FileText, title: 'Version controlled', body: 'Always know what you are using' },
                        { icon: Scale, title: 'South African law aligned', body: 'ECTA & CPA compliant' },
                        { icon: UserCheck, title: 'Human-reviewed content', body: 'Not auto-generated or AI-only' },
                    ]}
                />
            </form>
        </PurchaseShell>
    );
}
