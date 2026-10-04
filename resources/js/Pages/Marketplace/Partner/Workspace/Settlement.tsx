import { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import { CircleCheck, Download, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/Components/ui/Button';
import { StatusPill, Tabs } from '@/Components/ui/Kit';
import { PartnerShell } from '@/Components/Marketplace/Shells';
import { Card, CodeChip, Donut, InfoRows } from '@/Components/Marketplace/ui';
import { money } from '@/Components/Marketplace/PartnerKit';
import type { MkPartnerRequest } from '@/types/marketplace';

export default function Settlement({ request: r }: { request: MkPartnerRequest }) {
    const s = r.meta.settlement;
    const [tab, setTab] = useState('overview');
    const total = s.p + s.t;
    const vat = s.p_vat + s.t_vat;
    const csv = () => {
        const rows = [['Description', 'Type', 'Excl VAT', 'VAT', 'Incl VAT', 'Recipient'], ['Professional Fee (P)', 'Fee to Professional', s.p, s.p_vat, s.p + s.p_vat, r.partner?.name], ['TBCA Coordination Fee (M1)', 'TBCA Fee', s.t, s.t_vat, s.t + s.t_vat, 'The Business Clinic.Africa (Pty) Ltd']];
        const blob = new Blob([rows.map((x) => x.join(',')).join('\n')], { type: 'text/csv' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${s.reference}.csv`;
        a.click();
    };

    return (
        <PartnerShell crumbs={[{ label: 'Partner Dashboard', href: '/partner-services/workspace' }, { label: `Opportunity ${r.reference}` }, { label: 'Fee Settlement & Statement' }]}
            title={<span className="flex items-center gap-3">Fee Settlement &amp; Statement <CodeChip code="PS-023" /></span>} description="View fee breakdowns, settlement status and access your tax invoices and statements."
            actions={<div className="text-right text-xs text-ink-500">Opportunity Reference<p className="font-serif text-xl font-bold text-ink-900">{r.reference}</p><StatusPill status="Completed" tone="good" /></div>}>
            <Head title={`Fee Settlement – ${r.reference}`} />
            <Tabs value={tab} onChange={setTab} tabs={[{ key: 'overview', label: 'Settlement Overview' }, { key: 'split', label: 'Fee Breakdown (T/P)' }, { key: 'invoices', label: 'Invoices & Documents' }, { key: 'history', label: 'Payment History' }]} />
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-6">
                {[['Total Professional Fee (P)', money(s.p), 'Excl. VAT'], ['TBCA Coordination Fee (M1)', money(s.t), `Excl. VAT (${Math.round((s.t / total) * 100)}%)`], ['VAT (15%)', money(vat), ''], ['Total Paid to Date', money(total + vat), 'Incl. VAT'], ['Balance', money(0), 'No outstanding amount']].map(([k, v, c]) => <div key={k} className="rounded-[8px] border border-parchment-400 bg-white p-3"><p className="text-xs text-ink-500">{k}</p><p className="text-lg font-bold">{v}</p><p className="text-[0.6875rem] text-ink-400">{c}</p></div>)}
                <div className="rounded-[8px] border border-parchment-400 bg-white p-3"><p className="text-xs text-ink-500">Settlement Status</p><p className="flex items-center gap-1 text-lg font-bold text-verified-700"><CircleCheck className="size-5" aria-hidden="true" />{s.status}</p><p className="text-[0.6875rem] text-ink-400">{s.tax_point}</p></div>
            </div>
            <div className="mt-5 grid gap-5 xl:grid-cols-12">
                <div className="space-y-5 xl:col-span-8">
                    <div className="grid gap-5 md:grid-cols-2">
                        <Card title="A. Settlement Summary"><InfoRows dense rows={[['Arrangement', r.arrangement], ['Fee Mechanism', r.feeMechanism], ['Professional Partner', r.partner?.name], ['Profession', r.resolution.profession], ['Jurisdiction', r.intake.jurisdiction], ['Service', r.title], ['Client', r.clientName], ['Tax Point', s.tax_point], ['Payment Method', s.method], ['Settlement Reference', s.reference]]} /></Card>
                        <Card title="B. Fee Split (T/P)"><Donut items={[{ label: 'Professional Fee (P)', value: s.p }, { label: 'TBCA Coordination Fee (T)', value: s.t }]} total={money(total)} label="Fee split" /><p className="mt-3 rounded bg-parchment-200 p-2 text-xs text-ink-600">Amounts exclude VAT. VAT is added to the client invoice.</p></Card>
                    </div>
                    <Card title="C. Line Item Breakdown">
                        <div className="overflow-x-auto"><table className="w-full min-w-[620px] text-[0.8125rem]">
                            <thead className="text-xs text-ink-500"><tr>{['Description', 'Type', 'Amount (Excl. VAT)', 'VAT (15%)', 'Amount (Incl. VAT)', 'Recipient', 'Status'].map((h) => <th key={h} scope="col" className="pb-2 text-left font-medium">{h}</th>)}</tr></thead>
                            <tbody className="divide-y divide-parchment-300">
                                <tr><td className="py-2">Professional Fee (P)</td><td>Fee to Professional</td><td>{money(s.p)}</td><td>{money(s.p_vat)}</td><td>{money(s.p + s.p_vat)}</td><td>{r.partner?.name}</td><td><StatusPill status="Paid" /></td></tr>
                                <tr><td className="py-2">TBCA Coordination Fee (M1)</td><td>TBCA Fee</td><td>{money(s.t)}</td><td>{money(s.t_vat)}</td><td>{money(s.t + s.t_vat)}</td><td>The Business Clinic.Africa (Pty) Ltd</td><td><StatusPill status="Paid" /></td></tr>
                                <tr className="bg-gold-50 font-bold"><td className="py-2">TOTAL</td><td /><td>{money(total)}</td><td>{money(vat)}</td><td>{money(total + vat)}</td><td /><td /></tr>
                            </tbody>
                        </table></div>
                        <Button type="button" variant="outline" size="sm" className="mt-3" onClick={() => window.print()}><Download className="size-4" aria-hidden="true" />Download Settlement Statement (PDF)</Button>
                    </Card>
                </div>
                <aside className="space-y-4 xl:col-span-4">
                    <Card title="D. Invoice Summary"><InfoRows dense rows={[['Invoice Number', s.invoice], ['Invoice Date', s.tax_point], ['Invoice Total (Incl. VAT)', money(total + vat)], ['Status', <StatusPill key="s" status="Paid" />]]} /></Card>
                    <Card tone="green" title="E. Payment Confirmation"><InfoRows dense rows={[['Payment Date', s.paid_on], ['Amount Paid', money(total + vat)], ['Method', s.method], ['Reference', s.payment_ref], ['Payer', r.clientName]]} /><p className="mt-2 text-center"><StatusPill status="Payment Successful" tone="good" /></p></Card>
                    <Card tone="blue" title="F. Notes"><p className="text-xs text-ink-700">All fees are charged in ZAR. This statement reflects the final settlement for the above opportunity. Retain this statement for your tax and audit records.</p></Card>
                </aside>
            </div>
            <div className="mt-5 flex flex-wrap justify-between gap-3">
                <Link href="/partner-services/workspace" className="inline-flex h-11 items-center rounded-[4px] border border-ink-300 bg-white px-5 text-sm">← Back to Opportunity</Link>
                <div className="flex gap-3"><Button type="button" variant="outline" onClick={csv}><FileSpreadsheet className="size-4" aria-hidden="true" />Export Statement (CSV)</Button><Link href="/partner-services/workspace" className="inline-flex h-11 items-center rounded-[4px] bg-gold-500 px-5 text-sm font-semibold text-ink-900">Return to Dashboard →</Link></div>
            </div>
        </PartnerShell>
    );
}

Settlement.layout = null;
