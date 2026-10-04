import { useState } from 'react';
import { useForm } from '@inertiajs/react';
import { AlertCircle, CheckCircle2, Info, Plus, Trash2, XCircle } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { Card, Ring } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdOptions } from '@/types/due-diligence';

type Director = { name: string; role: string; ownership: number | string };

interface Props extends DdCasePageProps {
    subject: Record<string, string | number | boolean | null | Director[]>;
    missing: string[];
    options: DdOptions;
    quality: { rows: { label: string; ok: boolean; warn?: boolean; value: string }[]; percent: number };
    documents: { id: number; original_name: string; createdAt: string }[];
    consent: Record<string, unknown> | null;
}

const TABS = ['Entity', 'Directors / UBOs', 'Identifiers', 'Addresses', 'Jurisdiction', 'Authority & Purpose', 'Aliases', 'Documents'];

/** DD-033 Subject Details. */
export default function Subject(props: Props) {
    const { case: c, subject: s, missing, options, quality, documents, consent } = props;
    const [tab, setTab] = useState('Entity');
    const individual = c.subjectType === 'individual';
    const str = (k: string) => (s[k] === null || s[k] === undefined ? '' : String(s[k]));
    const form = useForm({
        registered_name: str('registered_name'), trading_name: str('trading_name'), registration_number: str('registration_number'), id_number: str('id_number'),
        nationality: str('nationality'), entity_type: str('entity_type'), incorporation_date: str('incorporation_date'), country: str('country') || 'South Africa',
        industry: str('industry'), nature_of_business: str('nature_of_business'), head_office: str('head_office'), aliases: str('aliases'),
        authority_confirmed: Boolean(s.authority_confirmed), directors: ((s.directors as Director[] | undefined) ?? []).map((d) => ({ ...d, ownership: d.ownership ?? '' })),
    });
    const err = form.errors as Record<string, string>;
    const closed = c.status === 'closed';
    const text = (k: 'registered_name' | 'trading_name' | 'registration_number' | 'id_number' | 'nationality' | 'country' | 'nature_of_business' | 'head_office' | 'aliases', label: string, required = false) => (
        <Field label={label} required={required} error={err[k]}>{(id) => <Input id={id} value={form.data[k]} disabled={closed} onChange={(e) => form.setData(k, e.target.value)} />}</Field>
    );
    const save = () => form.post(`/due-diligence/cases/${c.reference}/subject`, { preserveScroll: true });

    return (
        <CaseLayout
            page={props}
            active="subject"
            title="Subject Details"
            subtitle="Confirm subject identity/entity details."
            description="Accurate subject information enables compliant screening, ownership mapping and regulatory alignment."
            roleNote="Complete all required fields to proceed."
            actions={<Button type="button" disabled={form.processing || closed} onClick={save} trailingIcon="arrow-right">Complete Required Action</Button>}
            aside={
                <Card title="Evidence quality" action={<span className="rounded bg-gold-50 px-1.5 text-[0.6875rem] font-semibold text-gold-800">{quality.percent}% Complete</span>}>
                    <ul className="space-y-1.5">
                        {quality.rows.map((r) => (
                            <li key={r.label} className="flex items-center gap-2 text-xs">
                                {r.ok ? <CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" /> : r.warn ? <AlertCircle className="size-4 text-attested-500" aria-hidden="true" /> : <XCircle className="size-4 text-risk-500" aria-hidden="true" />}
                                <span className="flex-1">{r.label}</span>
                                <span className={r.ok ? 'text-verified-700' : r.warn ? 'text-attested-700' : 'text-risk-600'}>{r.value}</span>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-2 text-[0.6875rem] text-ink-500">Missing or incomplete items must be resolved before screening can begin.</p>
                </Card>
            }
        >
            <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-parchment-400">
                {TABS.map((t) => (
                    <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)} className={cn('-mb-px shrink-0 border-b-2 px-3 py-2 text-[0.8125rem]', tab === t ? 'border-gold-500 font-semibold text-gold-700' : 'border-transparent text-ink-500')}>{t}</button>
                ))}
            </div>
            {missing.length > 0 && <p className="rounded-[8px] border border-attested-500/30 bg-attested-50 p-3 text-xs text-ink-700">Still required: {missing.join(', ')}.</p>}

            <div className="grid gap-5 xl:grid-cols-5">
                <Card title={individual ? 'Identity Information' : 'Entity Information'} className="xl:col-span-3">
                    {tab === 'Entity' && (
                        <div className="grid gap-4 sm:grid-cols-2">
                            {text('registered_name', individual ? 'Full Legal Name' : 'Registered Name', true)}
                            {individual ? text('id_number', 'ID / Passport Number', true) : text('registration_number', 'Registration Number', true)}
                            {!individual && text('trading_name', 'Trading Name (if any)')}
                            <Field label="Entity Type" required={!individual} error={err.entity_type}>{(id) => <Select id={id} value={form.data.entity_type} disabled={closed} options={options.entityTypes} placeholder="Select" onChange={(e) => form.setData('entity_type', e.target.value)} />}</Field>
                            <Field label={individual ? 'Date of Birth' : 'Incorporation Date'} error={err.incorporation_date}>{(id) => <Input id={id} type="date" value={form.data.incorporation_date} disabled={closed} onChange={(e) => form.setData('incorporation_date', e.target.value)} />}</Field>
                            {text('country', individual ? 'Country of Residence' : 'Registered Country', true)}
                            {individual && text('nationality', 'Nationality', true)}
                            <Field label="Industry Sector" required={!individual} error={err.industry}>{(id) => <Select id={id} value={form.data.industry} disabled={closed} options={options.industries} placeholder="Select" onChange={(e) => form.setData('industry', e.target.value)} />}</Field>
                            <Field label={individual ? 'Occupation / Role' : 'Nature of Business'} required={!individual} error={err.nature_of_business} className="sm:col-span-2">{(id) => <Textarea id={id} value={form.data.nature_of_business} disabled={closed} onChange={(e) => form.setData('nature_of_business', e.target.value)} />}</Field>
                        </div>
                    )}
                    {tab === 'Directors / UBOs' && (
                        <div className="space-y-3">
                            {form.data.directors.map((d, i) => (
                                <div key={i} className="grid items-end gap-2 sm:grid-cols-[1fr_1fr_6rem_auto]">
                                    <Field label="Name" error={err[`directors.${i}.name`]}>{(id) => <Input id={id} value={d.name} onChange={(e) => form.setData('directors', form.data.directors.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} />}</Field>
                                    <Field label="Role" error={err[`directors.${i}.role`]}>{(id) => <Input id={id} value={d.role} onChange={(e) => form.setData('directors', form.data.directors.map((x, j) => (j === i ? { ...x, role: e.target.value } : x)))} />}</Field>
                                    <Field label="Own %">{(id) => <Input id={id} type="number" min={0} max={100} value={d.ownership} onChange={(e) => form.setData('directors', form.data.directors.map((x, j) => (j === i ? { ...x, ownership: e.target.value } : x)))} />}</Field>
                                    <button type="button" aria-label={`Remove ${d.name || 'person'}`} className="mb-2 text-risk-500" onClick={() => form.setData('directors', form.data.directors.filter((_, j) => j !== i))}><Trash2 className="size-4" /></button>
                                </div>
                            ))}
                            <Button type="button" variant="outline" size="sm" disabled={closed} onClick={() => form.setData('directors', [...form.data.directors, { name: '', role: 'Director', ownership: '' }])}><Plus className="size-4" aria-hidden="true" /> Add director / UBO</Button>
                        </div>
                    )}
                    {tab === 'Identifiers' && <div className="grid gap-4 sm:grid-cols-2">{text('registration_number', 'Registration Number')}{text('id_number', 'ID / Passport Number (signatory)')}</div>}
                    {tab === 'Addresses' && <div className="grid gap-4">{text('head_office', 'Head Office / Residential Address')}<p className="text-xs text-ink-500">Upload proof of address on the Evidence screen.</p></div>}
                    {tab === 'Jurisdiction' && <div className="grid gap-4 sm:grid-cols-2">{text('country', 'Registered Country', true)}<p className="text-xs text-ink-500 sm:col-span-2">Case jurisdiction: {c.chips[1]?.value} — cross-border processing requires a separate acknowledgement in the Consent Centre.</p></div>}
                    {tab === 'Authority & Purpose' && (
                        <div className="space-y-3 text-[0.8125rem]">
                            <p>Purpose recorded at the consent gate: <strong>{String(consent?.purpose ?? '—')}</strong> · Authority basis: <strong>{String(consent?.authority_basis ?? '—')}</strong></p>
                            <Checkbox label="I confirm the authority and purpose recorded for this case remain accurate." checked={form.data.authority_confirmed} onChange={(e) => form.setData('authority_confirmed', e.target.checked)} />
                        </div>
                    )}
                    {tab === 'Aliases' && text('aliases', 'Known aliases / former names (comma separated)')}
                    {tab === 'Documents' && (
                        <ul className="space-y-1 text-[0.8125rem]">{documents.length ? documents.map((d) => <li key={d.id}><a className="text-gold-700 hover:underline" href={`/due-diligence/cases/${c.reference}/documents/${d.id}`}>{d.original_name}</a></li>) : <li className="text-ink-500">No documents yet.</li>}</ul>
                    )}
                    <div className="mt-4 flex justify-end"><Button type="button" disabled={form.processing || closed} onClick={save}>Save subject details</Button></div>
                </Card>
                <Card title="Company Summary (read-only)" className="xl:col-span-2">
                    <dl className="space-y-1.5 text-xs">
                        {[['Group Affiliation', s.group], ['Ownership Structure', s.ownership], ['Employees (approx.)', s.employees], ['Annual Turnover (ZAR)', s.turnover], ['Website', s.website], ['Email (General)', s.email], ['Phone', s.phone]].map(([k, v]) => <div key={k as string} className="grid grid-cols-2 gap-2"><dt className="text-ink-500">{k as string}</dt><dd className="font-medium">{v ? String(v) : '—'}</dd></div>)}
                    </dl>
                    <div className="mt-4 flex gap-2 rounded-[8px] bg-gold-50 p-3 text-xs text-ink-600"><Info className="size-4 shrink-0 text-gold-700" aria-hidden="true" />Why we collect this: to verify identity, map ownership, apply the correct jurisdiction rules and ensure a lawful, proportionate due diligence process.</div>
                    <div className="mt-3 flex items-center gap-3"><Ring value={quality.percent} size={64} /><p className="text-xs text-ink-500">No fee applies — there is no charge to capture or update subject details.</p></div>
                </Card>
            </div>
        </CaseLayout>
    );
}
