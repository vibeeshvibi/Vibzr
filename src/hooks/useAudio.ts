import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';

// Singleton audio element — lives for the app's lifetime
let audioElement: HTMLAudioElement | null = null;

export function getAudio(): HTMLAudioElement {
  if (!audioElement) {
    audioElement = new Audio();
    audioElement.preload = 'auto';
  }
  return audioElement;
}

// Synchronously trigger audio play inside user click stack to prevent browser autoplay block
export function playAudioTrack(track: Track) {
  if (!track?.url) return;
  const audio = getAudio();
  if (audio.src !== track.url) {
    audio.src = track.url;
    audio.load();
  }
  audio.currentTime = 0;
  audio.play().catch((err) => {
    console.warn('Direct playback attempt notice:', err);
  });
}

export function toggleAudioPlayback(shouldPlay: boolean) {
  const audio = getAudio();
  if (!audio.src) return;
  if (shouldPlay) {
    audio.play().catch((err) => console.warn('Play error:', err));
  } else {
    audio.pause();
  }
}

export function useAudio() {
  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    setCurrentTime,
    setDuration,
    setPlaying,
    setLoading,
    nextTrack,
    repeatMode,
  } = usePlayerStore();

  const seekingRef = useRef(false);

  // Sync track & play state
  useEffect(() => {
    if (!currentTrack?.url) {
      setLoading(false);
      return;
    }

    const audio = getAudio();

    if (audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
      audio.load();
    }

    if (isPlaying) {
      audio.play().then(() => {
        setLoading(false);
      }).catch(() => {
        setLoading(false);
      });
    } else {
      audio.pause();
      setLoading(false);
    }
  }, [currentTrack?.id, currentTrack?.url, isPlaying, setLoading]);

  // Volume
  useEffect(() => {
    const audio = getAudio();
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Seek
  useEffect(() => {
    if (!seekingRef.current) {
      const audio = getAudio();
      if (Math.abs(audio.currentTime - currentTime) > 1.5) {
        audio.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  // Audio HTML5 event listeners
  useEffect(() => {
    const audio = getAudio();

    const onTimeUpdate = () => {
      if (!seekingRef.current) setCurrentTime(audio.currentTime);
    };

    const onDurationChange = () => setDuration(audio.duration || 0);
    const onPlaying = () => setLoading(false);
    const onCanPlay = () => setLoading(false);

    const onError = () => {
      setLoading(false);
      setPlaying(false);
    };

    const onEnded = () => {
      setLoading(false);
      if (repeatMode === 'one') {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else {
        nextTrack();
      }
    };

    const onWaiting = () => setLoading(true);
    const onPause = () => setPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('pause', onPause);
    };
  }, [nextTrack, repeatMode, setCurrentTime, setDuration, setLoading, setPlaying]);

  // Media Session API
  useEffect(() => {
    if (!currentTrack || !('mediaSession' in navigator)) return;

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentTrack.title,
        artist: currentTrack.artist,
        album: currentTrack.album,
        artwork: [
          { src: currentTrack.image, sizes: '512x512', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.setActionHandler('play', () => {
        setPlaying(true);
        toggleAudioPlayback(true);
      });
      navigator.mediaSession.setActionHandler('pause', () => {
        setPlaying(false);
        toggleAudioPlayback(false);
      });
      navigator.mediaSession.setActionHandler('nexttrack', nextTrack);
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        usePlayerStore.getState().prevTrack();
      });
    } catch (e) {
      console.warn('MediaSession setup failed:', e);
    }
  }, [currentTrack, nextTrack, setPlaying]);

  const seek = useCallback((time: number) => {
    const audioEl = getAudio();
    seekingRef.current = true;
    audioEl.currentTime = time;
    setCurrentTime(time);
    setTimeout(() => { seekingRef.current = false; }, 200);
  }, [setCurrentTime]);

  return { audio: getAudio(), seek };
}
