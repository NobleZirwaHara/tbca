import { Link } from '@inertiajs/react';
import { MessageCircle } from 'lucide-react';
import type { ReactNode } from 'react';
import Breadcrumbs, { type Crumb } from '@/Components/ui/Breadcrumbs';
import { openAskQuestion } from '@/Components/AskQuestion';
import { JourneySteps } from '@/Components/CorePages/Kit';
import type { HealthStep } from '@/types/core-pages';

/** Header shared by every Business Health Score screen. */
export function HealthHeader({
    crumbs,
    title = 'Business Health Score',
    subtitle,
    intro,
    steps,
    current,
    progress,
    stepLabel,
}: {
    crumbs: Crumb[];
    title?: string;
    subtitle: ReactNode;
    intro?: ReactNode;
    steps: string[];
    current: number;
    progress: number;
    stepLabel: string;
}) {
    return (
        <div className="grid gap-6 lg:grid-cols-12">
            <div className="lg:col-span-6">
                <Breadcrumbs items={crumbs} />
                <h1 className="font-serif text-[2rem] leading-tight font-semibold text-ink-900 md:text-[2.5rem]">{title}</h1>
                <p className="mt-2 font-serif text-[1.25rem] font-semibold text-gold-600">{subtitle}</p>
                {intro && <p className="mt-2 max-w-xl text-[0.875rem] leading-relaxed text-ink-600">{intro}</p>}
            </div>
            <div className="lg:col-span-6">
                <div className="flex items-center justify-between text-[0.8125rem]">
                    <span className="font-semibold text-ink-900">{stepLabel}</span>
                    <span className="font-semibold text-gold-700">{progress}% Complete</span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-parchment-400" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label="Diagnostic progress">
                    <div className="h-full rounded-full bg-gold-500" style={{ width: `${progress}%` }} />
                </div>
                <JourneySteps steps={steps} current={current} className="mt-4" />
            </div>
        </div>
    );
}

export function AssistanceBox() {
    return (
        <div className="mt-5 rounded-[8px] border border-gold-600/60 p-4">
            <p className="text-[0.875rem] font-semibold text-gold-400">Need assistance?</p>
            <p className="mt-1 text-[0.75rem] text-parchment-200">Chat with NATASHA or contact us over WhatsApp.</p>
            <button type="button" onClick={() => openAskQuestion({ subject: 'Business Health Score help', section: 'core' })} className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-gold-500 text-[0.8125rem] text-gold-300 hover:bg-gold-500 hover:text-ink-900">
                <MessageCircle className="size-4" aria-hidden="true" /> Chat with NATASHA
            </button>
            <a href="https://wa.me/27608011365" target="_blank" rel="noreferrer" className="mt-2 inline-flex h-9 w-full items-center justify-center gap-2 rounded-[4px] border border-parchment-200/40 text-[0.8125rem] text-parchment-100 hover:border-verified-500">
                Message us on WhatsApp
            </a>
        </div>
    );
}

export const stepLabels = (steps: HealthStep[]) => steps.map((s) => s.label);

export function SignInPrompt() {
    return (
        <div className="mt-5 border-t border-ink-800 pt-4 text-center">
            <p className="text-[0.8125rem] text-parchment-200">Already a TBCA client?</p>
            <Link href="/login" className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-[4px] border border-gold-500 text-[0.875rem] font-semibold text-gold-400 hover:bg-gold-500 hover:text-ink-900">
                Sign In and Continue
            </Link>
        </div>
    );
}
