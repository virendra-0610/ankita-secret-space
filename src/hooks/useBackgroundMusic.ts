import { useRef, useEffect } from 'react';

type Track = 'welcome' | 'heartKey' | 'blog';

export function useBackgroundMusic(currentTrack: Track) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTrackRef = useRef<Track>(currentTrack);
  const hasBootstrappedPlaybackRef = useRef<boolean>(false);
  
  useEffect(() => {
    const tracks = {
      welcome: '/music/welcome-theme.mp3',
      heartKey: '/music/heart-key-theme.mp3',
      blog: '/music/blog-theme.mp3'
    };

    if (!audioRef.current) {
      // Create a real <audio> element in the DOM to improve autoplay reliability
      const el = document.createElement('audio');
      el.setAttribute('autoplay', '');
      el.setAttribute('playsinline', '');
      el.preload = 'auto';
      el.loop = true;
      // Visually hidden but present in DOM
      el.style.position = 'fixed';
      el.style.width = '0px';
      el.style.height = '0px';
      el.style.opacity = '0';
      document.body.appendChild(el);
      audioRef.current = el;
      
      // Add event listeners for debugging
      audioRef.current.addEventListener('play', () => {
        console.debug('Audio started playing');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
      });

      // Set initial source
      audioRef.current.src = tracks[currentTrack];

      // Attempt autoplay on initial mount using muted-then-fade-in strategy
      // Most browsers allow autoplay if muted=true; we fade in shortly after.
      if (!hasBootstrappedPlaybackRef.current) {
        hasBootstrappedPlaybackRef.current = true;
        try {
          audioRef.current.muted = true;
          audioRef.current.volume = 0;
          const initialPlayPromise = audioRef.current.play();
          if (initialPlayPromise !== undefined) {
            initialPlayPromise
              .then(() => {
                // Fade-in
                const fadeDurationMs = 1200;
                const steps = 12;
                const stepMs = fadeDurationMs / steps;
                let currentStep = 0;
                const fadeTimer = window.setInterval(() => {
                  currentStep += 1;
                  const v = Math.min(1, currentStep / steps);
                  if (audioRef.current) {
                    audioRef.current.volume = v;
                    if (v >= 0.8) audioRef.current.muted = false;
                  }
                  if (currentStep >= steps) {
                    window.clearInterval(fadeTimer);
                  }
                }, stepMs);
                console.debug('Initial autoplay successful (muted then fade-in)');
              })
              .catch(error => {
                console.debug('Initial autoplay prevented even when muted:', error);
                const startAudio = () => {
                  if (audioRef.current) {
                    audioRef.current.muted = false;
                    audioRef.current.volume = 1;
                    audioRef.current.play().catch(() => {});
                  }
                  document.removeEventListener('click', startAudio);
                };
                document.addEventListener('click', startAudio);
              });
          }
        } catch (e) {
          console.debug('Initial autoplay setup error:', e);
        }
      }
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
      // Only cleanup on unmount; keep the element in DOM while app is mounted
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [currentTrack]);

  return audioRef;
}