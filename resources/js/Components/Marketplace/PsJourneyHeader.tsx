import type { ReactNode } from 'react';
import Breadcrumbs from '@/Components/ui/Breadcrumbs';
import type { MkPartnerRequest } from '@/types/marketplace';
import { CodeChip, RefCard, Responsibility } from './ui';
import { PsJourney } from './PartnerKit';

/** Header used by PS-011..PS-014: code chip, title, journey stepper, responsibility box and reference card. */
export default function PsJourneyHeader({ request: r, journey, code, title, lead, crumb, step, responsibility, refRows }: {
    request: MkPartnerRequest;
    journey: string[];
    code: string;
    title: string;
    lead: ReactNode;
    crumb: string;
    step: number;
    responsibility: ReactNode;
    refRows?: [ReactNode, ReactNode][];
}) {
    return (
        <>
            <Breadcrumbs items={[{ label: 'Partner Services', href: '/partner-services' }, { label: 'My Requests', href: '/partner-services/requests' }, { label: r.reference }, { label: crumb }]} />
            <div className="grid gap-5 lg:grid-cols-12">
                <div className="lg:col-span-6">
                    <CodeChip code={code} />
                    <h1 className="mt-2 font-serif text-4xl font-bold text-ink-900">{title}</h1>
                    <div className="mt-1 text-ink-600">{lead}</div>
                    <PsJourney journey={journey} step={step} className="mt-5" />
                </div>
                <div className="lg:col-span-3"><Responsibility>{responsibility}</Responsibility></div>
                <div className="lg:col-span-3">
                    <RefCard reference={r.reference} rows={refRows ?? [['Requested On', r.requestedOn], ['Requested By', r.clientName], ['Service Category', r.listing?.title ?? r.title], ['Profession', r.resolution.profession ?? r.intake.profession], ['Jurisdiction (Matter)', r.resolution.matter_jurisdiction ?? r.intake.jurisdiction]]} />
                </div>
            </div>
        </>
    );
}
