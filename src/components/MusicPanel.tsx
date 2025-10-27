import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicPanelProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrack: 'welcome' | 'heartKey' | 'blog';
}

const trackInfo = {
  welcome: { name: "Welcome Theme", color: "from-blue-500 to-purple-600" },
  heartKey: { name: "Heart's Whisper", color: "from-rose-500 to-pink-600" },
  blog: { name: "Garden Serenity", color: "from-emerald-500 to-teal-600" }
};

export const MusicPanel: React.FC<MusicPanelProps> = ({ audioRef, currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
    }
  }, [audioRef]);

  const handlePlayPause = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const handleMute = () => {
    if (!audioRef.current) return;
    audioRef.current.muted = !audioRef.current.muted;
    setIsMuted(!isMuted);
  };

  return (
    <motion.div initial={{ x: 60 }} animate={{ x: 0 }} className="w-full h-[85%] relative overflow-hidden rounded-2xl shadow-xl">
      {/* animated gradient background - pastel blue -> pink */}
      <div className="absolute inset-0 animate-gradient-bg" />

      {/* subtle moving overlay shapes */}
      <motion.div className="absolute inset-0 pointer-events-none" animate={{ opacity: [0.6, 0.9, 0.6] }} transition={{ duration: 8, repeat: Infinity }}>
        <svg className="w-full h-full" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stopColor="rgba(255,255,255,0.04)" />
              <stop offset="1" stopColor="rgba(0,0,0,0.02)" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#g1)" />
        </svg>
      </motion.div>

      {/* content */}
      <div className="relative z-10 p-4 h-full flex flex-col items-center justify-center gap-4">
        <div className="w-32 h-32 rounded-xl bg-white/8 backdrop-blur-sm flex items-center justify-center">
          {/* waveform or note */}
          {isPlaying ? (
            <div className="flex items-end gap-1 h-16">
              {[...Array(5)].map((_, i) => (
                <motion.div key={i} className="w-1.5 bg-white rounded-full" animate={{ height: [8, 48, 8] }} transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.1 }} />
              ))}
            </div>
          ) : (
            <div className="text-3xl text-white/90">♪</div>
          )}
        </div>

        <div className="text-center">
          <div className="text-sm text-white/90">{trackInfo[currentTrack].name}</div>
        </div>

        <div className="flex gap-3">
          <button onClick={handleMute} className="p-2 rounded-full bg-white/10 text-white"> {isMuted ? '🔇' : '🔊'} </button>
          <button onClick={handlePlayPause} className="p-3 rounded-full bg-white/20 text-white"> {isPlaying ? '⏸' : '▶'} </button>
        </div>
      </div>
    </motion.div>
  );
};