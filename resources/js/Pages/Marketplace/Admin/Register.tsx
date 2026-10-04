import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { AdminShell } from '@/Components/Marketplace/Shells';
import { Card, Donut, Notice, CheckList, zar } from '@/Components/Marketplace/ui';
import { ActionMenu, FilterSelect, KpiRow, PriorityPill, QueryTabs, SearchBox, SmallTag, Table, td } from '@/Components/Marketplace/AdminKit';
import { Modal, StatusPill } from '@/Components/ui/Kit';
import { Field, Input, Select } from '@/Components/ui/Form';
import { Button } from '@/Components/ui/Button';
import type { RegisterNav } from '@/types/marketplace';

interface Column {
    key: string;
    label: string;
    type?: string;
    sub?: string;
}

interface Def {
    area: string;
    code: string;
    title: string;
    description: string;
    columns: Column[];
    tabs: Record<string, string>;
    filters?: Record<string, string>;
    actions: Record<string, { label: string; from: string[]; to: string }>;
    create?: { label: string; prefix: string; fields: { key: string; label: string; required?: boolean; options?: string[] }[] };
    definitions?: [string, string][];
    lists?: { title: string; items: string[] }[];
    legend?: string[];
    notice?: string;
    tone?: 'bad' | 'warn';
    strip?: [string, string][];
}

type Row = { id: number; reference: string; status: string; priority: string | null } & Record<string, unknown>;

interface Props {
    registerKey: string;
    def: Def;
    rows: Row[];
    counts: Record<string, number>;
    kpis: { label: string; display: string; caption?: string; tone?: string }[];
    breakdowns: { title: string; items: { label: string; value: number }[] }[];
    filterOptions: { key: string; label: string; options: string[] }[];
    query: Record<string, string>;
    nav: RegisterNav;
}

function Cell({ col, row }: { col: Column; row: Row }) {
    const v = row[col.key];
    const s = v === null || v === undefined || v === '' ? '—' : String(v);
    switch (col.type) {
        case 'ref':
            return <span className="font-mono text-xs font-semibold whitespace-nowrap text-controlled-700">{s}</span>;
        case 'pill':
            return <StatusPill status={s} />;
        case 'priority':
            return <PriorityPill value={v as string | null} />;
        case 'tag':
            return s === '—' ? <span>—</span> : <SmallTag>{s}</SmallTag>;
        case 'money':
            return <span className="font-semibold whitespace-nowrap">{typeof v === 'number' ? zar(v, 2) : s}</span>;
        case 'pct':
            return <span>{s}%</span>;
        case 'days': {
            const n = Number(v);
            return <span className={n < 0 ? 'font-semibold text-risk-600' : n <= 30 ? 'font-semibold text-attested-600' : 'text-verified-700'}>{s}</span>;
        }
        case 'sub':
            return (
                <span>
                    <span className="block font-mono text-xs font-semibold text-controlled-700">{s}</span>
                    {col.sub && <span className="block text-xs text-ink-500">{String(row[col.sub] ?? '')}</span>}
                </span>
            );
        default:
            return <span>{s}</span>;
    }
}

function CreateModal({ registerKey, create }: { registerKey: string; create: NonNullable<Def['create']> }) {
    const [open, setOpen] = useState(false);
    const form = useForm<Record<string, string>>(Object.fromEntries(create.fields.map((f) => [f.key, f.options?.[0] ?? ''])));
    return (
        <>
            <Button type="button" size="sm" icon="plus" onClick={() => setOpen(true)}>
                {create.label}
            </Button>
            <Modal
                open={open}
                onClose={() => setOpen(false)}
                title={create.label}
                footer={
                    <>
                        <Button type="button" variant="outline" size="sm" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            size="sm"
                            disabled={form.processing}
                            onClick={() =>
                                form.post(`/admin/marketplace/${registerKey}`, {
                                    preserveScroll: true,
                                    onSuccess: () => {
                                        form.reset();
                                        setOpen(false);
                                    },
                                })
                            }
                        >
                            Submit for approval
                        </Button>
                    </>
                }
            >
                <div className="grid gap-3 sm:grid-cols-2">
                    {create.fields.map((f) => (
                        <Field key={f.key} label={f.label} required={f.required} error={form.errors[f.key]}>
                            {(id) =>
                                f.options ? (
                                    <Select id={id} value={form.data[f.key]} onChange={(e) => form.setData(f.key, e.target.value)} options={f.options} />
                                ) : (
                                    <Input id={id} value={form.data[f.key]} onChange={(e) => form.setData(f.key, e.target.value)} />
                                )
                            }
                        </Field>
                    ))}
                </div>
            </Modal>
        </>
    );
}

export default function Register({ registerKey, def, rows, counts, kpis, breakdowns, filterOptions, query, nav }: Props) {
    const url = `/admin/marketplace/${registerKey}`;
    const actionsFor = (row: Row) =>
        Object.entries(def.actions)
            .filter(([, a]) => a.from.includes(row.status))
            .map(([key, a]) => ({ key, label: a.label, danger: ['suspended', 'blocked', 'withdrawn', 'not_authorised', 'expired', 'conflicted', 'mismatch', 'escalated'].includes(a.to) }));

    return (
        <AdminShell
            nav={nav}
            crumbs={[{ label: 'Admin', href: '/admin' }, { label: def.area === 'partners' ? 'Partner Services Admin' : 'Marketplace Admin', href: '/admin/marketplace' }, { label: def.title }]}
            title={def.title}
            badge={<span className="rounded-[4px] border border-gold-500 bg-gold-50 px-2 py-0.5 text-[0.6875rem] font-bold text-gold-800">{def.code}</span>}
            description={def.description}
            actions={def.create ? <CreateModal registerKey={registerKey} create={def.create} /> : undefined}
        >
            <Head title={def.title} />

            {def.strip && (
                <div className="mb-4 grid grid-cols-2 gap-3 rounded-[8px] border border-parchment-400 bg-white p-4 sm:grid-cols-3 lg:grid-cols-6">
                    {def.strip.map(([k, v]) => (
                        <div key={k}>
                            <p className="text-[0.6875rem] text-ink-500">{k}</p>
                            <p className="text-[0.8125rem] font-semibold text-ink-900">{v}</p>
                        </div>
                    ))}
                </div>
            )}

            <KpiRow items={kpis.map((k) => ({ label: k.label, value: k.display, caption: k.caption, tone: k.tone }))} />

            <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
                <section className="min-w-0 rounded-[8px] border border-parchment-400 bg-white p-4" aria-label={`${def.title} records`}>
                    <QueryTabs url={url} query={query} tabs={def.tabs} counts={counts} />
                    <div className="mt-4 flex flex-wrap items-end gap-3">
                        <SearchBox url={url} query={query} placeholder="Search by ID, name, party…" />
                        {filterOptions.map((f) => (
                            <FilterSelect key={f.key} url={url} query={query} name={f.key} label={f.label} options={f.options} />
                        ))}
                    </div>
                    <div className="mt-4">
                        <Table head={[...def.columns.map((c) => c.label), 'Actions']} empty={rows.length === 0}>
                            {rows.map((row) => (
                                <tr key={row.id} className="hover:bg-parchment-100">
                                    {def.columns.map((c) => (
                                        <td key={c.key} className={td}>
                                            <Cell col={c} row={row} />
                                        </td>
                                    ))}
                                    <td className={td}>
                                        <ActionMenu url={`${url}/${row.id}`} actions={actionsFor(row)} />
                                    </td>
                                </tr>
                            ))}
                        </Table>
                    </div>
                    <p className="mt-2 text-xs text-ink-400">
                        Showing {rows.length} record{rows.length === 1 ? '' : 's'}. Every status change is version-stamped in the record history.
                    </p>
                </section>

                <aside className="space-y-4">
                    {breakdowns.map((b) => (
                        <Card key={b.title} title={b.title}>
                            <Donut items={b.items} label={b.title} />
                        </Card>
                    ))}
                    {def.definitions && (
                        <Card title="Definitions">
                            <dl className="space-y-2.5 text-xs">
                                {def.definitions.map(([k, v]) => (
                                    <div key={k}>
                                        <dt className="font-semibold text-ink-900">{k}</dt>
                                        <dd className="text-ink-500">{v}</dd>
                                    </div>
                                ))}
                            </dl>
                        </Card>
                    )}
                    {def.lists?.map((l) => (
                        <Card key={l.title} title={l.title}>
                            <CheckList items={l.items} />
                        </Card>
                    ))}
                    {def.legend && (
                        <Card title="Legend">
                            <CheckList items={def.legend} mark="info" />
                        </Card>
                    )}
                </aside>
            </div>

            {def.notice && (
                <Notice tone={def.tone ?? 'warn'} className="mt-5">
                    {def.notice}
                </Notice>
            )}
        </AdminShell>
    );
}

Register.layout = null;
