import { useEffect, useRef, useCallback } from 'react';
import { usePlayerStore } from '../store/playerStore';
import type { Track } from '../types/music';

// Singleton audio element — mounted to DOM to ensure iOS background audio priority
let audioElement: HTMLAudioElement | null = null;

export function getAudio(): HTMLAudioElement {
  if (!audioElement && typeof window !== 'undefined') {
    let el = document.getElementById('vibzr-audio-engine') as HTMLAudioElement;
    if (!el) {
      el = document.createElement('audio');
      el.id = 'vibzr-audio-engine';
      el.preload = 'auto';
      el.setAttribute('playsinline', 'true');
      el.setAttribute('webkit-playsinline', 'true');
      // Keep invisible in DOM
      el.style.position = 'fixed';
      el.style.pointerEvents = 'none';
      el.style.opacity = '0';
      el.style.width = '0';
      el.style.height = '0';
      el.style.bottom = '0';
      document.body.appendChild(el);
    }
    audioElement = el;
  }
  return audioElement!;
}

// Synchronously switch audio source and play without destructive .load() on iOS
export function playAudioTrack(track: Track) {
  if (!track?.url) return;
  const audio = getAudio();

  // Changing .src directly preserves the existing iOS audio hardware session
  if (audio.src !== track.url) {
    audio.src = track.url;
  }

  const playPromise = audio.play();
  if (playPromise !== undefined) {
    playPromise.catch((err) => {
      console.warn('Direct playback attempt notice:', err);
    });
  }
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
    currentTime,
    duration,
    setCurrentTime,
    setDuration,
    setPlaying,
    setLoading,
    nextTrack,
    repeatMode,
  } = usePlayerStore();

  const seekingRef = useRef(false);
  const lastPositionRef = useRef(0);
  const reconnectAttemptsRef = useRef(0);
  const isRecoveringRef = useRef(false);

  // Keep track of latest playback position
  lastPositionRef.current = currentTime;

  // Function to recover stream at current position after network reconnection
  const recoverStreamAtPosition = useCallback(() => {
    const audio = getAudio();
    const state = usePlayerStore.getState();
    if (!state.isPlaying || !state.currentTrack?.url || isRecoveringRef.current) return;

    isRecoveringRef.current = true;
    setLoading(true);

    const resumeTime = audio.currentTime || lastPositionRef.current || 0;
    console.log(`[Vibzr Audio] Reconnecting stream at ${resumeTime.toFixed(1)}s`);

    // Reset source to re-open the interrupted HTTP range connection
    audio.src = state.currentTrack.url;

    const onCanResume = () => {
      audio.removeEventListener('canplay', onCanResume);
      audio.removeEventListener('loadedmetadata', onCanResume);

      if (resumeTime > 0 && Math.abs(audio.currentTime - resumeTime) > 1) {
        audio.currentTime = resumeTime;
      }

      audio.play().then(() => {
        setLoading(false);
        isRecoveringRef.current = false;
        reconnectAttemptsRef.current = 0;
      }).catch((e) => {
        console.warn('[Vibzr Audio] Resume play failed:', e);
        setLoading(false);
        isRecoveringRef.current = false;
      });
    };

    audio.addEventListener('canplay', onCanResume, { once: true });
    audio.addEventListener('loadedmetadata', onCanResume, { once: true });
    audio.load();
  }, [setLoading]);

  // Sync track & play state without duplicate calls
  useEffect(() => {
    if (!currentTrack?.url) {
      setLoading(false);
      return;
    }

    const audio = getAudio();

    if (audio.src !== currentTrack.url) {
      audio.src = currentTrack.url;
    }

    if (isPlaying) {
      if (audio.paused) {
        audio.play().then(() => {
          setLoading(false);
        }).catch(() => {
          setLoading(false);
        });
      }
    } else {
      if (!audio.paused) {
        audio.pause();
      }
      setLoading(false);
    }
  }, [currentTrack?.id, currentTrack?.url, isPlaying, setLoading]);

  // Seek handler (usable in-app and by lock screen seekto)
  const seek = useCallback((time: number) => {
    const audioEl = getAudio();
    seekingRef.current = true;
    audioEl.currentTime = time;
    setCurrentTime(time);

    if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
      if (audioEl.duration && audioEl.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({
            duration: audioEl.duration,
            playbackRate: audioEl.playbackRate || 1,
            position: Math.min(Math.max(0, time), audioEl.duration),
          });
        } catch (e) {
          // Ignored
        }
      }
    }

    setTimeout(() => { seekingRef.current = false; }, 200);
  }, [setCurrentTime]);

  // Handle in-app manual seek updates
  useEffect(() => {
    if (!seekingRef.current) {
      const audio = getAudio();
      if (Math.abs(audio.currentTime - currentTime) > 1.5) {
        audio.currentTime = currentTime;
      }
    }
  }, [currentTime]);

  // Network offline / online reconnection listener
  useEffect(() => {
    const handleOnline = () => {
      console.log('[Vibzr Audio] Internet reconnected, recovering playback...');
      recoverStreamAtPosition();
    };

    const handleOffline = () => {
      console.warn('[Vibzr Audio] Internet disconnected');
      setLoading(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [recoverStreamAtPosition, setLoading]);

  // Audio HTML5 event listeners
  useEffect(() => {
    const audio = getAudio();
    let lastPositionUpdate = 0;

    const updatePositionState = () => {
      if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
        if (audio.duration && !isNaN(audio.duration) && audio.duration > 0) {
          try {
            navigator.mediaSession.setPositionState({
              duration: audio.duration,
              playbackRate: audio.playbackRate || 1,
              position: Math.min(audio.currentTime || 0, audio.duration),
            });
          } catch (e) {
            // Ignored
          }
        }
      }
    };

    const onTimeUpdate = () => {
      if (!seekingRef.current) {
        setCurrentTime(audio.currentTime);
      }
      // Sync lock screen progress bar state every 2 seconds
      const now = Date.now();
      if (now - lastPositionUpdate > 2000) {
        lastPositionUpdate = now;
        updatePositionState();
      }
    };

    const onDurationChange = () => {
      setDuration(audio.duration || 0);
      updatePositionState();
    };

    const onPlaying = () => {
      setLoading(false);
      reconnectAttemptsRef.current = 0;
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'playing';
      }
      updatePositionState();
    };

    const onCanPlay = () => setLoading(false);

    // Stalled / Error watchdog: recovers if stream stalled in background
    const onError = (e: Event) => {
      console.warn('Audio playback error:', e);
      setLoading(false);

      const state = usePlayerStore.getState();
      if (!state.isPlaying) return;

      // If network is available and we haven't exceeded retry limit, recover from current second
      if (navigator.onLine && reconnectAttemptsRef.current < 3) {
        reconnectAttemptsRef.current += 1;
        setTimeout(() => {
          recoverStreamAtPosition();
        }, 1000);
      } else {
        // If repeatedly failing or unrecoverable, advance to next track
        setTimeout(() => {
          usePlayerStore.getState().nextTrack();
        }, 800);
      }
    };

    const onStalled = () => {
      const state = usePlayerStore.getState();
      if (state.isPlaying && !audio.paused && navigator.onLine) {
        // If stalled mid-song for more than 4s while online, auto-recover stream
        setTimeout(() => {
          if (audio.readyState < 3 && state.isPlaying && navigator.onLine) {
            recoverStreamAtPosition();
          }
        }, 4000);
      }
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
    const onPause = () => {
      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'paused';
      }
      updatePositionState();
    };

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('durationchange', onDurationChange);
    audio.addEventListener('playing', onPlaying);
    audio.addEventListener('canplay', onCanPlay);
    audio.addEventListener('error', onError);
    audio.addEventListener('stalled', onStalled);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('waiting', onWaiting);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('durationchange', onDurationChange);
      audio.removeEventListener('playing', onPlaying);
      audio.removeEventListener('canplay', onCanPlay);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('stalled', onStalled);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('waiting', onWaiting);
      audio.removeEventListener('pause', onPause);
    };
  }, [nextTrack, recoverStreamAtPosition, repeatMode, setCurrentTime, setDuration, setLoading]);

  // Full Media Session API for iOS Lock Screen, Control Center, and CarPlay/AirPods
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

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      // Lock screen Play
      navigator.mediaSession.setActionHandler('play', () => {
        setPlaying(true);
        toggleAudioPlayback(true);
      });

      // Lock screen Pause
      navigator.mediaSession.setActionHandler('pause', () => {
        setPlaying(false);
        toggleAudioPlayback(false);
      });

      // Lock screen Next Track
      navigator.mediaSession.setActionHandler('nexttrack', () => {
        nextTrack();
      });

      // Lock screen Previous Track
      navigator.mediaSession.setActionHandler('previoustrack', () => {
        usePlayerStore.getState().prevTrack();
      });

      // Lock screen timeline scrubbing (seekto)
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined) {
          seek(details.seekTime);
        }
      });

      // Lock screen skip 10s forward
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skip = details.seekOffset || 10;
        const audio = getAudio();
        seek(Math.min(duration || audio.duration || 9999, (audio.currentTime || 0) + skip));
      });

      // Lock screen skip 10s backward
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skip = details.seekOffset || 10;
        const audio = getAudio();
        seek(Math.max(0, (audio.currentTime || 0) - skip));
      });

      // Stop
      navigator.mediaSession.setActionHandler('stop', () => {
        setPlaying(false);
        toggleAudioPlayback(false);
      });

    } catch (e) {
      console.warn('MediaSession setup error:', e);
    }
  }, [currentTrack, duration, isPlaying, nextTrack, seek, setPlaying]);

  return { audio: getAudio(), seek };
}
