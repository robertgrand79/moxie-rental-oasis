import React from 'react';
import { cn } from '@/lib/utils';
import TVAudioPlayer from './TVAudioPlayer';

interface TVLayoutProps {
  children: React.ReactNode;
  className?: string;
  showSafeZone?: boolean;
}

/**
 * TVLayout - 10-foot UI wrapper for TV interfaces
 * 
 * Implements:
 * - TV-safe zone margins (5% from edges)
 * - Large, readable typography
 * - Optimized for D-pad navigation
 * - High contrast for TV viewing distance
 */
const TVLayout: React.FC<TVLayoutProps> = ({ 
  children, 
  className,
  showSafeZone = false 
}) => {
  return (
    <div 
      className={cn(
        "min-h-screen w-full bg-background text-foreground overflow-hidden",
        "tv-layout",
        className
      )}
      style={{
        // TV-safe zone: 5% margin from all edges
        padding: '5vh 5vw',
      }}
    >
      <TVAudioPlayer src="https://joiovubyokikqjytxtuv.supabase.co/storage/v1/object/public/assets/moxie-island-vibe.mp3" />
      
      {showSafeZone && (
        <div 
          className="fixed inset-0 pointer-events-none border-4 border-dashed border-red-500/30 z-50"
          style={{ margin: '5vh 5vw' }}
        />
      )}
      <div className="h-full w-full relative z-10">
        {children}
      </div>
    </div>
  );
};

export default TVLayout;

// TV-specific CSS variables and utilities
export const tvStyles = {
  // Typography scale for 10-foot UI
  heading1: 'text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight',
  heading2: 'text-4xl md:text-5xl lg:text-6xl font-semibold',
  heading3: 'text-2xl md:text-3xl lg:text-4xl font-medium',
  body: 'text-xl md:text-2xl lg:text-3xl',
  bodySmall: 'text-lg md:text-xl lg:text-2xl',
  caption: 'text-base md:text-lg lg:text-xl text-muted-foreground',
  
  // Button sizes for remote control
  buttonLarge: 'h-16 md:h-20 px-8 md:px-12 text-xl md:text-2xl rounded-xl',
  buttonMedium: 'h-12 md:h-16 px-6 md:px-8 text-lg md:text-xl rounded-lg',
  
  // Focus ring for D-pad navigation
  focusRing: 'focus:outline-none focus:ring-4 focus:ring-primary focus:ring-offset-4 focus:ring-offset-background',
  
  // Card sizes
  cardLarge: 'p-8 md:p-12 rounded-2xl',
  cardMedium: 'p-6 md:p-8 rounded-xl',
  
  // Icon sizes
  iconLarge: 'h-16 w-16 md:h-20 md:w-20',
  iconMedium: 'h-10 w-10 md:h-12 md:w-12',
  iconSmall: 'h-8 w-8 md:h-10 md:w-10',
};
