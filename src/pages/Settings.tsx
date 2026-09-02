import { useState } from 'react';
import { Bell, Download, Info, Sliders } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}

function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`relative w-12 h-6 rounded-full transition-all duration-300 ${value ? 'bg-brand-pink' : 'bg-white/20'}`}
    >
      <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform duration-300 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

export function SettingsPage() {
  const { repeatMode, cycleRepeat, playlists, favorites } = usePlayerStore();
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [notifications, setNotifications] = useState(false);
  const [autoplay, setAutoplay] = useState(true);
  const [highQuality, setHighQuality] = useState(true);

  const settingGroups = [
    {
      title: 'Playback',
      icon: Sliders,
      items: [
        {
          label: 'Auto-play next song',
          desc: 'Automatically play the next song in queue',
          control: <Toggle value={autoplay} onChange={setAutoplay} />,
        },
        {
          label: 'High Quality Audio',
          desc: '320kbps streaming (uses more data)',
          control: <Toggle value={highQuality} onChange={setHighQuality} />,
        },
        {
          label: 'Repeat Mode',
          desc: `Current: ${repeatMode === 'none' ? 'Off' : repeatMode === 'all' ? 'Repeat All' : 'Repeat One'}`,
          control: (
            <button onClick={cycleRepeat} className="text-brand-pink text-sm font-medium hover:underline">
              Change
            </button>
          ),
        },
      ],
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        {
          label: 'Now Playing notifications',
          desc: 'Show track info in system notifications',
          control: <Toggle value={notifications} onChange={setNotifications} />,
        },
      ],
    },
    {
      title: 'App',
      icon: Download,
      items: [
        {
          label: 'Install Vibzr',
          desc: isInstalled ? 'Already installed on this device' : 'Add to your home screen for offline access',
          control: isInstalled ? (
            <span className="text-green-400 text-sm font-medium">Installed</span>
          ) : isInstallable ? (
            <button
              onClick={install}
              className="bg-brand-pink px-4 py-1.5 rounded-full text-white text-xs font-semibold hover:brightness-110 transition-all"
            >
              Install
            </button>
          ) : (
            <span className="text-white/30 text-xs">Not available</span>
          ),
        },
      ],
    },
  ];

  return (
    <div className="p-4 md:p-8 pb-36 md:pb-24 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-8">Settings</h1>

      {/* Setting groups */}
      {settingGroups.map((group) => (
        <div key={group.title} className="bg-brand-card rounded-xl p-5 mb-4 border border-white/[0.08]">
          <div className="flex items-center gap-2 mb-4">
            <group.icon size={16} className="text-brand-pink" />
            <h2 className="text-white font-semibold text-sm uppercase tracking-wider">{group.title}</h2>
          </div>
          <div className="space-y-4">
            {group.items.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-white/40 text-xs mt-0.5">{item.desc}</p>
                </div>
                {item.control}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Stats */}
      <div className="bg-brand-card rounded-xl p-5 mb-4 border border-white/[0.08]">
        <div className="flex items-center gap-2 mb-4">
          <Info size={16} className="text-brand-pink" />
          <h2 className="text-white font-semibold text-sm uppercase tracking-wider">Your Stats</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Favorites', value: favorites.length },
            { label: 'Playlists', value: playlists.length },
            { label: 'Playlist Songs', value: playlists.reduce((a, p) => a + p.tracks.length, 0) },
          ].map((stat) => (
            <div key={stat.label} className="bg-brand-surface rounded-xl p-4 text-center">
              <p className="text-2xl font-black text-brand-pink">{stat.value}</p>
              <p className="text-white/50 text-xs mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-brand-card rounded-xl p-5 border border-white/[0.08]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">Vibzr</p>
            <p className="text-white/40 text-xs mt-0.5">Version 1.0.0</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-brand-pink flex items-center justify-center">
            <span className="text-white font-black text-base">V</span>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/[0.08]">
          <p className="text-white/30 text-xs leading-relaxed">
            Music data provided by the JioSaavn community API. Built for personal use.
            Stream Tamil films, retro classics, and indie hits — all in one place.
          </p>
        </div>
      </div>
    </div>
  );
}
