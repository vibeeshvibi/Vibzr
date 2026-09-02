import type { Track } from '../../types/music';
import { TrackCard } from './TrackCard';
import { LoadingSkeleton } from '../ui/LoadingSkeleton';

interface TrackListProps {
  tracks: Track[];
  isLoading?: boolean;
  showIndex?: boolean;
  emptyMessage?: string;
}

export function TrackList({ tracks, isLoading = false, showIndex = true, emptyMessage = 'No tracks found' }: TrackListProps) {
  if (isLoading) return <LoadingSkeleton count={8} type="track" />;

  if (tracks.length === 0) {
    return (
      <div className="text-center py-12 text-white/30">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tracks.map((track, i) => (
        <TrackCard
          key={`${track.id}-${i}`}
          track={track}
          index={i}
          queue={tracks}
          showIndex={showIndex}
        />
      ))}
    </div>
  );
}
