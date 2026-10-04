import AiimPage, { SectionCard } from '@/Components/Aiim/Shell';
import { ButtonLink } from '@/Components/ui/Button';
import type { AiimPageProps } from '@/types/aiim';

/** Controlled availability state for countries not yet activated (GAP-002 / GAP-060). */
export default function CountryInactive({ country }: AiimPageProps & { country: string }) {
    return (
        <AiimPage title={`${country} — Coming Soon`} crumbs={[{ label: country }]} subtitle="Country pack not yet activated" rail={false}>
            <SectionCard>
                <p className="text-sm text-ink-700">
                    AIIM uses one canonical data model for all 54 African countries, but only <strong>South Africa</strong> is an active, verified Phase 1 country pack.
                    {` ${country}`} intelligence will be published once its country pack passes source verification and the activation gate. No intelligence or fees are offered for this country yet.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                    <ButtonLink href="/aiim/country/south-africa" trailingIcon="arrow-right">Explore South Africa</ButtonLink>
                    <ButtonLink href="/aiim/custom-intelligence" variant="outline">Request Custom Intelligence</ButtonLink>
                </div>
            </SectionCard>
        </AiimPage>
    );
}
