import { useState } from 'react';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Bookmark, Calendar, FileText, Handshake, Info, MessageSquare, ShieldCheck, ShoppingCart, User, Users, X } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Textarea } from '@/Components/ui/Form';
import { Modal } from '@/Components/ui/Kit';
import { openAskQuestion } from '@/Components/AskQuestion';
import { ActTag } from '@/Components/Shop/Bits';
import { CheckList } from '@/Components/Shop/ProductParts';
import { Glance } from '@/Components/Shop/ProductTabs';
import type { SharedProps } from '@/types';
import type { ProductDetail } from '@/types/shop';

/** OS-022 Honest Not-Purchasable State: shown whenever the derived listing state is LS-05. */
export default function NotPurchasable({ product }: { product: ProductDetail }) {
    const { auth } = usePage<SharedProps>().props;
    const [open, setOpen] = useState(false);
    const form = useForm({ name: auth.user?.name ?? '', email: auth.user?.email ?? '', phone: auth.user?.phone ?? '', company: auth.user?.company ?? '', message: '' });
    const kind = product.act === 'A4' ? 'Retainer' : product.act === 'A3' ? 'Subscription' : product.act === 'A1' ? 'Sprint' : 'product';
    const generic = [
        'Scope is client-specific and cannot be standardised',
        'Capacity and resource allocation must be confirmed',
        'Engagement terms and fees are proposal-based',
        'Conflict-of-interest and independence checks required',
        'Regulatory and professional standards apply',
        'Human consultation ensures the best outcome',
    ];
    const reasons = [...product.gate.hard, ...product.gate.soft];

    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <aside className="rounded-[8px] border border-parchment-400 bg-white p-5 lg:col-span-3">
                <div className="flex aspect-square items-center justify-center rounded-[10px] bg-ink-950">
                    <span className="relative">
                        <ShoppingCart className="size-20 text-parchment-100" strokeWidth={1.25} aria-hidden="true" />
                        <X className="absolute -inset-3 size-26 text-risk-500" strokeWidth={1.5} aria-hidden="true" />
                    </span>
                </div>
                <p className="mt-4 font-serif text-xl font-semibold text-ink-900">{product.name}</p>
                <div className="mt-1"><ActTag act={product.act} label={`${product.act_label} Product`} /></div>
                <p className="mt-2 text-xs text-ink-600">{product.tagline}</p>
                <div className="mt-4">
                    <Glance rows={(product.content.glance as [string, string][] | undefined) ?? [['Typical Term', product.delivery ?? 'TBC'], ['Human Review', 'Required']]} />
                </div>
                <Link href="/shop" className="mt-5 flex items-center justify-center gap-1.5 rounded-[4px] border border-risk-500/50 py-2 text-xs font-semibold text-risk-700 hover:bg-risk-50">
                    <ArrowLeft className="size-4" /> Back to Online Shop
                </Link>
            </aside>

            <div className="space-y-5 lg:col-span-6">
                <span className="inline-block rounded-[4px] bg-risk-50 px-2 py-0.5 text-[0.6875rem] font-semibold text-risk-700">OS-022 Honest Not-Purchasable State</span>
                <h1 className="font-serif text-[1.875rem] leading-tight font-semibold text-ink-900 md:text-[2.25rem]">This Product Cannot Be Purchased Online</h1>
                <p className="text-[0.9375rem] text-ink-700">This is a {kind} product that requires a proposal, capacity check and human consultation before engagement.</p>

                <div className="rounded-[8px] border border-risk-500/30 bg-risk-50/60 p-5">
                    <p className="flex items-center gap-2 font-semibold text-risk-700"><Info className="size-5" aria-hidden="true" /> Why it's not available for online purchase</p>
                    <p className="mt-1 text-xs text-ink-700">To deliver this {kind} ethically and effectively, we first need to understand your specific situation, capacity requirements and engagement terms.</p>
                    {reasons.length > 0 && (
                        <p className="mt-2 text-xs text-ink-700"><strong>Current governance state:</strong> {reasons.join('; ')}.</p>
                    )}
                    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                        {generic.map((g) => <li key={g} className="flex gap-2 text-xs text-ink-700"><X className="size-4 shrink-0 text-risk-500" aria-hidden="true" />{g}</li>)}
                    </ul>
                </div>

                <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                    <p className="font-semibold text-ink-900">What Happens Next?</p>
                    <p className="text-xs text-ink-500">Request a consultation and our team will guide you through the next steps.</p>
                    <ol className="mt-4 grid gap-3 sm:grid-cols-4">
                        {[[MessageSquare, 'Consultation Request', 'Tell us about your needs and objectives.'], [Users, 'Initial Discussion', 'We discuss scope, capacity and key considerations.'], [FileText, 'Tailored Proposal', 'You receive a customised proposal and terms.'], [Handshake, 'Engagement', 'Once agreed, we begin working together.']].map(([I, t, b], i) => {
                            const Icon = I as typeof User;
                            return (
                                <li key={String(t)} className="text-center">
                                    <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-risk-50 text-risk-500"><Icon className="size-6" aria-hidden="true" /></span>
                                    <p className="mt-2 text-xs font-semibold text-ink-900">{i + 1}. {String(t)}</p>
                                    <p className="text-[0.6875rem] text-ink-500">{String(b)}</p>
                                </li>
                            );
                        })}
                    </ol>
                </div>
                <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4">
                    <Info className="size-5 text-controlled-700" aria-hidden="true" />
                    <p className="flex-1 text-xs text-ink-700"><strong className="block text-[0.8125rem] text-ink-900">Need immediate guidance?</strong>Talk to a TBCA advisor for initial guidance.</p>
                    <button type="button" onClick={() => openAskQuestion({ subject: product.name, section: 'shop' })} className="rounded-[4px] border border-gold-500 px-3 py-1.5 text-xs font-semibold text-gold-800">Talk to TBCA Advisor →</button>
                </div>
            </div>

            <aside className="space-y-4 lg:col-span-3">
                <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                    <div className="flex items-start justify-between gap-2">
                        <p className="text-lg font-semibold text-ink-900">This is a {kind} Product</p>
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-risk-500 text-white"><User className="size-5" aria-hidden="true" /></span>
                    </div>
                    <p className="mt-2 text-xs text-ink-600">{kind} products in this state are not available for direct online purchase. They require:</p>
                    <div className="mt-3"><CheckList tone="green" items={['Proposal and engagement terms', 'Capacity and resource confirmation', 'Human consultation and scoping', 'Ongoing relationship and governance']} /></div>
                    <p className="mt-4 text-[0.8125rem] font-semibold text-ink-900">Interested in this {kind}?</p>
                    <p className="text-xs text-ink-600">Request a consultation and we will help you determine the right approach, scope and engagement terms.</p>
                    <div className="mt-3 space-y-2">
                        <Button type="button" className="w-full" onClick={() => setOpen(true)}>Request a Consultation <ArrowRight className="size-4" /></Button>
                        <Button type="button" variant="outline" className="w-full" onClick={() => router.post(`/shop/product/${product.slug}/save-for-later`, {}, { preserveScroll: true })}><Bookmark className="size-4" /> Save for Later</Button>
                        <Link href={`/search?q=${encodeURIComponent(product.name.split(' ').slice(0, 2).join(' '))}`} className="flex h-11 w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 text-sm font-medium text-ink-900 hover:border-ink-900">Explore Similar Options</Link>
                    </div>
                </div>
                <div className="rounded-[8px] border border-parchment-400 bg-white p-5">
                    <p className="font-semibold text-ink-900">Prefer a self-serve option?</p>
                    <p className="mt-1 text-xs text-ink-600">Explore our fixed Sprints, digital products or diagnostic tools that are available for immediate purchase.</p>
                    <Link href="/shop" className="mt-3 inline-flex h-9 items-center rounded-[4px] border border-gold-500 px-3 text-xs font-semibold text-gold-800">View Online Shop →</Link>
                </div>
                <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4">
                    <ShieldCheck className="size-6 shrink-0 text-controlled-700" aria-hidden="true" />
                    <p className="text-xs text-ink-700"><strong className="block text-[0.8125rem] text-ink-900">Transparency Promise</strong>We only offer what we deliver. If a {kind} requires human judgement, capacity or client-specific terms, we won't sell it online.</p>
                </div>
            </aside>

            <Modal open={open} onClose={() => setOpen(false)} title={`Request a Consultation: ${product.name}`}
                footer={<Button type="button" size="sm" disabled={form.processing} onClick={() => form.post(`/shop/product/${product.slug}/consultation`, { preserveScroll: true, onSuccess: () => { setOpen(false); form.reset('message'); } })}><Calendar className="size-4" /> Submit Request</Button>}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name" error={form.errors.name} required>{(id) => <Input id={id} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} />}</Field>
                    <Field label="Email" error={form.errors.email} required>{(id) => <Input id={id} type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />}</Field>
                    <Field label="Phone" error={form.errors.phone}>{(id) => <Input id={id} value={form.data.phone ?? ''} onChange={(e) => form.setData('phone', e.target.value)} />}</Field>
                    <Field label="Company" error={form.errors.company}>{(id) => <Input id={id} value={form.data.company ?? ''} onChange={(e) => form.setData('company', e.target.value)} />}</Field>
                    <Field label="Your needs and objectives" error={form.errors.message} required className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.message} onChange={(e) => form.setData('message', e.target.value)} />}</Field>
                </div>
            </Modal>
        </div>
    );
}
