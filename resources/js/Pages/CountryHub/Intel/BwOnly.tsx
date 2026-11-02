/* Intelligence pages for countries without a loaded pack (prototype bwOnly()). */
import { CountryHead, CountryPage, NoPack, SprintShelf } from '@/Components/CountryHub/Layout';
import type { CountryBase, HubShelf } from '@/types/countryHub';

interface Props { base: CountryBase; pageKey: string; title: string; desc: string; shelf: HubShelf }

export default function BwOnly({ base, pageKey, title, desc, shelf }: Props) {
    return (
        <CountryPage base={base} pageKey={pageKey}>
            <CountryHead base={base} pageKey={pageKey} title={title} desc={desc || undefined} />
            <NoPack c={base.c} what={title} pageKey={pageKey} />
            <SprintShelf shelf={shelf} c={base.c} />
        </CountryPage>
    );
}
