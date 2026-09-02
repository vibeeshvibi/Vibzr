# TamilVibes Music

> A high-performance, lag-free Progressive Web App for streaming Tamil songs — films, retro classics, and indie hits.

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🏗 Project Structure

```
src/
├── api/jiosaavn.ts          # JioSaavn API wrapper (search, trending, albums)
├── components/
│   ├── layout/Navigation    # Sidebar (desktop) + Bottom Nav (mobile)
│   ├── player/
│   │   ├── MiniPlayer       # Sticky bottom player bar
│   │   ├── FullScreenPlayer # Immersive full-screen player
│   │   ├── ProgressBar      # Click/drag seek bar
│   │   └── PlayerControls   # Play, skip, shuffle, repeat, volume
│   ├── music/
│   │   ├── TrackCard        # Animated track list item
│   │   ├── AlbumCard        # Album cover grid card
│   │   └── ArtistCard       # Artist avatar pill
│   └── ui/
│       ├── InstallBanner    # PWA install prompt
│       └── LoadingSkeleton  # Loading placeholders
├── hooks/
│   ├── useAudio.ts          # HTML5 Audio + Media Session API
│   ├── useSearch.ts         # Debounced search hook
│   └── usePWAInstall.ts     # PWA install prompt hook
├── pages/
│   ├── Home.tsx             # Trending + curated sections
│   ├── Search.tsx           # Search with tabs (songs/albums/artists)
│   ├── Playlists.tsx        # Create & manage local playlists
│   └── Settings.tsx         # Volume, playback, PWA install, stats
├── store/playerStore.ts     # Zustand global audio state
├── types/music.ts           # TypeScript interfaces
└── utils/formatters.ts      # Duration, title helpers
```

## 🎵 Features

- **Stream Tamil music** via JioSaavn API (no API key required)
- **Lag-free UI** with Framer Motion animations and zero layout shifts
- **Global audio** — music never stops between page navigations
- **Media Session API** — lock screen controls on iOS/Android
- **Search** songs, albums, and artists with 400ms debounce
- **Queue system** — shuffle, repeat-one, repeat-all
- **Custom playlists** saved to localStorage
- **PWA** — install to home screen, offline-capable

## 🛠 Tech Stack

| Tool | Purpose |
|------|---------|
| Vite + React 18 | Build & rendering |
| TypeScript | Type safety |
| Tailwind CSS v3 | Styling |
| Zustand | Global state |
| Framer Motion | Animations |
| React Router v6 | Client routing |
| vite-plugin-pwa | Service worker + manifest |
| JioSaavn API | Music data |

## 📦 Build for Production

```bash
npm run build
npm run preview
```
