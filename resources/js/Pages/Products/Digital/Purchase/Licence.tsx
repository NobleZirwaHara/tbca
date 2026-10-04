import { Link, useForm } from '@inertiajs/react';
import { Award, Briefcase, Building2, Check, CircleHelp, Lock, RefreshCw, ShieldCheck, User, Users, X, ArrowLeft, ArrowRight, Headphones, type LucideIcon } from 'lucide-react';
import PurchaseShell from '@/Components/Products/Digital/PurchaseShell';
import { openAskQuestion } from '@/Components/AskQuestion';
import { cn } from '@/lib/cn';
import { usePrice } from '@/lib/money';
import type { DpLicence, DpProductDetail } from '@/Components/Products/Digital/types';

const ICONS: Record<string, LucideIcon> = { user: User, users: Users, building: Building2, briefcase: Briefcase, award: Award };

interface Use {
    key: string;
    label: string;
    body: string;
    licence: string;
}

export default function Licence({
    product,
    licences,
    uses,
    adequacy,
    selection,
}: {
    product: DpProductDetail;
    licences: DpLicence[];
    uses: Use[];
    adequacy: Record<string, Record<string, boolean>>;
    selection: { use: string; licence: string };
}) {
    const price = usePrice();
    const form = useForm({ use: selection.use, licence: selection.licence });
    const recommended = uses.find((u) => u.key === form.data.use)?.licence ?? 'L2';

    const chooseUse = (key: string) => {
        const rec = uses.find((u) => u.key === key)?.licence ?? 'L2';
        const recLicence = licences.find((l) => l.code === rec);
        // Move to the recommended class if it is sold, else the next adequate permitted class.
        const next = recLicence?.permitted && rec !== 'L5' ? rec : licences.find((l) => l.code !== 'L5' && l.permitted && adequacy[key]?.[l.code])?.code ?? rec;
        form.setData({ use: key, licence: next });
    };

    return (
        <PurchaseShell
            product={product}
            title="Licence Selector"
            lead="Choose the licence that matches how you will use this product."
            step={1}
            crumbs={[{ label: 'Digital Products', href: '/digital-products' }, { label: product.name, href: `/digital-products/${product.slug}` }, { label: 'Licence Selector' }]}
        >
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post(`/digital-products/${product.slug}/licence`, { preserveScroll: true });
                }}
                className="space-y-5"
            >
                <div className="grid gap-5 xl:grid-cols-[300px_1fr]">
                    <fieldset className="rounded-[8px] border border-parchment-400 bg-white p-4">
                        <legend className="sr-only">Declared use</legend>
                        <h2 className="text-xs font-bold tracking-wide text-ink-900 uppercase">Step 1 of 6: Declare how you will use this product</h2>
                        <p className="mt-1 text-xs text-ink-500">Select the option that best describes your intended use. We will recommend the correct licence.</p>
                        <div className="mt-3 space-y-2" role="radiogroup">
                            {uses.map((u) => (
                                <label key={u.key} className={cn('flex cursor-pointer gap-2.5 rounded-[6px] border p-2.5', form.data.use === u.key ? 'border-gold-500 bg-gold-50' : 'border-transparent hover:bg-parchment-100')}>
                                    <input type="radio" name="use" value={u.key} checked={form.data.use === u.key} onChange={() => chooseUse(u.key)} className="mt-0.5 accent-gold-600" />
                                    <span>
                                        <span className="block text-[0.8125rem] font-semibold text-ink-900">{u.label}</span>
                                        <span className="block text-[0.6875rem] text-ink-500">{u.body}</span>
                                    </span>
                                </label>
                            ))}
                        </div>
                        <div className="mt-4 flex gap-2 rounded-[6px] border border-gold-300 bg-gold-50 p-3">
                            <CircleHelp className="size-5 shrink-0 text-gold-700" aria-hidden="true" />
                            <div>
                                <p className="text-xs font-semibold text-ink-900">Not sure which licence to choose?</p>
                                <p className="text-[0.6875rem] text-ink-600">Answer a few quick questions and we will recommend</p>
                                <button type="button" onClick={() => openAskQuestion({ subject: `Licence help: ${product.name}`, section: 'digital-products' })} className="mt-2 rounded-[4px] border border-gold-500 bg-white px-2.5 py-1 text-xs font-semibold">
                                    Help me choose →
                                </button>
                            </div>
                        </div>
                    </fieldset>

                    <section>
                        <h2 className="text-xs font-bold tracking-wide text-ink-900 uppercase">Available Licence Options</h2>
                        <p className="mt-1 text-xs text-ink-500">Pick a licence class below. Unavailable classes stay visible with the reason they cannot be selected.</p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                            {licences.map((l) => {
                                const Icon = ICONS[l.icon] ?? User;
                                const adequate = adequacy[form.data.use]?.[l.code] ?? true;
                                const selectable = l.code !== 'L5' && Boolean(l.permitted) && adequate;
                                const active = form.data.licence === l.code;
                                const reason = l.code === 'L5' ? null : !l.permitted ? 'Not offered for this product (rights not cleared).' : !adequate ? 'Does not cover your declared use.' : null;
                                return (
                                    <div key={l.code} className={cn('flex flex-col rounded-[8px] border bg-white p-3', active ? 'border-gold-500 ring-1 ring-gold-500' : 'border-parchment-400', !selectable && l.code !== 'L5' && 'opacity-70')}>
                                        <span className="self-start rounded border border-parchment-500 px-1.5 text-[0.625rem] font-bold">{l.code}</span>
                                        <Icon className="mx-auto mt-1 size-8 text-gold-600" aria-hidden="true" />
                                        <h3 className="mt-1 text-center text-sm font-bold text-ink-900">{l.name}</h3>
                                        <p className="mt-1 text-center text-[0.6875rem] text-ink-600">{l.summary}</p>
                                        <ul className="mt-3 space-y-1">
                                            {l.allowed.map((a) => (
                                                <li key={a} className="flex gap-1.5 text-[0.6875rem] text-ink-700">
                                                    <Check className="size-3.5 shrink-0 text-verified-500" aria-hidden="true" /> {a}
                                                </li>
                                            ))}
                                        </ul>
                                        {l.not_allowed.length > 0 && (
                                            <>
                                                <p className="mt-2 text-[0.6875rem] font-semibold text-ink-800">Not approved for</p>
                                                <ul className="mt-1 space-y-1">
                                                    {l.not_allowed.map((a) => (
                                                        <li key={a} className="flex gap-1.5 text-[0.6875rem] text-ink-500">
                                                            <X className="size-3.5 shrink-0 text-risk-500" aria-hidden="true" /> {a}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </>
                                        )}
                                        {l.review && (
                                            <p className="mt-3 rounded-[6px] border border-gold-300 bg-gold-50 p-2 text-[0.6875rem] text-ink-700">
                                                <strong className="block text-ink-900">Requires review</strong>
                                                {l.review}
                                            </p>
                                        )}
                                        <div className="mt-auto pt-3 text-center">
                                            {l.code !== 'L5' && l.price ? (
                                                <p className="text-sm font-semibold">
                                                    From {price(l.price)}
                                                    <span className="block text-[0.625rem] font-normal text-verified-600">or USD Available</span>
                                                </p>
                                            ) : null}
                                            {reason && <p className="text-[0.6875rem] text-risk-600">{reason}</p>}
                                            {l.code === 'L5' ? (
                                                <button
                                                    type="button"
                                                    onClick={() => openAskQuestion({ subject: `L5 white-label / resale review: ${product.name}`, section: 'digital-products' })}
                                                    className="mt-2 h-8 w-full rounded-[4px] border border-gold-500 text-xs font-semibold"
                                                >
                                                    Request Review
                                                </button>
                                            ) : (
                                                <button
                                                    type="button"
                                                    disabled={!selectable}
                                                    onClick={() => form.setData('licence', l.code)}
                                                    aria-pressed={active}
                                                    className={cn('mt-2 h-8 w-full rounded-[4px] border text-xs font-semibold disabled:cursor-not-allowed', active ? 'border-gold-500 bg-gold-500 text-ink-900' : 'border-gold-500 text-ink-900')}
                                                >
                                                    {active ? (l.code === recommended ? 'Recommended ✓' : 'Selected ✓') : `Select ${l.code}`}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {form.errors.licence && <p role="alert" className="mt-2 text-xs font-semibold text-risk-600">{form.errors.licence}</p>}
                        <ul className="mt-4 grid gap-3 rounded-[8px] border border-parchment-400 bg-white p-3 sm:grid-cols-5">
                            <li className="flex items-center gap-2 text-xs font-bold text-ink-900">
                                <ShieldCheck className="size-6 text-gold-600" aria-hidden="true" /> Every purchase includes
                            </li>
                            {[
                                [Lock, 'Secure delivery', 'Instant access after payment'],
                                [RefreshCw, 'Controlled version', 'You always know what you bought'],
                                [RefreshCw, 'Updates (if included)', "See what's included in your licence"],
                                [Headphones, 'Support (as applicable)', 'Get help when you need it'],
                            ].map(([, t, b]) => (
                                <li key={t as string} className="text-xs">
                                    <strong className="block text-ink-900">{t as string}</strong>
                                    <span className="text-ink-500">{b as string}</span>
                                </li>
                            ))}
                        </ul>
                    </section>
                </div>
                <div className="flex flex-wrap justify-between gap-3">
                    <Link href={`/digital-products/${product.slug}`} className="inline-flex h-10 items-center gap-2 rounded-[4px] border border-parchment-500 bg-white px-4 text-sm font-semibold">
                        <ArrowLeft className="size-4" aria-hidden="true" /> Back to Product
                    </Link>
                    <button type="submit" disabled={form.processing} className="inline-flex h-10 items-center gap-2 rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900 hover:bg-gold-400 disabled:opacity-60">
                        Continue to Options <ArrowRight className="size-4" aria-hidden="true" />
                    </button>
                </div>
            </form>
        </PurchaseShell>
    );
}
