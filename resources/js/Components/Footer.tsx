import { Link, usePage } from '@inertiajs/react';
import { Mail, Phone } from 'lucide-react';
import Logo from './Logo';
import Icon from './ui/Icon';
import type { SharedProps } from '@/types';

const socials = [
    { label: 'LinkedIn', href: '#' },
    { label: 'Facebook', href: '#' },
    { label: 'YouTube', href: '#' },
    { label: 'Instagram', href: '#' },
];

export default function Footer() {
    const { nav, contact, brand, trustBadges } = usePage<SharedProps>().props;

    return (
        <footer className="bg-ink-950 text-parchment-200">
            <div className="container-tbca py-12 md:py-14">
                <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
                    <div className="lg:col-span-4">
                        <Logo variant="full" className="w-full max-w-[22rem]" />

                        <address className="mt-6 space-y-0.5 text-[0.8125rem] leading-relaxed text-ink-300 not-italic">
                            {contact.address_lines.map((line) => (
                                <p key={line}>{line}</p>
                            ))}
                        </address>

                        <div className="mt-4 space-y-2 text-[0.8125rem]">
                            <a
                                href={`tel:${contact.phone.replace(/\s/g, '')}`}
                                className="flex items-center gap-2 text-ink-300 transition-colors hover:text-gold-300"
                            >
                                <Phone className="size-3.5 text-gold-600" aria-hidden="true" />
                                {contact.phone}
                            </a>
                            <a
                                href={`mailto:${contact.email}`}
                                className="flex items-center gap-2 text-ink-300 transition-colors hover:text-gold-300"
                            >
                                <Mail className="size-3.5 text-gold-600" aria-hidden="true" />
                                {contact.email}
                            </a>
                        </div>
                    </div>

                    <div className="grid gap-8 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-5 lg:gap-6">
                        {Object.entries(nav.footer).map(([heading, links]) => (
                            <nav key={heading} aria-label={heading}>
                                <h2 className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-parchment-100">
                                    {heading}
                                </h2>
                                <ul className="mt-3.5 space-y-2">
                                    {links.map((link) => (
                                        <li key={`${heading}-${link.href}-${link.label}`}>
                                            <Link
                                                href={link.href}
                                                className="text-[0.8125rem] text-ink-300 transition-colors hover:text-gold-300"
                                            >
                                                {link.label}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-ink-800">
                <div className="container-tbca flex flex-col gap-6 py-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex flex-wrap items-center gap-3">
                        {trustBadges.map((badge) => (
                            <span
                                key={badge.label}
                                className="inline-flex items-center gap-2 rounded-[4px] border border-ink-700 px-3 py-2 text-[0.75rem] font-medium text-parchment-200"
                            >
                                <Icon name={badge.icon} className="size-4 text-gold-500" />
                                {badge.label}
                            </span>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {socials.map(({ label, href }) => (
                            <a
                                key={label}
                                href={href}
                                className="inline-flex h-9 items-center rounded-[4px] border border-ink-700 px-3 text-[0.75rem] font-medium text-parchment-200 transition-colors hover:border-gold-600 hover:text-gold-300"
                            >
                                {label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-ink-800">
                <div className="container-tbca flex flex-col gap-2 py-5 text-[0.75rem] text-ink-400 sm:flex-row sm:items-center sm:justify-between">
                    <p>© {new Date().getFullYear()} {brand.trademark} All rights reserved.</p>
                    <p className="text-ink-500">{brand.promise}</p>
                </div>
            </div>
        </footer>
    );
}
