import { usePage } from '@inertiajs/react';
import { useState } from 'react';
import AiimPage from '@/Components/Aiim/Shell';
import { Banner } from '@/Components/Aiim/ProtoDesk';
import { B, Card, Chip, Dl, N, STable } from '@/Components/Industries/Kit';
import type { SharedProps } from '@/types';
import type { AiimPageProps } from '@/types/aiim';

interface Stored { saved: number; watchlist: number; comparisons: number; manifest: number; ledger: number; reports: number }
interface Item { type: string; name: string; related: string; archived: string; retain: string; size: string; status: string }

/**
 * AIIM mock 76: Archive and Deletion (prototype #archive). Shows what the account holds and the
 * two-step delete confirmation. Deletion is not performed online: confirming explains how to send
 * the request, and nothing is removed.
 */
export default function Archive({ stored, items }: AiimPageProps & { stored: Stored; items: Item[] }) {
    const { contact } = usePage<SharedProps>().props;
    const [step, setStep] = useState<0 | 1 | 2>(0);
    const mail = `mailto:${contact.email}?subject=${encodeURIComponent('AIIM data deletion request')}`;
    return (
        <AiimPage
            title="Archive and Deletion"
            crumbs={[{ label: 'Archive and Deletion' }]}
            subtitle="Page 76 · Your data, your control"
            notice={false}
            rail={<Card title="Retention"><p className="text-[0.84rem] text-ink-700">POPIA and Botswana Data Protection Act aligned. Engagement records are archived for the statutory period; personal data is deleted on request.</p></Card>}
        >
            <div className="grid gap-4">
                <Card title="Stored in your account">
                    <Dl rows={[
                        ['Saved items', N(stored.saved)], ['Watchlist', N(stored.watchlist)], ['Comparisons', N(stored.comparisons)],
                        ['Manifest lines', N(stored.manifest)], ['Ledger entries', N(stored.ledger)], ['Reports', N(stored.reports)],
                    ]} />
                </Card>
                <Card>
                    {step === 0 && (
                        <>
                            <h3 className="text-[0.95rem] font-semibold text-ink-900">Delete everything</h3>
                            <p className="mt-1 text-[0.84rem] text-ink-500">Removes all your AIIM data: saved items, watchlist, comparisons, manifest, ledger and reports. This cannot be undone.</p>
                            <B className="mt-3" onClick={() => setStep(1)}>Delete my data…</B>
                        </>
                    )}
                    {step === 1 && (
                        <>
                            <h3 className="text-[0.95rem] font-semibold text-ink-900">Are you sure?</h3>
                            <p className="mt-1 text-[0.84rem] text-ink-700">All saved items, watchlist, manifest, ledger and reports will be removed.</p>
                            <div className="mt-3 flex gap-2"><B v="pri" onClick={() => setStep(2)}>Yes, delete</B><B onClick={() => setStep(0)}>Cancel</B></div>
                        </>
                    )}
                    {step === 2 && (
                        <div role="status">
                            <h3 className="text-[0.95rem] font-semibold text-ink-900">Online deletion is not available yet</h3>
                            <div className="mt-2"><Banner>Nothing has been deleted. Send your deletion request to <a href={mail} className="font-semibold text-controlled-700 hover:underline">{contact.email}</a> and TBCA will process it under POPIA and the Botswana Data Protection Act.</Banner></div>
                            <div className="mt-3 flex gap-2"><a href={mail} className="inline-flex min-h-[36px] items-center rounded-[4px] border border-gold-500 bg-gold-500 px-3.5 text-[0.8rem] font-semibold text-ink-900 hover:bg-gold-400">Email deletion request</a><B onClick={() => setStep(0)}>Back</B></div>
                        </div>
                    )}
                </Card>
                {items.length > 0 && (
                    <Card title="Archived records">
                        <STable compact head={['Type', 'Item', 'Related', 'Archived on', 'Retain until', 'Size', 'Status']} rows={items.map((i) => [i.type, i.name, i.related, i.archived, i.retain, i.size, <Chip key="s" t={i.status.replace('_', ' ')} tone={i.status === 'archived' ? 'ok' : 'warn'} />])} />
                    </Card>
                )}
            </div>
        </AiimPage>
    );
}
