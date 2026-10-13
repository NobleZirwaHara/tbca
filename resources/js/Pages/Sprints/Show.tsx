import { lazy, Suspense, type ComponentType, type LazyExoticComponent } from 'react';
import { Link } from '@inertiajs/react';
import GenericSprint, { type GenericSprintProps } from '@/Components/Sprints/GenericSprint';
import { cn } from '@/lib/cn';
import type { SprintRecord } from '@/types';
import type { AisleListing } from '@/types/shop';

/**
 * Sprint detail dispatcher.
 *
 * Type templates live in ./Types/{type}.tsx (built by the type-template sections).
 * When one exists for sprint.type it renders the whole page body; otherwise the
 * generic sprint template from the Explore Sprints journey is used. Sprints loaded
 * from the 7,008-row register without bespoke page content carry
 * attributes.template = "generic" and always use the generic template.
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

/** Online Shop aisles the Sprint appears in: its home aisle first, then the aisles it is also listed in. */
function ListedIn({ aisles }: { aisles: AisleListing[] }) {
    if (aisles.length === 0) return null;

    return (
        <nav aria-label="Online Shop aisles" className="border-b border-white/10 bg-ink-950 text-parchment-100">
            <div className="container-tbca flex flex-wrap items-center gap-x-2 gap-y-1.5 py-2 text-xs">
                <span className="font-semibold text-ink-300">Listed in:</span>
                {aisles.map((a) => (
                    <Link
                        key={a.slug}
                        href={`/shop/aisle/${a.slug}`}
                        title={a.home ? 'Home aisle' : undefined}
                        className={cn(
                            'rounded-full border px-2.5 py-0.5 font-medium hover:border-gold-400 hover:text-gold-300',
                            a.home ? 'border-gold-500 text-gold-400' : 'border-white/25 text-parchment-100',
                        )}
                    >
                        {a.name}
                    </Link>
                ))}
            </div>
        </nav>
    );
}

export default function Show(props: GenericSprintProps & { listedIn?: AisleListing[] }) {
    const { listedIn = [], ...rest } = props;
    const TypeComponent = props.sprint.attributes?.template === 'generic' ? null : templateFor(props.sprint.type);

    return (
        <>
            <ListedIn aisles={listedIn} />
            {TypeComponent ? (
                <Suspense fallback={<Loading />}>
                    <TypeComponent sprint={props.sprint} related={props.related} />
                </Suspense>
            ) : (
                <GenericSprint key={props.sprint.slug} {...rest} />
            )}
        </>
    );
}
