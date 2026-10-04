import { Link } from '@inertiajs/react';
import { KpiTile, Panel, SimpleTable, StatusPill } from '@/Components/ui/Kit';
import AdminShell, { ABOUT_ADMIN_NAV } from '@/Components/About/AdminShell';
import { fmtDate } from '@/Components/About/ClaimEvidence';

interface Props {
    kpis: Record<'claims' | 'published' | 'evidence_expired' | 'evidence_expiring' | 'assets_attention' | 'testimonials_live' | 'corrections_open' | 'applications' | 'cases_open' | 'whistle_open', number>;
    attention: { code: string; claim: string; expiry: string | null; status: string }[];
}

export default function Overview({ kpis, attention }: Props) {
    return (
        <AdminShell crumb="Overview" title="About TBCA Control Tower" lead="Governed. Evidenced. Trusted." description="Every public trust claim, its evidence and the non-client cases behind the About surfaces.">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                <KpiTile label="Claims in register" value={kpis.claims} />
                <KpiTile label="Published claims" value={kpis.published} tone="good" />
                <KpiTile label="Evidence expired" value={kpis.evidence_expired} tone="bad" />
                <KpiTile label="Evidence expiring (60d)" value={kpis.evidence_expiring} tone="warn" />
                <KpiTile label="Marks / certs needing action" value={kpis.assets_attention} tone="warn" />
                <KpiTile label="Live testimonials" value={kpis.testimonials_live} tone="good" />
                <KpiTile label="Open corrections" value={kpis.corrections_open} tone="warn" />
                <KpiTile label="Applications to screen" value={kpis.applications} />
                <KpiTile label="Open cases" value={kpis.cases_open} />
                <KpiTile label="Open whistleblowing" value={kpis.whistle_open} tone="gold" />
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-2">
                <Panel title="Evidence needing attention">
                    <SimpleTable
                        columns={['Evidence', 'Claim', 'Expiry', 'Status']}
                        rows={attention.map((a) => [<span className="font-mono text-xs">{a.code}</span>, a.claim, fmtDate(a.expiry), <StatusPill status={a.status} />])}
                        empty="All evidence is current."
                    />
                    <Link href="/admin/about/evidence?expiry=expired" className="mt-3 inline-block text-xs font-semibold text-gold-700">Open Evidence & Expiry Monitor →</Link>
                </Panel>
                <Panel title="Consoles">
                    <ul className="grid gap-2 sm:grid-cols-2">
                        {ABOUT_ADMIN_NAV.flatMap((g) => g.items).filter((i) => i.href !== '/admin/about').map((i) => (
                            <li key={i.href}>
                                <Link href={i.href} className="flex items-center gap-2 rounded-[6px] border border-parchment-400 p-3 text-sm text-ink-800 hover:border-gold-400">
                                    {i.icon && <i.icon className="size-4 text-gold-600" aria-hidden="true" />} {i.label}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </Panel>
            </div>
        </AdminShell>
    );
}
Overview.layout = null;
