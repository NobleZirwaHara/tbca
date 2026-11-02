/* P27 Country Quote Request: topic → Sprint → tier, live summary (prototype #/c/{ISO}/quote?sprint=&tier=&opp=&premium=). */
import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { B, Card, Check, Cols, Dl, Field, Flag, Note, Ticks, inputCls, useMoney } from '@/Components/Industries/Kit';
import { cHref, CountryHead, CountryPage } from '@/Components/CountryHub/Layout';
import { CSteps, loadSample, type JourneyState } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

interface Opt { code: string; name: string; ep: number | null; tiers: Record<string, number> }
interface Props {
    base: CountryBase;
    j: JourneyState | null;
    cat: string;
    topics: Record<string, string>;
    sectors: Record<string, string>;
    options: Opt[];
    pre: string | null;
    tier: string;
    opp: { id: string; name: string; sector: string } | null;
    premium: { code: string; name: string } | null;
    units: string[];
    vat: number;
    types: string[];
    budgets: string[];
}

export default function Quote({ base, j, cat, topics, sectors, options, pre, tier, opp, premium, units, vat, types, budgets }: Props) {
    const { c, countries } = base;
    const money = useMoney();
    const form = useForm({
        fname: '', email: '', org: '', coo: c.name, phone: '', contact: 'Email',
        cat, sprint: pre ?? '', tier, type: 'Engagement',
        title: opp ? opp.name : premium ? premium.name : '', sector: opp ? opp.sector : '', region: '', start: '2026-11-02', budget: '',
        scope: opp ? `Validate ${opp.name} (${opp.id})` : '',
        accurate: false, privacy: false, noEngagement: false,
    });
    const { data, setData, errors, processing } = form;
    const s = options.find((x) => x.code === data.sprint);
    const price = s ? (s.tiers[data.tier] ?? s.ep) : null;

    const changeCat = (v: string) => {
        form.setData({ ...data, cat: v, sprint: '' });
        const params = Object.fromEntries(new URLSearchParams(window.location.search));
        router.get(cHref(c, 'quote'), { ...params, cat: v }, { only: ['options', 'cat', 'pre'], preserveState: true, preserveScroll: true, replace: true });
    };
    const submit = (e: FormEvent) => { e.preventDefault(); form.post(cHref(c, 'quote'), { preserveScroll: true }); };
    const err = Object.values(errors);

    const right = (
        <>
            <Card title="Request Summary" icon="file">
                <Dl rows={[
                    ['Country', <span key="c"><Flag iso2={c.iso2} /> {c.name}</span>], ['Service category', topics[data.cat]],
                    ['Sprint', s ? s.name : <span key="n" className="text-ink-400">Not selected</span>], ['Tier', data.tier],
                    ['Indicative price (ex VAT)', s ? <b key="p">{money(price)}</b> : <span key="p" className="text-ink-400">Quote-only</span>], ['VAT', `${vat} %`],
                    ['Request type', data.type], ['Preferred start', data.start || 'Not specified'], ['Budget range', data.budget || 'Not specified'],
                ]} />
                <Note className="mt-2.5">Your information is secure · POPIA &amp; ISO 27001 aligned</Note>
            </Card>
            <Card title="Next Steps">
                <ol className="list-decimal space-y-1 ps-5 text-[0.82rem]"><li>Submit your request</li><li>We review and clarify (if needed)</li><li>We prepare your proposal and Engagement Letter</li><li>You approve, pay and activate</li></ol>
            </Card>
            <Card title="Why Clients Request Quotes">
                <Ticks items={['Clear scope and deliverables', 'Transparent pricing & timelines', 'Specialist team mobilisation', 'Tailored to your country context']} />
            </Card>
        </>
    );

    return (
        <CountryPage base={base} pageKey="quote" right={right}>
            <CountryHead base={base} pageKey="quote" title="Country Quote Request" desc={`Request a tailored proposal or engagement for services in ${c.name}.`} />
            <CSteps c={c} active="quote" j={j} />
            {opp && <Note>Requesting a brief for opportunity <b>{opp.id} — {opp.name}</b>.</Note>}
            {premium && <Note>Requesting premium product <b>{premium.code} — {premium.name}</b>.</Note>}
            <form onSubmit={submit} className="space-y-4">
                {err.length > 0 && <div role="alert" className="rounded-[4px] border border-risk-500/40 bg-risk-50 px-3 py-2 text-[0.82rem] text-risk-700">{err.map((x) => <div key={x}>{x}</div>)}</div>}
                <Card title="1. Your Details" icon="user">
                    <Cols n={2}>
                        <Field label="Full name *"><input className={inputCls} name="fname" required placeholder="e.g. Neo Molefe" value={data.fname} onChange={(e) => setData('fname', e.target.value)} /></Field>
                        <Field label="Email address *"><input className={inputCls} name="email" type="email" required placeholder="e.g. neo@example.com" value={data.email} onChange={(e) => setData('email', e.target.value)} /></Field>
                        <Field label="Organisation / company"><input className={inputCls} name="org" placeholder="e.g. Kalahari AgriVentures (Pty) Ltd" value={data.org} onChange={(e) => setData('org', e.target.value)} /></Field>
                        <Field label="Country of operation *">
                            <select className={inputCls} name="coo" required value={data.coo} onChange={(e) => setData('coo', e.target.value)}>{countries.map((x) => <option key={x.iso3}>{x.name}</option>)}</select>
                        </Field>
                        <Field label="Phone number"><input className={inputCls} name="phone" placeholder="+267 …" value={data.phone} onChange={(e) => setData('phone', e.target.value)} /></Field>
                        <Field label="Preferred contact method">
                            <select className={inputCls} name="contact" value={data.contact} onChange={(e) => setData('contact', e.target.value)}><option>Email</option><option>WhatsApp</option><option>Phone</option></select>
                        </Field>
                    </Cols>
                </Card>
                <Card title="2. Your Request" icon="tag">
                    <Cols n={2}>
                        <Field label="Primary service category *">
                            <select className={inputCls} name="cat" required value={data.cat} onChange={(e) => changeCat(e.target.value)}>{Object.entries(topics).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                        </Field>
                        <Field label="Specific Sprint">
                            <select className={inputCls} name="sprint" value={data.sprint} onChange={(e) => setData('sprint', e.target.value)}>
                                <option value="">Select a Sprint (optional)</option>
                                {options.map((o) => <option key={o.code} value={o.code}>{o.name} — from {money(o.ep)}</option>)}
                            </select>
                        </Field>
                        <Field label="Tier">
                            <select className={inputCls} name="tier" value={data.tier} onChange={(e) => setData('tier', e.target.value)}>{['Basic', 'Standard', 'Premium'].map((t) => <option key={t}>{t}</option>)}</select>
                        </Field>
                        <Field label="Request type">
                            <select className={inputCls} name="type" value={data.type} onChange={(e) => setData('type', e.target.value)}>{types.map((t) => <option key={t}>{t}</option>)}</select>
                        </Field>
                    </Cols>
                </Card>
                <Card title="3. Scope & Context" icon="file">
                    <Cols n={2}>
                        <Field label="Project / engagement title"><input className={inputCls} name="title" placeholder="e.g. Market entry — horticulture" value={data.title} onChange={(e) => setData('title', e.target.value)} /></Field>
                        <Field label="Business sector">
                            <select className={inputCls} name="sector" value={data.sector} onChange={(e) => setData('sector', e.target.value)}><option value="">Select sector</option>{Object.entries(sectors).map(([k, n]) => <option key={k} value={k}>{n}</option>)}</select>
                        </Field>
                        <Field label="Region of operation">
                            <select className={inputCls} name="region" value={data.region} onChange={(e) => setData('region', e.target.value)}><option value="">Select region</option>{units.map((u) => <option key={u}>{u}</option>)}</select>
                        </Field>
                        <Field label="Desired start date"><input className={inputCls} name="start" type="date" value={data.start} onChange={(e) => setData('start', e.target.value)} /></Field>
                        <Field label="Budget range">
                            <select className={inputCls} name="budget" value={data.budget} onChange={(e) => setData('budget', e.target.value)}><option value="">Select range</option>{budgets.map((b) => <option key={b}>{b}</option>)}</select>
                        </Field>
                    </Cols>
                    <Field label="Scope of work" className="mt-2.5">
                        <textarea name="scope" rows={3} maxLength={1500} placeholder="Objectives, deliverables and any specific requirements…" value={data.scope} onChange={(e) => setData('scope', e.target.value)}
                            className="w-full min-w-0 rounded-[4px] border border-parchment-500 bg-white px-2 py-1.5 text-[0.85rem] font-normal text-ink-800" />
                    </Field>
                </Card>
                <Card title="4. Permissions & Declarations" icon="shield">
                    <div className="space-y-2">
                        <Check checked={data.accurate} onChange={(v) => setData('accurate', v)}>I confirm the information provided is accurate and that I am authorised to make this request.</Check>
                        <Check checked={data.privacy} onChange={(v) => setData('privacy', v)}>I agree to the TBCA Privacy Policy and POPIA-aligned processing of my information.</Check>
                        <Check checked={data.noEngagement} onChange={(v) => setData('noEngagement', v)}>I understand this request does not create an engagement until a written Engagement Letter is signed.</Check>
                    </div>
                </Card>
                <div className="flex flex-wrap items-center gap-2">
                    <B v="pri" type="submit" disabled={processing}>Submit Quote Request →</B>
                    <B onClick={() => loadSample(c, 'letter')}>Use sample request</B>
                    <span className="text-[0.82rem] text-ink-400">We respond within 2–3 business days (complex: 5–7).</span>
                </div>
            </form>
        </CountryPage>
    );
}
