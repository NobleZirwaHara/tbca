import Wordmark from '@/Components/Art/Wordmark';
import type { PublicInstitution } from '@/types/about';

/** Institution wordmark (typographic, see Components/Art/Wordmark; approved asset IDs replace this in production). */
export default function InstitutionMark({ inst, size = 'md' }: { inst: Pick<PublicInstitution, 'acronym' | 'color'> & { slug?: string }; size?: 'md' | 'lg' }) {
    return <Wordmark id={inst.slug} label={inst.acronym} color={inst.color} size={size} />;
}
