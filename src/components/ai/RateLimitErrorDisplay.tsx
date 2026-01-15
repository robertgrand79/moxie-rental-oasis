import React, { useState, useEffect } from 'react';
import { AlertCircle, Clock, ArrowUpRight, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { AIRateLimitError } from '@/hooks/useAIRateLimits';

interface RateLimitErrorDisplayProps {
  error: AIRateLimitError;
  onRetry?: () => void;
  onDismiss?: () => void;
  compact?: boolean;
  className?: string;
}

/**
 * Displays rate limit errors with countdown timer and upgrade prompts
 */
export function RateLimitErrorDisplay({
  error,
  onRetry,
  onDismiss,
  compact = false,
  className
}: RateLimitErrorDisplayProps) {
  const [countdown, setCountdown] = useState<number | null>(null);
  const [canRetry, setCanRetry] = useState(false);

  // For per-minute limits, show a 60-second countdown
  useEffect(() => {
    if (error.type === 'per_minute_limit') {
      setCountdown(60);
      setCanRetry(false);

      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            setCanRetry(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    } else {
      // Daily limit - no countdown, just show the message
      setCanRetry(false);
      setCountdown(null);
    }
  }, [error.type]);

  const formatCountdown = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}m ${secs}s`;
    }
    return `${secs}s`;
  };

  const tierDisplayName = error.tier.charAt(0).toUpperCase() + error.tier.slice(1);

  if (compact) {
    return (
      <div className={cn("p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-sm", className)}>
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span className="font-medium">
            {error.type === 'per_minute_limit' ? 'Too many requests' : 'Daily limit reached'}
          </span>
        </div>
        
        {countdown !== null && countdown > 0 && (
          <div className="mt-2 flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span className="text-xs">Try again in {formatCountdown(countdown)}</span>
          </div>
        )}

        {canRetry && onRetry && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="mt-2 h-7 text-xs"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Try again
          </Button>
        )}
      </div>
    );
  }

  return (
    <Alert variant="destructive" className={cn("", className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>
          {error.type === 'per_minute_limit' 
            ? 'Rate Limit Exceeded' 
            : 'Daily AI Limit Reached'}
        </span>
        {onDismiss && (
          <Button variant="ghost" size="sm" onClick={onDismiss} className="h-6 text-xs">
            Dismiss
          </Button>
        )}
      </AlertTitle>
      <AlertDescription className="mt-2 space-y-3">
        <p>{error.error}</p>

        {/* Usage info */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">
            {tierDisplayName} plan: {error.daily_used} / {error.daily_limit} daily requests
          </span>
        </div>

        {/* Progress bar showing usage */}
        <Progress 
          value={(error.daily_used / error.daily_limit) * 100} 
          className="h-2 [&>div]:bg-destructive"
        />

        {/* Countdown timer for per-minute limit */}
        {countdown !== null && countdown > 0 && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Clock className="h-5 w-5 text-muted-foreground animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium">Please wait...</p>
              <p className="text-xs text-muted-foreground">
                You can try again in {formatCountdown(countdown)}
              </p>
            </div>
            <div className="text-2xl font-mono font-bold text-primary">
              {formatCountdown(countdown)}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          {canRetry && onRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          )}

          {error.upgrade_available && (
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/subscription">
                <span>Upgrade Plan</span>
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </a>
            </Button>
          )}
        </div>
      </AlertDescription>
    </Alert>
  );
}

/**
 * Inline message version for chat interfaces
 */
export function RateLimitChatMessage({
  error,
  onRetry,
  bubbleColor
}: {
  error: AIRateLimitError;
  onRetry?: () => void;
  bubbleColor?: string;
}) {
  const [countdown, setCountdown] = useState<number | null>(null);

  useEffect(() => {
    if (error.type === 'per_minute_limit') {
      setCountdown(60);
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev === null || prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [error.type]);

  const isMinuteLimit = error.type === 'per_minute_limit';

  return (
    <div className="max-w-[85%] p-3 rounded-2xl rounded-bl-sm bg-amber-50 border border-amber-200 text-amber-900 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-200">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="space-y-1.5">
          <p className="text-sm font-medium">
            {isMinuteLimit ? "I'm getting a lot of messages right now!" : "We've reached today's AI limit"}
          </p>
          <p className="text-xs opacity-80">
            {isMinuteLimit 
              ? "Let me catch my breath - I'll be ready to help again in just a moment."
              : `You've used all ${error.daily_limit} AI requests for today. The limit resets in 24 hours.`}
          </p>
          
          {countdown !== null && countdown > 0 && (
            <div className="flex items-center gap-2 mt-2 text-xs">
              <Clock className="h-3 w-3 animate-pulse" />
              <span>Ready in {countdown}s...</span>
              <Progress 
                value={((60 - countdown) / 60) * 100} 
                className="h-1.5 flex-1 max-w-20 [&>div]:bg-amber-500"
              />
            </div>
          )}

          {countdown === 0 && onRetry && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onRetry}
              className="mt-1 h-7 text-xs text-amber-800 hover:text-amber-900 hover:bg-amber-100 dark:text-amber-200 dark:hover:bg-amber-900"
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              I'm ready, try again!
            </Button>
          )}

          {error.upgrade_available && !isMinuteLimit && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="mt-1 h-7 text-xs"
            >
              <a href="/admin/subscription">
                Upgrade for more AI credits →
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default RateLimitErrorDisplay;
