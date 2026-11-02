import { router, useForm } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { ADV, Fld, Flow, FormPanel, SvcRail, inputCls, type Country, type Rail } from '@/Components/Aiim/ProtoEngagement';
import type { AiimPageProps } from '@/types/aiim';

interface Props extends AiimPageProps {
    type: 'custom-intelligence' | 'advisory';
    engagement: { reference: string; request: Record<string, any> } | null;
    country: Country;
    options: {
        countries: { value: string; label: string }[];
        sectors: { code: string; name: string }[];
        units: { code: string; name: string }[];
        tickets: string[];
        desks: string[];
        channels: string[];
    };
    user: { name: string; email: string } | null;
    rail: Rail;
}

/** Page 39 Custom Intelligence Request and page 41 Advisor Request. */
export default function RequestWizard(props: Props) {
    return props.type === 'advisory' ? <AdvisorForm {...props} /> : <CustomForm {...props} />;
}

function CountryField({ country, options, path }: { country: Country; options: Props['options']; path: string }) {
    return (
        <Fld label="Country">
            <select className={inputCls} value={country.slug} onChange={(e) => router.get(path, { country: e.target.value }, { preserveScroll: true })}>
                {options.countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
        </Fld>
    );
}

function CustomForm({ engagement, country, options, rail }: Props) {
    const r = engagement?.request ?? {};
    const form = useForm({
        type: 'custom-intelligence', ref: engagement?.reference ?? '', country: country.slug,
        question: (r.detail as string) ?? '', sector: (r.sector_code as string) ?? options.sectors[0]?.code ?? '', unit: (r.unit as string) ?? '', ticket: (r.ticket as string) ?? options.tickets[0], needed_by: (r.required_by as string) ?? '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post('/aiim/workspace/engagements/request'); };
    const err = form.errors as Record<string, string>;
    return (
        <Flow title="Custom Intelligence Request" eyebrow="Page 39" steps={{ list: ADV, on: 0 }} crumbs={[{ label: country.name, href: `/aiim/country/${country.slug}` }]} side={<SvcRail rail={rail} context="Custom intelligence request" />}>
            <FormPanel title="Tell us what you need" submit="Submit request" onSubmit={submit} processing={form.processing}>
                <Fld label="Your question" error={err.question}>
                    <textarea rows={4} className={inputCls} value={form.data.question} onChange={(e) => form.setData('question', e.target.value)}
                        placeholder="e.g. Which Kalahari Copper Belt supplier niches can a foreign SME enter without breaching citizen-reserved rules?" />
                </Fld>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Fld label="Sector" error={err.sector}>
                        <select className={inputCls} value={form.data.sector} onChange={(e) => form.setData('sector', e.target.value)}>
                            {options.sectors.map((s) => <option key={s.code} value={s.code}>{s.name}</option>)}
                        </select>
                    </Fld>
                    <Fld label="Unit" error={err.unit}>
                        <select className={inputCls} value={form.data.unit} onChange={(e) => form.setData('unit', e.target.value)}>
                            <option value="">All</option>
                            {options.units.map((u) => <option key={u.code} value={u.name}>{u.name}</option>)}
                        </select>
                    </Fld>
                    <Fld label="Ticket size" error={err.ticket}>
                        <select className={inputCls} value={form.data.ticket} onChange={(e) => form.setData('ticket', e.target.value)}>
                            {options.tickets.map((t) => <option key={t}>{t}</option>)}
                        </select>
                    </Fld>
                    <Fld label="Needed by" error={err.needed_by}>
                        <input type="date" className={inputCls} value={form.data.needed_by} onChange={(e) => form.setData('needed_by', e.target.value)} />
                    </Fld>
                    <CountryField country={country} options={options} path="/aiim/custom-intelligence" />
                </div>
                {err.country && <p role="alert" className="text-xs text-risk-700">{err.country}</p>}
            </FormPanel>
        </Flow>
    );
}

function AdvisorForm({ engagement, country, options, user, rail }: Props) {
    const r = engagement?.request ?? {};
    const form = useForm({
        type: 'advisory', ref: engagement?.reference ?? '', country: country.slug,
        name: (r.contact?.name as string) ?? user?.name ?? '', email: (r.contact?.email as string) ?? user?.email ?? '',
        desk: (r.desk as string) ?? options.desks[0], channel: (r.channel as string) ?? options.channels[0], topic: (r.summary as string) ?? '',
    });
    const submit = (e: FormEvent) => { e.preventDefault(); form.post('/aiim/workspace/engagements/request'); };
    const err = form.errors as Record<string, string>;
    return (
        <Flow title="Advisor Request" eyebrow="Page 41 · Speak to a TBCA Advisor" steps={{ list: ADV, on: 0 }} crumbs={[{ label: country.name, href: `/aiim/country/${country.slug}` }]} side={<SvcRail rail={rail} context="Advisor request" />}>
            <FormPanel title="Request an advisor" submit="Request advisor" onSubmit={submit} processing={form.processing}>
                <div className="grid gap-3 sm:grid-cols-2">
                    <Fld label="Name" error={err.name}><input className={inputCls} value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} autoComplete="name" /></Fld>
                    <Fld label="Email" error={err.email}><input type="email" className={inputCls} value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} autoComplete="email" /></Fld>
                    <Fld label="Advisor desk" error={err.desk}>
                        <select className={inputCls} value={form.data.desk} onChange={(e) => form.setData('desk', e.target.value)}>{options.desks.map((d) => <option key={d}>{d}</option>)}</select>
                    </Fld>
                    <Fld label="Preferred channel" error={err.channel}>
                        <select className={inputCls} value={form.data.channel} onChange={(e) => form.setData('channel', e.target.value)}>{options.channels.map((d) => <option key={d}>{d}</option>)}</select>
                    </Fld>
                    <CountryField country={country} options={options} path="/aiim/workspace/advisor-request" />
                </div>
                <Fld label="Topic" error={err.topic}>
                    <textarea rows={4} className={inputCls} value={form.data.topic} onChange={(e) => form.setData('topic', e.target.value)} placeholder="What would you like to discuss?" />
                </Fld>
            </FormPanel>
        </Flow>
    );
}
