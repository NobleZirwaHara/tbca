import { Archive, CheckCircle2, Copy, FileCheck2, Info, Lock, Scale } from 'lucide-react';
import { Card, shortDate } from './Ui';
import type { DdReportMeta } from '@/types/due-diligence';

export function ReportDetails({ report, note = 'Report approved and ready for release' }: { report: DdReportMeta; note?: string }) {
    return (
        <Card title="Report details">
            <div className="flex gap-3">
                <span className="flex size-14 shrink-0 items-center justify-center rounded-full bg-verified-50"><FileCheck2 className="size-7 text-verified-600" aria-hidden="true" /></span>
                <dl className="min-w-0 space-y-1.5 text-xs">
                    <div><dt className="text-ink-500">Report title</dt><dd className="font-semibold">{report.title}</dd></div>
                    <div><dt className="text-ink-500">Report version</dt><dd className="font-semibold">{report.version}</dd></div>
                    <div><dt className="text-ink-500">Report date</dt><dd>{shortDate(report.approvedAt, true)}</dd></div>
                    <div>
                        <dt className="text-ink-500">Report hash (SHA-256)</dt>
                        <dd className="flex items-center gap-1 font-mono break-all">{report.hash ? `${report.hash.slice(0, 24)}…` : '—'}{report.hash && <button type="button" aria-label="Copy hash" onClick={() => navigator.clipboard?.writeText(report.hash ?? '')}><Copy className="size-3" /></button>}</dd>
                    </div>
                </dl>
            </div>
            <p className="mt-3 inline-flex items-center gap-1 rounded bg-verified-50 px-2 py-0.5 text-[0.6875rem] text-verified-700"><CheckCircle2 className="size-3.5" aria-hidden="true" />{note}</p>
        </Card>
    );
}

export function DeliverablesTable({ report }: { report: DdReportMeta }) {
    return (
        <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="text-ink-500"><tr><th className="py-1">Deliverable</th><th>Description</th><th>Format</th><th>Pages</th><th>Status</th></tr></thead>
                <tbody className="divide-y divide-parchment-300">
                    {report.deliverables.map((d) => (
                        <tr key={d.name}><td className="py-2 font-medium"><span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-verified-500" aria-hidden="true" />{d.name}</span></td><td className="text-ink-600">{d.description}</td><td>PDF</td><td>{d.pages}</td><td className="text-verified-700">Approved</td></tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export function ReleaseStrip() {
    return (
        <div className="grid gap-3 rounded-[10px] border border-parchment-400 bg-white p-4 text-xs md:grid-cols-4">
            {[[Lock, 'Secure and confidential', 'Your report is encrypted and access-controlled. Only authorised parties can access the report.'], [Info, 'No hidden release fee', 'There is no additional fee to release your report. All fees are per the accepted agreement.'], [Archive, 'Retention & records', 'Report and records are retained as per the retention policy and your agreement.'], [Scale, 'Professional use only', 'This report is for the stated purpose only. Do not share outside your organisation.']].map(([I, t, b]) => {
                const Icon = I as typeof Lock;
                return <p key={t as string} className="flex gap-2"><Icon className="size-5 shrink-0 text-gold-600" aria-hidden="true" /><span><strong className="block">{t as string}</strong>{b as string}</span></p>;
            })}
        </div>
    );
}
