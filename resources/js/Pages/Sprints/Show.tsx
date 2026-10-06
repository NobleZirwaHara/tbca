import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import GenericSprint, { type GenericSprintProps } from '@/Components/Sprints/GenericSprint';
import type { SprintRecord } from '@/types';

/**
 * Sprint detail dispatcher.
 *
 * Type templates live in ./Types/{type}.tsx (built by the type-template sections).
 * When one exists for sprint.type it renders the whole page body; otherwise the
 * generic sprint template from the Explore Sprints journey is used.
 *
 * Templates are loaded on demand: importing all 18 eagerly made the first sprint
 * visit download ~95 chunks before anything rendered.
 */
type TypeTemplate = ComponentType<{ sprint: SprintRecord; related: SprintRecord[] }>;

const loaders = import.meta.glob<{ default: TypeTemplate }>('./Types/*.tsx');
const templates: Record<string, LazyExoticComponent<TypeTemplate>> = {};

function templateFor(type: string): LazyExoticComponent<TypeTemplate> | null {
    const key = `./Types/${type}.tsx`;
    const load = loaders[key];
    if (!load) return null;
    templates[key] ??= lazy(load);
    return templates[key];
}

function Loading() {
    return (
        <div className="min-h-[70vh] bg-parchment-100" aria-busy="true">
            <div className="h-64 animate-pulse bg-ink-950" />
        </div>
    );
}

export default function Show(props: GenericSprintProps) {
    const TypeComponent = templateFor(props.sprint.type);

    if (TypeComponent) {
        return (
            <Suspense fallback={<Loading />}>
                <TypeComponent sprint={props.sprint} related={props.related} />
            </Suspense>
        );
    }

    return <GenericSprint key={props.sprint.slug} {...props} />;
}
