import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Music2, Play, X, ListMusic, Heart } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { TrackCard } from '../components/music/TrackCard';
import type { Playlist } from '../types/music';

export function PlaylistsPage() {
  const { playlists, favorites, initFavoritesFromIDB, createPlaylist, deletePlaylist, removeFromPlaylist, setTrack } = usePlayerStore();
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    initFavoritesFromIDB();
  }, [initFavoritesFromIDB]);

  const handleCreate = () => {
    if (!newName.trim()) return;
    createPlaylist(newName.trim());
    setNewName('');
    setShowCreate(false);
  };

  // Favorited songs view
  if (showFavorites) {
    return (
      <div className="p-4 md:p-8 pb-36 md:pb-24">
        <button
          onClick={() => setShowFavorites(false)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm"
        >
          ← Back to Library
        </button>

        <div className="flex items-center gap-5 mb-8">
          <div className="w-24 h-24 rounded-2xl bg-brand-pink flex items-center justify-center flex-shrink-0">
            <Heart size={44} fill="white" className="text-white" />
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Playlist</p>
            <h1 className="text-2xl font-bold text-white">Favorite Songs</h1>
            <p className="text-white/50 text-sm mt-1">{favorites.length} songs saved on device</p>
            {favorites.length > 0 && (
              <button
                onClick={() => setTrack(favorites[0], favorites)}
                className="flex items-center gap-2 bg-brand-pink px-5 py-2 rounded-full text-white text-sm font-semibold mt-3 hover:brightness-110 transition-all"
              >
                <Play size={14} fill="white" /> Play All
              </button>
            )}
          </div>
        </div>

        {favorites.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Heart size={48} className="mx-auto mb-4 opacity-30 text-brand-pink" />
            <p>No favorite songs saved yet. Click the heart icon on any song to save it!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {favorites.map((track, i) => (
              <TrackCard key={track.id} track={track} index={i} queue={favorites} showIndex />
            ))}
          </div>
        )}
      </div>
    );
  }

  // Selected playlist view
  if (selectedPlaylist) {
    const playlist = playlists.find((p) => p.id === selectedPlaylist.id) || selectedPlaylist;
    return (
      <div className="p-4 md:p-8 pb-36 md:pb-24">
        <button
          onClick={() => setSelectedPlaylist(null)}
          className="flex items-center gap-2 text-white/50 hover:text-white mb-6 transition-colors text-sm"
        >
          ← Back to Playlists
        </button>

        <div className="flex items-center gap-5 mb-8">
          <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
            {playlist.coverImage ? (
              <img src={playlist.coverImage} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-card border border-white/10 flex items-center justify-center">
                <ListMusic size={40} className="text-white/30" />
              </div>
            )}
          </div>
          <div>
            <p className="text-white/50 text-xs uppercase tracking-widest mb-1">Playlist</p>
            <h1 className="text-2xl font-bold text-white">{playlist.name}</h1>
            <p className="text-white/50 text-sm mt-1">{playlist.tracks.length} songs</p>
            {playlist.tracks.length > 0 && (
              <button
                onClick={() => setTrack(playlist.tracks[0], playlist.tracks)}
                className="flex items-center gap-2 bg-brand-pink px-5 py-2 rounded-full text-white text-sm font-semibold mt-3 hover:brightness-110 transition-all"
              >
                <Play size={14} fill="white" /> Play All
              </button>
            )}
          </div>
        </div>

        {playlist.tracks.length === 0 ? (
          <div className="text-center py-16 text-white/30">
            <Music2 size={48} className="mx-auto mb-4 opacity-30" />
            <p>No songs yet. Add some from search!</p>
          </div>
        ) : (
          <div className="space-y-1">
            {playlist.tracks.map((track, i) => (
              <div key={track.id} className="relative group">
                <TrackCard track={track} index={i} queue={playlist.tracks} showIndex />
                <button
                  onClick={() => removeFromPlaylist(playlist.id, track.id)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-white/0 group-hover:text-white/40 hover:!text-red-400 transition-colors p-2"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-24">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">Your Library</h1>
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-brand-pink px-4 py-2 rounded-full text-white text-sm font-semibold hover:brightness-110 transition-all"
        >
          <Plus size={16} /> New Playlist
        </motion.button>
      </div>

      {/* Favorites Card */}
      <motion.div
        whileHover={{ y: -2 }}
        onClick={() => setShowFavorites(true)}
        className="bg-brand-card border border-brand-pink/20 hover:border-brand-pink/40 rounded-xl p-5 mb-8 cursor-pointer transition-all flex items-center justify-between group"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-brand-pink flex items-center justify-center">
            <Heart size={26} fill="white" className="text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Favorite Songs</h2>
            <p className="text-white/50 text-xs mt-0.5">Your liked songs • {favorites.length} saved</p>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-brand-pink flex items-center justify-center transition-colors">
          <Play size={16} fill="white" className="ml-0.5 text-white" />
        </div>
      </motion.div>

      <h2 className="text-lg font-bold text-white mb-4">Playlists</h2>

      {/* Create modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
            onClick={(e) => e.target === e.currentTarget && setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-brand-surface rounded-2xl p-6 w-full max-w-sm border border-white/10"
            >
              <h2 className="text-white font-bold text-lg mb-4">New Playlist</h2>
              <input
                autoFocus
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                placeholder="Playlist name..."
                className="w-full bg-brand-card border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/30 focus:outline-none focus:border-brand-pink/50 mb-4 text-sm"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-3 rounded-xl bg-brand-card border border-white/10 text-white/70 hover:text-white transition-colors text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!newName.trim()}
                  className="flex-1 py-3 rounded-xl bg-brand-pink text-white font-semibold text-sm disabled:opacity-50 hover:brightness-110 transition-all"
                >
                  Create
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {playlists.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <div className="w-16 h-16 rounded-2xl bg-brand-card border border-white/10 flex items-center justify-center mx-auto mb-3">
            <ListMusic size={28} className="text-white/20" />
          </div>
          <h3 className="text-white font-semibold mb-1 text-sm">No custom playlists yet</h3>
          <p className="text-white/40 text-xs mb-4">Create custom playlists to organize your music</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-brand-pink px-5 py-2 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all"
          >
            Create Playlist
          </button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {playlists.map((playlist, i) => (
            <motion.div
              key={playlist.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              className="group cursor-pointer"
            >
              <div
                className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-brand-card border border-white/10"
                onClick={() => setSelectedPlaylist(playlist)}
              >
                {playlist.coverImage ? (
                  <img src={playlist.coverImage} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ListMusic size={40} className="text-white/20" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center">
                    <Play size={18} fill="#000" color="#000" className="ml-0.5" />
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); deletePlaylist(playlist.id); }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center text-white/0 group-hover:text-white/70 hover:!text-red-400 hover:bg-black/70 transition-all"
                >
                  <Trash2 size={12} />
                </button>
              </div>
              <p className="text-white font-semibold text-sm truncate" onClick={() => setSelectedPlaylist(playlist)}>
                {playlist.name}
              </p>
              <p className="text-white/40 text-xs mt-0.5">{playlist.tracks.length} songs</p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
