import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, Headphones, ShieldCheck } from 'lucide-react';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ShopCrumbs, SideCard, TrustStrip, FlowSteps, NextSteps } from '@/Components/Shop/Bits';
import { AttributeRow, CheckList, ProductHead, ReviewedBox } from '@/Components/Shop/ProductParts';
import PriceCard from '@/Components/Shop/PriceCard';
import NotPurchasable from '@/Components/Shop/NotPurchasable';
import BriefStepOne from '@/Components/Shop/BriefStepOne';
import { Glance, TabBar, TabBody, tabsFor, type TabKey } from '@/Components/Shop/ProductTabs';
import type { ProductDetail } from '@/types/shop';

function crumbs(p: ProductDetail) {
    return [
        { label: 'Online Shop', href: '/shop' },
        ...(p.aisle_name ? [{ label: p.aisle_name, href: `/shop/aisle/${p.aisle}` }] : []),
        { label: p.name },
    ];
}

function MarketplaceBriefTemplate({ product, saved }: { product: ProductDetail; saved: boolean }) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="space-y-5 lg:col-span-8">
                <ProductHead product={product} saved={saved} tagline={product.tagline ?? undefined}>
                    <p className="mt-1 text-sm text-ink-600">{product.summary}</p>
                </ProductHead>
                <FlowSteps current={1} steps={[{ title: 'Define Your Need', sub: 'Project scope & context' }, { title: 'Requirements', sub: 'Inputs & deliverables' }, { title: 'Preferences', sub: 'Providers & terms' }, { title: 'Review & Submit', sub: 'Confirm & send' }]} />
                <div className="grid gap-5 md:grid-cols-[14rem_1fr]">
                    <SideCard title="Why use a Marketplace Brief?">
                        <CheckList items={['Reach pre-vetted, high-quality service providers', 'Compare proposals on scope, approach, team and price', 'Transparent process with full governance', 'You remain in control of the selection']} />
                    </SideCard>
                    <SideCard title="1. Define Your Need">
                        <p className="-mt-2 mb-4 text-xs text-ink-500">Tell us about your project so we can match you with the right providers.</p>
                        <BriefStepOne data={{ title: `${product.name.replace(' Brief', '')} - `, category: 'Business Advisory' }} product={product.slug} compact />
                    </SideCard>
                </div>
            </div>
            <aside className="space-y-4 lg:col-span-4">
                <SideCard title="Your Marketplace Brief" action={<span className="rounded-full bg-gold-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-gold-800">Draft</span>}>
                    <Glance rows={[['Product', product.name], ['Act', product.act_label], ['Vehicle', `${product.vehicle} (${product.vehicle_code})`], ['Price', 'Provider-dependent (TBC)']]} />
                    <p className="mt-3 text-xs text-ink-500">{product.statement}</p>
                </SideCard>
                <SideCard title="What happens next?">
                    <NextSteps steps={[['Matching', "We'll match your brief with relevant pre-vetted providers."], ['Invitations', 'Selected providers will be invited to submit a proposal.'], ['Compare', "You'll review and compare proposals in your secure workspace."], ['Select', 'You choose the best provider for your project.']]} />
                </SideCard>
                <div className="flex gap-3 rounded-[8px] border border-gold-300 bg-gold-50 p-4">
                    <ShieldCheck className="size-6 shrink-0 text-gold-700" aria-hidden="true" />
                    <p className="text-xs text-ink-700"><strong className="block text-[0.8125rem] text-ink-900">Governed. Transparent. Trusted.</strong>All providers are reviewed by TBCA for quality, compliance and professional standing.</p>
                </div>
                <Link href="/shop/marketplace-brief" className="flex items-center justify-center gap-2 text-xs font-semibold text-gold-800 hover:underline">Open the full brief builder <ArrowRight className="size-3.5" /></Link>
            </aside>
        </div>
    );
}

export default function Product({ product, tab, saved }: { product: ProductDetail; tab: string; saved: boolean }) {
    const tabs = tabsFor(product);
    const initial = (tabs.find((t) => t.key === tab)?.key ?? 'overview') as TabKey;
    const [active, setActive] = useState<TabKey>(initial);
    const honest = product.listing_state === 'LS-05';
    const free = product.act === 'A7';
    const glanceLeft = product.act !== 'A1' && !free && (product.content.glance?.length ?? 0) > 0;

    return (
        <>
            <Head title={product.name} />
            <div className="container-tbca py-6 md:py-8">
                <ShopCrumbs tone="light" items={honest ? [...crumbs(product).slice(0, -1), { label: product.name, href: product.url }, { label: 'Honest Not-Purchasable State' }] : crumbs(product)} />

                {honest ? (
                    <NotPurchasable product={product} />
                ) : product.act === 'A5' ? (
                    <MarketplaceBriefTemplate product={product} saved={saved} />
                ) : (
                    <div className="grid gap-6 lg:grid-cols-12">
                        <div className="min-w-0 space-y-6 lg:col-span-8">
                            <ProductHead product={product} saved={saved} tone={free ? 'green' : 'gold'} tag={free ? 'A7 Free Access' : product.act === 'A3' ? 'A3 Subscription Product' : product.act === 'A4' ? 'A4 Retainer Product' : undefined}>
                                {product.summary && <p className="mt-3 text-sm leading-relaxed text-ink-600">{product.summary}</p>}
                                <AttributeRow product={product} />
                                {product.act === 'A1' && <ReviewedBox />}
                            </ProductHead>

                            <div className={glanceLeft ? 'grid gap-5 md:grid-cols-[13rem_1fr]' : ''}>
                                {glanceLeft && (
                                    <SideCard title="At a Glance" className="h-fit">
                                        <Glance rows={product.content.glance ?? []} />
                                    </SideCard>
                                )}
                                <div className="min-w-0 rounded-[8px] border border-parchment-400 bg-white">
                                    <TabBar tabs={tabs} value={active} onChange={setActive} />
                                    <div className="p-5" role="tabpanel">
                                        <TabBody p={product} tab={active} />
                                    </div>
                                    {product.act !== 'A1' && (
                                        <div className="mx-5 mb-5">
                                            <ReviewedBox
                                                title={free ? 'Results delivered instantly on completion.' : product.act === 'A2' ? '100% Human-Reviewed Content' : 'All deliverables and advice are human-reviewed by TBCA professionals.'}
                                                body={product.act === 'A2' ? 'All frameworks, tools and guidance are reviewed and approved by TBCA professionals for accuracy and compliance.' : product.act === 'A4' ? 'Confidential. Independent. In your best interest.' : 'Transparent. Accurate. Confidential.'}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {free && (
                                <div className="flex flex-wrap items-center gap-4 rounded-[8px] border border-verified-500/30 bg-verified-50 p-4">
                                    <Link href={`/shop/free/${product.slug}`} className="inline-flex h-12 items-center gap-2 rounded-[4px] bg-verified-700 px-6 text-sm font-semibold text-white hover:bg-verified-500">Start Your Free Health Check <ArrowRight className="size-4" /></Link>
                                    <p className="flex-1 text-xs text-ink-700"><strong className="block text-[0.8125rem] text-ink-900">It only takes 10-15 minutes.</strong>No payment. No obligation. Just valuable insights.</p>
                                    <p className="flex items-center gap-2 text-xs text-ink-600"><ShieldCheck className="size-5 text-verified-500" aria-hidden="true" /> Your information is secure and will never be shared.</p>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 lg:col-span-4">
                            <div className="lg:sticky lg:top-4"><PriceCard product={product} /></div>
                            {free && (
                                <SideCard>
                                    <p className="font-semibold text-ink-900">Explore more resources</p>
                                    <p className="mt-1 text-xs text-ink-600">Discover more free tools, guides and templates in our Resource Library.</p>
                                    <Link href="/shop/aisle/diagnostics-free-tools" className="mt-3 inline-flex h-9 items-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-gold-800">View Free Resources →</Link>
                                </SideCard>
                            )}
                            <button type="button" onClick={() => openAskQuestion({ subject: product.name, section: 'shop' })} className="flex w-full items-center gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-left text-xs text-ink-700">
                                <Headphones className="size-5 text-controlled-700" aria-hidden="true" />
                                <span><strong className="block text-[0.8125rem] text-ink-900">100% Human-Reviewed</strong>All deliverables are reviewed by TBCA professionals for quality and accuracy. Ask us anything.</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <TrustStrip items={free ? [{ title: 'Human-reviewed for accuracy' }, { title: 'Transparent and honest' }, { title: 'No hidden costs' }, { title: 'Secure & confidential' }] : undefined} />
        </>
    );
}
