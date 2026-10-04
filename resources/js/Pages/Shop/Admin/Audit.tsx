import { SimpleTable } from '@/Components/ui/Kit';
import AdminShell from '@/Components/Shop/AdminShell';
import { FilterBar, Pager, fmtDate } from '@/Components/Shop/AdminKit';
import type { Paginated } from '@/types/shop';

interface Event { id: number; actor: string; action: string; subject: string; summary: string; version: string | null; created_at: string | null }

function AuditConsole({ events, actions, filters }: { events: Paginated<Event>; actions: string[]; filters: Record<string, string> }) {
    return (
        <AdminShell title="Audit Trail" description="Every governance and commerce action in the Shop Admin Control Tower, with actor and timestamp." badge="Governance">
            <FilterBar path="/admin/shop/audit" filters={filters} selects={[{ name: 'action', label: 'Action', options: actions }]} />
            <p className="text-xs text-ink-500">{events.total} events</p>
            <SimpleTable columns={['When', 'Actor', 'Action', 'Subject', 'Summary', 'Version']} rows={events.data.map((e) => [fmtDate(e.created_at, true), e.actor, <span key="a" className="font-mono text-xs">{e.action}</span>, <span key="s" className="font-mono text-xs">{e.subject}</span>, e.summary, e.version ?? '-'])} empty="No audit events." />
            <Pager links={events.links} />
        </AdminShell>
    );
}

AuditConsole.layout = null;
export default AuditConsole;
