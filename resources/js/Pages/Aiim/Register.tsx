import { useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { Flow, SvcRail, type Svc } from '@/Components/Aiim/ProtoAccount';
import { B, Bullets, Card, Check, Field, inputCls } from '@/Components/Industries/Kit';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    options: { personas: { code: string; label: string }[]; currencies: string[]; languages: string[]; sectors: { code: string; name: string }[] };
    services: Svc[];
}

/** Mock-up 19: Registration. */
export default function Register({ options, services }: Props) {
    const form = useForm({
        name: '', email: '', organisation: '', persona: options.personas[0]?.code ?? 'SME', currency: options.currencies[0] ?? 'BWP', language: options.languages[0] ?? 'English',
        sectors: [] as string[], password: '', password_confirmation: '', terms: false, marketing: true,
    });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post('/aiim/register/1', { onFinish: () => form.reset('password', 'password_confirmation') }); };
    const toggle = (code: string, on: boolean) => form.setData('sectors', on ? [...form.data.sectors, code] : form.data.sectors.filter((c) => c !== code));
    const err = (k: string) => (form.errors as Record<string, string | undefined>)[k];
    const E = ({ k }: { k: string }) => (err(k) ? <span role="alert" className="text-[0.72rem] font-normal text-risk-600">{err(k)}</span> : null);

    return (
        <Flow
            title="Registration"
            eyebrow="Create your free AIIM account"
            lead="Save opportunities, watch places and sectors, compare templates and receive Botswana alerts."
            crumbs={[{ label: 'Botswana', href: '/aiim/country/botswana' }]}
            side={
                <>
                    <Card title="What you get free">
                        <Bullets items={['Cockpit, map and all 9 AIIM sub-sections', 'Teaser cards for 321 templates', 'Saved items, watchlist and comparisons', 'Source names and dates on every object']} />
                    </Card>
                    <SvcRail services={services} title="Account services" />
                </>
            }
        >
            <form onSubmit={submit} noValidate className="grid gap-3 rounded-[6px] border border-parchment-400 bg-white p-4">
                <h3 className="text-[0.95rem] font-semibold text-ink-900">Your details</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Full name"><input className={inputCls} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="Your name" autoComplete="name" /><E k="name" /></Field>
                    <Field label="Work email"><input type="email" className={inputCls} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} placeholder="name@company.com" autoComplete="email" /><E k="email" /></Field>
                    <Field label="Organisation"><input className={inputCls} value={form.data.organisation} onChange={(e) => form.setData('organisation', e.target.value)} placeholder="Company or fund" autoComplete="organization" /><E k="organisation" /></Field>
                    <Field label="Investor type">
                        <select className={inputCls} value={form.data.persona} onChange={(e) => form.setData('persona', e.target.value)}>{options.personas.map((p) => <option key={p.code} value={p.code}>{p.label}</option>)}</select>
                        <E k="persona" />
                    </Field>
                    <Field label="Preferred currency">
                        <select className={inputCls} value={form.data.currency} onChange={(e) => form.setData('currency', e.target.value)}>{options.currencies.map((c) => <option key={c}>{c}</option>)}</select>
                    </Field>
                    <Field label="Language">
                        <select className={inputCls} value={form.data.language} onChange={(e) => form.setData('language', e.target.value)}>{options.languages.map((c) => <option key={c}>{c}</option>)}</select>
                    </Field>
                    <Field label="Password"><input type="password" className={inputCls} value={form.data.password} onChange={(e) => form.setData('password', e.target.value)} autoComplete="new-password" /><E k="password" /></Field>
                    <Field label="Confirm password"><input type="password" className={inputCls} value={form.data.password_confirmation} onChange={(e) => form.setData('password_confirmation', e.target.value)} autoComplete="new-password" /></Field>
                </div>
                <fieldset className="grid gap-2">
                    <legend className="mb-1 text-[0.78rem] font-semibold text-ink-600">Sectors of interest</legend>
                    <div className="grid gap-x-3 gap-y-1.5 sm:grid-cols-2 lg:grid-cols-3">
                        {options.sectors.map((s) => <Check key={s.code} checked={form.data.sectors.includes(s.code)} onChange={(v) => toggle(s.code, v)}>{s.name}</Check>)}
                    </div>
                </fieldset>
                <Check checked={form.data.terms} onChange={(v) => form.setData('terms', v)}>I agree to the Terms and the Privacy Notice (POPIA and Botswana Data Protection Act aligned).</Check>
                <E k="terms" />
                <Check checked={form.data.marketing} onChange={(v) => form.setData('marketing', v)}>Send me the weekly Botswana briefing (AAB-EMB-179).</Check>
                <div className="flex flex-wrap gap-2">
                    <B v="pri" type="submit" disabled={form.processing}>Create account</B>
                    <B onClick={() => window.history.back()}>Back</B>
                </div>
            </form>
        </Flow>
    );
}
