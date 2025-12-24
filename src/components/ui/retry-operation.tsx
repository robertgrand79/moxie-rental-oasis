import React, { useState, useCallback } from 'react';
import { RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from './button';
import { Card, CardContent } from './card';
import { cn } from '@/lib/utils';

interface RetryOperationProps {
  error: Error | string;
  onRetry: () => Promise<void> | void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
}

/**
 * Component for displaying retry UI after an operation fails
 */
const RetryOperation: React.FC<RetryOperationProps> = ({
  error,
  onRetry,
  className,
  size = 'md',
  showDetails = false,
}) => {
  const [isRetrying, setIsRetrying] = useState(false);
  const errorMessage = error instanceof Error ? error.message : error;

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    try {
      await onRetry();
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry]);

  const sizeClasses = {
    sm: {
      icon: 'h-4 w-4',
      text: 'text-sm',
      button: 'h-8 px-3 text-xs',
    },
    md: {
      icon: 'h-5 w-5',
      text: 'text-base',
      button: 'h-9 px-4',
    },
    lg: {
      icon: 'h-6 w-6',
      text: 'text-lg',
      button: 'h-10 px-6',
    },
  };

  const sizes = sizeClasses[size];

  return (
    <Card className={cn('border-destructive/50 bg-destructive/5', className)}>
      <CardContent className="flex flex-col items-center justify-center py-6 text-center">
        <AlertCircle className={cn('text-destructive mb-3', sizes.icon)} />
        <p className={cn('text-destructive font-medium mb-1', sizes.text)}>
          Something went wrong
        </p>
        {showDetails && (
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {errorMessage}
          </p>
        )}
        <Button
          onClick={handleRetry}
          disabled={isRetrying}
          variant="outline"
          size={size === 'sm' ? 'sm' : 'default'}
          className="border-destructive/50 text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default RetryOperation;

/**
 * Hook for managing retry state
 */
export function useRetry(maxRetries: number = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  const canRetry = retryCount < maxRetries;

  const retry = useCallback(async <T,>(operation: () => Promise<T>): Promise<T | undefined> => {
    if (!canRetry) return undefined;

    setIsRetrying(true);
    try {
      const result = await operation();
      setRetryCount(0); // Reset on success
      return result;
    } catch (error) {
      setRetryCount(prev => prev + 1);
      throw error;
    } finally {
      setIsRetrying(false);
    }
  }, [canRetry]);

  const reset = useCallback(() => {
    setRetryCount(0);
    setIsRetrying(false);
  }, []);

  return {
    retryCount,
    isRetrying,
    canRetry,
    retry,
    reset,
    remainingRetries: maxRetries - retryCount,
  };
}
