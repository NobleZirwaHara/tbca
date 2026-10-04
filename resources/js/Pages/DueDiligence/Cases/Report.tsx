import { useState } from 'react';
import { ChevronLeft, ChevronRight, Download, Lock, Printer, ShieldCheck } from 'lucide-react';
import { ButtonLink } from '@/Components/ui/Button';
import CaseLayout from '@/Components/DueDiligence/CaseLayout';
import { ReleaseStrip, ReportDetails } from '@/Components/DueDiligence/ReportParts';
import { Card, shortDate } from '@/Components/DueDiligence/Ui';
import { cn } from '@/lib/cn';
import type { DdCasePageProps, DdReportMeta } from '@/types/due-diligence';

interface Props extends DdCasePageProps {
    report: DdReportMeta & { sections: { key: string; title: string; body: string[] }[]; access: { at: string; action: string; by: string; device: string; ip: string }[] };
    watermark: string;
}

/** DD-044 Secure Report Viewer and Download. */
export default function Report(props: Props) {
    const { case: c, report, watermark } = props;
    const base = `/due-diligence/cases/${c.reference}`;
    const [i, setI] = useState(0);
    const section = report.sections[i];
    const total = report.deliverables.reduce((s, d) => s + d.pages, 0);

    return (
        <CaseLayout
            page={props}
            active="report-ready"
            title="Secure Report Viewer and Download"
            subtitle="Your report is ready. You can view it securely online or download the approved files."
            description="All access is logged and controlled. Do not share outside your organisation."
            roleNote="You are authorised to view and download the report."
            bandNote="You have already paid for this report."
            actions={<ButtonLink href={`${base}/dispute`} variant="outline-light">Open Dispute / Monitoring</ButtonLink>}
            aside={
                <>
                    <Card title="Access & download">
                        <p className="mb-2 rounded bg-verified-50 px-2 py-1 text-xs text-verified-700">You have download access</p>
                        <a href={`${base}/report/download`} className="flex w-full items-center justify-center gap-2 rounded-[4px] border border-ink-300 px-3 py-2 text-sm font-medium hover:border-ink-900"><Download className="size-4" aria-hidden="true" /> Download Full Report</a>
                        <p className="mt-2 text-[0.6875rem] text-ink-500">Watermark: {watermark}</p>
                    </Card>
                    <Card title="Access activity">
                        <ul className="space-y-1.5 text-[0.6875rem]">{report.access.map((a, n) => <li key={n} className="grid grid-cols-2 gap-1"><span className="text-ink-500">{shortDate(a.at, true)}</span><span>{a.action} · {a.by}<br /><span className="text-ink-400">{a.device} / {a.ip}</span></span></li>)}</ul>
                    </Card>
                </>
            }
        >
            <div className="grid gap-5 xl:grid-cols-12">
                <div className="space-y-4 xl:col-span-4">
                    <ReportDetails report={report} note="Report approved and released" />
                    <Card title="Deliverables included">
                        <ul className="space-y-1 text-xs">{report.deliverables.map((d) => <li key={d.name} className="flex justify-between"><span>{d.name}</span><span className="text-ink-500">{d.pages} pages</span></li>)}<li className="flex justify-between border-t border-parchment-300 pt-1 font-semibold"><span>Total</span><span>{total} pages</span></li></ul>
                    </Card>
                </div>
                <Card title="Secure report viewer" className="xl:col-span-8">
                    <p className="mb-2 flex items-center gap-2 rounded bg-verified-50 px-2 py-1 text-xs text-verified-700"><ShieldCheck className="size-4" aria-hidden="true" />This is the approved final report. You can view it securely online.</p>
                    <div className="overflow-hidden rounded-[8px] border border-ink-800">
                        <div className="flex items-center gap-2 bg-ink-900 px-3 py-2 text-xs text-parchment-200">
                            <button type="button" aria-label="Previous section" disabled={i === 0} onClick={() => setI(i - 1)} className="disabled:opacity-30"><ChevronLeft className="size-4" /></button>
                            <span>{i + 1} / {report.sections.length}</span>
                            <button type="button" aria-label="Next section" disabled={i === report.sections.length - 1} onClick={() => setI(i + 1)} className="disabled:opacity-30"><ChevronRight className="size-4" /></button>
                            <span className="flex-1" />
                            <a href={`${base}/report/download`} aria-label="Download"><Download className="size-4" /></a>
                            <button type="button" aria-label="Print" onClick={() => window.print()}><Printer className="size-4" /></button>
                        </div>
                        <div className="grid bg-white md:grid-cols-[1fr_12rem]">
                            <article className="relative min-h-80 p-6">
                                <p className="text-xs font-semibold text-gold-700">The Business Clinic.Africa™ · Confidential</p>
                                <h3 className="mt-3 font-serif text-xl font-semibold">{section?.title}</h3>
                                <ul className="mt-3 space-y-2 text-[0.8125rem] text-ink-700">{section?.body.map((l, n) => <li key={n}>{i === 0 && n === 0 ? <strong className="font-serif text-lg">{l}</strong> : l}</li>)}</ul>
                                <p className="pointer-events-none absolute right-4 bottom-3 text-[0.625rem] text-ink-300 select-none">{watermark}</p>
                            </article>
                            <ol className="border-t border-parchment-300 bg-parchment-100 p-2 text-xs md:border-t-0 md:border-l">
                                {report.sections.map((s, n) => <li key={s.key}><button type="button" onClick={() => setI(n)} className={cn('w-full rounded px-2 py-1.5 text-left', n === i ? 'bg-gold-100 font-semibold' : 'hover:bg-parchment-200')}>{n + 1}. {s.title}</button></li>)}
                            </ol>
                        </div>
                    </div>
                    <p className="mt-2 flex items-center gap-2 rounded bg-attested-50 px-2 py-1 text-xs text-ink-700"><Lock className="size-4 text-attested-600" aria-hidden="true" />Report content is protected. Copying and redistribution are restricted and monitored.</p>
                </Card>
            </div>
            <ReleaseStrip />
        </CaseLayout>
    );
}
