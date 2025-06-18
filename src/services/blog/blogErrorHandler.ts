
import { toast } from '@/hooks/use-toast';

export const isNetworkError = (error: any): boolean => {
  return error?.message?.includes('Failed to fetch') || 
         error?.message?.includes('Network request failed') ||
         error?.name === 'NetworkError' ||
         error?.code === 'NETWORK_ERROR';
};

export const handleBlogServiceError = (operation: string, error: any, showToast = true): never => {
  console.error(`❌ ${operation} error:`, error);
  
  let errorMessage = 'An unexpected error occurred';
  
  if (isNetworkError(error)) {
    errorMessage = 'Network connection error. Please check your internet connection.';
  } else if (error?.message) {
    errorMessage = error.message;
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
