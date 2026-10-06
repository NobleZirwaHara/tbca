import CoverArt from '@/Components/Art/CoverArt';

/** Brief category -> shared CoverArt colour family, so each brief type reads as one set. */
const FAMILY: Record<string, string> = {
    'Investment Climate': 'business-management',
    Sectors: 'research-reports',
    Provinces: 'project-advisory',
    Countries: 'project-advisory',
    'Data Packs': 'data-dashboards',
    Projects: 'data-dashboards',
    'Markets & Trade': 'templates-toolkits',
    Infrastructure: 'technology',
    'Regulatory & Policy': 'subscriptions-retainers',
    'Risk & Outlook': 'due-diligence',
    'Custom Report': 'ai-automation',
};

/**
 * Cover picture for a premium brief: the generated CoverArt placeholder (deterministic
 * per SKU), or a real HD image when `src` is set — swapping in final art is a data change.
 */
export default function BriefArt({ seed, category, label, src, className }: { seed: string; category?: string | null; label?: string; src?: string | null; className?: string }) {
    const real = src && (src.startsWith('/') || src.startsWith('http')) ? src : null;
    return <CoverArt seed={seed} category={FAMILY[category ?? ''] ?? 'research-reports'} label={label} src={real} className={className} />;
}
