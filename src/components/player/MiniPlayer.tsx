import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, ChevronUp } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { ProgressBar } from './ProgressBar';
import { formatDuration } from '../../utils/formatters';

export function MiniPlayer() {
  const { currentTrack, isPlaying, currentTime, duration, togglePlay, nextTrack, setFullScreen, isLoading } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed bottom-[calc(3.1rem+env(safe-area-inset-bottom))] md:bottom-0 left-0 right-0 z-40 px-2 pb-1 md:px-0 md:pb-0"
      >
        <div
          className="relative border-t border-white/[0.08] md:rounded-none rounded-2xl overflow-hidden mx-auto max-w-full"
          style={{ background: 'rgba(28,28,30,0.98)', backdropFilter: 'blur(20px)' }}
        >
          {/* Thin progress bar at top */}
          <div className="absolute top-0 left-0 right-0 h-0.5">
            <ProgressBar />
          </div>

          <div className="relative flex items-center gap-3 px-4 py-3">
            {/* Album art */}
            <motion.div
              whileTap={{ scale: 0.95 }}
              onClick={() => setFullScreen(true)}
              className="relative flex-shrink-0 cursor-pointer"
            >
              <img
                src={currentTrack.image}
                alt={currentTrack.title}
                className="w-11 h-11 rounded-lg object-cover shadow-md"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/44x44/1C1C1E/FC3C44?text=%E2%99%AA';
                }}
              />
              {isLoading && (
                <div className="absolute inset-0 rounded-lg bg-black/50 flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
              )}
            </motion.div>

            {/* Track info */}
            <div
              className="flex-1 min-w-0 cursor-pointer"
              onClick={() => setFullScreen(true)}
            >
              <p className="text-white font-semibold text-sm truncate">{currentTrack.title}</p>
              <p className="text-white/50 text-xs truncate">{currentTrack.artist}</p>
            </div>

            {/* Time */}
            <span className="text-white/30 text-xs hidden sm:block flex-shrink-0">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </span>

            {/* Controls */}
            <div className="flex items-center gap-1 flex-shrink-0">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={togglePlay}
                className="w-9 h-9 rounded-full bg-brand-pink flex items-center justify-center"
              >
                {isLoading ? (
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : isPlaying ? (
                  <Pause size={16} fill="white" color="white" />
                ) : (
                  <Play size={16} fill="white" color="white" className="ml-0.5" />
                )}
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={nextTrack}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <SkipForward size={16} fill="white" className="text-white" />
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setFullScreen(true)}
                className="w-9 h-9 rounded-full hover:bg-white/10 flex items-center justify-center ml-1 transition-colors"
              >
                <ChevronUp size={16} className="text-white/70" />
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
