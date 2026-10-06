import type { ReactNode } from 'react';
import {
    BadgeCheck, BarChart3, Calculator, CircleDot, ClipboardCheck, Clock, FileCheck, FileText, Files, Handshake, Leaf, Lock, MapPin, PenLine,
    Scale, Settings, ShieldCheck, Sprout, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Stepper } from '@/Components/ui/Kit';
import { cn } from '@/lib/cn';
import type { MkPartnerRequest } from '@/types/marketplace';
import { RefCard } from './ui';

const icons: Record<string, LucideIcon> = {
    scale: Scale,
    'file-check': FileCheck,
    calculator: Calculator,
    leaf: Leaf,
    sprout: Sprout,
    settings: Settings,
    'bar-chart-3': BarChart3,
    'shield-check': ShieldCheck,
    'badge-check': BadgeCheck,
    'file-text': FileText,
    files: Files,
    'map-pin': MapPin,
    clock: Clock,
    'pen-line': PenLine,
    'clipboard-check': ClipboardCheck,
    users: Users,
    handshake: Handshake,
    lock: Lock,
};

export function PIcon({ name, className }: { name: string; className?: string }) {
    const I = icons[name] ?? CircleDot;
    return <I className={cn('size-5', className)} aria-hidden="true" />;
}

/** Journey stepper for the Partner Services matter (9 stages). */
export function PsJourney({ journey, step, className }: { journey: string[]; step: number; className?: string }) {
    return (
        <div className={cn('overflow-x-auto pb-1', className)}>
            <div className="min-w-[680px]">
                <Stepper steps={journey} current={step} />
            </div>
        </div>
    );
}

export function RequestRef({ request, extra = [] }: { request: MkPartnerRequest; extra?: [ReactNode, ReactNode][] }) {
    return (
        <RefCard
            reference={request.reference}
            rows={[
                ['Requested On', request.requestedOn],
                ['Requested By', request.clientName],
                ['Service Category', request.listing?.title ?? request.title],
                ['Primary Profession', request.resolution?.profession ?? request.intake?.profession],
                ['Jurisdiction (Matter)', request.intake?.jurisdiction ?? 'South Africa'],
                ...extra,
            ]}
        />
    );
}

/** Parchment page body for partner journey pages. */
export function PsBody({ children, className }: { children: ReactNode; className?: string }) {
    return <div className={cn('bg-parchment-100 py-8 md:py-10', className)}><div className="container-tbca space-y-6">{children}</div></div>;
}

export const TRUST_CHIPS = ['Africa Market (Active)', '7 Languages', 'ZAR (Source) & 5 Currencies', 'Human-Reviewed Expertise', 'POPIA Ready · Confidential', 'Conflict Checked Engagements'];

export const money = (n: number | null | undefined) => `R ${Number(n ?? 0).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).replace(/,/g, ' ')}`;
