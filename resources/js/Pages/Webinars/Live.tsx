import LiveRoom from '@/Components/Webinars/LiveRoom';
import type { LiveRoomProps } from '@/types/webinars';

export default function Live(props: LiveRoomProps) {
    return <LiveRoom {...props} view="session" />;
}

Live.layout = null;
