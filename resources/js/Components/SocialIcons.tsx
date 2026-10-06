import type { ReactNode } from 'react';

/** Simple inline brand glyphs (24x24, currentColor) for the footer social row. */
const GLYPHS: Record<string, ReactNode> = {
    linkedin: (
        <path
            fill="currentColor"
            d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9.5 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.4c0-1.3-.02-2.95-1.8-2.95-1.8 0-2.08 1.4-2.08 2.86V21h-4z"
        />
    ),
    facebook: (
        <path
            fill="currentColor"
            d="M13.5 22v-8.2h2.8l.42-3.2H13.5V8.56c0-.93.26-1.56 1.6-1.56h1.7V4.14A22.6 22.6 0 0 0 14.32 4C11.86 4 10.2 5.5 10.2 8.25v2.35H7.4v3.2h2.8V22z"
        />
    ),
    x: (
        <path
            fill="currentColor"
            d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.46 21H2.39l7.17-8.2L2 3h6.33l4.37 5.78zm-1.08 16.2h1.7L7.4 4.73H5.58z"
        />
    ),
    youtube: (
        <path
            fill="currentColor"
            d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6z"
        />
    ),
    instagram: (
        <g fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="5" />
            <circle cx="12" cy="12" r="4" />
            <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
        </g>
    ),
    whatsapp: (
        <g>
            <path
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
                d="M12 2.8a9.2 9.2 0 0 0-7.9 13.9L2.9 21.1l4.5-1.2A9.2 9.2 0 1 0 12 2.8z"
            />
            <path
                fill="currentColor"
                d="M9.1 7.4c-.17-.4-.36-.4-.53-.41h-.45c-.16 0-.41.06-.63.3-.21.23-.83.81-.83 1.98s.85 2.29.97 2.45c.12.16 1.64 2.62 4.04 3.57 2 .79 2.41.63 2.85.59.44-.04 1.41-.58 1.61-1.13.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28l-1.61-.79c-.22-.08-.38-.12-.54.12-.16.24-.62.79-.76.95-.14.16-.28.18-.52.06-.24-.12-1-.37-1.92-1.18a7.2 7.2 0 0 1-1.32-1.65c-.14-.24-.01-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42z"
            />
        </g>
    ),
};

export type SocialNetwork = keyof typeof GLYPHS;

export default function SocialIcon({ network, className }: { network: string; className?: string }) {
    return (
        <svg viewBox="0 0 24 24" className={className} aria-hidden="true" focusable="false">
            {GLYPHS[network]}
        </svg>
    );
}
