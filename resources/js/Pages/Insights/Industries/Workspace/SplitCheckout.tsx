import { Link, useForm } from '@inertiajs/react';
import { Banknote, CheckCircle2, CreditCard, FileText, Lock, Plus, ShieldCheck, Trash2, Wallet } from 'lucide-react';
import { Stepper } from '@/Components/ui/Kit';
import { WorkspaceShell } from '@/Components/Insights/Industries';
import { Box, Chip, Notice, Stat, zar } from '@/Components/Insights/Shared';
import type { WorkspaceBase } from '@/types/insights';

interface Row { method: 'card' | 'eft' | 'wallet'; label: string; payer: string; role: string; amount: number; enabled: boolean }
interface Props extends WorkspaceBase {
    amount: number;
    invoice: { item: number; description: string; amount: number }[];
    draft: Row[];
    walletAvailable: number;
    letterSigned: boolean;
    quotationApproved: boolean;
    issueDate: string;
    dueOn: string | null;
}

const ICON = { card: CreditCard, eft: Banknote, wallet: Wallet };
const LABEL = { card: 'Corporate Card', eft: 'Bank Transfer', wallet: 'Wallet Balance' };

export default function SplitCheckout(props: Props) {
    const { engagement: e, amount, invoice, draft, walletAvailable, letterSigned, quotationApproved, issueDate, dueOn } = props;
    const root = `/industries/workspace/${e.reference}`;
    const form = useForm<{ mode: 'draft' | 'confirm'; rows: Row[] }>({ mode: 'confirm', rows: draft });
    const rows = form.data.rows;
    const total = rows.filter((r) => r.enabled).reduce((a, r) => a + (Number(r.amount) || 0), 0);
    const remaining = amount - total;
    const update = (i: number, patch: Partial<Row>) => form.setData('rows', rows.map((r, j) => (j === i ? { ...r, ...patch } : r)));
    const add = () => form.setData('rows', [...rows, { method: 'eft', label: 'Bank Transfer', payer: '', role: 'Co-funder', amount: Math.max(0, remaining), enabled: true }]);
    const submit = (mode: 'draft' | 'confirm') => {
        form.transform((d) => ({ ...d, mode }));
        form.post(`${root}/split-checkout`, { preserveScroll: true });
    };
    const blocked = !letterSigned || !quotationApproved || amount === 0;
    const errorText = (form.errors as Record<string, string>).rows;

    return (
        <WorkspaceShell
            base={props}
            title="Split Checkout"
            badge={<Chip tone="green">AIIM Verified</Chip>}
            description="Complete your purchase using multiple payment methods. Your ledger will be updated in real time."
            actions={<Link href={root} className="rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold">← Back to Engagement</Link>}
            right={
                <>
                    <Box title="Engagement Summary">
                        <dl className="space-y-1.5 text-xs">
                            <div className="flex justify-between"><dt>Reference</dt><dd>{e.reference}</dd></div>
                            <div className="flex justify-between"><dt>Issue Date</dt><dd>{issueDate}</dd></div>
                            <div className="flex justify-between"><dt>Amount Due (ZAR)</dt><dd className="font-bold text-verified-700">{zar(amount, 2)}</dd></div>
                            <div className="flex justify-between"><dt>Payment Terms</dt><dd>100% upfront</dd></div>
                            <div className="flex justify-between"><dt>Due Date</dt><dd>{dueOn}</dd></div>
                        </dl>
                    </Box>
                    <Box title="Payment Security"><ul className="space-y-1.5 text-xs">{['256-bit SSL encryption', 'PCI DSS compliant', 'Secure banking partners', 'Fraud protection enabled'].map((t) => <li key={t} className="flex items-center gap-2"><ShieldCheck className="size-4 text-ink-500" />{t}</li>)}</ul></Box>
                </>
            }
        >
            <Stepper steps={['Engagement Summary', 'Split Checkout', 'Review & Confirm', 'Payment Processing', 'Receipt & Ledger Update']} current={2} />
            {blocked && (
                <Notice tone="amber" title="Payment not yet available">
                    {amount === 0 ? 'There is no outstanding invoice on this engagement.' : !letterSigned ? <>Sign the <Link className="underline" href={`${root}/engagement-letter`}>engagement letter</Link> first.</> : <>Approve the <Link className="underline" href={`${root}/gates`}>quotation gate (G3)</Link> first.</>}
                </Notice>
            )}
            <div className="grid gap-3 sm:grid-cols-3">
                <Stat label="Total Amount" value={zar(amount, 2)} caption="Excl. VAT" icon={<FileText className="size-5" />} />
                <Stat label="Amount to Pay" value={zar(total, 2)} caption={`${amount ? ((total / amount) * 100).toFixed(0) : 0}% of total`} icon={<CheckCircle2 className="size-5" />} />
                <Stat label="Outstanding After Payment" value={zar(Math.max(0, remaining), 2)} caption={`${amount ? Math.max(0, (remaining / amount) * 100).toFixed(0) : 0}% remaining`} icon={<Wallet className="size-5" />} tone={remaining === 0 ? 'green' : 'gold'} />
            </div>

            <div className="grid gap-5 xl:grid-cols-[1.2fr_1fr]">
                <div className="space-y-4">
                    <Box title="1. Select Payment Split">
                        <p className="-mt-2 mb-3 text-xs text-ink-500">Choose how you want to split the payment.</p>
                        <div className="space-y-2">
                            {rows.map((r, i) => {
                                const Icon = ICON[r.method];
                                return (
                                    <div key={i} className="grid items-center gap-2 rounded-[6px] border border-parchment-300 p-2 sm:grid-cols-[auto_1fr_1fr_8rem_3.5rem_auto]">
                                        <input type="checkbox" aria-label={`Include ${r.label}`} className="accent-gold-600" checked={r.enabled} onChange={(ev) => update(i, { enabled: ev.target.checked })} />
                                        <label className="flex items-center gap-2 text-xs">
                                            <Icon className="size-4 text-ink-500" />
                                            <select aria-label="Payment method" value={r.method} onChange={(ev) => update(i, { method: ev.target.value as Row['method'], label: LABEL[ev.target.value as Row['method']] })} className="h-8 rounded border border-parchment-500 px-1 text-xs">
                                                <option value="card">Corporate Card</option><option value="eft">Bank Transfer (EFT)</option><option value="wallet">Wallet Balance</option>
                                            </select>
                                        </label>
                                        <input aria-label="Payer / source" value={r.payer} onChange={(ev) => update(i, { payer: ev.target.value })} placeholder="Payer / source" className="h-8 rounded border border-parchment-500 px-2 text-xs" />
                                        <input aria-label="Amount ZAR" type="number" min={0} value={r.amount} onChange={(ev) => update(i, { amount: Number(ev.target.value) })} className="h-8 rounded border border-parchment-500 px-2 text-right text-xs" />
                                        <span className="text-right text-xs text-ink-500">{amount ? ((Number(r.amount) / amount) * 100).toFixed(2) : 0}%</span>
                                        <button type="button" aria-label="Remove" onClick={() => form.setData('rows', rows.filter((_, j) => j !== i))} className="text-ink-400 hover:text-risk-500"><Trash2 className="size-4" /></button>
                                        {r.method === 'wallet' && <span className="text-[0.625rem] text-ink-400 sm:col-span-6">Available: {zar(walletAvailable, 2)}</span>}
                                    </div>
                                );
                            })}
                        </div>
                        {rows.length < 5 && <button type="button" onClick={add} className="mt-2 flex items-center gap-1 text-xs font-semibold text-controlled-700"><Plus className="size-4" /> Add Payment Method</button>}
                        <div className="mt-3 flex justify-between border-t border-parchment-300 pt-2 text-sm font-semibold"><span>Total</span><span className={remaining === 0 ? 'text-verified-700' : 'text-risk-700'}>{zar(total, 2)} ({amount ? ((total / amount) * 100).toFixed(2) : 0}%)</span></div>
                        {errorText && <p role="alert" className="mt-1 text-xs text-risk-500">{errorText}</p>}
                    </Box>
                    <Box title="2. Apply to Invoice">
                        <table className="w-full text-xs"><thead className="text-ink-500"><tr><th className="py-1 text-left">Item</th><th className="text-left">Description</th><th className="text-right">Amount (ZAR)</th></tr></thead>
                            <tbody>{invoice.map((i) => <tr key={i.item} className="border-t border-parchment-300"><td className="py-1.5">{i.item}</td><td>{i.description}</td><td className="text-right">{zar(i.amount, 2)}</td></tr>)}</tbody></table>
                        <p className="mt-2 flex items-center gap-1.5 rounded bg-controlled-50 p-2 text-xs text-controlled-700"><Lock className="size-3.5" /> All payments are encrypted and processed securely.</p>
                    </Box>
                </div>
                <Box title="3. Ledger Preview">
                    <p className="-mt-2 mb-3 text-xs text-ink-500">Preview of how this payment will be recorded.</p>
                    <table className="w-full text-xs">
                        <tbody className="divide-y divide-parchment-300">
                            <tr><td className="py-1.5 font-semibold">Opening Balance</td><td /><td className="text-right">R0.00</td></tr>
                            {rows.filter((r) => r.enabled).map((r, i) => <tr key={i}><td className="py-1.5"><strong className="block">{r.label}</strong><span className="text-ink-500">{r.payer}</span></td><td><Chip tone="green">Payment</Chip></td><td className="text-right">{zar(Number(r.amount), 2)}</td></tr>)}
                            <tr><td className="py-1.5"><strong className="block">Invoice Applied</strong><span className="text-ink-500">{e.reference}</span></td><td><Chip tone="blue">Applied</Chip></td><td className="text-right text-risk-700">-{zar(amount, 2)}</td></tr>
                            <tr><td className="py-1.5 font-semibold">Closing Balance</td><td /><td className="text-right font-semibold">{zar(total - amount, 2)}</td></tr>
                        </tbody>
                    </table>
                    {remaining === 0 ? (
                        <p className="mt-3 flex items-center gap-2 rounded border border-verified-500/30 bg-verified-50 p-2 text-xs text-verified-700"><CheckCircle2 className="size-4" /> This payment will fully settle the invoice. No outstanding balance will remain.</p>
                    ) : (
                        <p className="mt-3 rounded border border-risk-500/30 bg-risk-50 p-2 text-xs text-risk-700">The split must equal {zar(amount, 2)}. Difference: {zar(Math.abs(remaining), 2)}.</p>
                    )}
                </Box>
            </div>

            <div className="grid items-center gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-3">
                <div><p className="text-xs text-ink-500">Total to Pay</p><p className="text-2xl font-bold text-verified-700">{zar(total, 2)}</p></div>
                <div className="text-center"><button type="button" onClick={() => submit('draft')} disabled={form.processing} className="w-full rounded border border-parchment-500 py-2 text-sm font-semibold">Save as Draft</button><p className="mt-1 text-[0.6875rem] text-ink-400">You can complete this later</p></div>
                <div className="text-center"><button type="button" onClick={() => submit('confirm')} disabled={form.processing || blocked || remaining !== 0} className="flex w-full items-center justify-center gap-2 rounded bg-gold-500 py-2 text-sm font-bold disabled:opacity-50"><Lock className="size-4" /> Review & Confirm Payment</button><p className="mt-1 text-[0.6875rem] text-ink-400">You will review before finalising on the secure payment page</p></div>
            </div>
        </WorkspaceShell>
    );
}
