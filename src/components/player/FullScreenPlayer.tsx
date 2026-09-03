import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ListMusic, Heart, Share2, MoreHorizontal } from 'lucide-react';
import { usePlayerStore } from '../../store/playerStore';
import { PlayerControls } from './PlayerControls';
import { ProgressBar } from './ProgressBar';
import { formatDuration } from '../../utils/formatters';
import { useState } from 'react';

export function FullScreenPlayer() {
  const { currentTrack, isFullScreenOpen, setFullScreen, currentTime, duration, playlists, addToPlaylist, queue } = usePlayerStore();
  const [showQueue, setShowQueue] = useState(false);
  const [showPlaylistMenu, setShowPlaylistMenu] = useState(false);

  if (!currentTrack) return null;

  return (
    <AnimatePresence>
      {isFullScreenOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="fixed inset-0 z-50 flex flex-col"
          style={{
            background: `#000`,
          }}
        >
          {/* Background blurred album art */}
          <div className="absolute inset-0 overflow-hidden">
            <img
              src={currentTrack.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover opacity-15 blur-3xl scale-110"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
          </div>

          <div className="relative z-10 flex flex-col h-full px-6 pb-8 pt-[calc(env(safe-area-inset-top)+1.5rem)] max-w-lg mx-auto w-full">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-8">
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setFullScreen(false)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <ChevronDown size={22} className="text-white" />
              </motion.button>

              <div className="text-center">
                <p className="text-white/50 text-xs font-medium uppercase tracking-widest">Now Playing</p>
              </div>

              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowPlaylistMenu(!showPlaylistMenu)}
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center"
              >
                <MoreHorizontal size={22} className="text-white" />
              </motion.button>
            </div>

            {/* Playlist menu */}
            <AnimatePresence>
              {showPlaylistMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-24 right-6 bg-brand-surface border border-white/10 rounded-xl p-2 z-20 min-w-48"
                >
                  <p className="text-white/50 text-xs px-3 py-1 font-medium">Add to Playlist</p>
                  {playlists.length === 0 && (
                    <p className="text-white/40 text-xs px-3 py-2">No playlists yet. Create one in the Playlists tab.</p>
                  )}
                  {playlists.map((pl) => (
                    <button
                      key={pl.id}
                      onClick={() => { addToPlaylist(pl.id, currentTrack); setShowPlaylistMenu(false); }}
                      className="w-full text-left px-3 py-2 text-sm text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      {pl.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Album Art */}
            <motion.div
              key={currentTrack.id}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              className="flex justify-center mb-8"
            >
              <div className="relative">
                <img
                  src={currentTrack.image}
                  alt={currentTrack.title}
                  className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl object-cover shadow-2xl"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://placehold.co/300x300/1C1C1E/FC3C44?text=%E2%99%AA';
                  }}
                />
              </div>
            </motion.div>

            {/* Track Info */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1 min-w-0 mr-4">
                <h2 className="text-2xl font-bold text-white truncate">{currentTrack.title}</h2>
                <p className="text-white/60 mt-1 truncate">{currentTrack.artist}</p>
                {currentTrack.album && (
                  <p className="text-white/40 text-sm mt-0.5 truncate">{currentTrack.album}</p>
                )}
              </div>
              <div className="flex gap-3">
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => usePlayerStore.getState().toggleFavorite(currentTrack)}
                  className={`transition-colors ${usePlayerStore.getState().isFavorite(currentTrack.id) ? 'text-brand-pink' : 'text-white/40 hover:text-white'}`}
                  title={usePlayerStore.getState().isFavorite(currentTrack.id) ? 'Remove from Favorites' : 'Add to Favorites'}
                >
                  <Heart size={22} fill={usePlayerStore.getState().isFavorite(currentTrack.id) ? '#FC3C44' : 'none'} />
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.8 }}
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({ title: currentTrack.title, text: `${currentTrack.title} by ${currentTrack.artist}` }).catch(() => {});
                    }
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <Share2 size={22} />
                </motion.button>
              </div>
            </div>

            {/* Progress */}
            <div className="mb-6">
              <ProgressBar large />
              <div className="flex justify-between mt-2">
                <span className="text-white/40 text-xs">{formatDuration(currentTime)}</span>
                <span className="text-white/40 text-xs">{formatDuration(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center mb-8">
              <PlayerControls size="full" />
            </div>

            {/* Queue toggle */}
            <button
              onClick={() => setShowQueue(!showQueue)}
              className={`flex items-center gap-2 mx-auto text-sm font-medium transition-colors ${showQueue ? 'text-brand-pink' : 'text-white/40 hover:text-white'}`}
            >
              <ListMusic size={16} />
              {showQueue ? 'Hide Queue' : `View Queue (${queue.length})`}
            </button>

            {/* Queue list */}
            <AnimatePresence>
              {showQueue && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mt-4"
                >
                  <div className="max-h-48 overflow-y-auto space-y-2 no-scrollbar">
                    {queue.map((track, i) => (
                      <div
                        key={`${track.id}-${i}`}
                        onClick={() => usePlayerStore.getState().setTrack(track, queue)}
                        className={`flex items-center gap-3 p-2 rounded-xl cursor-pointer transition-all
                                    ${track.id === currentTrack.id ? 'bg-brand-pink/20 border border-brand-pink/30' : 'hover:bg-white/5'}`}
                      >
                        <img src={track.image} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-medium truncate ${track.id === currentTrack.id ? 'text-brand-pink' : 'text-white'}`}>
                            {track.title}
                          </p>
                          <p className="text-white/40 text-xs truncate">{track.artist}</p>
                        </div>
                        <span className="text-white/30 text-xs">{formatDuration(track.duration)}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
