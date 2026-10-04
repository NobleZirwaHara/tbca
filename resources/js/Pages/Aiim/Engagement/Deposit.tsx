import { useForm } from '@inertiajs/react';
import { Building2, CheckCircle2, CreditCard, Download, FileText, Landmark, Lock, ShieldCheck, Zap } from 'lucide-react';
import type { FormEvent } from 'react';
import { HumanLed } from '@/Components/Aiim/EngagementKit';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { ChoiceCard } from '@/Components/ui/Form';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, Engagement } from '@/types/aiim';

export default function Deposit({ engagement: e }: AiimPageProps & { engagement: Engagement }) {
    const q = e.quote!;
    const form = useForm({ method: 'card' });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(`/aiim/workspace/engagements/${e.reference}/pay`); };
    const stages: [string, string, boolean][] = [['Discovery', 'Completed', true], ['Proposal & Quote', 'Accepted', true], ['Engagement Letter', 'Signed', true], ['Deposit Payment', 'In Progress', false], ['Engagement Active', 'Upcoming', false]];
    return (
        <AiimPage
            title="Deposit Payment"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Advisor Services' }, { label: 'Deposit Payment' }]}
            heading={<><CreditCard className="size-7 text-referenced-500" /> Deposit Payment</>}
            subtitle="Secure your engagement with a deposit payment."
            description="To commence your advisory engagement, a deposit is required as per the agreed terms in the engagement letter."
            accent="purple"
            notice={<HumanLed text="Your payment is secure and encrypted. No AI-only advice." />}
            rail={<SelectionBox />}
        >
            <ol className="mb-4 grid gap-2 rounded-[8px] border border-parchment-400 bg-white p-3 sm:grid-cols-5">
                {stages.map(([t, s, done], i) => <li key={t} className="flex items-center gap-2 text-xs">{done ? <CheckCircle2 className="size-6 text-verified-500" /> : <span className={`flex size-6 items-center justify-center rounded-full border-2 ${i === 3 ? 'border-referenced-500 text-referenced-700' : 'border-parchment-500 text-ink-400'}`}>{i + 1}</span>}<span><strong className="block">{t}</strong><span className={i === 3 ? 'text-referenced-700' : 'text-ink-500'}>{s}</span></span></li>)}
            </ol>
            <form onSubmit={submit} className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_18rem]">
                <SectionCard number={1} title="Engagement Summary">
                    <dl className="space-y-1.5 text-xs">{[['Engagement Type', e.title], ['Engagement ID', e.reference], ['Client', `${e.client.name}${e.client.company ? ` (${e.client.company})` : ''}`], ['Advisor', e.advisor ? `${e.advisor.name} — ${e.advisor.title}` : '—'], ['Total Engagement Fee (ex. VAT)', zar2(q.subtotal)], [`Recommended Deposit (${q.deposit_percent}%)`, `${zar2(q.deposit_ex_vat)} · Due Now`], ['Engagement Fee (incl. VAT 15%)', zar2(q.total)], ['Signed', e.signature ? `${e.signature.name}, ${e.signature.at}` : '—']].map(([k, v]) => <div key={k} className="grid grid-cols-[10rem_1fr] gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                </SectionCard>
                <div className="space-y-4">
                    <SectionCard number={2} title="Payment Breakdown">
                        <dl className="space-y-1 text-sm"><div className="flex justify-between"><dt>Engagement Fee (ex. VAT)</dt><dd>{zar2(q.subtotal)}</dd></div><div className="flex justify-between"><dt>Deposit ({q.deposit_percent}% of ex. VAT)</dt><dd>{zar2(q.deposit_ex_vat)}</dd></div><div className="flex justify-between"><dt>VAT (15% on deposit)</dt><dd>{zar2(q.deposit_vat)}</dd></div><div className="flex justify-between border-t border-parchment-300 pt-1 text-lg font-bold"><dt>Total Deposit Payable</dt><dd className="text-referenced-700">{zar2(q.deposit_total)}</dd></div></dl>
                        <p className="mt-2 flex gap-1.5 rounded bg-verified-50 p-2 text-xs text-verified-700"><ShieldCheck className="size-4 shrink-0" />This deposit will be deducted from your total engagement fee upon completion. The secure checkout adds the disclosed platform and bank charges.</p>
                    </SectionCard>
                    <SectionCard number={3} title="Payment Method">
                        <div role="radiogroup" className="grid gap-2 sm:grid-cols-2">
                            <ChoiceCard selected={form.data.method === 'card'} onSelect={() => form.setData('method', 'card')} title="Credit / Debit Card" description="Visa, Mastercard" icon={<CreditCard className="size-4" />} />
                            <ChoiceCard selected={form.data.method === 'eft'} onSelect={() => form.setData('method', 'eft')} title="Instant EFT" icon={<Zap className="size-4" />} />
                            <ChoiceCard selected={form.data.method === 'bank'} onSelect={() => form.setData('method', 'bank')} title="Bank Transfer" description="Manual transfer" icon={<Landmark className="size-4" />} />
                            <ChoiceCard selected={form.data.method === 'corporate'} onSelect={() => form.setData('method', 'corporate')} title="Corporate Account" description="For existing clients" icon={<Building2 className="size-4" />} />
                        </div>
                        {form.errors.method && <p role="alert" className="mt-1 text-xs text-risk-500">{form.errors.method}</p>}
                    </SectionCard>
                </div>
                <div className="space-y-4">
                    <SectionCard number={6} title="Make Payment">
                        <p className="text-center text-xs text-ink-500">Amount Due (incl. VAT)</p>
                        <p className="text-center text-2xl font-bold text-referenced-700">{zar2(q.deposit_total)}</p>
                        <Button type="submit" disabled={form.processing} className="mt-3 w-full !border-referenced-500 !bg-referenced-500 !text-white" trailingIcon="arrow-right"><Lock className="size-4" />Pay Now Securely</Button>
                    </SectionCard>
                    <SectionCard number={5} title="Next Steps After Payment"><ul className="space-y-1 text-xs">{['We will confirm your payment.', 'Your engagement will be activated.', 'Your advisor will schedule the kickoff.', 'You will receive onboarding instructions.'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{t}</li>)}</ul></SectionCard>
                    <SectionCard number={8} title="Download Documents">
                        <ul className="space-y-1 text-xs">
                            <li><a href={`/aiim/workspace/engagements/${e.reference}/sign`} className="flex items-center justify-between rounded border border-parchment-400 p-2 hover:border-gold-500"><span className="flex items-center gap-1.5"><FileText className="size-3.5" />Engagement Letter (Signed)</span><Download className="size-3.5" /></a></li>
                            <li><a href={`/aiim/workspace/engagements/${e.reference}/quote`} className="flex items-center justify-between rounded border border-parchment-400 p-2 hover:border-gold-500"><span className="flex items-center gap-1.5"><FileText className="size-3.5" />Formal Quotation</span><Download className="size-3.5" /></a></li>
                        </ul>
                    </SectionCard>
                </div>
            </form>
            <ButtonLink href="/aiim/workspace" variant="outline" className="mt-4">Back to Workspace</ButtonLink>
        </AiimPage>
    );
}
