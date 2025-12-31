import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface TVHeaderProps {
  propertyName?: string;
  logoUrl?: string;
  guestName?: string;
  className?: string;
}

/**
 * TVHeader - Header component for TV interface
 * 
 * Shows:
 * - Property branding (logo/name)
 * - Current time
 * - Guest welcome message
 */
const TVHeader: React.FC<TVHeaderProps> = ({
  propertyName,
  logoUrl,
  guestName,
  className
}) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <header className={cn(
      "flex items-center justify-between py-6",
      className
    )}>
      {/* Left: Logo/Property Name */}
      <div className="flex items-center gap-4">
        {logoUrl ? (
          <img 
            src={logoUrl} 
            alt={propertyName || 'Property'} 
            className="h-12 md:h-16 w-auto object-contain"
          />
        ) : propertyName ? (
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {propertyName}
          </h1>
        ) : null}
      </div>

      {/* Center: Guest Welcome */}
      {guestName && (
        <div className="text-center">
          <p className="text-xl md:text-2xl text-muted-foreground">
            Welcome, <span className="text-foreground font-medium">{guestName}</span>
          </p>
        </div>
      )}

      {/* Right: Time Display */}
      <div className="text-right">
        <p className="text-3xl md:text-4xl font-light tabular-nums text-foreground">
          {format(currentTime, 'h:mm')}
          <span className="text-xl md:text-2xl text-muted-foreground ml-1">
            {format(currentTime, 'a')}
          </span>
        </p>
        <p className="text-lg md:text-xl text-muted-foreground">
          {format(currentTime, 'EEEE, MMMM d')}
        </p>
      </div>
    </header>
  );
};

export default TVHeader;
