import { Head, router, useForm } from '@inertiajs/react';
import { useState, type FormEvent } from 'react';
import { Search, Upload } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { Field, Input, Select } from '@/Components/ui/Form';
import { SimpleTable, StatusPill, Tabs } from '@/Components/ui/Kit';
import { Pager, TechPortal } from '@/Components/Advisory/shells';
import { Card, CheckList, KV } from '@/Components/Advisory/ui';
import type { Paginated, TechHeader } from '@/types/advisory';

interface Doc { id: number; name: string; type: string; category: string; linked_to: string; uploaded_by: string; uploaded: string; status: string; visibility: string; version: string }
interface Props {
    engagement: TechHeader;
    documents: Paginated<Doc>;
    filters: Record<string, string>;
    options: { types: string[]; categories: string[]; statuses: string[]; linked: string[] };
    summary: { total: number; verified: number; pending: number; expired: number; shared: number };
    requests: { id: number; title: string; evidence: string; status: string }[];
}

export default function Documents({ engagement: e, documents, filters, options, summary, requests }: Props) {
    const [tab, setTab] = useState('all');
    const [q, setQ] = useState(filters.q ?? '');
    const go = (patch: Record<string, string>) => router.get(`/technology-solutions/workspace/${e.reference}/documents`, { ...filters, ...patch }, { preserveScroll: true, preserveState: true });
    const up = useForm<{ file: File | null; type: string; category: string; linked_to: string; visibility: string }>({ file: null, type: 'Evidence', category: 'Technical', linked_to: 'Implementation', visibility: 'All Parties' });
    const upload = (ev: FormEvent) => {
        ev.preventDefault();
        up.post(`/technology-solutions/workspace/${e.reference}/documents`, { forceFormData: true, preserveScroll: true, onSuccess: () => { up.reset(); setTab('all'); } });
    };
    return (
        <TechPortal e={e} title="Documents & Evidence" description="Upload, manage and track all documents and evidence related to your engagement.">
            <Head title="Documents & Evidence" />
            <Tabs tabs={[{ key: 'all', label: 'All Documents' }, { key: 'requests', label: 'Evidence Requests', count: requests.length }, { key: 'upload', label: 'Upload New' }]} value={tab} onChange={setTab} />
            <div className="mt-4 grid gap-4 xl:grid-cols-12">
                <div className="xl:col-span-9">
                    {tab === 'all' && (
                        <div className="rounded-[8px] border border-parchment-400 bg-white p-4">
                            <div className="mb-3 flex flex-wrap gap-2">
                                <form onSubmit={(x) => { x.preventDefault(); go({ q }); }} className="relative" role="search"><Search className="absolute top-3 left-2.5 size-4 text-ink-400" /><label htmlFor="dq" className="sr-only">Search documents</label><Input id="dq" value={q} onChange={(x) => setQ(x.target.value)} placeholder="Search documents by name, type or keyword..." className="w-72 pl-8" /></form>
                                <Select aria-label="Type" value={filters.type ?? ''} onChange={(x) => go({ type: x.target.value })} placeholder="All Types" options={options.types} className="w-36" />
                                <Select aria-label="Category" value={filters.category ?? ''} onChange={(x) => go({ category: x.target.value })} placeholder="All Categories" options={options.categories} className="w-36" />
                                <Select aria-label="Status" value={filters.status ?? ''} onChange={(x) => go({ status: x.target.value })} placeholder="All Statuses" options={options.statuses} className="w-36" />
                                <Select aria-label="Linked to" value={filters.linked ?? ''} onChange={(x) => go({ linked: x.target.value })} placeholder="All Items" options={options.linked} className="w-40" />
                                <Button size="sm" variant="ghost" onClick={() => router.get(`/technology-solutions/workspace/${e.reference}/documents`)}>Clear Filters</Button>
                            </div>
                            <SimpleTable columns={['Document Name', 'Type', 'Category', 'Linked To', 'Uploaded By', 'Uploaded On', 'Status', 'Visibility']} rows={documents.data.map((d) => [<b>{d.name}</b>, d.type, d.category, d.linked_to, d.uploaded_by, d.uploaded, <StatusPill status={d.status} />, d.visibility])} />
                            <div className="flex items-center justify-between"><p className="mt-2 text-xs text-ink-500">Showing {documents.from ?? 0} to {documents.to ?? 0} of {documents.total} documents</p><Pager links={documents.links} /></div>
                        </div>
                    )}
                    {tab === 'requests' && <Card title="Evidence Requests"><SimpleTable columns={['Task', 'Evidence required', 'Status']} rows={requests.map((r) => [r.title, r.evidence, <StatusPill status={r.status} />])} empty="No outstanding evidence requests." /></Card>}
                    {tab === 'upload' && (
                        <Card title="Upload New Document">
                            <form onSubmit={upload} className="grid gap-3 sm:grid-cols-2">
                                <Field label="File (PDF, DOC, DOCX, XLS, XLSX, JPG, PNG — max 20MB)" required error={up.errors.file} className="sm:col-span-2">{(id) => <input id={id} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" onChange={(x) => up.setData('file', x.target.files?.[0] ?? null)} className="block w-full text-sm" />}</Field>
                                <Field label="Type" error={up.errors.type}>{(id) => <Input id={id} value={up.data.type} onChange={(x) => up.setData('type', x.target.value)} />}</Field>
                                <Field label="Category" error={up.errors.category}>{(id) => <Input id={id} value={up.data.category} onChange={(x) => up.setData('category', x.target.value)} />}</Field>
                                <Field label="Linked to" error={up.errors.linked_to}>{(id) => <Select id={id} value={up.data.linked_to} onChange={(x) => up.setData('linked_to', x.target.value)} options={[...new Set([...options.linked, 'Implementation', 'UAT & Acceptance'])]} />}</Field>
                                <Field label="Visibility">{(id) => <Select id={id} value={up.data.visibility} onChange={(x) => up.setData('visibility', x.target.value)} options={['All Parties', 'Internal']} />}</Field>
                                <Button type="submit" disabled={up.processing || !up.data.file} className="sm:col-span-2"><Upload className="size-4" />Upload document</Button>
                            </form>
                        </Card>
                    )}
                </div>
                <aside className="space-y-4 xl:col-span-3">
                    <Card title="Document Summary"><KV rows={[['Total Documents', summary.total], ['Verified', summary.verified], ['Pending Review', summary.pending], ['Expired / Outdated', summary.expired], ['Shared with TBCA', summary.shared]]} /></Card>
                    <Card title="Upload Guidelines"><CheckList items={['Accepted formats: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG', 'Max file size: 20MB per file', 'Ensure documents are clear and readable', 'Sensitive data will be kept secure']} /></Card>
                </aside>
            </div>
        </TechPortal>
    );
}

Documents.layout = null;
