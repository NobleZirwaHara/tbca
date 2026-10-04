import type { PublicInstitution } from '@/types/about';

/** Text wordmark for an institution (approved asset IDs replace this in production; no hotlinked logos). */
export default function InstitutionMark({ inst, size = 'md' }: { inst: Pick<PublicInstitution, 'acronym' | 'color'>; size?: 'md' | 'lg' }) {
    return (
        <span
            className={size === 'lg' ? 'font-serif text-[1.75rem] leading-none font-bold tracking-tight' : 'font-serif text-[1.25rem] leading-none font-bold tracking-tight'}
            style={{ color: inst.color ?? undefined }}
            aria-hidden="true"
        >
            {inst.acronym}
        </span>
    );
}
