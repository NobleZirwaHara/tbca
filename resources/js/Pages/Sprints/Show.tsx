import type { ComponentType } from 'react';
import GenericSprint, { type GenericSprintProps } from '@/Components/Sprints/GenericSprint';
import type { SprintRecord } from '@/types';

/**
 * Sprint detail dispatcher.
 *
 * Type templates live in ./Types/{type}.tsx (built by the type-template sections).
 * When one exists for sprint.type it renders the whole page body; otherwise the
 * generic sprint template from the Explore Sprints journey is used.
 */
type TypeTemplate = ComponentType<{ sprint: SprintRecord; related: SprintRecord[] }>;

const types = import.meta.glob('./Types/*.tsx', { eager: true }) as Record<string, { default?: TypeTemplate }>;

export default function Show(props: GenericSprintProps) {
    const TypeComponent = types[`./Types/${props.sprint.type}.tsx`]?.default;

    if (TypeComponent) {
        return <TypeComponent sprint={props.sprint} related={props.related} />;
    }

    return <GenericSprint key={props.sprint.slug} {...props} />;
}
