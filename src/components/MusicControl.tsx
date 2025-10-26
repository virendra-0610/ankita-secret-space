import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

type MusicControlProps = {
  audioRef: React.RefObject<HTMLAudioElement | null>;
  currentTrack: 'welcome' | 'heartKey' | 'blog';
};

export const MusicControl: React.FC<MusicControlProps> = ({ audioRef, currentTrack }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('play', () => setIsPlaying(true));
      audioRef.current.addEventListener('pause', () => setIsPlaying(false));
      audioRef.current.addEventListener('ended', () => setIsPlaying(false));
    }
  }, [audioRef]);

  const togglePlayback = async () => {
    if (!audioRef.current) return;
    try {
      if (audioRef.current.paused) {
        await audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    } catch (err) {
      console.error('Playback toggle failed:', err);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed bottom-8 right-8 z-50"
    >
      <motion.button
        whileHover={{ scale: 1.1, backgroundColor: 'rgba(255, 255, 255, 0.25)' }}
        whileTap={{ scale: 0.95 }}
        onClick={togglePlayback}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-rose-300/80 to-blue-300/80 
                   backdrop-blur-md flex items-center justify-center 
                   shadow-lg shadow-rose-500/20
                   border-2 border-white/30 hover:border-white/50
                   transition-all duration-300"
      >
        <motion.div
          initial={false}
          animate={{
            scale: isPlaying ? [0.8, 1] : [0.8, 1],
            rotate: isPlaying ? 0 : 0
          }}
          transition={{ duration: 0.2 }}
          className="text-white"
        >
          {isPlaying ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </motion.div>
      </motion.button>
    </motion.div>
  );
};