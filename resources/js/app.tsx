import '../css/app.css';

import { createInertiaApp, router } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import type { ComponentType, ReactElement, ReactNode } from 'react';

import PublicLayout from '@/Layouts/PublicLayout';
import AssistantHost from '@/Components/Assistant/AssistantHost';
import DisplayCurrency from '@/Components/DisplayCurrency';
import { applyDocumentLocale, loadLocale } from '@/lib/i18n';
import type { SharedProps } from '@/types';

const appName = 'The Business Clinic.Africa';

type PageComponent = ComponentType<Record<string, unknown>> & {
    layout?: ((page: ReactElement) => ReactNode) | null;
    withAssistant?: boolean;
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

        // Every page gets the site assistant (NATASHA / KAREN / MICHAELA + NIKIWE secure chat),
        // whatever layout it uses. Wrapped once per page module.
        if (!page.default.withAssistant) {
            const base = page.default.layout;
            page.default.layout = (child: ReactElement) => (
                <DisplayCurrency>
                    {base ? base(child) : child}
                    <AssistantHost />
                </DisplayCurrency>
            );
            page.default.withAssistant = true;
        }

        return page;
    }) as never,
    setup({ el, App, props }) {
        // Load the visitor's dictionary before the first render so a non-English
        // page never flashes English, then keep <html lang dir> in step on every visit.
        const initial = props.initialPage.props as unknown as SharedProps;
        const languageOf = (context: SharedProps['context']) => context.languages.find((l) => l.code === context.language);

        router.on('navigate', (event) => {
            const context = (event.detail.page.props as unknown as SharedProps).context;
            if (context) applyDocumentLocale(languageOf(context));
        });

        loadLocale(initial.context?.language ?? 'en').finally(() => {
            if (initial.context) applyDocumentLocale(languageOf(initial.context));
            createRoot(el).render(<App {...props} />);
        });
    },
    progress: {
        color: '#d6a32e',
        showSpinner: false,
    },
});
