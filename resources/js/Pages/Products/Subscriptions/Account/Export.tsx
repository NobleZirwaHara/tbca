import { router } from '@inertiajs/react';
import { Download, FileArchive, FileSpreadsheet, FileText, History, Receipt } from 'lucide-react';
import { SimpleTable, StatusPill } from '@/Components/ui/Kit';
import { LabelValues, Notice } from '@/Components/Products/Shared';
import { AccountShell, HelpCard, PurpleButton } from '@/Components/Products/Subscriptions/Account';
import { Card, RecordHeader, SubStatus, fmtDate, zar } from '@/Components/Products/Subscriptions/ui';
import type { SubSubscription } from '@/Components/Products/Subscriptions/types';

interface Props {
    subscription: SubSubscription;
    types: { key: string; title: string; body: string; format: string; size: string; available: boolean }[];
    windowOpen: boolean;
    history: { export_type: string; file_type: string; status: string; size_label: string | null; requested_at: string }[];
    invoice: { reference: string; total_zar: number; created_at: string } | null;
}

const ICONS: Record<string, typeof FileText> = { activity: History, invoices: Receipt, reports: FileSpreadsheet, templates: FileArchive, usage: FileText };

export default function Export({ subscription: sub, types, windowOpen, history, invoice }: Props) {
    const base = `/subscriptions/account/${sub.reference}`;
    const until = sub.access_until;

    return (
        <AccountShell sub={sub} title="Export Your Data" crumb="Data Export">
            <RecordHeader icon={Download} title="Export Your Data" sub={sub} lead="Download or request the records you are entitled to keep before maintained access ends." />

            <Notice tone="warn" className="mb-5">
                Cancellation does not delete your historical records or acquired rights. You can continue to export and retain eligible data before maintained access ends. Your rights to historical records, downloaded content, invoices, and exports remain intact.
            </Notice>
            {!windowOpen && <Notice tone="info" className="mb-5" title="Maintained access has ended">Invoices and audit history remain downloadable. Other exports closed on {fmtDate(until)}.</Notice>}

            <div className="grid gap-5 xl:grid-cols-[1fr_300px]">
                <div className="min-w-0 space-y-5">
                    <Card title="1. Choose What You Want to Export">
                        <div className="grid gap-3 md:grid-cols-2">
                            {types.map((t) => {
                                const Icon = ICONS[t.key] ?? FileText;
                                return (
                                    <div key={t.key} className="flex gap-3 rounded-[8px] border border-parchment-400 p-4">
                                        <Icon className="mt-0.5 size-6 shrink-0 text-referenced-500" aria-hidden="true" />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-semibold text-ink-900">{t.title}</p>
                                            <p className="text-xs text-ink-500">{t.body}</p>
                                            <p className="mt-1 text-[0.6875rem] text-ink-500">
                                                Format: {t.format} · Est. size: {t.size}
                                            </p>
                                            <div className="mt-2 flex items-center justify-between gap-2">
                                                <StatusPill status={t.available ? 'Available' : 'Closed'} tone={t.available ? 'good' : 'neutral'} />
                                                {t.available ? (
                                                    <a href={`${base}/export/${t.key}`} className="inline-flex h-8 items-center gap-1 rounded-[4px] border border-parchment-500 px-3 text-xs font-semibold text-ink-800 hover:border-ink-900">
                                                        <Download className="size-3.5" aria-hidden="true" /> Download
                                                    </a>
                                                ) : (
                                                    <span className="text-xs text-ink-400">Window closed</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            <div className="flex gap-3 rounded-[8px] border border-controlled-500/30 bg-controlled-50 p-4">
                                <FileArchive className="mt-0.5 size-6 shrink-0 text-controlled-700" aria-hidden="true" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-ink-900">Account Data Request</p>
                                    <p className="text-xs text-ink-500">Request a comprehensive export of your data.</p>
                                    <p className="mt-1 text-[0.6875rem] text-ink-500">Format: ZIP (JSON) · Est. time 1–2 days</p>
                                    <div className="mt-2 flex items-center justify-between gap-2">
                                        <StatusPill status="Requestable" tone="info" />
                                        <button type="button" onClick={() => router.post(`${base}/export/request`, {}, { preserveScroll: true })} className="inline-flex h-8 items-center rounded-[4px] border border-controlled-500 px-3 text-xs font-semibold text-controlled-700">
                                            Request Export →
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <p className="mt-3 text-[0.6875rem] text-ink-500">Exports are prepared securely. Large requests are delivered to your registered email; links expire in 7 days.</p>
                    </Card>

                    <Card title="2. Recent Export Activity">
                        <SimpleTable
                            columns={['Export Type', 'File Type', 'Requested On', 'Status', 'Size']}
                            rows={history.map((h) => [h.export_type, h.file_type, new Date(h.requested_at).toLocaleString('en-ZA'), <StatusPill status={h.status} />, h.size_label ?? '—'])}
                            empty="No exports yet."
                        />
                    </Card>

                    <div className="grid gap-5 lg:grid-cols-2">
                        <Card title="3. What You Can Still Keep">
                            <LabelValues
                                rows={[
                                    { label: 'Future maintained access', value: <span className="text-risk-700">Ends on {fmtDate(until)}</span> },
                                    { label: 'Historical records', value: 'Remain available for export' },
                                    { label: 'Acquired versions / downloads', value: 'Stay yours' },
                                    { label: 'Export rights', value: `Before ${fmtDate(until)}` },
                                    { label: 'Retained evidence', value: 'Invoices, receipts and audit logs' },
                                ]}
                            />
                        </Card>
                        <Card title="4. Important Export Terms">
                            <ul className="list-disc space-y-1 pl-4 text-xs text-ink-700">
                                <li>Export requests must be initiated before {fmtDate(until)}, 23:59 SAST.</li>
                                <li>Data is provided in common formats such as CSV, JSON and ZIP.</li>
                                <li>Exports are delivered securely; links expire in 7 days.</li>
                                <li>We handle your data in accordance with our Privacy Policy and POPIA.</li>
                            </ul>
                        </Card>
                    </div>
                </div>

                <div className="space-y-4">
                    <Card title="Subscription Summary">
                        <LabelValues
                            rows={[
                                { label: 'Plan', value: sub.plan.name },
                                { label: 'Recurrence', value: `${sub.plan.recurrence_class} ${sub.plan.class_name}` },
                                { label: 'Status', value: <SubStatus status={sub.display_status} /> },
                                { label: 'Access until', value: <span className="text-risk-700">{fmtDate(until)}</span> },
                                ...(invoice ? [{ label: 'Last invoice', value: `${invoice.reference} · ${zar(invoice.total_zar)}` }] : []),
                            ]}
                        />
                        <div className="mt-3 flex flex-col gap-2">
                            <a href={`${base}/export/invoices`} className="inline-flex h-10 items-center justify-center rounded-[4px] bg-gold-500 text-sm font-semibold text-ink-900">Download Invoices</a>
                            <PurpleButton tone="outline" onClick={() => router.visit('/subscriptions/account')}>Go to My Subscriptions</PurpleButton>
                            {sub.display_status === 'REACTIVATABLE' && <PurpleButton tone="gold" onClick={() => router.visit(`${base}/reactivate`)}>Reactivate Subscription</PurpleButton>}
                        </div>
                    </Card>
                    <HelpCard sub={sub} title="Need Help With Your Export?" body="Our specialists can guide you on what to keep and how to export the right data securely." />
                </div>
            </div>
        </AccountShell>
    );
}

Export.layout = null;
