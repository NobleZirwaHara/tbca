import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import ConsoleLayout from '@/Layouts/ConsoleLayout';
import { Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import { Input, Select } from '@/Components/ui/Form';
import { DD_ADMIN_NAV } from '@/Components/DueDiligence/AdminNav';
import { shortDate } from '@/Components/DueDiligence/Ui';

interface Props {
    cases: { reference: string; name: string; package: string; status: string; statusLabel: string; slaDueAt: string | null; overdue: boolean; risk: string; updatedAt: string; isSample: boolean }[];
    filters: { status: string; search: string };
    statuses: { value: string; label: string }[];
}

/** Case Register with server-side filtering. */
export default function AdminCases({ cases, filters, statuses }: Props) {
    const [search, setSearch] = useState(filters.search);
    const apply = (next: Partial<Props['filters']>) => router.get('/admin/due-diligence/cases', { ...filters, search, ...next }, { preserveState: true, replace: true });

    return (
        <ConsoleLayout area="Due Diligence Control Tower" areaIcon={ShieldCheck} groups={DD_ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'Due Diligence', href: '/admin/due-diligence' }, { label: 'Cases' }]} title="Case Register" description={`${cases.length} case(s)`}>
            <Head title="DD Case Register" />
            <Panel>
                <form className="mb-4 flex flex-wrap gap-2" onSubmit={(e) => { e.preventDefault(); apply({}); }}>
                    <label className="sr-only" htmlFor="dd-search">Search</label>
                    <Input id="dd-search" placeholder="Search reference or case name" value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-xs" />
                    <label className="sr-only" htmlFor="dd-status">Status</label>
                    <Select id="dd-status" value={filters.status} options={statuses} placeholder="All statuses" onChange={(e) => apply({ status: e.target.value })} className="max-w-56" />
                    <Button type="submit" size="sm">Filter</Button>
                </form>
                <SimpleTable
                    columns={['Reference', 'Case', 'Package', 'Status', 'Risk', 'SLA due', 'Updated']}
                    rows={cases.map((c) => [
                        <Link key="r" href={`/admin/due-diligence/cases/${c.reference}`} className="font-mono text-gold-700 hover:underline">{c.reference}</Link>,
                        <span key="n">{c.name}{c.isSample && <span className="ml-1 rounded bg-gold-100 px-1 text-[0.625rem] text-gold-800">SAMPLE</span>}</span>,
                        c.package,
                        <StatusPill key="s" status={c.statusLabel} />,
                        c.risk,
                        <span key="d" className={c.overdue ? 'font-semibold text-risk-600' : ''}>{shortDate(c.slaDueAt)}</span>,
                        shortDate(c.updatedAt),
                    ])}
                    empty="No cases match."
                />
            </Panel>
        </ConsoleLayout>
    );
}

AdminCases.layout = null;
