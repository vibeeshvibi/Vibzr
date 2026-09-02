import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Music2 } from 'lucide-react';
import { getHomeSections, searchSongs } from '../api/jiosaavn';
import type { Track } from '../types/music';
import { usePlayerStore } from '../store/playerStore';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

const FEATURED_MOODS = [
  { label: 'Trending', query: 'tamil hits 2024', color: 'bg-[#FC3C44]' },
  { label: 'Romance', query: 'tamil love melody songs', color: 'bg-[#AF52DE]' },
  { label: 'Energy', query: 'tamil mass bgm songs', color: 'bg-[#FF9500]' },
  { label: 'Sad', query: 'tamil sad melody songs', color: 'bg-[#5856D6]' },
  { label: 'Party', query: 'tamil kuthu dance songs', color: 'bg-[#34C759]' },
  { label: 'Devotional', query: 'tamil devotional songs', color: 'bg-[#FF2D55]' },
];

interface HomeSection {
  trending: Track[];
  thalapathy: Track[];
  anirudh: Track[];
  retro: Track[];
}

function HorizontalTrackRow({ title, tracks }: { title: string; tracks: Track[] }) {
  const { setTrack } = usePlayerStore();
  if (!tracks || tracks.length === 0) return null;

  return (
    <section className="mb-8">
      <div className="am-section-header">
        <h2>{title}</h2>
        <span className="am-see-all">See All</span>
      </div>
      <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
        {tracks.slice(0, 12).map((track, i) => (
          <motion.div
            key={`${track.id}-${i}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.03 }}
            whileTap={{ scale: 0.96 }}
            onClick={() => setTrack(track, tracks)}
            className="flex-shrink-0 w-36 cursor-pointer group"
          >
            <div className="relative mb-2">
              <img
                src={track.image}
                alt={track.title}
                loading="lazy"
                className="w-36 h-36 rounded-xl object-cover group-hover:brightness-90 transition-all duration-200"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://placehold.co/144x144/1C1C1E/FC3C44?text=%E2%99%AA';
                }}
              />
              <div className="absolute inset-0 rounded-xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#000" className="ml-0.5">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
              </div>
            </div>
            <p className="text-white font-medium text-xs truncate">{track.title}</p>
            <p className="text-white/50 text-xs truncate mt-0.5">{track.artist}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export function HomePage() {
  const [sections, setSections] = useState<HomeSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMood, setActiveMood] = useState<string | null>(null);
  const [moodTracks, setMoodTracks] = useState<Track[]>([]);
  const [isMoodLoading, setIsMoodLoading] = useState(false);

  const loadHomeData = () => {
    setIsLoading(true);
    getHomeSections().then((data) => {
      setSections(data);
      setIsLoading(false);
    });
  };

  useEffect(() => {
    loadHomeData();
  }, []);

  const handleMoodClick = async (mood: typeof FEATURED_MOODS[0]) => {
    if (activeMood === mood.label) {
      setActiveMood(null);
      setMoodTracks([]);
      return;
    }
    setActiveMood(mood.label);
    setIsMoodLoading(true);
    const results = await searchSongs(mood.query, 1, 15);
    setMoodTracks(results);
    setIsMoodLoading(false);
  };

  const { setTrack } = usePlayerStore();

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-white mb-0.5">Vibzr Now</h1>
          <p className="text-white/40 text-sm">Curated for vibeesh</p>
        </div>
        <button
          onClick={loadHomeData}
          className="p-2.5 rounded-full bg-brand-card border border-white/10 text-white/50 hover:text-white transition-colors"
          title="Refresh"
        >
          <RefreshCw size={17} className={isLoading ? 'animate-spin text-brand-pink' : ''} />
        </button>
      </motion.div>

      {/* Mood chips */}
      <section className="mb-8">
        <div className="am-section-header">
          <h2>Moods</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {FEATURED_MOODS.map((mood, i) => (
            <motion.button
              key={mood.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleMoodClick(mood)}
              className={`${mood.color} rounded-full py-2.5 px-5 text-white font-semibold text-sm transition-all ${
                activeMood === mood.label ? 'ring-2 ring-white/60 brightness-110' : 'opacity-90 hover:opacity-100'
              }`}
            >
              {mood.label}
            </motion.button>
          ))}
        </div>
      </section>

      {/* Active Mood Results */}
      {activeMood && (
        <section className="mb-8 bg-brand-card rounded-xl p-4 border border-brand-pink/30">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">{activeMood}</h2>
            <button
              onClick={() => { setActiveMood(null); setMoodTracks([]); }}
              className="text-white/40 hover:text-white text-xs transition-colors"
            >
              Clear
            </button>
          </div>
          {isMoodLoading ? (
            <LoadingSkeleton count={5} type="track" />
          ) : moodTracks.length > 0 ? (
            <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
              {moodTracks.map((track, i) => (
                <motion.div
                  key={`${track.id}-${i}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setTrack(track, moodTracks)}
                  className="flex-shrink-0 w-36 cursor-pointer group"
                >
                  <div className="relative mb-2">
                    <img
                      src={track.image}
                      alt={track.title}
                      loading="lazy"
                      className="w-36 h-36 rounded-xl object-cover group-hover:brightness-90 transition-all"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/144x144/1C1C1E/FC3C44?text=%E2%99%AA';
                      }}
                    />
                    <div className="absolute inset-0 rounded-xl bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="#000" className="ml-0.5">
                          <path d="M5 3l14 9-14 9V3z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <p className="text-white font-medium text-xs truncate">{track.title}</p>
                  <p className="text-white/50 text-xs truncate mt-0.5">{track.artist}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-white/40 text-xs text-center py-4">No tracks found for this mood.</p>
          )}
        </section>
      )}

      {/* Main sections */}
      {isLoading ? (
        <div className="space-y-10">
          {[1, 2, 3].map((i) => (
            <div key={i}>
              <div className="skeleton h-5 w-40 rounded mb-4" />
              <LoadingSkeleton count={6} type="horizontal" />
            </div>
          ))}
        </div>
      ) : sections ? (
        <>
          <HorizontalTrackRow title="Trending Now" tracks={sections.trending} />
          <HorizontalTrackRow title="Thalapathy Vijay Hits" tracks={sections.thalapathy} />
          <HorizontalTrackRow title="Anirudh Bangers" tracks={sections.anirudh} />
          <HorizontalTrackRow title="Ilayaraja Classics" tracks={sections.retro} />
        </>
      ) : (
        <div className="text-center py-16 text-white/40">
          <Music2 size={48} className="mx-auto mb-4 opacity-30" />
          <p>Failed to load music. Tap the refresh button above.</p>
        </div>
      )}
    </div>
  );
}
