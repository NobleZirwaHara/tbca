import LiveRoom from '@/Components/Webinars/LiveRoom';
import type { LiveRoomProps } from '@/types/webinars';

export default function LiveQa(props: LiveRoomProps) {
    return <LiveRoom {...props} view="qa" />;
}

LiveQa.layout = null;
