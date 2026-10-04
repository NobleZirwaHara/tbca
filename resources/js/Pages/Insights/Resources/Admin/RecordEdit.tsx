import { useState } from 'react';
import { Link, router, useForm } from '@inertiajs/react';
import { Archive, CheckCircle2, Eye, Save, Send, ShieldAlert, XCircle } from 'lucide-react';
import { Modal } from '@/Components/ui/Kit';
import { Checkbox, Field, Input, Select, Textarea } from '@/Components/ui/Form';
import { Box, Chip, CurrentnessChip, Status, Table, label } from '@/Components/Insights/Shared';
import { ResourceAdmin } from '@/Components/Insights/Resources';
import { cn } from '@/lib/cn';
import type { Currentness } from '@/types/insights';

interface Rec {
    id: number | null; recordId: string | null; title: string; slug: string; meta_description: string; summary: string; type: string; collection: string; category: string; format: string;
    minutes: number | null; access: string; price_zar: number | null; list_price_zar: number | null; source: string; source_basis: string; risk_class: string; human_review: string; ai_assisted: boolean;
    owner: string; editor: string; reviewer: string; content_level: string; boundary_note: string; linked_product: string; protected: boolean; next_review_at: string; content: string; industries: string[]; publishState: string; version: string;
}
interface Props {
    record: Rec;
    options: { types: string[]; collections: string[]; categories: { value: string; label: string }[]; access: string[]; riskClasses: Record<string, string>; levels: string[]; people: string[]; resources: { value: string; label: string }[] };
    meta: null | { status: string; currentness: Currentness; version: string; updated: string; created: string; editor: string | null; url: string; checks: { label: string; value: number }[]; transitions: string[]; assets: { id: number; name: string; type: string; version: string; access: string; status: string }[]; audit: { at: string; actor: string; action: string; from: string | null; to: string | null; note: string | null }[] };
}

const SECTIONS = ['Executive Summary', 'What You Need to Know', 'Key Insights', 'Examples / Case Notes', 'Action Steps', 'Resources & Next Steps'];
const TRANSITION_LABEL: Record<string, string> = { internal_review: 'Submit for Review', legal_review: 'Approve → Legal / Compliance', published: 'Publish', archived: 'Archive / Unpublish', retired: 'Retire', draft: 'Return to Draft' };

export default function RecordEdit({ record, options, meta }: Props) {
    const { id: _id, recordId: _r, publishState: _p, version: _v, ...data } = record;
    const form = useForm({ ...data, minutes: data.minutes ?? '', price_zar: data.price_zar ?? '', list_price_zar: data.list_price_zar ?? '' });
    const [retire, setRetire] = useState(false);
    const [preview, setPreview] = useState(false);
    const retireForm = useForm({ to: 'retired', reason: '', replacement_id: '' });
    const isNew = !record.id;
    const save = () => (isNew ? form.post('/admin/insights/resources/records') : form.put(`/admin/insights/resources/records/${record.slug}`, { preserveScroll: true }));
    const transition = (to: string) => (to === 'retired' ? setRetire(true) : router.post(`/admin/insights/resources/records/${record.slug}/transition`, { to }, { preserveScroll: true }));
    const insert = (s: string) => form.setData('content', `${form.data.content}${form.data.content ? '\n\n' : ''}## ${s}\n`);
    const err = form.errors as Record<string, string>;
    const words = form.data.content.trim() ? form.data.content.trim().split(/\s+/).length : 0;

    return (
        <ResourceAdmin
            title={isNew ? 'Article Template' : 'Content Record Manager'}
            badge={isNew ? 'Controlled Content' : record.recordId ?? undefined}
            description={isNew ? 'Create authoritative, accurate and trustworthy articles using the TBCA controlled content framework.' : `Editing ${record.title}`}
            actions={
                <>
                    <button type="button" onClick={() => setPreview(true)} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Eye className="size-4" /> Preview</button>
                    {meta?.transitions.includes('archived') && <button type="button" onClick={() => transition('archived')} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Archive className="size-4" /> Archive</button>}
                    <button type="button" onClick={save} disabled={form.processing} className="flex items-center gap-1.5 rounded border border-parchment-500 bg-white px-3 py-2 text-xs font-semibold"><Save className="size-4" /> {isNew ? 'Save Draft' : 'Save'}</button>
                    {meta?.transitions.filter((t) => t !== 'archived').map((t) => <button key={t} type="button" onClick={() => transition(t)} className={cn('flex items-center gap-1.5 rounded px-3 py-2 text-xs font-bold', t === 'retired' || t === 'draft' ? 'border border-risk-500/40 bg-white text-risk-700' : 'bg-gold-500')}><Send className="size-4" /> {TRANSITION_LABEL[t]}</button>)}
                </>
            }
        >
            <div className="mb-3 flex flex-wrap gap-2"><Chip tone="gold">Controlled Content</Chip><Chip>{form.data.content_level}</Chip><Status value={record.publishState} />{meta && <CurrentnessChip value={meta.currentness} />}</div>
            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="space-y-4">
                    <Box title="Controlled Content Record">
                        <div className="grid gap-3 md:grid-cols-2">
                            <Field label={`Article / Content Title (${form.data.title.length}/120)`} required error={err.title} className="md:col-span-2">{(id) => <Input id={id} maxLength={120} value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} placeholder="Enter a clear, compelling title..." />}</Field>
                            <Field label={`Slug (${form.data.slug.length}/80)`} required error={err.slug}>{(id) => <Input id={id} maxLength={80} value={form.data.slug} onChange={(e) => form.setData('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, '-'))} placeholder="enter-your-slug-here" />}</Field>
                            <Field label={`Meta Description (${form.data.meta_description.length}/160)`} required error={err.meta_description}>{(id) => <Input id={id} maxLength={160} value={form.data.meta_description} onChange={(e) => form.setData('meta_description', e.target.value)} placeholder="Brief summary for search engines and social sharing..." />}</Field>
                            <Field label="Summary" required error={err.summary} className="md:col-span-2">{(id) => <Textarea id={id} value={form.data.summary} onChange={(e) => form.setData('summary', e.target.value)} />}</Field>
                            <Field label="Resource / Template Type" required error={err.type}>{(id) => <Select id={id} value={form.data.type} onChange={(e) => form.setData('type', e.target.value)} options={options.types.map((t) => ({ value: t, label: label(t) }))} />}</Field>
                            <Field label="Collection" required>{(id) => <Select id={id} value={form.data.collection} onChange={(e) => form.setData('collection', e.target.value)} options={options.collections.map((t) => ({ value: t, label: label(t) }))} />}</Field>
                            <Field label="Primary Topic / Category" required error={err.category}>{(id) => <Select id={id} value={form.data.category} onChange={(e) => form.setData('category', e.target.value)} options={options.categories} />}</Field>
                            <div className="grid grid-cols-2 gap-2">
                                <Field label="Format" required error={err.format}>{(id) => <Input id={id} value={form.data.format} onChange={(e) => form.setData('format', e.target.value)} />}</Field>
                                <Field label="Minutes" error={err.minutes}>{(id) => <Input id={id} type="number" value={form.data.minutes} onChange={(e) => form.setData('minutes', e.target.value === '' ? '' : Number(e.target.value))} />}</Field>
                            </div>
                        </div>
                    </Box>
                    <Box title="Content Editor" action={<span className="text-[0.6875rem] text-ink-500">Word count: {words} · Characters: {form.data.content.length}</span>}>
                        <Field label="Body (use “## Heading” to start a section)" error={err.content}>{(id) => <Textarea id={id} className="min-h-64 font-mono text-xs" value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} placeholder="Start writing your article content here..." />}</Field>
                        <p className="mt-3 text-xs font-semibold">Content Sections (Recommended)</p>
                        <div className="mt-1 flex flex-wrap gap-2">{SECTIONS.map((s) => <button key={s} type="button" onClick={() => insert(s)} className="rounded border border-gold-300 bg-gold-50 px-2.5 py-1 text-xs">{s}</button>)}</div>
                    </Box>
                    <div className="grid gap-4 md:grid-cols-2">
                        <Box title="Monetisation & Boundary">
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-1" role="radiogroup" aria-label="Access model">{options.access.map((a) => <button key={a} type="button" role="radio" aria-checked={form.data.access === a} onClick={() => form.setData('access', a)} className={cn('rounded border px-3 py-1 text-xs capitalize', form.data.access === a ? 'border-gold-500 bg-gold-500 font-semibold' : 'border-parchment-500')}>{a}</button>)}</div>
                                {form.data.access === 'paid' && <div className="grid grid-cols-2 gap-2"><Field label="Price (ZAR)" required error={err.price_zar}>{(id) => <Input id={id} type="number" value={form.data.price_zar} onChange={(e) => form.setData('price_zar', e.target.value === '' ? '' : Number(e.target.value))} />}</Field><Field label="List price if reduced" error={err.list_price_zar}>{(id) => <Input id={id} type="number" value={form.data.list_price_zar} onChange={(e) => form.setData('list_price_zar', e.target.value === '' ? '' : Number(e.target.value))} />}</Field></div>}
                                <Field label="Free Explains / Paid Completes boundary note" error={err.boundary_note}>{(id) => <Textarea id={id} value={form.data.boundary_note} onChange={(e) => form.setData('boundary_note', e.target.value)} />}</Field>
                                <Field label="Linked paid product / sprint">{(id) => <Input id={id} value={form.data.linked_product} onChange={(e) => form.setData('linked_product', e.target.value)} />}</Field>
                                <Checkbox label="Protected catalogue (no self-serve)" checked={form.data.protected} onChange={(e) => form.setData('protected', e.target.checked)} />
                            </div>
                        </Box>
                        <Box title="Governance, AI & Source Transparency">
                            <div className="space-y-3">
                                <Field label="Content risk class" required error={err.risk_class}>{(id) => <Select id={id} value={form.data.risk_class} onChange={(e) => form.setData('risk_class', e.target.value)} options={Object.entries(options.riskClasses).map(([v, l]) => ({ value: v, label: `${v} – ${l}` }))} />}</Field>
                                <Field label="Next review date" hint="Capped at the risk-class maximum." error={err.next_review_at}>{(id) => <Input id={id} type="date" value={form.data.next_review_at} onChange={(e) => form.setData('next_review_at', e.target.value)} />}</Field>
                                <div className="grid grid-cols-2 gap-2"><Field label="Source" required error={err.source}>{(id) => <Input id={id} value={form.data.source} onChange={(e) => form.setData('source', e.target.value)} />}</Field><Field label="Source basis">{(id) => <Input id={id} value={form.data.source_basis} onChange={(e) => form.setData('source_basis', e.target.value)} />}</Field></div>
                                <Checkbox label="AI-assisted drafting (requires human approval before publication)" checked={form.data.ai_assisted} onChange={(e) => form.setData('ai_assisted', e.target.checked)} />
                            </div>
                        </Box>
                    </div>
                    {meta && meta.assets.length > 0 && (
                        <Box title="Resources Extensions"><Table head={['#', 'Asset', 'Type', 'Version', 'Access State', 'Status']} rows={meta.assets.map((a, i) => [i + 1, a.name, a.type, a.version, <Status key="a" value={a.access} />, <Status key="s" value={a.status} />])} /></Box>
                    )}
                </div>
                <div className="space-y-4">
                    <Box title="Publishing">
                        <div className="space-y-3">
                            <p className="text-xs">Status: <Status value={record.publishState} /> · v{record.version}</p>
                            <Field label="Author / Owner" required error={err.owner}>{(id) => <Select id={id} value={form.data.owner} onChange={(e) => form.setData('owner', e.target.value)} options={options.people} placeholder="Select author" />}</Field>
                            <Field label="Editor">{(id) => <Select id={id} value={form.data.editor} onChange={(e) => form.setData('editor', e.target.value)} options={options.people} placeholder="Select editor" />}</Field>
                            <Field label="Reviewer">{(id) => <Select id={id} value={form.data.reviewer} onChange={(e) => form.setData('reviewer', e.target.value)} options={options.people} placeholder="Select reviewer" />}</Field>
                            <Field label="Content Level (L1–L4)">{(id) => <Select id={id} value={form.data.content_level} onChange={(e) => form.setData('content_level', e.target.value)} options={options.levels} />}</Field>
                        </div>
                    </Box>
                    {meta && (
                        <>
                            <Box title="Review Summary">
                                <ul className="space-y-2 text-xs">{meta.checks.map((c) => <li key={c.label}><div className="flex justify-between"><span>{c.label}</span><strong>{c.value}%</strong></div><div className="mt-0.5 h-1.5 rounded-full bg-parchment-300"><div className={cn('h-full rounded-full', c.value >= 90 ? 'bg-verified-500' : 'bg-attested-500')} style={{ width: `${c.value}%` }} /></div></li>)}</ul>
                                <div className="mt-3 flex gap-2">
                                    <button type="button" onClick={() => router.post(`/admin/insights/resources/records/${record.slug}/reviewed`, {}, { preserveScroll: true })} className="flex items-center gap-1 rounded border border-verified-500/40 px-2 py-1 text-[0.6875rem] text-verified-700"><CheckCircle2 className="size-3.5" /> Mark reviewed</button>
                                    <button type="button" onClick={() => router.post(`/admin/insights/resources/records/${record.slug}/reviewed`, { restrict: true }, { preserveScroll: true })} className="flex items-center gap-1 rounded border border-risk-500/40 px-2 py-1 text-[0.6875rem] text-risk-700"><ShieldAlert className="size-3.5" /> Restrict</button>
                                </div>
                            </Box>
                            <Box title="Audit Metadata">
                                <dl className="space-y-1 text-[0.6875rem]">{[['Created', meta.created], ['Updated', meta.updated], ['Version', meta.version], ['Record ID', record.recordId], ['Slug', record.slug]].map(([k, v]) => <div key={k as string} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd>{v}</dd></div>)}</dl>
                                <ul className="mt-2 space-y-1 border-t border-parchment-300 pt-2 text-[0.6875rem]">{meta.audit.map((a, i) => <li key={i}>{a.at} · {a.actor} · {a.action}{a.from ? ` (${a.from} → ${a.to})` : ''}</li>)}</ul>
                                <Link href={meta.url} className="mt-2 inline-block text-xs font-semibold text-gold-700">View public page →</Link>
                            </Box>
                        </>
                    )}
                </div>
            </div>

            <Modal open={retire} onClose={() => setRetire(false)} title="Retire content" footer={<button type="button" onClick={() => retireForm.post(`/admin/insights/resources/records/${record.slug}/transition`, { preserveScroll: true, onSuccess: () => setRetire(false) })} className="rounded bg-risk-500 px-4 py-2 text-sm font-semibold text-white"><XCircle className="mr-1 inline size-4" />Retire</button>}>
                <div className="space-y-3">
                    <Field label="Reason" required error={retireForm.errors.reason}>{(id) => <Input id={id} value={retireForm.data.reason} onChange={(e) => retireForm.setData('reason', e.target.value)} />}</Field>
                    <Field label="Recommended replacement">{(id) => <Select id={id} value={retireForm.data.replacement_id} onChange={(e) => retireForm.setData('replacement_id', e.target.value)} options={options.resources} placeholder="None" />}</Field>
                </div>
            </Modal>
            <Modal open={preview} onClose={() => setPreview(false)} title="Preview" size="lg">
                <h2 className="font-serif text-2xl font-semibold">{form.data.title || 'Untitled'}</h2>
                <p className="mt-1 text-sm text-ink-600">{form.data.summary}</p>
                {form.data.content.split(/^##\s+/m).filter(Boolean).map((chunk, i) => { const [h, ...rest] = chunk.split('\n'); return <section key={i} className="mt-3"><h3 className="font-semibold">{h}</h3><p className="text-sm whitespace-pre-line text-ink-700">{rest.join('\n')}</p></section>; })}
            </Modal>
        </ResourceAdmin>
    );
}
