import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Track, RepeatMode, Playlist } from '../types/music';
import { playAudioTrack, toggleAudioPlayback } from '../hooks/useAudio';
import { saveFavoriteToIDB, removeFavoriteFromIDB, getAllFavoritesFromIDB } from '../utils/idbStorage';
import { searchSongs } from '../api/jiosaavn';

interface PlayerState {
  // Current track
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;

  // Queue & Pagination
  queue: Track[];
  queueIndex: number;
  originalQueue: Track[];
  activeQuery: string | null;
  currentPage: number;
  isFetchingNextPage: boolean;

  // Modes
  isShuffled: boolean;
  repeatMode: RepeatMode;

  // UI
  isFullScreenOpen: boolean;
  isLoading: boolean;

  // Playlists (persisted)
  playlists: Playlist[];

  // Favorites (persisted via IndexedDB + state)
  favorites: Track[];

  // Actions
  setTrack: (track: Track, queue?: Track[], query?: string) => void;
  fetchNextPage: () => Promise<boolean>;
  togglePlay: () => void;
  setPlaying: (playing: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  nextTrack: () => void;
  prevTrack: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
  setFullScreen: (open: boolean) => void;
  setLoading: (loading: boolean) => void;

  // Favorite actions
  toggleFavorite: (track: Track) => void;
  isFavorite: (trackId: string) => boolean;
  initFavoritesFromIDB: () => Promise<void>;

  // Playlist actions
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (playlistId: string, track: Track) => void;
  removeFromPlaylist: (playlistId: string, trackId: string) => void;
  renamePlaylist: (id: string, name: string) => void;
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      currentTrack: null,
      isPlaying: false,
      currentTime: 0,
      duration: 0,
      volume: 0.8,
      isMuted: false,
      queue: [],
      queueIndex: -1,
      originalQueue: [],
      activeQuery: null,
      currentPage: 1,
      isFetchingNextPage: false,
      isShuffled: false,
      repeatMode: 'none',
      isFullScreenOpen: false,
      isLoading: false,
      playlists: [],
      favorites: [],

      setTrack: (track, queue, query) => {
        const newQueue = queue || [track];
        const idx = newQueue.findIndex((t) => t.id === track.id);
        const inferredQuery = query || (track.artist ? `${track.artist} tamil` : 'tamil hits 2024');

        // Play synchronously inside user click
        playAudioTrack(track);

        set({
          currentTrack: track,
          queue: newQueue,
          originalQueue: newQueue,
          queueIndex: idx >= 0 ? idx : 0,
          currentTime: 0,
          isPlaying: true,
          isLoading: false,
          activeQuery: inferredQuery,
          currentPage: 1,
        });

        // Pre-fetch next page early in the background while track 1 is actively playing
        // This ensures the queue is already filled before reaching the end of the batch
        if (newQueue.length <= 15) {
          get().fetchNextPage();
        }
      },

      fetchNextPage: async () => {
        const { activeQuery, currentPage, isFetchingNextPage, queue } = get();
        if (isFetchingNextPage) return false;

        const queryToFetch = activeQuery || 'tamil hits 2024';
        const nextPage = (currentPage || 1) + 1;

        set({ isFetchingNextPage: true });

        try {
          const newTracks = await searchSongs(queryToFetch, nextPage, 20);
          const existingIds = new Set(queue.map((t) => t.id));
          const uniqueNew = newTracks.filter((t) => !existingIds.has(t.id));

          if (uniqueNew.length > 0) {
            set((s) => ({
              queue: [...s.queue, ...uniqueNew],
              originalQueue: [...s.originalQueue, ...uniqueNew],
              currentPage: nextPage,
              isFetchingNextPage: false,
            }));
            return true;
          }
        } catch (e) {
          console.warn('Auto fetch next page failed:', e);
        }

        set({ isFetchingNextPage: false });
        return false;
      },

      togglePlay: () => {
        const nextState = !get().isPlaying;
        toggleAudioPlayback(nextState);
        set({ isPlaying: nextState });
      },

      setPlaying: (playing) => set({ isPlaying: playing }),
      setCurrentTime: (time) => set({ currentTime: time }),
      setDuration: (duration) => set({ duration }),

      setVolume: (volume) => {
        set({ volume: Math.min(1, Math.max(0, volume)), isMuted: false });
      },

      toggleMute: () => set((s) => ({ isMuted: !s.isMuted })),

      // Synchronous track transition to guarantee zero audio gap on iOS lock screen
      nextTrack: () => {
        const { queue, queueIndex, repeatMode } = get();
        if (!queue.length) return;

        if (repeatMode === 'one') {
          set({ currentTime: 0, isPlaying: true });
          const cur = get().currentTrack;
          if (cur) playAudioTrack(cur);
          return;
        }

        const nextIdx = queueIndex + 1;

        if (nextIdx < queue.length) {
          const next = queue[nextIdx];
          // Immediately initiate audio playback within the synchronous event tick
          playAudioTrack(next);
          set({ queueIndex: nextIdx, currentTrack: next, currentTime: 0, isPlaying: true, isLoading: false });

          // Proactively fetch more songs while this track is playing, well before the queue runs dry
          if (nextIdx >= queue.length - 4) {
            get().fetchNextPage();
          }
        } else {
          // Reached end of queue
          if (repeatMode === 'all') {
            const first = queue[0];
            if (first) playAudioTrack(first);
            set({ queueIndex: 0, currentTrack: first, currentTime: 0, isPlaying: true, isLoading: false });
          } else {
            set({ isPlaying: false, isLoading: false });
          }
        }
      },

      prevTrack: () => {
        const { queue, queueIndex, currentTime } = get();
        if (currentTime > 3) {
          set({ currentTime: 0 });
          return;
        }
        const prevIdx = queueIndex - 1;
        if (prevIdx >= 0) {
          const prev = queue[prevIdx];
          playAudioTrack(prev);
          set({ queueIndex: prevIdx, currentTrack: prev, currentTime: 0, isPlaying: true });
        }
      },

      toggleShuffle: () => {
        const { isShuffled, originalQueue, queue, currentTrack } = get();
        if (!isShuffled) {
          const others = queue.filter((t) => t.id !== currentTrack?.id);
          const shuffled = [currentTrack!, ...others.sort(() => Math.random() - 0.5)];
          set({ isShuffled: true, queue: shuffled, queueIndex: 0 });
        } else {
          const idx = originalQueue.findIndex((t) => t.id === currentTrack?.id);
          set({ isShuffled: false, queue: originalQueue, queueIndex: idx >= 0 ? idx : 0 });
        }
      },

      cycleRepeat: () => {
        const { repeatMode } = get();
        const next: RepeatMode = repeatMode === 'none' ? 'all' : repeatMode === 'all' ? 'one' : 'none';
        set({ repeatMode: next });
      },

      addToQueue: (track) =>
        set((s) => ({
          queue: [...s.queue, track],
          originalQueue: [...s.originalQueue, track],
        })),

      removeFromQueue: (index) =>
        set((s) => {
          const newQueue = [...s.queue];
          newQueue.splice(index, 1);
          return { queue: newQueue };
        }),

      clearQueue: () => set({ queue: [], originalQueue: [], queueIndex: -1, activeQuery: null, currentPage: 1 }),

      setFullScreen: (open) => set({ isFullScreenOpen: open }),
      setLoading: (loading) => set({ isLoading: loading }),

      toggleFavorite: (track) => {
        const { favorites } = get();
        const exists = favorites.some((f) => f.id === track.id);
        if (exists) {
          const updated = favorites.filter((f) => f.id !== track.id);
          set({ favorites: updated });
          removeFavoriteFromIDB(track.id);
        } else {
          const updated = [...favorites, track];
          set({ favorites: updated });
          saveFavoriteToIDB(track);
        }
      },

      isFavorite: (trackId) => get().favorites.some((f) => f.id === trackId),

      initFavoritesFromIDB: async () => {
        const idbFavs = await getAllFavoritesFromIDB();
        if (idbFavs && idbFavs.length > 0) {
          set({ favorites: idbFavs });
        }
      },

      createPlaylist: (name) => {
        const playlist: Playlist = {
          id: Math.random().toString(36).slice(2),
          name,
          tracks: [],
          createdAt: Date.now(),
        };
        set((s) => ({ playlists: [...s.playlists, playlist] }));
      },

      deletePlaylist: (id) =>
        set((s) => ({ playlists: s.playlists.filter((p) => p.id !== id) })),

      addToPlaylist: (playlistId, track) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId && !p.tracks.find((t) => t.id === track.id)
              ? { ...p, tracks: [...p.tracks, track], coverImage: p.coverImage || track.image }
              : p
          ),
        })),

      removeFromPlaylist: (playlistId, trackId) =>
        set((s) => ({
          playlists: s.playlists.map((p) =>
            p.id === playlistId ? { ...p, tracks: p.tracks.filter((t) => t.id !== trackId) } : p
          ),
        })),

      renamePlaylist: (id, name) =>
        set((s) => ({
          playlists: s.playlists.map((p) => (p.id === id ? { ...p, name } : p)),
        })),
    }),
    {
      name: 'vibzr',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        repeatMode: state.repeatMode,
        isShuffled: state.isShuffled,
        playlists: state.playlists,
        favorites: state.favorites,
      }),
    }
  )
);
