import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { BadgeCheck, CalendarClock, Check, Clock, Download, Info, MessageSquare, RefreshCw } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Textarea } from '@/Components/ui/Form';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import ShopIcon from '@/Components/Shop/ShopIcon';
import { FlowSteps, NextSteps, ShopCrumbs, SideCard, TrustStrip, zar2 } from '@/Components/Shop/Bits';

interface QuoteLine { description: string; quantity: number; unit_zar: number }
interface Quote {
    reference: string; title: string; category: string | null; licence: string | null; provider: string | null; jurisdiction: string; engagement_type: string;
    version: number; lines: QuoteLine[]; deliverables: string[] | null; terms: [string, string][] | null; history: { version: number; label: string; subtotal_zar: number; issued_at: string | null }[] | null;
    provider_note: string | null; client_note: string | null; status: string; valid_until: string | null; issued_at: string | null; order_reference: string | null; order_paid: boolean;
}

const fmt = (iso?: string | null, time = true) => (iso ? new Date(iso).toLocaleString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric', ...(time ? { hour: '2-digit', minute: '2-digit' } : {}) }) : '-');
const TERM_ICONS = [CalendarClock, Clock, Clock, RefreshCw];

export default function QuoteReview({ quote, totals }: { quote: Quote; totals: { subtotal: number; vat: number; total: number } }) {
    const [modal, setModal] = useState<'decline' | 'changes' | null>(null);
    const accept = useForm({ accept_terms: false });
    const decline = useForm({ reason: '' });
    const changes = useForm({ note: '' });
    const open = quote.status === 'issued';
    const days = quote.valid_until ? Math.max(0, Math.ceil((new Date(quote.valid_until).getTime() - Date.now()) / 86400000)) : null;
    const stage = quote.status === 'accepted' ? (quote.order_paid ? 5 : 4) : 3;

    return (
        <>
            <Head title={`Quote Review ${quote.reference}`} />
            <div className="container-tbca py-6">
                <ShopCrumbs tone="light" items={[{ label: 'Online Shop', href: '/shop' }, { label: 'Quotes', href: '/portal' }, { label: 'Quote Pipeline' }, { label: 'Quote Review' }]} />
                <div className="grid gap-6 lg:grid-cols-12">
                    <div className="min-w-0 space-y-5 lg:col-span-8">
                        <div>
                            <h1 className="font-serif text-[1.875rem] font-semibold text-ink-900">Quote Review</h1>
                            <p className="text-sm text-ink-600">Review your quote details, terms and conditions before accepting.</p>
                        </div>
                        <FlowSteps current={stage} done={stage - 1} steps={[{ title: 'Brief Submitted', sub: 'Completed' }, { title: 'Provider Matching', sub: 'Completed' }, { title: 'Quote Received', sub: 'Current Step' }, { title: 'Review & Select' }, { title: 'Engagement Kickoff' }]} />
                        <dl className="grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 text-xs sm:grid-cols-5">
                            <div><dt className="text-ink-500">Quote ID</dt><dd className="font-mono font-semibold">{quote.reference}</dd></div>
                            <div><dt className="text-ink-500">Version</dt><dd>{quote.version} <span className="rounded bg-controlled-50 px-1.5 text-controlled-700">Current</span></dd></div>
                            <div><dt className="text-ink-500">Received</dt><dd>{fmt(quote.issued_at)}</dd></div>
                            <div><dt className="text-ink-500">Valid Until</dt><dd>{fmt(quote.valid_until, false)}{days !== null && ` (${days} days)`}</dd></div>
                            <div><dt className="text-ink-500">Status</dt><dd><StatusPill status={quote.status === 'issued' ? 'awaiting review' : quote.status} tone={quote.status === 'issued' ? 'good' : undefined} /></dd></div>
                        </dl>

                        <SideCard title="1. Quote Summary">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="flex gap-3"><ShopIcon name="users" size="md" /><div><p className="font-semibold text-ink-900">{quote.title}</p><p className="text-xs text-ink-500">{quote.category}</p>{quote.licence && <p className="text-xs text-ink-500">Licence: {quote.licence}</p>}</div></div>
                                <div className="text-xs"><p className="text-ink-500">Provider</p><p className="font-semibold text-ink-900">{quote.provider}</p><p className="mt-1 flex items-center gap-1 text-verified-700"><BadgeCheck className="size-3.5" /> Verified Provider</p></div>
                                <div className="text-xs"><p className="text-ink-500">Jurisdiction</p><p className="font-semibold">{quote.jurisdiction}</p><p className="mt-1 text-ink-500">Engagement Type</p><p className="font-semibold">{quote.engagement_type}</p></div>
                            </div>
                        </SideCard>

                        <div className="grid gap-5 md:grid-cols-2">
                            <SideCard title="2. Deliverables"><ul className="space-y-1.5 text-[0.8125rem]">{(quote.deliverables ?? []).map((d) => <li key={d} className="flex gap-2"><Check className="mt-0.5 size-4 text-verified-500" aria-hidden="true" />{d}</li>)}</ul></SideCard>
                            <SideCard title="3. Terms & Conditions (Overview)">
                                <ul className="space-y-2 text-xs">{(quote.terms ?? []).map(([k, v], i) => { const I = TERM_ICONS[i % TERM_ICONS.length]; return <li key={k} className="flex gap-2"><I className="size-4 text-ink-400" aria-hidden="true" /><span><strong className="block text-ink-900">{k}</strong>{v}</span></li>; })}</ul>
                            </SideCard>
                        </div>

                        <SideCard title="4. Quote Line Items">
                            <div className="overflow-x-auto">
                                <table className="w-full min-w-[560px] text-left text-[0.8125rem]">
                                    <thead className="bg-parchment-200 text-xs"><tr><th className="p-2">Item</th><th className="p-2">Description</th><th className="p-2">Quantity</th><th className="p-2 text-right">Unit Price (Excl. VAT)</th><th className="p-2 text-right">VAT (15%)</th><th className="p-2 text-right">Total (Incl. VAT)</th></tr></thead>
                                    <tbody className="divide-y divide-parchment-300">
                                        {quote.lines.map((l, i) => { const ex = l.unit_zar * l.quantity; return <tr key={i}><td className="p-2">{i + 1}</td><td className="p-2">{l.description}</td><td className="p-2">{l.quantity}</td><td className="p-2 text-right">{zar2(l.unit_zar)}</td><td className="p-2 text-right">{zar2(ex * 0.15)}</td><td className="p-2 text-right">{zar2(ex * 1.15)}</td></tr>; })}
                                    </tbody>
                                    <tfoot className="text-sm">
                                        <tr><td colSpan={5} className="p-2 text-right">Subtotal (Excl. VAT)</td><td className="p-2 text-right">{zar2(totals.subtotal)}</td></tr>
                                        <tr><td colSpan={5} className="p-2 text-right">VAT (15%)</td><td className="p-2 text-right">{zar2(totals.vat)}</td></tr>
                                        <tr><td colSpan={5} className="p-2 text-right font-semibold">Total (Incl. VAT)</td><td className="p-2 text-right text-lg font-bold text-verified-700">{zar2(totals.total)}</td></tr>
                                    </tfoot>
                                </table>
                            </div>
                        </SideCard>
                        <p className="flex gap-2 rounded-[6px] bg-controlled-50 p-3 text-xs text-controlled-700"><Info className="size-4 shrink-0" aria-hidden="true" /> By accepting this quote, you agree to the Terms & Conditions and authorise The Business Clinic.Africa to facilitate this engagement. Material changes require re-acceptance of a new version.</p>
                    </div>

                    <aside className="space-y-4 lg:col-span-4">
                        <SideCard title="Quote Summary" action={<button type="button" onClick={() => window.print()} className="inline-flex items-center gap-1 text-xs font-semibold text-controlled-700"><Download className="size-3.5" /> Download Quote (PDF)</button>}>
                            <div className="flex gap-3"><ShopIcon name="users" size="sm" /><div className="text-xs"><p className="font-semibold text-ink-900">{quote.title}</p><p>{quote.provider}</p></div></div>
                            <dl className="mt-3 space-y-1 text-sm"><div className="flex justify-between"><dt>Subtotal (Excl. VAT)</dt><dd>{zar2(totals.subtotal)}</dd></div><div className="flex justify-between"><dt>VAT (15%)</dt><dd>{zar2(totals.vat)}</dd></div></dl>
                            <p className="mt-2 flex justify-between border-t border-parchment-300 pt-2 font-semibold">Total (Incl. VAT)<span className="text-xl font-bold text-verified-700">{zar2(totals.total)}</span></p>
                        </SideCard>
                        <SideCard title="Quote Versions">
                            <ul className="space-y-1 text-xs">
                                <li className="flex justify-between rounded bg-verified-50 p-2 font-semibold"><span>V{quote.version} (Current)</span><span>{fmt(quote.issued_at)}</span><span>{zar2(totals.total)}</span></li>
                                {[...(quote.history ?? [])].reverse().map((h) => <li key={h.version} className="flex justify-between p-2 text-ink-500"><span>{h.label}</span><span>{fmt(h.issued_at)}</span><span>{zar2(h.subtotal_zar * 1.15)}</span></li>)}
                            </ul>
                        </SideCard>
                        {quote.provider_note && <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4 text-xs text-ink-700"><MessageSquare className="size-5 shrink-0 text-controlled-700" aria-hidden="true" /><p><strong className="block text-ink-900">Notes from Provider</strong>{quote.provider_note}</p></div>}
                        {quote.client_note && <p className="rounded-[6px] bg-parchment-200 p-3 text-xs"><strong>Your note:</strong> {quote.client_note}</p>}
                        <SideCard title="What happens next?"><NextSteps steps={[['Accept Quote', 'Approve this quote and proceed to engagement setup.'], ['Schedule Kickoff', "We'll work with you to schedule the project kickoff."], ['Work Begins', 'Our team will commence work as per the agreed timeline.']]} /></SideCard>

                        {open ? (
                            <div className="space-y-3">
                                <Checkbox checked={accept.data.accept_terms} onChange={(e) => accept.setData('accept_terms', e.target.checked)} label="I accept this quote and the Terms & Conditions." />
                                {accept.errors.accept_terms && <p role="alert" className="text-xs text-risk-500">{accept.errors.accept_terms}</p>}
                                <div className="grid grid-cols-3 gap-2">
                                    <button type="button" onClick={() => setModal('decline')} className="rounded-[4px] border border-risk-500 py-2.5 text-xs font-semibold text-risk-700">Decline Quote</button>
                                    <button type="button" onClick={() => setModal('changes')} className="rounded-[4px] border border-controlled-500 py-2.5 text-xs font-semibold text-controlled-700">Request Changes</button>
                                    <button type="button" disabled={accept.processing} onClick={() => accept.post(`/shop/quote/${quote.reference}/accept`)} className="rounded-[4px] bg-verified-700 py-2.5 text-xs font-semibold text-white">✓ Accept Quote</button>
                                </div>
                                <p className="text-center text-[0.6875rem] text-ink-400">Secure & Binding Agreement</p>
                            </div>
                        ) : quote.status === 'accepted' && quote.order_reference ? (
                            <Link href={quote.order_paid ? `/checkout/${quote.order_reference}/confirmation` : `/checkout/${quote.order_reference}`} className="block rounded-[4px] bg-verified-700 py-3 text-center text-sm font-semibold text-white">{quote.order_paid ? 'View Confirmation' : 'Continue to Payment'}</Link>
                        ) : (
                            <p className="rounded-[6px] border border-parchment-400 bg-white p-3 text-center text-sm text-ink-600">This quote is <strong>{quote.status.replace('_', ' ')}</strong>. {quote.status === 'changes_requested' && 'A revised version will be issued.'}</p>
                        )}
                    </aside>
                </div>
            </div>
            <TrustStrip items={[{ title: 'Verified Providers', body: 'All providers are vetted.' }, { title: 'Transparent Pricing', body: 'No hidden fees.' }, { title: 'Secure & Confidential', body: 'Your data is protected.' }, { title: 'Human Oversight', body: 'Every engagement is reviewed.' }]} />

            <Modal open={modal === 'decline'} onClose={() => setModal(null)} title="Decline Quote" footer={<Button type="button" size="sm" disabled={decline.processing} onClick={() => decline.post(`/shop/quote/${quote.reference}/decline`, { onSuccess: () => setModal(null) })}>Decline Quote</Button>}>
                <Field label="Reason (optional)" error={decline.errors.reason}>{(id) => <Textarea id={id} value={decline.data.reason} onChange={(e) => decline.setData('reason', e.target.value)} />}</Field>
            </Modal>
            <Modal open={modal === 'changes'} onClose={() => setModal(null)} title="Request Changes" footer={<Button type="button" size="sm" disabled={changes.processing} onClick={() => changes.post(`/shop/quote/${quote.reference}/changes`, { onSuccess: () => setModal(null) })}>Send Change Request</Button>}>
                <Field label="What would you like changed?" error={changes.errors.note} required>{(id) => <Textarea id={id} value={changes.data.note} onChange={(e) => changes.setData('note', e.target.value)} />}</Field>
            </Modal>
        </>
    );
}

