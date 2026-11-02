import { Head } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import { bwHref, DocTable, QuickLinks, SheetTable, Split, type Sheet } from '@/Components/Aiim/ProtoDesk';
import { Card, StatusChip } from '@/Components/Industries/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';

interface Props { controls: string[][]; validator: Sheet; editions: Sheet; decisions: string[][]; roles: Sheet; rollout: Sheet }

/** AIIM mock 80: AIIM Admin and Dashboard (prototype #admin-dash): pack controls from BW-1.0. */
export default function AdminDashboard({ controls, validator, editions, decisions, roles, rollout }: Props) {
    const passed = validator.rows.filter((r) => /pass/i.test(String(r.Result ?? ''))).length;
    return (
        <ConsoleLayout area="AIIM Admin Area" areaIcon={ShieldCheck} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM' }, { label: 'AIIM Admin and Dashboard' }]} title="AIIM Admin and Dashboard" description="Page 80 · Pack controls">
            <Head title="AIIM Admin and Dashboard" />
            <Split side={<QuickLinks items={[
                ['/admin/aiim/pricing', 'cash', 'Pricing administration'],
                ['/admin/aiim/sources', 'shield', 'Source & confidence'],
                [bwHref('coverage'), 'check', 'Coverage report'],
                [bwHref('registers'), 'db', 'Data Room'],
            ]} />}>
                <Card title="Controls (K-1)"><DocTable rows={controls} /></Card>
                <Card title={`Validator — ${passed}/${validator.rows.length}`}><SheetTable s={validator} bare size={40} fmt={{ Result: (v) => <StatusChip s={v} /> }} /></Card>
                <Card title="Edition log (K-8)"><SheetTable s={editions} bare /></Card>
                <Card title="Open decisions"><DocTable rows={decisions} /></Card>
                <Card title="Replication roles (54 countries)"><SheetTable s={roles} size={10} /></Card>
                <Card title="Rollout (K-7)"><SheetTable s={rollout} bare /></Card>
            </Split>
        </ConsoleLayout>
    );
}

AdminDashboard.layout = null;
