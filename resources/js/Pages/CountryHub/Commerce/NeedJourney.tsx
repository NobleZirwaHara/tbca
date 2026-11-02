/* Commercial journey step without an engagement for this country (prototype needJourney). */
import { NeedJourney as Panel, type JourneyState } from '@/Components/CountryHub/Journey';
import type { CountryBase } from '@/types/countryHub';

export default function NeedJourney({ base, pageKey, title, j }: { base: CountryBase; pageKey: string; title: string; j: JourneyState | null }) {
    return <Panel base={base} pageKey={pageKey} title={title} j={j} />;
}
