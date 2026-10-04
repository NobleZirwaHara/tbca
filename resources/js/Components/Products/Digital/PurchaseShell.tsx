import type { ReactNode } from 'react';
import { Head } from '@inertiajs/react';
import { Calendar, FileText, Globe, KeyRound, Languages, RefreshCw } from 'lucide-react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { DpCover, ErrorList, FLOW_TRUST, Meta, PurchaseStepper, TrustBand } from './Ui';
import type { DpProductDetail } from './types';

/** Page frame for purchase steps 1–6: crumbs, title, product strip, stepper, trust band. */
export default function PurchaseShell({
    product,
    title,
    lead,
    crumbs,
    step,
    meta,
    aside,
    children,
}: {
    product: DpProductDetail;
    title: string;
    lead: ReactNode;
    crumbs: Crumb[];
    step: number;
    meta?: { label: string; value: ReactNode }[];
    aside?: ReactNode;
    children: ReactNode;
}) {
    const icons = [KeyRound, Globe, RefreshCw, Calendar, FileText, Languages];
    const items = meta ?? [
        { label: 'Version', value: product.currentVersion?.display ?? '—' },
        { label: 'Jurisdiction', value: product.jurisdiction },
        { label: 'Language', value: product.languages.join(', ') },
        { label: 'Format', value: product.formats.join(', ') },
    ];

    return (
        <>
            <Head title={`${title} | ${product.name}`} />
            <div className="container-tbca space-y-5 py-6">
                <Breadcrumbs items={crumbs} />
                <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
                    <div className="flex flex-wrap gap-5">
                        <DpCover name={product.name} type={product.typeLabel} tone={product.tone} className="w-40 shrink-0 sm:w-48" />
                        <div className="min-w-0 flex-1">
                            <h1 className="font-serif text-2xl font-semibold text-ink-900 sm:text-3xl">{title}</h1>
                            <p className="mt-1 text-sm text-ink-600">{lead}</p>
                            <p className="mt-3 text-sm font-semibold text-ink-900">{product.name}</p>
                            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
                                {items.map((m, i) => (
                                    <Meta key={m.label} icon={icons[i % icons.length]} label={m.label} value={m.value} />
                                ))}
                            </div>
                        </div>
                    </div>
                    {aside}
                </div>
                <PurchaseStepper current={step} />
                <ErrorList />
                {children}
                <TrustBand items={FLOW_TRUST} />
            </div>
        </>
    );
}
