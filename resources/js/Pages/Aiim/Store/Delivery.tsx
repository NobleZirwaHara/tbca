import { Link } from '@inertiajs/react';
import { CheckCircle2, ChevronRight, Clock, Download, Eye, FileArchive, FileSpreadsheet, Info } from 'lucide-react';
import { zar2 } from '@/Components/Aiim/format';
import AiimPage, { SectionCard, SelectionBox, DeeperBox } from '@/Components/Aiim/Shell';
import { Stepper } from '@/Components/ui/Kit';
import { Button } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';
import { ReportCard, type ReportProps } from './Quote';

export default function Delivery({ report: r }: AiimPageProps & { report: ReportProps }) {
    const delivered = r.status === 'delivered';
    const stage = { quoted: 2, paid: 3, in_production: 3, delivered: 4 }[r.status] ?? 2;
    return (
        <AiimPage
            title="Report Delivery"
            crumbs={[{ label: 'My Workspace', href: '/aiim/workspace' }, { label: 'Reports', href: '/aiim/workspace/reports' }, { label: r.reference }, { label: 'Report Delivery' }]}
            heading={<>Report Delivery {delivered ? <CheckCircle2 className="size-7 text-verified-500" /> : <Clock className="size-7 text-attested-500" />}</>}
            subtitle={delivered ? 'Your premium report is ready' : 'Your premium report is in production'}
            description={delivered ? 'Your report has been generated and is available for download.' : `Payment ${r.paid ? 'confirmed' : 'pending'}. Estimated delivery ${r.deliveryEstimate} from payment.`}
            accent={delivered ? 'green' : 'gold'}
            notice={delivered ? <div className="rounded-[8px] border border-verified-500/40 bg-verified-50 p-3 text-xs"><p className="font-semibold text-verified-700">Delivered</p><p>Delivered On: {r.deliveredAt}</p><p>Delivered To: {r.delivery?.email}</p></div> : true}
            rail={<><SelectionBox /><DeeperBox /></>}
        >
            {!delivered && <SectionCard className="mb-4"><Stepper steps={['Configure', 'Quote', 'Production', 'Delivery']} current={stage} /></SectionCard>}
            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <SectionCard>
                    <ReportCard r={r} badge={delivered ? 'Completed' : 'In Production'} />
                    {delivered && r.delivery?.size && <p className="mt-2 text-xs text-ink-500">File Size: {r.delivery.size}</p>}
                    <div className="mt-4 grid gap-2 sm:grid-cols-4">
                        <Button type="button" variant="outline" disabled={!delivered} onClick={() => window.print()}><Eye className="size-4" />Preview Report</Button>
                        <Button type="button" disabled={!delivered} onClick={() => window.print()}><Download className="size-4" />Download PDF</Button>
                        <Button type="button" disabled={!delivered}><FileSpreadsheet className="size-4" />Download Excel</Button>
                        <Button type="button" disabled={!delivered}><FileArchive className="size-4" />Download All (ZIP)</Button>
                    </div>
                </SectionCard>
                <SectionCard title="Report Summary">
                    <dl className="space-y-1.5 text-sm">{[['Report ID', r.reference], ['Quote ID', r.quoteReference], ['Fee Code', r.typeCode], ['Order', r.orderReference ?? '—'], ['Payment Status', r.paid ? 'Paid' : 'Pending'], ['Amount Paid', `${zar2(r.total)} incl. VAT`]].map(([k, v]) => <div key={k} className="flex justify-between gap-2"><dt className="text-ink-500">{k}</dt><dd className="font-medium">{v}</dd></div>)}</dl>
                    <p className="mt-3 flex gap-1.5 rounded bg-controlled-50 p-2 text-xs text-controlled-700"><Info className="size-4 shrink-0" />This report is generated using verified sources, human-reviewed intelligence and TBCA methodology. For terms of use, data policy and limitations, refer to the report documentation.</p>
                </SectionCard>
            </div>
            <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
                <SectionCard title="What's Included"><ul className="grid gap-1 text-xs sm:grid-cols-2">{r.modules.map((m) => <li key={m} className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />{m}</li>)}<li className="flex gap-1.5"><CheckCircle2 className="size-3.5 text-verified-500" />Appendices and data references</li></ul></SectionCard>
                <SectionCard title="Next Steps">
                    <ul className="space-y-1 text-sm">{[['Explore related opportunities', '/aiim/opportunities'], ['Compare with other regions', '/aiim/workspace/compare'], ['Request human advisor call', '/aiim/workspace/advisor-request'], ['Order another report', '/aiim/store']].map(([l, h]) => <li key={h}><Link href={h} className="flex items-center justify-between rounded p-1.5 hover:bg-parchment-200">{l}<ChevronRight className="size-4" /></Link></li>)}</ul>
                </SectionCard>
            </div>
        </AiimPage>
    );
}
