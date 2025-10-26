import { useEffect, useRef } from 'react';

type Track = 'welcome' | 'heartKey' | 'blog';

export function useBackgroundMusic(currentTrack: Track) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  useEffect(() => {
    const tracks = {
      welcome: '/music/welcome-theme.mp3',
      heartKey: '/music/heart-key-theme.mp3',
      blog: '/music/blog-theme.mp3'
    };

    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.loop = true;
    }

    // Switch track when component changes
    audioRef.current.src = tracks[currentTrack];
    audioRef.current.play().catch(err => {
      console.debug('Audio autoplay failed:', err);
    });

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentTrack]);

  return audioRef;
}