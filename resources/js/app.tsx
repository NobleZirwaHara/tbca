import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ComponentType, ReactElement, ReactNode } from 'react';

import PublicLayout from '@/Layouts/PublicLayout';

const appName = 'The Business Clinic.Africa';

type PageComponent = ComponentType<Record<string, unknown>> & {
    layout?: (page: ReactElement) => ReactNode;
};

type PageModule = { default: PageComponent };

createInertiaApp({
    title: (title) => (title ? `${title} | ${appName}` : appName),
    resolve: (async (name: string) => {
        const page = (await resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        )) as PageModule;

        page.default.layout =
            page.default.layout ?? ((child: ReactElement) => <PublicLayout>{child}</PublicLayout>);

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
