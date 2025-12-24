import { toast } from '@/hooks/use-toast';

interface ErrorLike {
  message?: string;
  name?: string;
  code?: string;
}

export const isNetworkError = (error: unknown): boolean => {
  const err = error as ErrorLike | null;
  return err?.message?.includes('Failed to fetch') || 
         err?.message?.includes('Network request failed') ||
         err?.name === 'NetworkError' ||
         err?.code === 'NETWORK_ERROR' ||
         false;
};

export const handleBlogServiceError = (operation: string, error: unknown, showToast = true): never => {
  console.error(`❌ ${operation} error:`, error);
  
  const err = error as ErrorLike | null;
  let errorMessage = 'An unexpected error occurred';
  
  if (isNetworkError(error)) {
    errorMessage = 'Network connection error. Please check your internet connection.';
  } else if (err?.message) {
    errorMessage = err.message;
  }
  
  if (showToast) {
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive'
    });
  }
  
  throw new Error(errorMessage);
};
