import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { AssistantPanel } from '@/Components/AskQuestion';
import { assistant } from '@/lib/assistant';
import type { SharedProps } from '@/types';
import { personaForPath, type DealRoomContext } from './personas';
import { secureChat } from './secureChatStore';
import SecureChat from './SecureChat';

interface RoomHeaderProp {
    slug?: string;
    name?: string;
    reference?: string;
    status?: string;
    role?: string | null;
    currentStage?: { code: string; name: string; page: string };
    nextStage?: { code: string; name: string } | null;
}

/** Deal-room context for MICHAELA: the room slug from the URL, enriched by the page's `room` prop when present. */
function roomContext(path: string, props: Record<string, unknown>): DealRoomContext | undefined {
    const slug = path.match(/^\/virtual-deal-room\/rooms\/([^/?#]+)/)?.[1];
    if (!slug) return undefined;
    const r = (props.room ?? null) as RoomHeaderProp | null;
    const same = r && r.slug === slug;
    return {
        slug,
        name: same ? r.name : undefined,
        reference: same ? r.reference : undefined,
        status: same ? r.status : undefined,
        role: same ? r.role : undefined,
        stage: same ? r.currentStage : undefined,
        nextStage: same ? r.nextStage : undefined,
    };
}

/**
 * Mounted once around every page (see app.tsx): picks the persona for the
 * current section (NATASHA / KAREN / MICHAELA) and renders NIKIWE's secure
 * chat when opened from the header.
 */
export default function AssistantHost() {
    const props = usePage<SharedProps>().props;
    const path = props.url?.path ?? (typeof window !== 'undefined' ? window.location.pathname : '/');
    const user = props.auth?.user ?? null;
    const persona = personaForPath(path, Boolean(user));

    // Point openAskQuestion()/openSecureChat() at this page's persona and user (module stores).
    useEffect(() => {
        assistant.bind(persona);
        secureChat.bindUser(user ? { name: user.name, email: user.email } : null);
    }, [persona, user]);

    const ctx = { page: path, signedIn: Boolean(user), userName: user?.name, room: persona === 'michaela' ? roomContext(path, props) : undefined };

    return (
        <>
            <AssistantPanel persona={persona} ctx={ctx} user={user} />
            <SecureChat page={path} />
        </>
    );
}
