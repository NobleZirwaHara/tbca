import { Head, Link } from '@inertiajs/react';
import { FilePlus2 } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import { StatusPill } from '@/Components/ui/Kit';
import { MkHeader } from '@/Components/Marketplace/ui';
import { PsBody } from '@/Components/Marketplace/PartnerKit';
import type { MkPartnerRequest } from '@/types/marketplace';

export default function Index({ requests }: { requests: MkPartnerRequest[] }) {
    return (
        <>
            <Head title="My Partner Requests" />
            <MkHeader crumbs={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'My Requests' }]} title="My Partner Requests" lead="Every matter is permission-checked and conflict-cleared before any money or work."
                aside={<ButtonLink href="/partner-services/request"><FilePlus2 className="size-4" aria-hidden="true" /> New Request</ButtonLink>} />
            <PsBody>
                <ul className="space-y-3">
                    {requests.length === 0 && <li className="rounded-[8px] border border-dashed border-parchment-500 bg-white p-8 text-center text-sm text-ink-500">No partner requests yet.</li>}
                    {requests.map((r) => (
                        <li key={r.reference} className="flex flex-wrap items-center justify-between gap-3 rounded-[8px] border border-parchment-400 bg-white p-4">
                            <div><p className="font-mono text-xs text-ink-500">{r.reference} · {r.requestedOn}</p><p className="font-semibold text-ink-900">{r.title}</p><p className="text-xs text-ink-500">{r.intake.profession} · {r.arrangement ?? 'Arrangement pending'} · {r.partner?.name ?? 'Professional pending'}</p></div>
                            <div className="flex items-center gap-3"><StatusPill status={r.stageLabel} /><Link href={`/partner-services/requests/${r.reference}`} className="text-sm font-semibold text-gold-700">Open →</Link></div>
                        </li>
                    ))}
                </ul>
            </PsBody>
        </>
    );
}
