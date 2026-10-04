import { router, useForm } from '@inertiajs/react';
import { CheckCircle2, Info, Scale, ShieldCheck } from 'lucide-react';
import type { FormEvent } from 'react';
import { FeeSummary } from '@/Components/Aiim/FeeTable';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { DeeperBox, SectionCard, SelectionBox } from '@/Components/Aiim/Shell';
import { Checkbox, Field, Input, Select } from '@/Components/ui/Form';
import { Button, ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps, ProjectItem, Totals } from '@/types/aiim';
import { LockedHero } from './Locked';

interface Props extends AiimPageProps {
    item: ProjectItem;
    extra: number;
    price: Totals & { views: number; baseViews: number; extraViewRate: number; durationDays: number };
    wallet: number;
    user: { name: string };
    requestedOn: string;
}

export default function UnlockApproval({ item, extra, price, wallet, user, requestedOn }: Props) {
    const form = useForm({ authoriser: `${user.name} (Account Admin)`, purpose: 'Investment evaluation', method: wallet >= price.subtotal ? 'wallet' : 'card', extra_views: extra, confirm: false });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(`/aiim/unlock/${item.code}/approve`); };
    const setExtra = (n: number) => router.get(`/aiim/unlock/${item.code}/approve`, { extra: n }, { preserveScroll: true, preserveState: false });
    const walletShort = wallet < price.subtotal;

    return (
        <AiimPage
            title="Metered Unlock Approval"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Metered Unlock Approval' }]}
            heading={<>Metered Unlock Approval <ShieldCheck className="size-7 text-risk-500" /></>}
            subtitle="Review and approve metered access to this premium intelligence object."
            description="You are authorising a pay-per-view unlock. Charges apply only for approved access."
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            <SectionCard>
                <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                    <LockedHero item={item} />
                    <div className="lg:border-l lg:border-parchment-300 lg:pl-6">
                        <h3 className="mb-2 text-sm font-semibold">Metered Access Summary</h3>
                        <dl className="space-y-1 text-xs">
                            {[['Access Type', 'Pay-per-view'], ['Metered Item', item.premium?.title ?? 'Detailed financial model'], ['Access Duration', `${price.durationDays} days from first view`], ['Views Included', `${price.baseViews} views`], ['Extra Views', `${zar2(price.extraViewRate)} per additional view`], ['Purpose', form.data.purpose], ['Requested By', user.name], ['Requested On', requestedOn]].map(([k, v]) => <div key={k} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}
                        </dl>
                    </div>
                </div>
            </SectionCard>

            <form onSubmit={submit} className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_17rem]" noValidate>
                <SectionCard title={<span className="flex items-center gap-2"><Scale className="size-4" />Cost and Approval</span>}>
                    <label className="mb-3 flex items-center justify-between gap-2 text-xs">
                        <span>Estimated extra views (pre-paid allowance)</span>
                        <select value={extra} onChange={(e) => setExtra(Number(e.target.value))} className="h-8 rounded border border-parchment-500 px-2">
                            {[0, 1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                    </label>
                    <FeeSummary {...price} />
                    {form.data.method === 'wallet' && <p className="mt-2 text-xs text-ink-500">Paying with credits debits the ex-VAT subtotal ({zar2(price.subtotal)}); VAT was charged when the credits were bought.</p>}
                </SectionCard>
                <SectionCard title="Approval">
                    <div className="space-y-3">
                        <Field label="Who is authorising this unlock?" error={form.errors.authoriser} required>{(id) => <Select id={id} value={form.data.authoriser} onChange={(e) => form.setData('authoriser', e.target.value)} options={[`${user.name} (Account Admin)`, `${user.name} (Investment Committee)`]} />}</Field>
                        <Field label="Purpose" error={form.errors.purpose} required>{(id) => <Input id={id} value={form.data.purpose} onChange={(e) => form.setData('purpose', e.target.value)} />}</Field>
                        <fieldset>
                            <legend className="mb-1 text-[0.8125rem] font-medium">Payment Method</legend>
                            <label className="flex items-center gap-2 text-sm"><input type="radio" name="method" checked={form.data.method === 'wallet'} disabled={walletShort} onChange={() => form.setData('method', 'wallet')} className="accent-gold-600" />Wallet / Credits (Balance: {zar2(wallet)})</label>
                            {walletShort && <p className="ml-6 text-xs text-risk-500">Insufficient credits. <a href="/aiim/wallet" className="underline">Top up</a></p>}
                            <label className="mt-1 flex items-center gap-2 text-sm"><input type="radio" name="method" checked={form.data.method === 'card'} onChange={() => form.setData('method', 'card')} className="accent-gold-600" />Pay now by Card / EFT</label>
                        </fieldset>
                        <Checkbox checked={form.data.confirm} onChange={(e) => form.setData('confirm', e.target.checked)} label="I confirm this unlock is required for investment decision-making." />
                        {form.errors.confirm && <p role="alert" className="text-xs text-risk-500">{form.errors.confirm}</p>}
                        <p className="text-[0.6875rem] text-ink-400">All fees are non-refundable once access is initiated.</p>
                    </div>
                </SectionCard>
                <SectionCard title={<span className="flex items-center gap-2"><Info className="size-4 text-gold-600" />How Metered Access Works</span>} className="bg-gold-50">
                    <ul className="space-y-1.5 text-xs">{['You are charged for this unlock only.', 'Views are tracked securely.', 'Extra views are charged at the rate shown.', `Access ends after ${price.durationDays} days.`, 'Downloads included as per item rules.'].map((t) => <li key={t} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{t}</li>)}</ul>
                </SectionCard>
                <div className="flex flex-wrap justify-between gap-3 xl:col-span-3">
                    <ButtonLink href={`/aiim/unlock/${item.code}`} variant="outline">Back to Locked Object</ButtonLink>
                    <div className="flex gap-3">
                        <ButtonLink href="/aiim/workspace/advisor-request" variant="outline">Request Human Assistance</ButtonLink>
                        <Button type="submit" disabled={form.processing} icon="lock" trailingIcon="arrow-right">Approve &amp; Unlock Now</Button>
                    </div>
                </div>
            </form>
        </AiimPage>
    );
}
