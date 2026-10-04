import { router, useForm } from '@inertiajs/react';
import { BarChart3, Clock, Coins, CreditCard, History, Lock, Package, ShieldCheck, Wallet as WalletIcon } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Chip } from '@/Components/Aiim/Chips';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { RailBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Field, Input } from '@/Components/ui/Form';
import { Modal, SimpleTable } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    summary: { balance: number; total: number; used: number; reserved: number; expiring: number };
    wallet: { auto_recharge: boolean; auto_recharge_threshold_zar: number; auto_recharge_amount_zar: number };
    packs: { code: string; credits: number; price: number; label: string; saving?: string }[];
    transactions: { reference: string; date: string; description: string; type: string; amount: number; balance: number }[];
    usage: number;
}

export default function Wallet({ summary, wallet, packs, transactions, usage }: Props) {
    const [topUp, setTopUp] = useState(false);
    const [auto, setAuto] = useState(false);
    const top = useForm({ amount: 1000 });
    const ar = useForm({ ...wallet });
    const buyPack = (code: string) => router.post('/aiim/wallet/top-up', { pack: code });
    const submitTop = (e: FormEvent) => { e.preventDefault(); top.post('/aiim/wallet/top-up'); };
    const submitAuto = (e: FormEvent) => { e.preventDefault(); ar.post('/aiim/wallet/auto-recharge', { onSuccess: () => setAuto(false) }); };

    return (
        <AiimPage
            title="Wallet and Credits"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Wallet and Credits' }]}
            heading={<>Wallet and Credits <WalletIcon className="size-7 text-risk-500" /></>}
            subtitle="Manage your AIIM wallet, credits and transaction history."
            description="Prepaid credits make unlocking premium intelligence simple and secure."
            rail={
                <>
                    <SelectionBox />
                    <RailBox title="Wallet Insights">
                        <ul className="space-y-3 text-xs">{[[Coins, 'Save on every unlock', 'Credit packs give you the best value.'], [ShieldCheck, 'No hidden fees', 'All fees are shown upfront.'], [Lock, 'Flexible and secure', 'Credits are usable only for AIIM services.']].map(([I, t, d]) => { const Icon = I as typeof Coins; return <li key={t as string} className="flex gap-2"><Icon className="size-4 text-gold-500" /><span><strong className="block">{t as string}</strong><span className="text-ink-400">{d as string}</span></span></li>; })}</ul>
                    </RailBox>
                    <RailBox title="Need More Credits?"><Button type="button" size="sm" className="w-full" onClick={() => setTopUp(true)}>Add Funds</Button></RailBox>
                </>
            }
        >
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)]">
                <div className="space-y-4">
                    <SectionCard title="Wallet Balance">
                        <p className="text-3xl font-bold text-verified-700">{zar2(summary.balance)}</p>
                        <p className="text-sm">Available Credits</p>
                        <p className="mt-1 text-xs text-ink-500">This balance can be used to unlock premium intelligence objects.</p>
                        <div className="mt-3 flex items-center justify-between border-t border-parchment-300 pt-2 text-xs">
                            <span className="flex items-center gap-1"><Clock className="size-3.5" />Auto-recharge: {wallet.auto_recharge ? `On (below ${zar2(wallet.auto_recharge_threshold_zar)})` : 'Off'}</span>
                            <button type="button" onClick={() => setAuto(true)} className="font-semibold text-risk-500 underline">Manage Auto-recharge</button>
                        </div>
                    </SectionCard>
                    <SectionCard title="Quick Actions">
                        <ul className="space-y-1 text-sm">
                            <li><button type="button" onClick={() => setTopUp(true)} className="flex w-full items-center gap-3 rounded p-2 text-left hover:bg-parchment-200"><CreditCard className="size-5 text-gold-600" /><span><strong className="block">Add Funds</strong><span className="text-xs text-ink-500">Top up your wallet securely.</span></span></button></li>
                            <li><a href="#packs" className="flex items-center gap-3 rounded p-2 hover:bg-parchment-200"><Package className="size-5 text-gold-600" /><span><strong className="block">Purchase Credit Pack</strong><span className="text-xs text-ink-500">Choose from prepaid credit bundles.</span></span></a></li>
                            <li><a href="#history" className="flex items-center gap-3 rounded p-2 hover:bg-parchment-200"><History className="size-5 text-gold-600" /><span><strong className="block">Transaction History</strong><span className="text-xs text-ink-500">View all wallet and credit transactions.</span></span></a></li>
                            <li className="flex items-center gap-3 p-2"><BarChart3 className="size-5 text-gold-600" /><span><strong className="block">Credits Usage Report</strong><span className="text-xs text-ink-500">{usage} paid unlocks/views to date.</span></span></li>
                        </ul>
                    </SectionCard>
                </div>
                <div className="space-y-4">
                    <SectionCard title="Credits Summary">
                        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                            {[['Total Credits', summary.total], ['Used Credits', summary.used], ['Reserved Credits', summary.reserved], ['Expiring Soon', summary.expiring]].map(([k, v]) => <div key={k as string}><dt className="text-xs text-ink-500">{k}</dt><dd className="text-lg font-bold">{zar2(v as number)}</dd></div>)}
                        </dl>
                    </SectionCard>
                    <SectionCard title="Credit Packs">
                        <ul id="packs" className="grid gap-3 sm:grid-cols-3">
                            {packs.map((p) => (
                                <li key={p.code} className="rounded-[8px] border border-parchment-400 p-3 text-center">
                                    <p className="font-semibold">{p.label}</p>
                                    <p className="text-2xl font-bold text-gold-700">{p.credits.toLocaleString('en-ZA')}</p>
                                    <p className="text-xs text-ink-500">credits for {zar2(p.price)} + VAT</p>
                                    {p.saving && <Chip tone="good" className="mt-1">{p.saving}</Chip>}
                                    <Button type="button" size="sm" className="mt-2 w-full" onClick={() => buyPack(p.code)}>Buy Pack</Button>
                                </li>
                            ))}
                        </ul>
                    </SectionCard>
                    <SectionCard title="Recent Transactions">
                        <div id="history">
                            <SimpleTable
                                columns={['Date', 'Description', 'Type', 'Amount (ZAR)', 'Balance (ZAR)']}
                                rows={transactions.map((t) => [t.date, t.description, <Chip key="t" tone={t.type === 'debit' ? 'bad' : t.type === 'credit' ? 'info' : 'good'}>{t.type === 'top-up' ? 'Top-up' : t.type === 'debit' ? 'Debit' : 'Credit'}</Chip>, <span key="a" className={t.amount < 0 ? 'text-risk-500' : 'text-verified-700'}>{t.amount < 0 ? '-' : '+'} {zar2(Math.abs(t.amount))}</span>, zar2(t.balance)])}
                                empty="No transactions yet."
                            />
                        </div>
                    </SectionCard>
                </div>
            </div>

            <Modal open={topUp} onClose={() => setTopUp(false)} title="Add Funds">
                <form onSubmit={submitTop} className="space-y-3">
                    <Field label="Amount (ZAR credits)" error={top.errors.amount} hint="Minimum R500. VAT and the disclosed platform fee are added at checkout.">{(id) => <Input id={id} type="number" min={500} step={100} value={top.data.amount} onChange={(e) => top.setData('amount', Number(e.target.value))} />}</Field>
                    <Button type="submit" disabled={top.processing} className="w-full">Continue to Secure Payment</Button>
                </form>
            </Modal>
            <Modal open={auto} onClose={() => setAuto(false)} title="Manage Auto-recharge">
                <form onSubmit={submitAuto} className="space-y-3">
                    <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={ar.data.auto_recharge} onChange={(e) => ar.setData('auto_recharge', e.target.checked)} className="accent-gold-600" />Enable auto-recharge</label>
                    <Field label="Recharge when balance falls below (ZAR)" error={ar.errors.auto_recharge_threshold_zar}>{(id) => <Input id={id} type="number" value={ar.data.auto_recharge_threshold_zar} onChange={(e) => ar.setData('auto_recharge_threshold_zar', Number(e.target.value))} />}</Field>
                    <Field label="Recharge amount (ZAR)" error={ar.errors.auto_recharge_amount_zar}>{(id) => <Input id={id} type="number" value={ar.data.auto_recharge_amount_zar} onChange={(e) => ar.setData('auto_recharge_amount_zar', Number(e.target.value))} />}</Field>
                    <Button type="submit" disabled={ar.processing} className="w-full">Save Settings</Button>
                </form>
            </Modal>
        </AiimPage>
    );
}
