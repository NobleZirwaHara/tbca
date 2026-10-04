import { useState } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Bookmark, CheckCircle2, Lock, MessageCircle, Repeat, ShieldCheck, ShoppingCart, Truck, User } from 'lucide-react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import { Button } from '@/Components/ui/Button';
import { Tabs, Tag } from '@/Components/ui/Kit';
import { Field, Select, Textarea } from '@/Components/ui/Form';
import { openAskQuestion } from '@/Components/AskQuestion';
import { Stars } from '@/Components/Marketplace/ui';
import { usePrice } from '@/lib/money';
import type { SharedProps } from '@/types';
import type { MkListing, MkProvider } from '@/types/marketplace';

interface Props {
    listing: MkListing;
    provider: MkProvider | null;
    reviews: { author: string; company: string | null; rating: number; body: string; date: string }[];
    canReview: boolean;
    saved: boolean;
    related: MkListing[];
}

export default function Service({ listing, provider, reviews, canReview, saved, related }: Props) {
    const { auth, contact } = usePage<SharedProps>().props;
    const price = usePrice();
    const d = listing.details;
    const recurring = listing.kind === 'recurring';
    const [tab, setTab] = useState('overview');
    const [plan, setPlan] = useState<'full' | 'instalments'>('full');
    const review = useForm({ rating: 5, body: '' });
    const whatsapp = `https://wa.me/${(contact?.whatsapp ?? '27120010567').toString().replace(/\D/g, '')}?text=${encodeURIComponent(`Hi TBCA, I'm interested in ${listing.title}`)}`;

    const order = () => router.post(`/marketplace/services/${listing.slug}/order`, { plan });
    const toggleSave = () =>
        auth.user
            ? router.post('/saved', { item_type: 'marketplace-service', item_key: listing.slug, label: listing.title, url: `/marketplace/services/${listing.slug}` }, { preserveScroll: true })
            : router.visit('/login');

    const tabs = [
        { key: 'overview', label: 'Overview' },
        { key: 'included', label: "What's Included" },
        { key: 'deliverables', label: 'Deliverables' },
        { key: 'process', label: 'Process' },
        { key: 'requirements', label: 'Requirements' },
        { key: 'reviews', label: `Reviews (${listing.reviewsCount})` },
        { key: 'faqs', label: 'FAQs' },
    ];
    const list = (items?: string[]) => (
        <ul className="space-y-2 text-sm text-ink-700">{(items ?? []).map((i) => <li key={i} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{i}</li>)}</ul>
    );

    return (
        <>
            <Head title={listing.title} />
            <section className="bg-white">
                <div className="container-tbca py-8">
                    <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Marketplace', href: '/marketplace' }, { label: listing.categoryLabel, href: `/marketplace/services?category=${listing.category}` }, { label: listing.subcategory ?? 'Service' }, { label: listing.title }]} />
                    <div className="grid gap-8 lg:grid-cols-12">
                        <div className="lg:col-span-8">
                            <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                                <div className="relative min-h-56 overflow-hidden rounded-[8px] bg-gradient-to-br from-controlled-700 via-ink-900 to-ink-950">
                                    <div className="absolute inset-0 motif-grid opacity-30" aria-hidden="true" />
                                    {listing.badge && <span className="absolute top-0 left-4 bg-controlled-700 px-2.5 pt-3 pb-2 text-[0.625rem] font-bold tracking-wide text-white uppercase shadow">{listing.badge}</span>}
                                    <div className="absolute inset-x-0 bottom-0 flex flex-wrap gap-3 bg-ink-950/80 px-3 py-2 text-[0.6875rem] text-parchment-100">
                                        {(recurring ? ['Confidential & Secure', 'Bank-Grade Quality', 'Expert Support'] : ['Expert Review', 'Data Accuracy', 'Bankable Outputs', 'QA Assured']).map((t) => (
                                            <span key={t} className="flex items-center gap-1"><CheckCircle2 className="size-3" aria-hidden="true" />{t}</span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h1 className="font-serif text-3xl font-bold text-ink-900">{listing.title}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                        {recurring && <Tag tone="good">Recurring Service</Tag>}
                                        <Stars value={listing.rating} /> <span>{listing.rating} ({listing.reviewsCount} reviews)</span>
                                        <Tag tone="good"><BadgeCheck className="mr-1 size-3" aria-hidden="true" />Verified by TBCA</Tag>
                                    </div>
                                    <p className="mt-3 text-sm leading-relaxed text-ink-600">{listing.summary}</p>
                                    <ul className="mt-4 grid gap-2 text-sm text-ink-700 sm:grid-cols-2">
                                        {(d.features ?? []).map((f: string) => <li key={f} className="flex gap-2"><CheckCircle2 className="size-4 shrink-0 text-verified-500" aria-hidden="true" />{f}</li>)}
                                    </ul>
                                </div>
                            </div>
                            <dl className="mt-6 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                                {[
                                    ['Service Category', listing.categoryLabel], ['Delivery Time', d.delivery], ['Provider Type', d.provider_type], ['Ideal For', d.ideal_for],
                                    [recurring ? 'Engagement Model' : 'Difficulty / Complexity', recurring ? d.engagement : d.difficulty], [recurring ? 'Cancellation' : 'Engagement Model', recurring ? d.cancellation : d.engagement],
                                ].map(([k, v]) => (
                                    <div key={k} className="flex justify-between gap-3 border-b border-parchment-300 py-1.5"><dt className="font-semibold text-ink-800">{k}:</dt><dd className="text-right text-ink-600">{v ?? '—'}</dd></div>
                                ))}
                            </dl>

                            <Tabs className="mt-8" tabs={tabs} value={tab} onChange={setTab} />
                            <div className="rounded-b-[8px] border border-t-0 border-parchment-400 p-5">
                                {tab === 'overview' && (
                                    <div className="grid gap-6 md:grid-cols-3">
                                        <div><h3 className="mb-2 font-semibold text-ink-900">Service Overview</h3><p className="text-sm text-ink-600">{d.overview}</p></div>
                                        <div><h3 className="mb-2 font-semibold text-ink-900">What You Will Get</h3>{list(d.get)}</div>
                                        <div><h3 className="mb-2 font-semibold text-ink-900">{recurring ? 'How It Works' : 'Who Is This For?'}</h3>
                                            {recurring ? <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-700">{(d.how ?? []).map((s: string) => <li key={s}>{s}</li>)}</ol> : list(d.for)}
                                        </div>
                                    </div>
                                )}
                                {tab === 'included' && list(d.included)}
                                {tab === 'deliverables' && list(d.deliverables)}
                                {tab === 'process' && <ol className="list-decimal space-y-1 pl-5 text-sm text-ink-700">{(d.process ?? []).map((s: string) => <li key={s}>{s}</li>)}</ol>}
                                {tab === 'requirements' && list(d.requirements)}
                                {tab === 'faqs' && <dl className="space-y-3">{(d.faqs ?? []).map(([q, a]: [string, string]) => <div key={q}><dt className="font-semibold text-ink-900">{q}</dt><dd className="text-sm text-ink-600">{a}</dd></div>)}</dl>}
                                {tab === 'reviews' && (
                                    <div className="space-y-4">
                                        {reviews.length === 0 && <p className="text-sm text-ink-500">No written reviews yet.</p>}
                                        {reviews.map((r, i) => (
                                            <div key={i} className="border-b border-parchment-300 pb-3">
                                                <div className="flex flex-wrap items-center gap-2"><Stars value={r.rating} /><span className="text-sm font-semibold text-ink-900">{r.company ?? r.author}</span><span className="text-xs text-ink-400">{r.date}</span></div>
                                                <p className="mt-1 text-sm text-ink-700">{r.body}</p>
                                            </div>
                                        ))}
                                        {canReview ? (
                                            <form className="space-y-3 rounded-[6px] bg-parchment-100 p-4" onSubmit={(e) => { e.preventDefault(); review.post(`/marketplace/services/${listing.slug}/reviews`, { preserveScroll: true, onSuccess: () => review.reset() }); }}>
                                                <p className="font-semibold text-ink-900">Rate this service</p>
                                                <Field label="Rating" error={review.errors.rating}>{(id) => <Select id={id} value={String(review.data.rating)} onChange={(e) => review.setData('rating', Number(e.target.value))} options={['5', '4', '3', '2', '1'].map((v) => ({ value: v, label: `${v} star${v === '1' ? '' : 's'}` }))} />}</Field>
                                                <Field label="Your review" error={review.errors.body} required>{(id) => <Textarea id={id} value={review.data.body} onChange={(e) => review.setData('body', e.target.value)} maxLength={1000} />}</Field>
                                                <Button type="submit" size="sm" disabled={review.processing}>Publish review</Button>
                                            </form>
                                        ) : (
                                            <p className="text-xs text-ink-400">Only verified buyers of this service can leave a review.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <aside className="space-y-4 lg:col-span-4">
                            <div className="rounded-[8px] border border-parchment-400 p-5">
                                <div className="flex justify-between gap-4">
                                    <div>
                                        <p className="text-xs font-semibold text-gold-700">{recurring ? 'Subscription Plan' : 'Price (All inclusive)'}</p>
                                        <p className="mt-1 text-3xl font-bold text-ink-900">{price(listing.priceZar ?? 0)}{recurring && <span className="text-sm font-normal text-ink-500"> / month</span>}</p>
                                        <p className="text-xs text-ink-500">{recurring ? 'Excl. VAT' : 'Excl. VAT & platform fee – shown at checkout'}</p>
                                        {recurring && d.allowance && <p className="mt-2 text-xs text-ink-600">{d.allowance}</p>}
                                    </div>
                                    <div className="border-l border-parchment-300 pl-4 text-center">
                                        <p className="text-xs text-ink-500">Certainty Class</p>
                                        <p className="mt-1 flex items-center gap-1 font-bold text-verified-700"><ShieldCheck className="size-5" aria-hidden="true" /> {d.certainty ?? 'C2'}</p>
                                        <button type="button" className="mt-1 text-xs text-controlled-600 underline" onClick={() => openAskQuestion({ subject: 'What is Certainty Class C2?', section: 'marketplace' })}>What is this?</button>
                                    </div>
                                </div>
                                {!recurring && (
                                    <fieldset className="mt-4 space-y-1.5 text-sm">
                                        <legend className="sr-only">Payment plan</legend>
                                        <label className="flex items-center gap-2"><input type="radio" className="accent-gold-600" checked={plan === 'full'} onChange={() => setPlan('full')} /> Pay in full</label>
                                        <label className="flex items-center gap-2"><input type="radio" className="accent-gold-600" checked={plan === 'instalments'} onChange={() => setPlan('instalments')} /> or 3 payments of {price(Math.round((listing.priceZar ?? 0) / 3))}</label>
                                    </fieldset>
                                )}
                                <div className="mt-4 space-y-2">
                                    <Button type="button" className="w-full" onClick={order} disabled={provider ? !provider.routable : false}>
                                        {recurring ? <Repeat className="size-4" aria-hidden="true" /> : <ShoppingCart className="size-4" aria-hidden="true" />} {recurring ? 'Subscribe Now' : 'Order Now'}
                                    </Button>
                                    <Button type="button" variant="outline" className="w-full" onClick={toggleSave}><Bookmark className={saved ? 'size-4 fill-gold-500 text-gold-600' : 'size-4'} aria-hidden="true" /> {saved ? 'Saved' : 'Save for Later'}</Button>
                                    <a href={whatsapp} target="_blank" rel="noreferrer" className="flex h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-verified-500 text-sm font-medium text-verified-700 hover:bg-verified-50">
                                        <MessageCircle className="size-4" aria-hidden="true" /> Chat on WhatsApp
                                    </a>
                                </div>
                                <div className="mt-3 flex justify-between text-xs text-ink-500">
                                    <span className="flex items-center gap-1"><Truck className="size-3.5" aria-hidden="true" /> {recurring ? 'Cancel Anytime' : '30-Day Delivery Guarantee'}</span>
                                    <span className="flex items-center gap-1"><Lock className="size-3.5" aria-hidden="true" /> Secure Checkout</span>
                                </div>
                            </div>
                            {provider && (
                                <div className="rounded-[8px] border border-parchment-400 p-5">
                                    <div className="flex items-start gap-3">
                                        <User className="size-9 rounded-full border border-parchment-400 p-1.5 text-ink-500" aria-hidden="true" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-xs font-semibold text-ink-900">{recurring ? 'Service Provider' : 'Provider'}</p>
                                            <p className="text-sm text-ink-600">{provider.name}</p>
                                            <Link href={`/marketplace/providers/${provider.slug}`} className="text-sm font-semibold text-controlled-600 hover:underline">View Provider Profile</Link>
                                        </div>
                                        <Tag tone="info">Verified Partner</Tag>
                                    </div>
                                    {recurring && (
                                        <div className="mt-3 grid grid-cols-3 gap-2 border-t border-parchment-300 pt-3 text-center text-xs">
                                            <div><p className="text-ink-500">Services</p><p className="font-bold">{provider.profile.services_count ?? 32}</p></div>
                                            <div><p className="text-ink-500">Clients</p><p className="font-bold">120+</p></div>
                                            <div><p className="text-ink-500">Rating</p><p className="font-bold">{provider.rating}</p></div>
                                        </div>
                                    )}
                                </div>
                            )}
                            <div className="rounded-[8px] border border-parchment-400 p-5">
                                <p className="font-semibold text-ink-900">Need Help Choosing?</p>
                                <p className="text-xs text-ink-500">Talk to our team for guidance on the right solution.</p>
                                <div className="mt-3 grid grid-cols-2 gap-2">
                                    <Button size="sm" variant="outline" type="button" onClick={() => openAskQuestion({ subject: listing.title, section: 'marketplace' })}>Ask a Question</Button>
                                    <Link href="/marketplace/brief" className="flex h-9 items-center justify-center rounded-[4px] border border-ink-300 text-[0.8125rem] font-medium hover:border-ink-900">Submit a Brief</Link>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>
            <section className="bg-parchment-100 py-8">
                <div className="container-tbca">
                    <div className="rounded-[8px] border border-gold-300/60 bg-white p-5">
                        <h2 className="font-semibold text-ink-900">Why Clients Choose This</h2>
                        <ul className="mt-3 grid gap-3 text-sm text-ink-700 sm:grid-cols-2 lg:grid-cols-5">
                            {['Independent Review', 'Bank-Grade Quality', 'Confidential & Secure', 'Aligned to TBCA QA Standards', 'Trusted by 500+ Clients'].map((t) => <li key={t} className="flex items-center gap-2"><ShieldCheck className="size-5 text-gold-600" aria-hidden="true" />{t}</li>)}
                        </ul>
                    </div>
                    {related.length > 0 && (
                        <div className="mt-8">
                            <h2 className="font-serif text-xl font-bold text-ink-900">Related services</h2>
                            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
                                {related.map((r) => (
                                    <li key={r.slug}><Link href={`/marketplace/services/${r.slug}`} className="block rounded-[8px] border border-parchment-400 bg-white p-4 hover:border-gold-400"><p className="font-semibold text-ink-900">{r.title}</p><p className="mt-1 text-sm font-bold">{price(r.priceZar ?? 0)}</p></Link></li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}
