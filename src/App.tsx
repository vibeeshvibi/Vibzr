import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Sidebar, BottomNav } from './components/layout/Navigation';
import { MiniPlayer } from './components/player/MiniPlayer';
import { FullScreenPlayer } from './components/player/FullScreenPlayer';
import { InstallBanner } from './components/ui/InstallBanner';
import { HomePage } from './pages/Home';
import { SearchPage } from './pages/Search';
import { PlaylistsPage } from './pages/Playlists';
import { SettingsPage } from './pages/Settings';
import { useAudio } from './hooks/useAudio';

// Mount the audio engine at the root so it never unmounts
function AudioEngine() {
  useAudio();
  return null;
}

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="flex-1 overflow-y-auto"
      >
        <Routes location={location}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/playlists" element={<PlaylistsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AudioEngine />
      <div className="flex h-screen overflow-hidden bg-brand-dark">
        {/* Sidebar — desktop only */}
        <Sidebar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative pt-[env(safe-area-inset-top)]">
          {/* Decorative background orbs */}
          <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
            <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-pink/10 rounded-full blur-3xl" />
            <div className="absolute top-1/2 -left-40 w-80 h-80 bg-brand-purple/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-40 right-1/3 w-80 h-80 bg-brand-orange/8 rounded-full blur-3xl" />
          </div>

          <AnimatedRoutes />
        </div>
      </div>

      {/* Global overlays */}
      <InstallBanner />
      <MiniPlayer />
      <FullScreenPlayer />
      <BottomNav />
    </BrowserRouter>
  );
}
