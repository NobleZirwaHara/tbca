import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Building2, ExternalLink, Mail, MapPin } from 'lucide-react';
import { OfficesSection, PhoneLink, useOfficeCountry } from '@/Components/CorePages/ContactParts';
import { useT } from '@/lib/i18n';
import type { Office, OfficeRegion } from '@/types/core-pages';

interface Props {
    headOffice: Office;
    regions: OfficeRegion[];
    offices: Office[];
    generalEmail: string;
}

/** /contact/offices: every TBCA office, head office first, then country offices by region. */
export default function Offices({ headOffice, regions, offices, generalEmail }: Props) {
    const t = useT();

    return (
        <div className="bg-ink-950 text-parchment-200">
            <Head title={t('TBCA Offices')} />

            <section className="relative overflow-hidden">
                <div className="pointer-events-none absolute inset-0 motif-glow" aria-hidden="true" />
                <div className="container-tbca relative py-10 md:py-12">
                    <Link href="/contact" className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-gold-400 hover:text-gold-300">
                        <ArrowLeft className="size-3.5" aria-hidden="true" /> {t('Back to Contact')}
                    </Link>
                    <p className="mt-6 text-[0.75rem] font-semibold tracking-[0.16em] text-gold-500 uppercase">{t('Contact TBCA')}</p>
                    <h1 className="mt-2 text-[2.25rem] leading-[1.1] font-semibold text-parchment-100 md:text-[2.75rem]">{t('Head Office and Country Offices')}</h1>
                    <p className="mt-4 max-w-2xl text-[1rem] leading-relaxed text-parchment-200">
                        {t('TBCA is headquartered in Pretoria and works through :count country offices across Africa. Write to :email for any office without a direct line.', {
                            count: offices.length,
                            email: generalEmail,
                        })}
                    </p>

                    <div className="mt-8 grid gap-4 lg:grid-cols-3">
                        <OfficeDetail office={headOffice} label={t('Head Office')} highlight />
                    </div>

                    {regions.map((group) => (
                        <section key={group.region} className="mt-10" aria-labelledby={`region-${group.region}`}>
                            <h2 id={`region-${group.region}`} className="text-[1.25rem] font-semibold text-parchment-100">
                                {t(group.region)}
                            </h2>
                            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {group.offices.map((office) => (
                                    <li key={office.slug}>
                                        <OfficeDetail office={office} label={t('Country Office')} />
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            </section>

            <OfficesSection headOffice={headOffice} offices={offices} eyebrow={t('Map')} title={t('Find an Office on the Map')} />
        </div>
    );
}

function OfficeDetail({ office, label, highlight = false }: { office: Office; label: string; highlight?: boolean }) {
    const t = useT();
    const country = useOfficeCountry();

    return (
        <article className={`flex h-full flex-col rounded-[8px] border p-4 ${highlight ? 'border-gold-500 bg-ink-900' : 'border-gold-700/40 bg-ink-900/60'}`}>
            <p className="flex items-center gap-1.5 text-[0.6875rem] font-semibold tracking-[0.12em] text-gold-500 uppercase">
                {office.kind === 'head' ? <Building2 className="size-3.5" aria-hidden="true" /> : <MapPin className="size-3.5" aria-hidden="true" />}
                {label}
            </p>
            <h3 className="mt-2 text-[1rem] font-semibold text-parchment-100">
                {country(office)} · <bdi>{office.city}</bdi>
            </h3>
            <p className="mt-1.5 text-[0.8125rem] leading-snug text-ink-200">
                <span dir="ltr">{office.address}</span>
            </p>
            <div className="mt-auto space-y-1 pt-3 text-[0.8125rem]">
                {office.phone && <PhoneLink phone={office.phone} />}
                <a href={`mailto:${office.email}`} className="flex items-center gap-1.5 break-all text-parchment-100 hover:text-gold-300">
                    <Mail className="size-3.5 shrink-0 text-gold-500" aria-hidden="true" /> {office.email}
                </a>
                <a href={office.map_link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 font-semibold text-gold-300 hover:text-gold-200">
                    {t('Open in Google Maps')} <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
            </div>
        </article>
    );
}
