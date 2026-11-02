import { Head, Link } from '@inertiajs/react';
import { ShieldCheck } from 'lucide-react';
import { ADMIN_NAV } from '@/Components/Aiim/Nav';
import { DocTable, SheetTable, Split, type Sheet } from '@/Components/Aiim/ProtoDesk';
import { Card, Chip, STable, StatusChip } from '@/Components/Industries/Kit';
import ConsoleLayout from '@/Layouts/ConsoleLayout';

interface RegistrySource { code: string; name: string; provider: string; category: string; tierName: string; confidence: number; grade: { grade: string; label: string }; status: string; updated: string | null }
interface Props { sources: Sheet; conflicts: Sheet; verify: Sheet; freshness: Sheet; policy: string[][]; registry: RegistrySource[] }

const link = (v: unknown) => {
    const s = String(v ?? '');
    return /^https?:/.test(s) ? <a href={s} target="_blank" rel="noopener" className="text-controlled-700 hover:underline">{s.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40)}</a> : s;
};

/** AIIM mock 82: Source and Confidence Administration (prototype #source-admin). */
export default function Sources({ sources, conflicts, verify, freshness, policy, registry }: Props) {
    return (
        <ConsoleLayout area="AIIM Admin Area" areaIcon={ShieldCheck} groups={ADMIN_NAV} crumbs={[{ label: 'Admin', href: '/admin' }, { label: 'AIIM', href: '/admin/aiim' }, { label: 'Source and Confidence Administration' }]} title="Source and Confidence Administration" description="Page 82">
            <Head title="AIIM Source and Confidence Administration" />
            <Split side={<Card title="Confidence policy"><DocTable rows={policy} /></Card>}>
                <Card title="Sources"><SheetTable s={sources} size={15} fmt={{ URL: link }} /></Card>
                <Card title="Conflict, vintage and arithmetic register (I-1)"><SheetTable s={conflicts} bare /></Card>
                <Card title="Verification log"><SheetTable s={verify} bare fmt={{ Result: (v) => <StatusChip s={v} /> }} /></Card>
                <Card title="Freshness rules"><SheetTable s={freshness} bare /></Card>
                {registry.length > 0 && (
                    <Card title="AIIM source registry">
                        <STable compact head={['Code', 'Source', 'Provider', 'Category', 'Tier', 'Confidence', 'Status', 'Updated']} rows={registry.map((s) => [
                            <Link key="c" href={`/aiim/sources/${s.code}`} className="font-mono text-controlled-700 hover:underline">{s.code}</Link>, s.name, s.provider, s.category, s.tierName,
                            <Chip key="g" t={`${s.confidence}% · ${s.grade.grade}`} tone={s.confidence >= 80 ? 'ok' : s.confidence >= 60 ? 'warn' : 'bad'} />, <StatusChip key="s" s={s.status} />, s.updated ?? '—',
                        ])} />
                    </Card>
                )}
            </Split>
        </ConsoleLayout>
    );
}

Sources.layout = null;
