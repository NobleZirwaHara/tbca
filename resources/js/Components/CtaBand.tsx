import { ButtonLink } from '@/Components/ui/Button';
import { useT } from '@/lib/i18n';

interface CtaBandProps {
    title: string;
    body?: string;
    primary: { label: string; href: string };
    secondary?: { label: string; href: string };
}

/** Dark closing band used at the foot of every route page. */
export default function CtaBand({ title, body, primary, secondary }: CtaBandProps) {
    const t = useT();

    return (
        <section className="bg-parchment-200 pb-14 md:pb-20">
            <div className="container-tbca">
                <div className="relative overflow-hidden rounded-[8px] bg-ink-900 px-6 py-10 md:px-12 md:py-12">
                    <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />

                    <div className="relative flex flex-col items-start justify-between gap-7 lg:flex-row lg:items-center">
                        <div className="max-w-2xl">
                            <h2 className="font-serif text-[1.625rem] leading-tight font-semibold tracking-[-0.015em] text-parchment-100 md:text-[2rem]">
                                {t(title)}
                            </h2>
                            {body && (
                                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-ink-200">{t(body)}</p>
                            )}
                        </div>

                        <div className="flex shrink-0 flex-wrap gap-3">
                            <ButtonLink href={primary.href} variant="gold" size="lg" trailingIcon="arrow-right">
                                {t(primary.label)}
                            </ButtonLink>
                            {secondary && (
                                <ButtonLink href={secondary.href} variant="outline-light" size="lg">
                                    {t(secondary.label)}
                                </ButtonLink>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
