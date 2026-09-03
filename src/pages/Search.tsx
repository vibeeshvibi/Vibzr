import { useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Music2, Disc3, Mic2 } from 'lucide-react';
import { searchAll } from '../api/jiosaavn';
import type { SearchResults } from '../types/music';
import { TrackCard } from '../components/music/TrackCard';
import { AlbumCard } from '../components/music/AlbumCard';
import { ArtistCard } from '../components/music/ArtistCard';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { useSearch } from '../hooks/useSearch';

import { useSearchParams } from 'react-router-dom';

type Tab = 'songs' | 'albums' | 'artists';

const QUICK_SEARCHES = [
  'Anirudh Hits', 'Vijay Antony', 'Harris Jayaraj', 'AR Rahman Tamil',
  'Sid Sriram', 'Yuvan Shankar Raja', 'GV Prakash', 'Ilayaraja',
];

const BROWSE_CATEGORIES = [
  { label: 'Tamil Film', color: 'bg-[#C2185B]', query: 'Tamil Film' },
  { label: 'Retro Classics', color: 'bg-[#E65100]', query: 'Retro Classics Tamil' },
  { label: 'Independent', color: 'bg-[#2E7D32]', query: 'Independent Tamil' },
  { label: 'Devotional', color: 'bg-[#F9A825]', query: 'Devotional Tamil' },
  { label: 'BGM & Beats', color: 'bg-[#AD1457]', query: 'BGM Beats Tamil' },
  { label: 'Folk', color: 'bg-[#D84315]', query: 'Folk Tamil' },
];

export function SearchPage() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState<Tab>('songs');
  const searchFn = useCallback((q: string) => searchAll(q), []);
  const { query, results, isLoading, search, clear } = useSearch<SearchResults>(searchFn, 400);

  useEffect(() => {
    const qParam = searchParams.get('q');
    if (qParam) {
      search(qParam);
    }
  }, [searchParams]);

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'songs', label: 'Songs', icon: Music2 },
    { id: 'albums', label: 'Albums', icon: Disc3 },
    { id: 'artists', label: 'Artists', icon: Mic2 },
  ];

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-24">
      <h1 className="text-2xl font-bold text-white mb-6">Search</h1>

      {/* Search bar */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
        <input
          type="text"
          value={query}
          onChange={(e) => search(e.target.value)}
          placeholder="Artists, Songs, Albums..."
          className="w-full bg-brand-card border border-white/10 rounded-xl pl-11 pr-11 py-3.5 text-white placeholder:text-white/40 focus:outline-none focus:border-brand-pink/50 transition-all duration-200 text-sm"
        />
        {query && (
          <button onClick={clear} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* Quick search chips + Browse categories */}
      {!query && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="text-white/50 text-sm font-medium mb-3">Popular searches</p>
          <div className="flex flex-wrap gap-2 mb-8">
            {QUICK_SEARCHES.map((q) => (
              <button
                key={q}
                onClick={() => search(q)}
                className="px-4 py-2 bg-brand-card border border-white/10 rounded-full text-sm text-white/70 hover:text-white hover:border-white/20 transition-all duration-200"
              >
                {q}
              </button>
            ))}
          </div>

          <p className="text-white/50 text-sm font-medium mb-3">Browse categories</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {BROWSE_CATEGORIES.map((cat) => (
              <motion.button
                key={cat.label}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => search(cat.query)}
                className={`${cat.color} rounded-xl p-5 text-left min-h-[80px] flex items-end`}
              >
                <p className="text-white font-bold text-sm">{cat.label}</p>
              </motion.button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Results */}
      {query && (
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <LoadingSkeleton count={6} type="track" />
            </motion.div>
          ) : results ? (
            <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              {/* Tabs */}
              <div className="flex gap-2 mb-5">
                {tabs.map(({ id, label, icon: Icon }) => {
                  const count = results[id === 'songs' ? 'songs' : id === 'albums' ? 'albums' : 'artists']?.length || 0;
                  return (
                    <button
                      key={id}
                      onClick={() => setActiveTab(id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                                  ${activeTab === id
                          ? 'bg-brand-pink text-white'
                          : 'bg-brand-card text-white/60 hover:text-white border border-white/10'
                        }`}
                    >
                      <Icon size={14} />
                      {label}
                      {count > 0 && (
                        <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-white/20' : 'bg-white/10'}`}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Content */}
              {activeTab === 'songs' && (
                <div className="space-y-1">
                  {results.songs.length === 0 ? (
                    <p className="text-white/40 text-center py-8">No songs found</p>
                  ) : (
                    results.songs.map((track, i) => (
                      <TrackCard key={track.id} track={track} index={i} queue={results.songs} showIndex query={query} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'albums' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {results.albums.length === 0 ? (
                    <p className="text-white/40 col-span-full text-center py-8">No albums found</p>
                  ) : (
                    results.albums.map((album, i) => (
                      <AlbumCard key={album.id} album={album} index={i} />
                    ))
                  )}
                </div>
              )}

              {activeTab === 'artists' && (
                <div className="flex flex-wrap gap-6 justify-center sm:justify-start">
                  {results.artists.length === 0 ? (
                    <p className="text-white/40 w-full text-center py-8">No artists found</p>
                  ) : (
                    results.artists.map((artist, i) => (
                      <ArtistCard key={artist.id} artist={artist} index={i} />
                    ))
                  )}
                </div>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      )}
    </div>
  );
}
