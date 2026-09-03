import { motion } from 'framer-motion';
import { Play, Pause, SkipBack, SkipForward, Shuffle, Repeat, Repeat1 } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';

interface PlayerControlsProps {
  size?: 'mini' | 'full';
}

export function PlayerControls({ size = 'full' }: PlayerControlsProps) {
  const {
    isPlaying,
    isShuffled,
    repeatMode,
    isLoading,
    togglePlay,
    nextTrack,
    prevTrack,
    toggleShuffle,
    cycleRepeat,
  } = usePlayerStore();

  const btnSize = size === 'mini' ? 18 : 22;
  const playSize = size === 'mini' ? 20 : 28;

  const RepeatIcon = repeatMode === 'one' ? Repeat1 : Repeat;

  return (
    <div className={`flex items-center ${size === 'full' ? 'gap-5' : 'gap-3'}`}>
      {/* Shuffle */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={toggleShuffle}
        className={`transition-colors duration-200 ${isShuffled ? 'text-brand-pink' : 'text-white/50 hover:text-white'}`}
        title="Shuffle"
      >
        <Shuffle size={btnSize} />
      </motion.button>

      {/* Previous */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={prevTrack}
        className="text-white/70 hover:text-white transition-colors"
        title="Previous"
      >
        <SkipBack size={btnSize} fill="currentColor" />
      </motion.button>

      {/* Play / Pause */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={togglePlay}
        className={`relative flex items-center justify-center rounded-full
                   ${size === 'full' ? 'w-16 h-16 bg-white' : 'w-9 h-9 bg-brand-pink'}`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isLoading ? (
          <div className={`border-2 rounded-full animate-spin
                          ${size === 'full' ? 'w-6 h-6 border-black/30 border-t-black' : 'w-4 h-4 border-white/30 border-t-white'}`} />
        ) : isPlaying ? (
          <Pause size={playSize} fill={size === 'full' ? '#000' : 'white'} color={size === 'full' ? '#000' : 'white'} />
        ) : (
          <Play size={playSize} fill={size === 'full' ? '#000' : 'white'} color={size === 'full' ? '#000' : 'white'} className="ml-0.5" />
        )}
      </motion.button>

      {/* Next */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={nextTrack}
        className="text-white/70 hover:text-white transition-colors"
        title="Next"
      >
        <SkipForward size={btnSize} fill="currentColor" />
      </motion.button>

      {/* Repeat */}
      <motion.button
        whileTap={{ scale: 0.9 }}
        onClick={cycleRepeat}
        className={`transition-colors duration-200 ${repeatMode !== 'none' ? 'text-brand-pink' : 'text-white/50 hover:text-white'}`}
        title={`Repeat: ${repeatMode}`}
      >
        <RepeatIcon size={btnSize} />
      </motion.button>

    </div>
  );
}
