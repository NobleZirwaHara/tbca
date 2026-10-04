import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ComponentType, ReactElement, ReactNode } from 'react';

import PublicLayout from '@/Layouts/PublicLayout';

const appName = 'The Business Clinic.Africa';

type PageComponent = ComponentType<Record<string, unknown>> & {
    layout?: ((page: ReactElement) => ReactNode) | null;
};

type PageModule = { default: PageComponent };

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    resolve: (async (name: string) => {
        const page = (await resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        )) as PageModule;

        // Pages render inside PublicLayout unless they declare their own layout.
        // `Page.layout = null` opts out entirely (auth screens, consoles that wrap themselves).
        if (page.default.layout === undefined) {
            page.default.layout = (child: ReactElement) => <PublicLayout>{child}</PublicLayout>;
        }

        return page;
    }) as never,
    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />);
    },
    progress: {
        color: '#d6a32e',
        showSpinner: false,
    },
});
