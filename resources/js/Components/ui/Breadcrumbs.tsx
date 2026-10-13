import { Link } from '@inertiajs/react';
import { ChevronRight } from 'lucide-react';
import { useT } from '@/lib/i18n';

export interface Crumb {
    label: string;
    href?: string;
}

export default function Breadcrumbs({ items }: { items: Crumb[] }) {
    const t = useT();

    return (
        <nav aria-label={t('Breadcrumb')} className="mb-6">
            <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-ink-400">
                {items.map((item, index) => {
                    const last = index === items.length - 1;

                    return (
                        <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                            {item.href && !last ? (
                                <Link
                                    href={item.href}
                                    className="transition-colors hover:text-ink-800"
                                >
                                    {t(item.label)}
                                </Link>
                            ) : (
                                <span className={last ? 'text-gold-700' : undefined} aria-current={last ? 'page' : undefined}>
                                    {t(item.label)}
                                </span>
                            )}
                            {!last && <ChevronRight className="size-3.5 text-parchment-500" aria-hidden="true" />}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
