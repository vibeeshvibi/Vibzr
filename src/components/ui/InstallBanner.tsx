import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { useState } from 'react';

export function InstallBanner() {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (isInstalled || dismissed) return null;
  if (!isInstallable && !isIOS) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        className="fixed top-[calc(env(safe-area-inset-top)+0.75rem)] left-1/2 -translate-x-1/2 z-50 w-[calc(100%-2rem)] max-w-sm"
      >
        <div className="bg-brand-card border border-white/10 rounded-xl p-3 shadow-2xl backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-pink rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white font-black text-base">V</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-semibold text-sm">Install Vibzr App</p>
              <p className="text-white/50 text-xs truncate">
                {isIOS ? 'Add to Home Screen for full app experience' : 'Add to home screen for fast access'}
              </p>
            </div>

            {isIOS ? (
              <button
                onClick={() => setShowIOSInstructions(!showIOSInstructions)}
                className="bg-brand-pink px-3 py-1.5 rounded-full text-white text-xs font-semibold flex-shrink-0 hover:brightness-110 transition-all"
              >
                How to Install
              </button>
            ) : (
              <button
                onClick={install}
                className="flex items-center gap-1 bg-brand-pink px-3 py-1.5 rounded-full text-white text-xs font-semibold flex-shrink-0 hover:brightness-110 transition-all"
              >
                <Download size={12} />
                Install
              </button>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="text-white/40 hover:text-white/70 flex-shrink-0 transition-colors p-1"
            >
              <X size={16} />
            </button>
          </div>

          {/* iOS Step-by-step instructions box */}
          {isIOS && showIOSInstructions && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 pt-3 border-t border-white/10 text-xs text-white/80 space-y-2"
            >
              <p className="font-semibold text-brand-pink">To install on iPhone / iPad:</p>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">1</span>
                <span>Tap the <Share size={14} className="inline text-brand-pink mx-0.5" /> <strong>Share</strong> button in Safari toolbar below</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">2</span>
                <span>Scroll down & tap <PlusSquare size={14} className="inline text-brand-pink mx-0.5" /> <strong>Add to Home Screen</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">3</span>
                <span>Launch <strong>Vibzr</strong> from your Home Screen!</span>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
