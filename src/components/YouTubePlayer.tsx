import React, { useEffect, useRef, useImperativeHandle, forwardRef, useState } from 'react';

declare global {
  interface Window { YT: any; onYouTubeIframeAPIReady?: any; }
}

export type YouTubePlayerHandle = {
  play: () => void;
  pause: () => void;
  next: () => void;
  prev: () => void;
  mute: () => void;
  unmute: () => void;
  getState: () => number | null;
};

type Props = {
  playlist: string[]; // array of YouTube video IDs
  startIndex?: number;
  autoplay?: boolean;
  width?: string | number;
  height?: string | number;
};

const loadYouTubeApi = () => {
  if ((window as any).YT) return Promise.resolve();
  return new Promise<void>((resolve) => {
    const existing = document.querySelector('script[data-youtube-api]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.setAttribute('data-youtube-api', '1');
    script.async = true;
    script.onload = () => {
      // API uses global callback, but we can resolve later when YT available
    };
    document.head.appendChild(script);
    // Poll for YT
    const t = setInterval(() => {
      if ((window as any).YT && (window as any).YT.Player) {
        clearInterval(t);
        resolve();
      }
    }, 50);
  });
};

const YouTubePlayer = forwardRef<YouTubePlayerHandle, Props>(({
  playlist,
  startIndex = 0,
  autoplay = false,
  width = '100%',
  height = 240
}, ref) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const playerRef = useRef<any>(null);
  const [index, setIndex] = useState(Math.max(0, Math.min(startIndex, playlist.length - 1)));

  useImperativeHandle(ref, () => ({
    play: () => playerRef.current?.playVideo(),
    pause: () => playerRef.current?.pauseVideo(),
    next: () => {
      const nxt = (index + 1) % playlist.length;
      setIndex(nxt);
      playerRef.current?.loadVideoById(playlist[nxt]);
    },
    prev: () => {
      const prev = (index - 1 + playlist.length) % playlist.length;
      setIndex(prev);
      playerRef.current?.loadVideoById(playlist[prev]);
    },
    mute: () => playerRef.current?.mute(),
    unmute: () => playerRef.current?.unMute(),
    getState: () => playerRef.current ? playerRef.current.getPlayerState() : null
  }), [index, playlist]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      await loadYouTubeApi();
      if (!mounted || !containerRef.current) return;
      // if a player exists, destroy it first
      if (playerRef.current && playerRef.current.destroy) {
        try { playerRef.current.destroy(); } catch {}
      }
      playerRef.current = new (window as any).YT.Player(containerRef.current, {
        height: String(height),
        width: String(width),
        videoId: playlist[index],
        playerVars: {
          autoplay: autoplay ? 1 : 0,
          controls: 0,
          rel: 0,
          modestbranding: 1,
          disablekb: 0,
          iv_load_policy: 3
        },
        events: {
          onReady: (e: any) => {
            if (autoplay) e.target.playVideo();
          },
          onStateChange: (event: any) => {
            // when video ends -> auto next
            if (event.data === (window as any).YT?.PlayerState.ENDED) {
              const nxt = (index + 1) % playlist.length;
              setIndex(nxt);
              playerRef.current?.loadVideoById(playlist[nxt]);
            }
          }
        }
      });
    })();
    return () => { mounted = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // init once

  // track index changes triggered by imperative calls or internal next/prev
  useEffect(() => {
    if (!playerRef.current || !playerRef.current.loadVideoById) return;
    playerRef.current.loadVideoById(playlist[index]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  return (
    <div style={{ width }} className="youtube-player-wrapper">
      <div ref={containerRef} />
    </div>
  );
});

export default YouTubePlayer;