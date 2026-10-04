import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Building2, CalendarClock, Check, Info, MessageCircle, Minus, ShieldCheck, ShoppingCart, Star } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Checkbox, Select } from '@/Components/ui/Form';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { ActTag, Chip, ShopCrumbs, SideCard, TrustStrip, zar } from '@/Components/Shop/Bits';
import { SaveToggle } from '@/Components/Shop/ProductParts';
import { cn } from '@/lib/cn';
import type { ProductDetail } from '@/types/shop';

type Tab = 'tier' | 'variant' | 'addons' | 'delivery';

export default function Configure({ product, saved }: { product: ProductDetail; saved: boolean }) {
    const v = product.variants;
    const tiers = v.tiers ?? [];
    const [tab, setTab] = useState<Tab>('tier');
    const [tier, setTier] = useState((tiers.find((t) => t.popular) ?? tiers[0])?.key ?? '');
    const [size, setSize] = useState(v.sizes?.[2] ?? '');
    const [industry, setIndustry] = useState(v.industries?.[0] ?? '');
    const [mode, setMode] = useState(v.modes?.[2] ?? '');
    const [addons, setAddons] = useState<string[]>([]);
    const [busy, setBusy] = useState(false);
    const [detailed, setDetailed] = useState(false);

    const t = tiers.find((x) => x.key === tier);
    const addonTotal = (v.addons ?? []).filter((a) => addons.includes(a.key)).reduce((s, a) => s + a.zar, 0);
    const total = (t?.zar ?? 0) + addonTotal;
    const step = tab === 'tier' || tab === 'variant' ? 1 : tab === 'addons' ? 1 : 2;
    const submit = (buyNow: boolean) => {
        setBusy(true);
        router.post(`/shop/product/${product.slug}/add`, { tier, addons, config: { business_size: size, industry, delivery_mode: mode }, buy_now: buyNow }, { preserveScroll: true, onFinish: () => setBusy(false) });
    };
    const tabs: { key: Tab; label: string }[] = [{ key: 'tier', label: '1. Tier Selection' }, { key: 'variant', label: '2. Variant Options' }, { key: 'addons', label: '3. Add-ons' }, { key: 'delivery', label: '4. Delivery & Support' }];

    return (
        <>
            <Head title={`Configure ${product.name}`} />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, ...(product.aisle_name ? [{ label: product.aisle_name, href: `/shop/aisle/${product.aisle}` }] : []), { label: product.name, href: product.url }, { label: 'Configure' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8">
                        <div className="flex flex-wrap gap-5">
                            <ShopIcon name={product.icon} size="lg" />
                            <div className="min-w-0 flex-1">
                                <ActTag act="A1" label="A1 Fixed Sprint Product" />
                                <h1 className="mt-1 font-serif text-[1.75rem] leading-tight font-semibold text-ink-900 md:text-[2.25rem]">{product.name}</h1>
                                <p className="font-semibold text-ink-800">Configure your tier and variant to match your exact needs</p>
                                <p className="mt-1 text-sm text-ink-600">{product.summary}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                                    <span className="flex items-center gap-1 text-gold-600"><Star className="size-4 fill-gold-500" aria-hidden="true" /> <strong className="text-ink-900">{product.rating}</strong> ({product.reviews_count} reviews)</span>
                                    {(product.content.chips ?? []).map((c) => <Chip key={c} tone="green">{c}</Chip>)}
                                    <Chip icon={<ShieldCheck className="size-3" />}>Human-Reviewed</Chip>
                                </div>
                            </div>
                        </div>

                        <div className="grid gap-5 md:grid-cols-[13rem_1fr]">
                            <div className="space-y-4">
                                <SideCard title="Configuration Steps">
                                    <ol className="space-y-3 text-xs">
                                        {[['Choose Tier & Variant', 'Select scope level'], ['Delivery & Support', 'Choose timeline & support'], ['Confirm & Add to Cart', 'Review and purchase']].map(([a, b], i) => (
                                            <li key={a} className={cn('flex gap-2 rounded-[6px] p-2', step === i + 1 && 'bg-controlled-50')}>
                                                <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold', step === i + 1 ? 'border-controlled-700 bg-controlled-700 text-white' : 'border-parchment-500 text-ink-500')}>{i + 1}</span>
                                                <span><span className="block font-semibold text-ink-900">{a}</span><span className="text-ink-500">{b}</span></span>
                                            </li>
                                        ))}
                                    </ol>
                                </SideCard>
                                <SideCard title="Need help choosing?">
                                    <p className="-mt-2 text-xs text-ink-600">We'll help you select the right tier for your business.</p>
                                    <button type="button" onClick={() => openAskQuestion({ subject: `Tier advice: ${product.name}`, section: 'shop' })} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-[4px] bg-verified-700 py-2 text-xs font-semibold text-white"><MessageCircle className="size-4" /> Talk to an Advisor</button>
                                </SideCard>
                            </div>

                            <div className="min-w-0 rounded-[8px] border border-parchment-400 bg-white">
                                <div role="tablist" className="flex overflow-x-auto border-b border-parchment-400">
                                    {tabs.map((x) => <button key={x.key} type="button" role="tab" aria-selected={tab === x.key} onClick={() => setTab(x.key)} className={cn('-mb-px shrink-0 border-b-2 px-4 py-2.5 text-[0.8125rem]', tab === x.key ? 'border-gold-500 font-semibold text-ink-900' : 'border-transparent text-ink-500')}>{x.label}</button>)}
                                </div>
                                <div className="p-5" role="tabpanel">
                                    {tab === 'tier' && (
                                        <>
                                            <div className="flex flex-wrap items-center justify-between gap-2">
                                                <h2 className="text-lg font-semibold text-ink-900">Choose Your Tier</h2>
                                                <div className="flex gap-1">{(['Compare Tiers', 'Detailed View'] as const).map((l, i) => <button key={l} type="button" aria-pressed={detailed === (i === 1)} onClick={() => setDetailed(i === 1)} className={cn('rounded-[4px] border px-3 py-1.5 text-xs', detailed === (i === 1) ? 'border-controlled-500 text-controlled-700' : 'border-parchment-500')}>{l}</button>)}</div>
                                            </div>
                                            <p className="mt-3 flex gap-2 rounded-[6px] bg-controlled-50 p-2.5 text-xs text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" /> All tiers deliver the same core outcome. Tiers differ by business size, complexity and depth of analysis.</p>
                                            <div role="radiogroup" aria-label="Tier" className="mt-4 grid gap-3 lg:grid-cols-3">
                                                {tiers.map((x) => (
                                                    <div key={x.key} className={cn('relative flex flex-col rounded-[8px] border p-4', tier === x.key ? 'border-controlled-500 ring-1 ring-controlled-500' : 'border-parchment-400')}>
                                                        {x.badge && <span className={cn('absolute -top-2.5 right-3 rounded-[4px] px-2 py-0.5 text-[0.625rem] font-bold', x.popular ? 'bg-attested-500 text-white' : 'bg-controlled-50 text-controlled-700')}>{x.badge}</span>}
                                                        <p className="flex items-center gap-2 font-semibold text-ink-900"><Building2 className="size-5 text-ink-400" aria-hidden="true" />{x.name}</p>
                                                        <p className="text-xs text-ink-500">{x.sub}</p>
                                                        <p className="mt-2 text-xl font-bold text-ink-900">{zar(x.zar)}<span className="ml-1 text-[0.625rem] font-normal text-ink-400">Excl. VAT</span></p>
                                                        <p className="text-xs font-semibold text-ink-700">{x.fit}</p>
                                                        <ul className="mt-2 flex-1 space-y-1 text-xs text-ink-600">{(x.features ?? []).map((f) => <li key={f} className="flex gap-1.5"><Check className="size-3.5 shrink-0 text-verified-500" aria-hidden="true" />{f}</li>)}</ul>
                                                        <button type="button" role="radio" aria-checked={tier === x.key} onClick={() => setTier(x.key)} className={cn('mt-3 rounded-[4px] py-2 text-xs font-semibold', tier === x.key ? 'bg-controlled-700 text-white' : 'border border-parchment-500 text-ink-800')}>{tier === x.key ? 'Selected ✓' : `Select ${x.name}`}</button>
                                                    </div>
                                                ))}
                                            </div>
                                            {!detailed && (v.matrix?.length ?? 0) > 0 && (
                                                <div className="mt-5 overflow-x-auto">
                                                    <h3 className="mb-2 text-sm font-semibold text-ink-900">Tier Comparison Matrix</h3>
                                                    <table className="w-full min-w-[480px] text-xs">
                                                        <thead className="bg-parchment-200"><tr><th className="p-2 text-left">Feature / Deliverable</th>{tiers.map((x) => <th key={x.key} className="p-2">{x.name}</th>)}</tr></thead>
                                                        <tbody className="divide-y divide-parchment-300">
                                                            {(v.matrix ?? []).map((row) => (
                                                                <tr key={String(row[0])}><td className="p-2">{String(row[0])}</td>{row.slice(1).map((c, i) => <td key={i} className="p-2 text-center">{c === true ? <Check className="mx-auto size-4 text-verified-500" aria-label="Included" /> : c === false ? <Minus className="mx-auto size-4 text-ink-300" aria-label="Not included" /> : String(c)}</td>)}</tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {tab === 'variant' && (
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <label className="text-xs font-semibold text-ink-800">Business Size<Select className="mt-1" options={v.sizes ?? []} value={size} onChange={(e) => setSize(e.target.value)} /></label>
                                            <label className="text-xs font-semibold text-ink-800">Industry<Select className="mt-1" options={v.industries ?? []} value={industry} onChange={(e) => setIndustry(e.target.value)} /></label>
                                            <label className="text-xs font-semibold text-ink-800">Delivery Mode<Select className="mt-1" options={v.modes ?? []} value={mode} onChange={(e) => setMode(e.target.value)} /></label>
                                        </div>
                                    )}
                                    {tab === 'addons' && (
                                        <div className="space-y-2">
                                            {(v.addons ?? []).map((a) => <div key={a.key} className="flex items-center justify-between rounded-[6px] border border-parchment-400 p-3"><Checkbox label={a.name} checked={addons.includes(a.key)} onChange={() => setAddons(addons.includes(a.key) ? addons.filter((x) => x !== a.key) : [...addons, a.key])} /><span className="text-sm font-semibold">+ {zar(a.zar)}</span></div>)}
                                        </div>
                                    )}
                                    {tab === 'delivery' && (
                                        <dl className="grid gap-3 text-sm sm:grid-cols-2">
                                            <div className="rounded-[6px] border border-parchment-400 p-3"><dt className="text-xs text-ink-500">Support level (by tier)</dt><dd className="font-semibold">{t?.support}</dd></div>
                                            <div className="rounded-[6px] border border-parchment-400 p-3"><dt className="text-xs text-ink-500">Delivery mode</dt><dd className="font-semibold">{mode}</dd></div>
                                            <div className="rounded-[6px] border border-parchment-400 p-3"><dt className="text-xs text-ink-500">Estimated start</dt><dd className="font-semibold">{product.content.estimated_start}</dd></div>
                                            <div className="rounded-[6px] border border-parchment-400 p-3"><dt className="text-xs text-ink-500">Estimated completion</dt><dd className="font-semibold">{product.content.estimated_completion}</dd></div>
                                        </dl>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title="Your Selection" action={<span className="rounded bg-parchment-300 px-1.5 text-[0.625rem]">Product Master {product.code}</span>}>
                            <div className="flex items-center gap-3"><ShopIcon name={product.icon} size="sm" /><p className="font-semibold text-ink-900">{product.name}</p></div>
                            <dl className="mt-3 space-y-2 text-xs">
                                {[['Tier', `${t?.name} (${zar(t?.zar ?? 0)})`, 'tier'], ['Business Size', size, 'variant'], ['Industry', industry, 'variant'], ['Delivery Mode', mode, 'variant'], ['Support', t?.support ?? '', 'delivery'], ['Add-ons', `${addons.length} selected`, 'addons']].map(([k, val, target]) => (
                                    <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="text-right">{val} <button type="button" onClick={() => setTab(target as Tab)} className="ml-1 text-controlled-700 underline">Edit</button></dd></div>
                                ))}
                            </dl>
                            <p className="mt-4 flex items-baseline justify-between border-t border-parchment-300 pt-3"><span className="text-sm">Price (Excl. VAT)</span><span className="text-xl font-bold text-controlled-700">{zar(total)}</span></p>
                            <p className="text-right text-[0.6875rem] text-ink-400">VAT calculated at checkout</p>
                            <div className="mt-3 space-y-2">
                                <button type="button" disabled={busy} onClick={() => submit(false)} className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-gold-500 py-3 text-sm font-semibold text-ink-900 disabled:opacity-50"><ShoppingCart className="size-4" /> Add to Cart</button>
                                <button type="button" disabled={busy} onClick={() => submit(true)} className="w-full rounded-[4px] border border-gold-500 py-2.5 text-sm font-semibold text-gold-800">Buy Now</button>
                                <SaveToggle product={product} saved={saved} className="w-full" />
                                <Link href={`/shop/compare?items=${product.code}`} className="block w-full rounded-[4px] border border-parchment-500 py-2 text-center text-xs font-semibold">Compare with Other Products</Link>
                            </div>
                            <ul className="mt-4 space-y-1 text-xs text-ink-600"><li>✓ ESG & governance compliant</li><li>✓ Invoice available</li><li>✓ Protected by bank-grade security</li></ul>
                            <div className="mt-3 grid grid-cols-2 gap-2 rounded-[6px] bg-parchment-200 p-3 text-xs"><p><CalendarClock className="mb-1 size-4 text-ink-500" aria-hidden="true" />Estimated Start<br /><strong>{product.content.estimated_start}</strong></p><p>Estimated Completion<br /><strong>{product.content.estimated_completion}</strong></p></div>
                        </SideCard>
                        <SideCard>
                            <p className="font-semibold text-ink-900">Still not sure?</p>
                            <p className="text-xs text-ink-600">Compare variants or speak to an advisor.</p>
                            <button type="button" onClick={() => openAskQuestion({ subject: `Custom configuration: ${product.name}`, section: 'shop' })} className="mt-2 rounded-[4px] border border-controlled-500 px-3 py-1.5 text-xs font-semibold text-controlled-700">Request a Custom Configuration →</button>
                        </SideCard>
                    </aside>
                </div>
            </div>
            <TrustStrip />
        </>
    );
}

