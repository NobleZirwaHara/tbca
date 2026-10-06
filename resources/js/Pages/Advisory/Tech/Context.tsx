import { Head, Link, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select, Textarea } from '@/Components/ui/Form';
import TechJourney, { type JourneyState } from '@/Components/Advisory/TechJourney';
import { Card, CheckList, KV } from '@/Components/Advisory/ui';

interface Props {
    journey: JourneyState;
    context: Record<string, string | number>;
    options: Record<string, string[]> & { currencies: Record<string, string> };
}

export default function Context({ journey, context, options }: Props) {
    const form = useForm({ ...(context as Record<string, string>), draft: false as boolean });
    const e = form.errors as Record<string, string>;
    const d = form.data as Record<string, string | number | boolean>;
    const set = (k: string) => (ev: { target: { value: string } }) => form.setData(k as never, ev.target.value as never);
    const submit = (draft: boolean) => (ev?: FormEvent) => {
        ev?.preventDefault();
        form.transform((x) => ({ ...x, draft }));
        form.post('/technology-solutions/context', { preserveScroll: true });
    };
    const text = (k: string, label: string, req = true, ph = '') => <Field label={label} required={req} error={e[k]}>{(id) => <Input id={id} value={String(d[k] ?? '')} onChange={set(k)} placeholder={ph} />}</Field>;
    const sel = (k: string, label: string, opts: string[]) => <Field label={label} required error={e[k]}>{(id) => <Select id={id} value={String(d[k] ?? '')} onChange={set(k)} options={opts} />}</Field>;
    const complete = ['legal_name', 'registration', 'email', 'phone', 'challenge'].every((k) => String(d[k] ?? '').length > 0);
    return (
        <>
            <Head title="Country & Context Setup" />
            <form onSubmit={submit(false)}>
                <TechJourney step={1} journey={journey} title="Country & Context Setup" crumbs={[{ label: 'Technology Solutions Journey', href: '/technology-solutions' }, { label: 'Country & Context Setup' }]} sub="Tell us about your organisation so we can tailor the right technology solutions for you." badge={<span className="rounded bg-gold-100 px-2 py-1 text-xs font-semibold text-gold-800">Context Capture</span>}
                    footer={<><Link href="/technology-solutions" className="text-sm">← Back to Technology Solutions</Link><div className="flex gap-2"><Button type="button" variant="outline" onClick={() => submit(true)()}>Save as Draft</Button><Button type="submit" disabled={form.processing} trailingIcon="arrow-right">Save & Continue</Button></div></>}>
                    <div className="grid gap-4 xl:grid-cols-12">
                        <div className="space-y-4 xl:col-span-8">
                            <Card num={1} title="Country & Language">
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <Field label="Country" required hint="Delivered across Africa (Active): all 54 African countries." error={e.country}>{(id) => <Select id={id} value={String(d.country)} onChange={set('country')} options={options.countries} />}</Field>
                                    <Field label="Language" required hint="7 platform languages; English is the source language." error={e.language}>{(id) => <Select id={id} value={String(d.language)} onChange={set('language')} options={options.languages.map((l) => ({ value: l, label: l === 'English' ? 'English (Source)' : l }))} />}</Field>
                                    <Field label="Display Currency" hint="Prices are set in ZAR and shown in 5 currencies." error={e.currency}>{(id) => <Select id={id} value={String(d.currency)} onChange={set('currency')} options={Object.entries(options.currencies).map(([value, label]) => ({ value, label }))} />}</Field>
                                    <Field label="USD treatment" hint="USD shown only where supported by product.">{(id) => <Select id={id} value={String(d.usd)} onChange={set('usd')} options={['By Product', 'Hidden']} />}</Field>
                                </div>
                            </Card>
                            <Card num={2} title="Organisation Details">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {text('legal_name', 'Legal Entity Name', true, 'Acme Manufacturing (Pty) Ltd')}
                                    {text('trading_name', 'Trading Name (If different)', false)}
                                    {text('registration', 'Registration Number', true, '2019/123456/07')}
                                    {text('email', 'Business Email')}
                                    {text('phone', 'Phone Number', true, '+27 11 123 4567')}
                                    {text('website', 'Website (Optional)', false)}
                                </div>
                            </Card>
                            <Card num={3} title="Industry & Business Context">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {sel('industry', 'Primary Industry', options.industries)}
                                    {sel('model', 'Business Model', options.models)}
                                    {sel('objective', 'Key Business Objective', options.objectives)}
                                    <Field label="Describe your primary technology challenge or opportunity" required hint={`${String(d.challenge ?? '').length}/500`} error={e.challenge} className="sm:col-span-3">{(id) => <Textarea id={id} maxLength={500} value={String(d.challenge ?? '')} onChange={set('challenge')} />}</Field>
                                </div>
                            </Card>
                            <Card num={4} title="Existing Technology Landscape">
                                <div className="grid gap-3 sm:grid-cols-3">
                                    {sel('crm', 'CRM / Customer System', options.crms)}
                                    {sel('accounting', 'Accounting / Finance System', options.accounting)}
                                    {text('platforms', 'Other Key Platforms (Optional)', false, 'Zoho Books, Gmail, Microsoft 365')}
                                </div>
                            </Card>
                            <Card num={5} title="Organisation Scale">
                                <div className="grid gap-3 sm:grid-cols-5">
                                    {sel('size', 'Organisation Size', options.sizes)}
                                    <Field label="User Count (Approx.)" required error={e.users}>{(id) => <Input id={id} type="number" min={1} value={String(d.users)} onChange={set('users')} />}</Field>
                                    <Field label="Number of Sites" required error={e.sites}>{(id) => <Input id={id} type="number" min={1} value={String(d.sites)} onChange={set('sites')} />}</Field>
                                    {sel('revenue', 'Annual Revenue Band', options.revenues)}
                                    {sel('data', 'Data Volume', options.data)}
                                </div>
                            </Card>
                        </div>
                        <aside className="space-y-4 xl:col-span-4">
                            <Card title="Context Summary" action={<span className={complete ? 'rounded bg-verified-50 px-2 text-xs text-verified-700' : 'rounded bg-attested-50 px-2 text-xs text-attested-700'}>{complete ? 'Complete' : 'In progress'}</span>}>
                                <KV rows={[['Location', `${d.country} · ${d.language} | ${d.currency}`], ['Organisation', `${d.legal_name || '—'} ${d.registration ? `· ${d.registration}` : ''}`], ['Industry & Model', `${d.industry} | ${d.model}`], ['Objective', String(d.objective)], ['Scale', `${d.users} Users | ${d.sites} Sites · ${d.size}`], ['Existing Platforms', [d.crm, d.accounting, d.platforms].filter(Boolean).join(', ')], ['Data Volume', String(d.data)]]} />
                            </Card>
                            <Card title="Why We Ask This"><CheckList items={['To recommend the right solution towers', 'To estimate effort, costs and timelines', 'To identify integrations and dependencies', 'To ensure security and compliance alignment', 'Your data is secure and never shared']} /></Card>
                            <p className="flex gap-2 rounded bg-verified-50 p-3 text-xs text-verified-700"><Shield className="size-4 shrink-0" />All data captured here is used only to design solutions and produce your fee schedule.</p>
                            {journey.progress.context && <p className="flex items-center gap-1.5 text-xs text-verified-700"><CheckCircle2 className="size-4" />Context saved for this session.</p>}
                        </aside>
                    </div>
                </TechJourney>
            </form>
        </>
    );
}
