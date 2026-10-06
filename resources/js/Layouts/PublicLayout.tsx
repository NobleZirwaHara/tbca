import type { ReactNode } from 'react';
import Header, { type HeaderVariant } from '@/Components/Header';
import Footer from '@/Components/Footer';
import Flash from '@/Components/Flash';
import Backdrop, { type BackdropVariant } from '@/Components/Backdrop';

export default function PublicLayout({
    children,
    headerVariant = 'split',
    backdrop = 'network',
}: {
    children: ReactNode;
    headerVariant?: HeaderVariant;
    /** Faint full-page background picture; pages may vary or disable it. */
    backdrop?: BackdropVariant;
}) {
    return (
        <div className="relative isolate flex min-h-screen flex-col bg-parchment-200">
            <Backdrop variant={backdrop} />

            <a
                href="#main"
                className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[60] focus:rounded-[4px] focus:bg-gold-500 focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink-900"
            >
                Skip to content
            </a>

            <Header variant={headerVariant} />

            <main id="main" className="flex-1">
                {children}
            </main>

            <Footer />
            <Flash />
        </div>
    );
}
