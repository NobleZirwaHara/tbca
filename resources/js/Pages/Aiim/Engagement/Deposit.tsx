import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ADV, Banner, Flow, Panel, SumBox, btn, eng } from '@/Components/Aiim/ProtoEngagement';
import { useMoney } from '@/Components/Industries/Kit';
import { cn } from '@/lib/cn';
import type { AiimPageProps, Engagement } from '@/types/aiim';

const METHODS: [string, string, string][] = [
    ['card', 'Card via payment provider', 'You will be passed to the provider’s secure page'],
    ['eft', 'Instant EFT', 'Pay from your bank account'],
    ['bank', 'EFT / bank transfer', 'Invoice with reference; work starts on receipt'],
];

/** Page 48 Deposit Payment: the deposit is paid through the secure checkout. */
export default function Deposit({ engagement: e }: AiimPageProps & { engagement: Engagement }) {
    const q = e.quote!;
    const money = useMoney();
    const form = useForm({ method: 'card' });
    const submit = (ev: FormEvent) => { ev.preventDefault(); form.post(eng(e.reference, '/pay')); };
    const pct = q.deposit_percent;
    return (
        <Flow title="Deposit Payment" eyebrow={`Page 48 · ${pct} % deposit`} steps={{ list: ADV, on: 5 }} crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }]}
            side={<Banner>The secure checkout adds any disclosed bank charges. The deposit is set against the engagement total; the balance is due on acceptance of deliverables.</Banner>}>
            <Panel title="Deposit">
                <SumBox lines={[['Engagement total (excl. VAT)', q.subtotal], [`Less ${100 - pct} % balance on acceptance`, -(q.subtotal - q.deposit_ex_vat)]]} total={{ label: 'Deposit due now' }} />
                <form onSubmit={submit} className="mt-4 grid gap-3">
                    <div role="radiogroup" aria-label="Payment method" className="grid gap-2 sm:grid-cols-3">
                        {METHODS.map(([v, t, s]) => (
                            <label key={v} className={cn('grid cursor-pointer gap-1 rounded-[10px] border p-3 text-[0.82rem]', form.data.method === v ? 'border-gold-500 bg-gold-50' : 'border-parchment-400 bg-white')}>
                                <span className="flex items-center gap-2"><input type="radio" name="method" value={v} checked={form.data.method === v} onChange={() => form.setData('method', v)} className="accent-gold-600" /><b>{t}</b></span>
                                <span className="text-ink-500">{s}</span>
                            </label>
                        ))}
                    </div>
                    {form.errors.method && <p role="alert" className="text-[0.8rem] text-risk-700">{form.errors.method}</p>}
                    <div><button type="submit" className={btn('gold')} disabled={form.processing}>Pay deposit · {money(q.deposit_total)}</button></div>
                </form>
            </Panel>
        </Flow>
    );
}
