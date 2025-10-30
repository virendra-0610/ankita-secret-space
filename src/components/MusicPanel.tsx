import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import '../styles/blog.css';
import '../styles/mini-player.css';

interface MusicPanelProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
}

const TRACKS = [
  { title: "Pardesiya (From Param Sundari)", path: "/media/Pardesiya (From Param Sundari).mp3" },
  { title: "Perfect", path: "/media/Perfect.mp3" },
  { title: "Sairat Jhala Ji", path: "/media/Sairat Jhala Ji.mp3" },
  { title: "Sapphire", path: "/media/Sapphire.mp3" },
  { title: "Tera Mera Pyar Amar", path: "/media/Tera Mera Pyar Amar.mp3" },
  { title: "Tu Jarashi", path: "/media/Tu Jarashi.mp3" }
];

export const MusicPanel: React.FC<MusicPanelProps> = ({ audioRef }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Set up audio event listeners and start autoplay
  useEffect(() => {
    const audio = audioRef?.current;
    if (!audio) return;

    // Set initial track and start playing
    audio.src = TRACKS[currentTrackIndex].path;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(err => console.error('Initial autoplay failed:', err));

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => {
      // Advance the queue using functional state update to avoid stale closures
      setCurrentTrackIndex(prev => {
        const next = prev < TRACKS.length - 1 ? prev + 1 : 0;
        const audioEl = audioRef?.current;
        if (audioEl) {
          audioEl.src = TRACKS[next].path;
          // try to play next track immediately
          audioEl.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error('Playback failed:', err));
        }
        return next;
      });
    };
    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
      }
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('timeupdate', onTimeUpdate);

    // Ensure audio has an initial source and update initial state
    if (!audio.src) {
      audio.src = TRACKS[currentTrackIndex].path;
    }
    setIsPlaying(!audio.paused && !audio.ended);

    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, [audioRef]);

  // Play/Pause the current track
  const handlePlayPause = () => {
    const audio = audioRef?.current;
    if (!audio) return;
    if (isPlaying) audio.pause();
    else audio.play().catch(err => console.error('Playback failed:', err));
  };

  // Handle track changes
  const handleTrackSelect = (index: number) => {
    const audio = audioRef?.current;
    if (!audio) return;

    setCurrentTrackIndex(index);
    audio.src = TRACKS[index].path;
    audio.play()
      .then(() => setIsPlaying(true))
      .catch(err => console.error('Playback failed:', err));
  };

  // Previous track
  const handlePrevious = () => {
    const prevIndex = currentTrackIndex > 0 ? currentTrackIndex - 1 : TRACKS.length - 1;
    handleTrackSelect(prevIndex);
  };

  // Next track
  const handleNext = () => {
    const nextIndex = currentTrackIndex < TRACKS.length - 1 ? currentTrackIndex + 1 : 0;
    handleTrackSelect(nextIndex);
  };

  const currentTrackInfo = TRACKS[currentTrackIndex];

  return (
    <div className="music-player">
      <div className="mini-player" data-playing={isPlaying}>
      {/* Background video (muted, looped) - placed before other background layers so it's behind content */}
      <video
        className="mini-bg-video"
        src="/animations/bg.mp4"
        autoPlay
        muted
        loop
        playsInline
        aria-hidden="true"
      />
      {/* Album Art */}
      <div 
        className="album-art"
        style={{ 
          backgroundImage: `linear-gradient(45deg, #e11d48, #881337)`
        }}
      />        {/* Track Info */}
        <div className="track-info">
          <div className="track-title">
            {TRACKS[currentTrackIndex].title}
          </div>
          {/* <div className="track-artist">
            Ankita Garden
          </div> */}
        </div>

        {/* Controls */}
        <div className="player-controls">
          <button 
            className="control-button"
            onClick={handlePrevious}
            aria-label="Previous track"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          <button 
            className="control-button play-button"
            onClick={handlePlayPause}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
              </svg>
            ) : (
              <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>

          <button 
            className="control-button"
            onClick={handleNext}
            aria-label="Next track"
          >
            <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        {/* Progress Bar */}
        <div 
          className="progress-bar"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const ratio = (e.clientX - rect.left) / rect.width;
            const audio = audioRef?.current;
            if (audio) {
              audio.currentTime = audio.duration * ratio;
            }
          }}
        >
          <div 
            className="progress-bar-fill" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Track list */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="track-list"
          >
            {TRACKS.map((track, index) => (
              <div
                key={track.path}
                className={`track-item ${index === currentTrackIndex ? 'active' : ''}`}
                onClick={() => handleTrackSelect(index)}
              >
                {track.title}
                {index === currentTrackIndex && isPlaying && (
                  <span className="playing-indicator">♫</span>
                )}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};