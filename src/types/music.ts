export interface Track {
  id: string;
  title: string;
  album: string;
  albumId: string;
  artist: string;
  artistId: string;
  duration: number; // seconds
  image: string;
  url: string; // audio stream URL
  language: string;
  year: string;
  hasLyrics?: boolean;
}

export interface Album {
  id: string;
  title: string;
  artist: string;
  artistId: string;
  image: string;
  year: string;
  songCount: number;
  language: string;
}

export interface Artist {
  id: string;
  name: string;
  image: string;
  followerCount?: number;
  dominantType?: string;
}

export interface SearchResults {
  songs: Track[];
  albums: Album[];
  artists: Artist[];
}

export type RepeatMode = 'none' | 'one' | 'all';

export interface Playlist {
  id: string;
  name: string;
  tracks: Track[];
  createdAt: number;
  coverImage?: string;
}
