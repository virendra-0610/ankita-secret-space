import { useRef, useEffect } from 'react';

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
      
      // Add event listeners for debugging
      audioRef.current.addEventListener('play', () => {
        console.debug('Audio started playing');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });
    }

    // Switch track and attempt immediate playback
    audioRef.current.src = tracks[currentTrack];
    console.debug('Loading track:', tracks[currentTrack]);
    
    // Attempt immediate playback
    const playPromise = audioRef.current.play();
    
    if (playPromise !== undefined) {
      playPromise.then(() => {
        console.debug('Autoplay successful');
      }).catch(error => {
        console.debug('Autoplay prevented:', error);
        // Add click listener for first interaction
        const startAudio = () => {
          audioRef.current?.play();
          document.removeEventListener('click', startAudio);
        };
        document.addEventListener('click', startAudio);
      });
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentTrack]);

  return audioRef;
}