import { Head, Link, router, useForm } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tag } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Textarea } from '@/Components/ui/Form';
import { ProviderShell } from '@/Components/Marketplace/Shells';
import { Card, CheckList, InfoRows, Notice, zarCode } from '@/Components/Marketplace/ui';
import type { MkBrief, MkProvider } from '@/types/marketplace';

interface Props {
    provider: MkProvider;
    brief: MkBrief;
    match: number;
    rate: number;
    proposal: { rate: number; days: number; status: string; note: string | null } | null;
    agreementTerms: { title: string; items: string[] }[];
}

export default function Opportunity({ provider, brief, match, rate, proposal, agreementTerms }: Props) {
    const s = brief.scope;
    const form = useForm({ rate: proposal?.rate ?? rate, days: proposal?.days ?? 10, note: proposal?.note ?? '', accept_qa: false, accept_rate_terms: false });
    const aboveCap = Number(form.data.rate) > rate;

    return (
        <ProviderShell crumbs={[{ label: 'Opportunity Feed', href: '/marketplace/provider/opportunities' }, { label: brief.reference }]} title="Brief Detail, QA Standard & Rate Acceptance"
            badge={<Tag tone="info">{match}% match</Tag>} description={`${brief.title} · ${brief.data.country ?? ''} · ${brief.categoryLabel}`}>
            <Head title={`${brief.reference} – Brief Detail`} />
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    <Card number={1} title="Brief Detail">
                        <InfoRows rows={[['Brief ID', brief.reference], ['Client', brief.clientName], ['Industry', brief.data.industry], ['Country', brief.data.country], ['Budget band (client)', brief.budgetLabel], ['Desired delivery', brief.data.delivery_date], ['Data classification', brief.data.data_class], ['Access', brief.data.vdr === 'none' ? 'No VDR' : 'Controlled, read-only workspace']]} />
                        <p className="mt-3 text-sm text-ink-700">{brief.data.description}</p>
                    </Card>
                    <div className="grid gap-5 md:grid-cols-2">
                        <Card number={2} title="Methodology & Scope"><p className="mb-2 text-xs text-ink-500">{s.methodology}</p><CheckList items={s.scope_items ?? []} /><p className="mt-3 text-xs font-semibold">Deliverables</p><CheckList items={s.deliverables ?? []} mark="info" /></Card>
                        <Card number={3} title="QA Standard Snapshot">
                            <InfoRows dense rows={[['QA Standard', s.qa?.standard ?? 'QA-MP-07'], ['Human Review', s.qa?.human_review ?? 'Required'], ['Release Rule', s.qa?.release ?? 'No release before QA pass'], ['Correction policy', 'R1 minor: 5 days · R2 major: 7 days, no charge'], ['Payment trigger', 'QA pass + acceptance'], ['Payout instruction', 'Within 5 business days of PAYOUT_READY']]} />
                            <Notice tone="warn" className="mt-3">Professional-boundary STOP: do not perform regulated or reserved work. Escalate if the brief requires it.</Notice>
                        </Card>
                    </div>
                    <Card title="Key agreement terms that apply">
                        <div className="grid gap-4 md:grid-cols-3">{agreementTerms.map((t) => <div key={t.title}><p className="text-sm font-semibold text-ink-900">{t.title}</p><ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-ink-600">{t.items.map((i) => <li key={i}>{i}</li>)}</ul></div>)}</div>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="Rate Acceptance" tone="cream">
                        <p className="text-xs text-ink-500">Disclosed provider rate (Ledger C cap)</p>
                        <p className="text-3xl font-bold text-ink-900">{zarCode(rate)}</p>
                        {proposal && <p className="mt-2 flex items-center gap-2 text-sm">Your proposal: <strong>{zarCode(proposal.rate)}</strong> <StatusPill status={proposal.status} /></p>}
                        {brief.openToProviders ? (
                            <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); form.post(`/marketplace/provider/opportunities/${brief.reference}/accept`); }}>
                                <div className="grid grid-cols-2 gap-3">
                                    <Field label="Your rate (ZAR)" required error={form.errors.rate}>{(id) => <Input id={id} type="number" min={1000} value={form.data.rate} onChange={(e) => form.setData('rate', Number(e.target.value))} />}</Field>
                                    <Field label="Delivery (days)" required error={form.errors.days}>{(id) => <Input id={id} type="number" min={1} value={form.data.days} onChange={(e) => form.setData('days', Number(e.target.value))} />}</Field>
                                </div>
                                {aboveCap && <p className="text-xs text-attested-700">Above the cap: if selected, the client must re-confirm a new price version.</p>}
                                <Field label="Note to TBCA (optional)" error={form.errors.note}>{(id) => <Textarea id={id} maxLength={1000} value={form.data.note} onChange={(e) => form.setData('note', e.target.value)} />}</Field>
                                <Checkbox label="I accept the QA standard, evidence requirements and R1/R2 correction policy." checked={form.data.accept_qa} onChange={(e) => form.setData('accept_qa', e.target.checked)} />
                                <Checkbox label="I accept the rate, payment trigger and no-circumvention terms." checked={form.data.accept_rate_terms} onChange={(e) => form.setData('accept_rate_terms', e.target.checked)} />
                                {(form.errors.accept_qa || form.errors.accept_rate_terms) && <p role="alert" className="text-xs text-risk-500">Both confirmations are required.</p>}
                                <Button type="submit" className="w-full" disabled={form.processing || !provider.routable}><ShieldCheck className="size-4" aria-hidden="true" /> {proposal ? 'Update Proposal' : 'Accept & Submit Proposal'}</Button>
                                <Button type="button" variant="outline" className="w-full" onClick={() => router.post(`/marketplace/provider/opportunities/${brief.reference}/decline`)}>Decline Brief</Button>
                                <p className="text-[0.6875rem] text-ink-500">Declining work never lowers your quality tier.</p>
                            </form>
                        ) : <p className="mt-3 text-sm text-ink-500">This brief is no longer open for proposals.</p>}
                    </Card>
                    <Link href="/marketplace/provider/opportunities" className="block text-sm font-semibold text-gold-700">← Back to Opportunity Feed</Link>
                </aside>
            </div>
        </ProviderShell>
    );
}

Opportunity.layout = null;
