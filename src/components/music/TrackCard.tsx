import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Track } from '../../types/music';
import { usePlayerStore } from '../../store/playerStore';
import { formatDuration } from '../../utils/formatters';
import { Heart, ListPlus } from 'lucide-react';

interface TrackCardProps {
  track: Track;
  index?: number;
  queue?: Track[];
  showIndex?: boolean;
  query?: string;
}

export function TrackCard({ track, index, queue, showIndex = false, query }: TrackCardProps) {
  const { setTrack, addToQueue, currentTrack, isPlaying, toggleFavorite, isFavorite } = usePlayerStore();
  const isActive = currentTrack?.id === track.id;
  const favorite = isFavorite(track.id);

  const handlePlay = () => {
    setTrack(track, queue || [track], query);
  };

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(track);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: (index || 0) * 0.04, duration: 0.3 }}
      className={`group flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200
                  hover:bg-white/[0.06]
                  ${isActive ? 'bg-brand-pink/10 border border-brand-pink/20' : 'border border-transparent'}`}
      onClick={handlePlay}
    >
      {/* Index or waveform */}
      <div className="w-8 flex-shrink-0 flex items-center justify-center">
        {isActive && isPlaying ? (
          <div className="flex items-end gap-0.5 h-5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="w-0.5 bg-brand-pink rounded-full wave-bar"
                style={{ height: `${[60, 100, 80, 40][i - 1]}%` }}
              />
            ))}
          </div>
        ) : showIndex ? (
          <span className={`text-sm font-medium group-hover:hidden ${isActive ? 'text-brand-pink' : 'text-white/40'}`}>
            {(index || 0) + 1}
          </span>
        ) : null}
        <Play
          size={14}
          fill="white"
          className={`text-white ${showIndex ? 'hidden group-hover:block' : isActive && isPlaying ? 'hidden' : 'block'}`}
        />
      </div>

      {/* Album art */}
      <div className="relative flex-shrink-0">
        <img
          src={track.image}
          alt={track.title}
          loading="lazy"
          className="w-11 h-11 rounded-lg object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/44x44/1C1C1E/FC3C44?text=%E2%99%AA';
          }}
        />
        {isActive && isPlaying && (
          <div className="absolute inset-0 rounded-lg bg-brand-pink/20 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-brand-pink animate-pulse" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className={`font-medium text-sm truncate ${isActive ? 'text-brand-pink' : 'text-white'}`}>
          {track.title}
        </p>
        <p className="text-white/50 text-xs truncate mt-0.5">{track.artist}</p>
      </div>

      {/* Duration + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-white/30 text-xs hidden sm:block">{formatDuration(track.duration)}</span>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={handleFavoriteClick}
          className={`p-1 transition-all duration-200 ${favorite ? 'text-brand-pink' : 'text-white/20 group-hover:text-white/50 hover:!text-white'}`}
          title={favorite ? 'Remove from Favorites' : 'Add to Favorites'}
        >
          <Heart size={16} fill={favorite ? '#FC3C44' : 'none'} />
        </motion.button>

        <motion.button
          whileTap={{ scale: 0.8 }}
          onClick={(e) => { e.stopPropagation(); addToQueue(track); }}
          className="text-white/0 group-hover:text-white/50 hover:!text-white transition-all duration-200"
          title="Add to queue"
        >
          <ListPlus size={16} />
        </motion.button>
      </div>
    </motion.div>
  );
}
