import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import TVFocusableButton from './TVFocusableButton';

interface TVAudioPlayerProps {
  src: string;
}

const TVAudioPlayer: React.FC<TVAudioPlayerProps> = ({ src }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  useEffect(() => {
    const playAudio = async () => {
      if (audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (error) {
          console.log('Autoplay blocked, waiting for user interaction:', error);
          setAutoplayBlocked(true);
        }
      }
    };

    playAudio();

    // Fallback: attempt to play on any generic key or click event (like D-Pad navigation)
    const handleInteraction = async () => {
      if (!isPlaying && audioRef.current) {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
          setAutoplayBlocked(false);
        } catch (err) {
          // Keep waiting
        }
      }
    };

    window.addEventListener('keydown', handleInteraction);
    window.addEventListener('click', handleInteraction);

    return () => {
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('click', handleInteraction);
    };
  }, [src, isPlaying]);

  const handleManualPlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setAutoplayBlocked(false);
        })
        .catch((err) => console.error('Failed to play after interaction:', err));
    }
  };

  return (
    <>
      <audio ref={audioRef} src={src} loop preload="auto" />
      
      {autoplayBlocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-md">
          <div className="text-center flex flex-col items-center">
            <h2 className="text-4xl md:text-6xl font-bold mb-8 text-foreground">Welcome to Moxie</h2>
            <p className="text-xl text-muted-foreground mb-12 max-w-lg">
              Press OK on your remote to enter and start your curated experience.
            </p>
            <TVFocusableButton
              onClick={handleManualPlay}
              className="animate-pulse py-6 px-12 text-2xl"
              autoFocus
            >
              Press OK to Enter
            </TVFocusableButton>
          </div>
        </div>
      )}

      {isPlaying && !autoplayBlocked && (
        <div className="fixed bottom-8 left-8 z-50 flex items-center gap-3 rounded-full bg-background/50 backdrop-blur-md px-4 py-2 border border-border/50 shadow-lg">
          <div className="flex items-end h-3 gap-[3px] overflow-hidden py-[1px]">
            <div className="w-[3px] h-full bg-muted-foreground animate-bounce rounded-full" style={{ animationDuration: '0.8s' }} />
            <div className="w-[3px] h-full bg-muted-foreground animate-bounce rounded-full" style={{ animationDuration: '1.2s' }} />
            <div className="w-[3px] h-full bg-muted-foreground animate-bounce rounded-full" style={{ animationDuration: '1s' }} />
          </div>
          <span className="text-xs text-muted-foreground tracking-widest uppercase font-medium">
            Now Playing: Moxie Curated Vibes
          </span>
        </div>
      )}
    </>
  );
};

export default TVAudioPlayer;
