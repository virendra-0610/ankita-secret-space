import { useRef, useEffect } from 'react';

type Track = 'welcome' | 'heartKey' | 'blog';

export function useBackgroundMusic(currentTrack: Track) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTrackRef = useRef<Track>(currentTrack);
  
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

      // Set initial source
      audioRef.current.src = tracks[currentTrack];
    }

    // Only switch track if it has changed (prevents unnecessary reloads)
    if (currentTrack !== lastTrackRef.current) {
      audioRef.current.src = tracks[currentTrack];
      console.debug('Loading track:', tracks[currentTrack]);
      lastTrackRef.current = currentTrack;
      
      // Attempt immediate playback only on track change
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
    }

    return () => {
      // Only cleanup on unmount, not on every track change
      if (audioRef.current && !document.body.contains(audioRef.current)) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [currentTrack]);

  return audioRef;
}