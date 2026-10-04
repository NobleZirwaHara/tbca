import type { ReactNode } from 'react';
import type { ShellTab } from './SprintShell';

export type SectionKey =
    | 'overview'
    | 'included'
    | 'process'
    | 'deliverables'
    | 'requirements'
    | 'faqs'
    | 'support'
    | 'limitations'
    | 'rights'
    | 'controls'
    | 'assets';

const MATCHERS: [RegExp, SectionKey][] = [
    [/overview/i, 'overview'],
    [/included/i, 'included'],
    [/process|how it works|journey|flow|agenda/i, 'process'],
    [/deliverable/i, 'deliverables'],
    [/requirement|inputs?$|what we need/i, 'requirements'],
    [/faq/i, 'faqs'],
    [/support/i, 'support'],
    [/limitation|exclusion|not included/i, 'limitations'],
    [/rights|usage|licen/i, 'rights'],
    [/control/i, 'controls'],
    [/asset|preview|content/i, 'assets'],
];

export function sectionKey(label: string): SectionKey | null {
    return MATCHERS.find(([re]) => re.test(label))?.[1] ?? null;
}

/** Maps the mockup's tab labels onto the template's section renderers (unknown labels fall back to overview). */
export function buildTabs(labels: string[] | undefined, fallback: string[], sections: Partial<Record<SectionKey, ReactNode>>): ShellTab[] {
    const list = labels?.length ? labels : fallback;
    return list.map((label) => {
        const key = sectionKey(label);
        return { label, content: (key && sections[key]) ?? sections.overview };
    });
}
