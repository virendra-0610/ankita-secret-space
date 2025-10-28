import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import '../styles/blog.css';

interface MusicPanelProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrack: 'welcome' | 'heartKey' | 'blog';
  onTrackChange?: (track: 'welcome' | 'heartKey' | 'blog') => void;
}

// Available tracks with their display names
const tracks = [
  { id: 'welcome', name: 'Welcome Theme' },
  { id: 'heartKey', name: "Heart's Whisper" },
  { id: 'blog', name: 'Garden Serenity' }
] as const;

export const MusicPanel: React.FC<MusicPanelProps> = ({ audioRef, currentTrack, onTrackChange }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Set up audio event listeners
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      setIsPlaying(false);
      handleNext(); // Auto-play next track
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);

    // Update initial state
    setIsPlaying(!audio.paused && !audio.ended);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, [audioRef]);

  // Play/Pause the current track
  const handlePlayPause = () => {
    const audio = audioRef?.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(err => console.error('Playback failed:', err));
  };

  // Change to a specific track
  const handleTrackChange = (trackId: typeof tracks[number]['id']) => {
    const audio = audioRef?.current;
    if (!audio) return;

    // Update audio source
    audio.src = `/music/${trackId}-theme.mp3`;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(err => console.error('Playback failed:', err));

    // Notify parent component
    onTrackChange?.(trackId as any);
  };

  // Play previous track
  const handlePrevious = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : tracks.length - 1;
    handleTrackChange(tracks[prevIndex].id);
  };

  // Play next track
  const handleNext = () => {
    const currentIndex = tracks.findIndex(t => t.id === currentTrack);
    const nextIndex = currentIndex < tracks.length - 1 ? currentIndex + 1 : 0;
    handleTrackChange(tracks[nextIndex].id);
  };

  const currentTrackInfo = tracks.find(t => t.id === currentTrack);

  return (
    <div className="w-full bg-white/10 backdrop-blur-md rounded-xl overflow-hidden border border-white/20">
      {/* Now Playing Section */}
      <div className="p-4 border-b border-white/20">
        <div className="text-lg text-white mb-2 font-medium">
          {currentTrackInfo?.name}
          {isPlaying && <span className="ml-2 text-sm opacity-60">• Now Playing</span>}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 flex justify-center gap-3">
        <button 
          onClick={handlePrevious} 
          className="p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Previous track"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M11 19l-9-7 9-7v14zm11 0l-9-7 9-7v14z" />
          </svg>
        </button>

        <button 
          onClick={handlePlayPause} 
          className="p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors"
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        <button 
          onClick={handleNext} 
          className="p-2 text-white/80 hover:text-white transition-colors"
          aria-label="Next track"
        >
          <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 19l9-7-9-7v14zm-11 0l9-7-9-7v14z" />
          </svg>
        </button>
      </div>

      {/* Track List */}
      <div className="p-4 border-t border-white/20">
        <div className="space-y-2">
          {tracks.map(track => (
            <button
              key={track.id}
              onClick={() => handleTrackChange(track.id)}
              className={`w-full text-left p-2 rounded transition-colors ${
                currentTrack === track.id
                  ? 'bg-white/15 text-white'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <div className="flex items-center">
                <span className="flex-1">{track.name}</span>
                {currentTrack === track.id && isPlaying && (
                  <span className="text-xs animate-pulse">♪</span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};