
import React from 'react';
import { usePropertyManagementLoading } from '@/hooks/usePropertyManagementLoading';
import PropertyManagementLoadingState from './PropertyManagementLoadingState';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Wifi, WifiOff } from 'lucide-react';

interface SmartLoadingWrapperProps {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  view?: 'dashboard' | 'tasks' | 'projects' | 'properties' | 'calendar' | 'workorders';
  error?: Error | null;
  retry?: () => void;
  showSkeleton?: boolean;
  minLoadingTime?: number;
}

const SmartLoadingWrapper = ({
  children,
  isLoading = false,
  loadingMessage,
  view = 'dashboard',
  error,
  retry,
  showSkeleton = true,
  minLoadingTime = 500
}: SmartLoadingWrapperProps) => {
  const { isAnyLoading, getLoadingMessage } = usePropertyManagementLoading();
  const [showMinLoading, setShowMinLoading] = React.useState(false);
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // Handle minimum loading time for better UX
  React.useEffect(() => {
    if (isLoading || isAnyLoading) {
      setShowMinLoading(true);
      const timer = setTimeout(() => {
        setShowMinLoading(false);
      }, minLoadingTime);
      return () => clearTimeout(timer);
    }
  }, [isLoading, isAnyLoading, minLoadingTime]);

  // Handle online/offline status
  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const shouldShowLoading = isLoading || isAnyLoading || showMinLoading;
  const currentLoadingMessage = loadingMessage || getLoadingMessage();

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription className="flex items-center justify-between">
          <span>Failed to load data: {error.message}</span>
          {retry && (
            <button
              onClick={retry}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (!isOnline) {
    return (
      <Alert>
        <WifiOff className="h-4 w-4" />
        <AlertDescription>
          You're currently offline. Some features may not be available.
        </AlertDescription>
      </Alert>
    );
  }

  if (shouldShowLoading) {
    return (
      <PropertyManagementLoadingState
        view={view}
        message={currentLoadingMessage}
        showSkeleton={showSkeleton}
      />
    );
  }

  return (
    <>
      {!isOnline && (
        <Alert className="mb-4">
          <Wifi className="h-4 w-4" />
          <AlertDescription>
            Connection restored. All features are now available.
          </AlertDescription>
        </Alert>
      )}
      {children}
    </>
  );
};

export default SmartLoadingWrapper;
