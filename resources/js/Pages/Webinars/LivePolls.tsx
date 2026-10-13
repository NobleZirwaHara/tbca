import LiveRoom from '@/Components/Webinars/LiveRoom';
import type { LiveRoomProps } from '@/types/webinars';

export default function LivePolls(props: LiveRoomProps) {
    return <LiveRoom {...props} view="polls" />;
}

LivePolls.layout = null;
