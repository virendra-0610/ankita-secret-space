import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface MusicPanelProps {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrack: 'welcome' | 'heartKey' | 'blog';
}

const trackInfo = {
  welcome: { name: "Welcome Theme", color: "from-blue-300 to-purple-300" },
  heartKey: { name: "Heart's Whisper", color: "from-rose-300 to-pink-300" },
  blog: { name: "Garden Serenity", color: "from-emerald-300 to-teal-300" }
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
    <motion.div 
      initial={{ x: 300 }}
      animate={{ x: 0 }}
      className="w-72 h-full bg-white/10 backdrop-blur-md border-l border-white/10"
    >
      <div className="p-6 flex flex-col h-full">
        <motion.div 
          className={`aspect-square rounded-2xl bg-gradient-to-br ${trackInfo[currentTrack].color} 
                     shadow-lg relative overflow-hidden`}
        >
          {/* Updated Animated Waveform */}
          <div className="absolute inset-0 flex items-center justify-center">
            {isPlaying && (
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-3 bg-white/90 rounded-full"
                    animate={{
                      height: ['25px', '75px', '25px'],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      delay: i * 0.15,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Larger Music Note Animation */}
          <AnimatePresence>
            {!isPlaying && (
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <span className="text-6xl text-white/90">♪</span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
        
        {/* Updated Controls */}
        <div className="mt-6 flex justify-center items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleMute}
            className="p-3 rounded-full bg-rose-500/20 hover:bg-rose-500/30 
                     transition-all backdrop-blur-sm"
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-6 h-6 text-white"
              stroke="currentColor" 
              fill="none" 
              strokeWidth="2"
            >
              {isMuted ? (
                <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M17 14l2-2m-2 2l2 2m-2-2l-2-2m2 2l-2 2" />
              ) : (
                <path d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07" />
              )}
            </svg>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayPause}
            className={`p-4 rounded-full ${isPlaying ? 'bg-rose-500' : 'bg-rose-500/80'} 
                       hover:bg-rose-600 transition-all shadow-lg`}
          >
            <svg 
              viewBox="0 0 24 24" 
              className="w-7 h-7 text-white"
              stroke="currentColor" 
              fill="currentColor"
              strokeWidth="2"
            >
              {isPlaying ? (
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              ) : (
                <path d="M8 5v14l11-7z" />
              )}
            </svg>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};