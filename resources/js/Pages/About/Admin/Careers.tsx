import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Download } from 'lucide-react';
import { Panel, StatusPill } from '@/Components/ui/Kit';
import { Select } from '@/Components/ui/Form';
import AdminShell, { Pager, useFilters, type Paginated } from '@/Components/About/AdminShell';
import { fmtDate } from '@/Components/About/ClaimEvidence';
import type { RoleSummary } from '@/types/about';

interface AppRow {
    id: number;
    reference: string;
    name: string;
    email: string;
    role: string;
    status: string;
    cv_name: string | null;
    has_cv: boolean;
    location: string | null;
    submitted_at: string;
    experience: Record<string, string | boolean> | null;
    screening: { skills?: string[]; notice_period?: string; motivation?: string } | null;
}
interface Props {
    applications: Paginated<AppRow>;
    vacancies: (RoleSummary & { id: number; status: string; applications: number })[];
    statuses: string[];
    filters: Record<string, string | undefined>;
}

export default function Careers({ applications, vacancies, statuses, filters }: Props) {
    const apply = useFilters('/admin/about/careers', filters);
    const [open, setOpen] = useState<number | null>(null);
    const setStatus = (a: AppRow, status: string) => {
        const note = window.prompt(`Note for moving ${a.reference} to ${status} (optional)`) ?? undefined;
        router.post(`/admin/about/careers/applications/${a.id}/status`, { status, note }, { preserveScroll: true });
    };

    return (
        <AdminShell crumb="Careers & Applications" title="Careers & Applications" lead="Authorised vacancies. Human decisions." description="Screen candidate applications and control which vacancies are open. AI never issues a final hiring or rejection decision.">
            <Panel title="Applications" action={<Select aria-label="Filter by status" placeholder="All statuses" options={statuses} value={filters.status ?? ''} onChange={(e) => apply({ status: e.target.value, page: undefined })} className="h-8 w-40 text-xs" />}>
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] text-left text-[0.8125rem]">
                        <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Reference', 'Candidate', 'Role', 'Location', 'Submitted', 'CV', 'Status', 'Move to'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {applications.data.length === 0 && <tr><td colSpan={8} className="py-8 text-center text-ink-400">No applications yet.</td></tr>}
                            {applications.data.map((a) => (
                                <tr key={a.id} className="align-top">
                                    <td className="px-3 py-2.5 font-mono text-xs"><button type="button" onClick={() => setOpen(open === a.id ? null : a.id)} className="text-gold-700 underline">{a.reference}</button></td>
                                    <td className="px-3 py-2.5">{a.name}<span className="block text-xs text-ink-500">{a.email}</span>
                                        {open === a.id && (
                                            <div className="mt-2 rounded bg-parchment-100 p-2 text-xs text-ink-700">
                                                {a.experience && <p>{String(a.experience.title ?? '')} at {String(a.experience.employer ?? '')} · {String(a.experience.years ?? '')}</p>}
                                                {a.screening?.skills && <p>Skills: {a.screening.skills.join(', ')}</p>}
                                                {a.screening?.notice_period && <p>Notice: {a.screening.notice_period}</p>}
                                                {a.screening?.motivation && <p className="mt-1 italic">“{a.screening.motivation}”</p>}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2.5">{a.role}</td>
                                    <td className="px-3 py-2.5">{a.location}</td>
                                    <td className="px-3 py-2.5 whitespace-nowrap">{fmtDate(a.submitted_at)}</td>
                                    <td className="px-3 py-2.5">{a.has_cv ? <a href={`/admin/about/careers/applications/${a.id}/cv`} className="inline-flex items-center gap-1 text-xs text-controlled-700"><Download className="size-3.5" aria-hidden="true" />{a.cv_name}</a> : <span className="text-xs text-ink-400">{a.cv_name ?? '—'}</span>}</td>
                                    <td className="px-3 py-2.5"><StatusPill status={a.status} /></td>
                                    <td className="px-3 py-2.5">
                                        <select aria-label={`Move ${a.reference}`} value="" onChange={(e) => e.target.value && setStatus(a, e.target.value)} className="h-8 rounded border border-parchment-400 bg-white px-1 text-xs">
                                            <option value="">Move to…</option>
                                            {statuses.filter((s) => s !== a.status).map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <Pager page={applications} noun="applications" />
            </Panel>
            <Panel title="Vacancies" className="mt-5">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px] text-left text-[0.8125rem]">
                        <thead className="bg-parchment-200 text-xs text-ink-600"><tr>{['Code', 'Title', 'Department', 'Closes', 'Applications', 'Public', 'Status'].map((h) => <th key={h} className="px-3 py-2">{h}</th>)}</tr></thead>
                        <tbody className="divide-y divide-parchment-300">
                            {vacancies.map((v) => (
                                <tr key={v.id}>
                                    <td className="px-3 py-2.5 font-mono text-xs">{v.code}</td>
                                    <td className="px-3 py-2.5">{v.title}</td>
                                    <td className="px-3 py-2.5">{v.department}</td>
                                    <td className="px-3 py-2.5">{fmtDate(v.closes_at)}</td>
                                    <td className="px-3 py-2.5">{v.applications}</td>
                                    <td className="px-3 py-2.5">{v.is_open ? <StatusPill status="listed" tone="good" /> : <StatusPill status="hidden" tone="neutral" />}</td>
                                    <td className="px-3 py-2.5">
                                        <select aria-label={`Status for ${v.code}`} value={v.status} onChange={(e) => router.post(`/admin/about/careers/vacancies/${v.id}/status`, { status: e.target.value }, { preserveScroll: true })} className="h-8 rounded border border-parchment-400 bg-white px-1 text-xs">
                                            {['draft', 'open', 'closed'].map((s) => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Panel>
        </AdminShell>
    );
}
Careers.layout = null;
