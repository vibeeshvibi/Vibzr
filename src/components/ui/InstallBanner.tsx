import { motion, AnimatePresence } from 'framer-motion';
import { Download, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useState } from 'react';

export function InstallBanner() {
  const { isInstallable, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!isInstallable || dismissed) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
      >
        <div className="bg-brand-card border border-white/10 rounded-xl flex items-center gap-3 p-3 shadow-lg">
          <div className="w-10 h-10 bg-brand-pink rounded-xl flex items-center justify-center flex-shrink-0">
            <span className="text-white font-black text-base">V</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm">Install Vibzr</p>
            <p className="text-white/50 text-xs">Add to home screen for the best experience</p>
          </div>
          <button
            onClick={install}
            className="flex items-center gap-1 bg-brand-pink px-3 py-1.5 rounded-full text-white text-xs font-semibold flex-shrink-0 hover:brightness-110 transition-all"
          >
            <Download size={12} />
            Install
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="text-white/40 hover:text-white/70 flex-shrink-0 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
