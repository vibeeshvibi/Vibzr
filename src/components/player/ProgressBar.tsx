import { useState, useRef, useCallback } from 'react';
import { usePlayerStore } from '../../store/playerStore';

interface ProgressBarProps {
  large?: boolean;
}

export function ProgressBar({ large = false }: ProgressBarProps) {
  const { currentTime, duration, setCurrentTime } = usePlayerStore();
  const { seek } = { seek: (t: number) => setCurrentTime(t) };
  const barRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hoverX, setHoverX] = useState<number | null>(null);

  const getTimeFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!barRef.current || !duration) return 0;
    const rect = barRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return ratio * duration;
  }, [duration]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const time = getTimeFromEvent(e);
    setCurrentTime(time);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!barRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    setHoverX((e.clientX - rect.left) / rect.width * 100);
    if (isDragging) {
      const time = getTimeFromEvent(e);
      setCurrentTime(time);
    }
  };

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      const time = getTimeFromEvent(e);
      usePlayerStore.getState().setCurrentTime(time);
      // trigger actual audio seek
      const audio = document.querySelector('audio') as HTMLAudioElement | null;
      if (audio) audio.currentTime = time;
    }
    setIsDragging(false);
  };

  const handleClick = (e: React.MouseEvent) => {
    const time = getTimeFromEvent(e);
    usePlayerStore.getState().setCurrentTime(time);
    const audio = document.querySelector('audio') as HTMLAudioElement | null;
    if (audio) audio.currentTime = time;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={barRef}
      className={`progress-bar ${large ? 'h-1.5 my-2' : 'h-1'} cursor-pointer group`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { setIsDragging(false); setHoverX(null); }}
      onClick={handleClick}
    >
      <div className="progress-fill" style={{ width: `${progress}%` }} />
      {/* Hover thumb */}
      <div
        className={`absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-glow 
                     transition-opacity duration-150 pointer-events-none -translate-x-1/2
                     ${isDragging || hoverX !== null ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
        style={{ left: `${progress}%` }}
      />
    </div>
  );
}
