import { Head, Link } from '@inertiajs/react';
import { Briefcase } from 'lucide-react';
import { IndustriesSubNav } from '@/Components/Insights/Industries';
import { TrustStrip } from '@/Components/Insights/Shared';

export default function WorkspaceEmpty() {
    return (
        <>
            <Head title="Industry Workspace" />
            <IndustriesSubNav />
            <div className="bg-parchment-100">
                <div className="container-tbca py-16 text-center">
                    <Briefcase className="mx-auto size-12 text-gold-600" />
                    <h1 className="mt-4 font-serif text-3xl font-bold text-ink-900">Industry Workspace</h1>
                    <p className="mx-auto mt-2 max-w-lg text-sm text-ink-600">You have no Industry engagements yet. Select your industry, review a sector service and acknowledge its scope and add-ons to open an engagement workspace.</p>
                    <div className="mt-6 flex justify-center gap-3">
                        <Link href="/industries/select" className="rounded-[4px] bg-gold-500 px-5 py-2.5 text-sm font-semibold text-ink-900">Select Industry</Link>
                        <Link href="/industries/agriculture-agro-industry/services/agriculture-export-readiness-diagnostic" className="rounded-[4px] border border-ink-300 px-5 py-2.5 text-sm font-semibold">Browse a sector service</Link>
                    </div>
                </div>
            </div>
            <TrustStrip variant="industries" />
        </>
    );
}
