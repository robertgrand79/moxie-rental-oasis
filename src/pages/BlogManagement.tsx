
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBlogPosts } from '@/hooks/useBlogPosts';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import BlogManagementTabs from '@/components/admin/blog/BlogManagementTabs';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Wifi, WifiOff } from 'lucide-react';

const BlogManagement = () => {
  const { loading, error, retryCount, refetch } = useBlogPosts();
  const [searchParams, setSearchParams] = useSearchParams();
  const [autoOpenAdd, setAutoOpenAdd] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Check for action parameter
  useEffect(() => {
    const action = searchParams.get('action');
    if (action === 'add') {
      setAutoOpenAdd(true);
      // Clear the parameter from URL
      setSearchParams(prev => {
        prev.delete('action');
        return prev;
      });
    }
  }, [searchParams, setSearchParams]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Auto-retry when connection is restored
  useEffect(() => {
    if (isOnline && error && error.includes('Network')) {
      console.log('📶 Connection restored, retrying blog posts fetch...');
      setTimeout(() => refetch(), 1000);
    }
  }, [isOnline, error, refetch]);

  if (loading) {
    return (
      <AdminPageWrapper
        title="Blog Management"
        description="Create and manage your blog posts and newsletters"
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">
            Loading blog posts...
            {retryCount > 0 && ` (Retry ${retryCount}/3)`}
          </p>
        </div>
      </AdminPageWrapper>
    );
  }

  if (error) {
    const isNetworkError = error.includes('Network') || error.includes('Failed to fetch');
    
    return (
      <AdminPageWrapper
        title="Blog Management"
        description="Create and manage your blog posts and newsletters"
      >
        <div className="text-center py-8">
          <div className="mb-4">
            {isNetworkError ? (
              <div className="flex items-center justify-center mb-4">
                {isOnline ? (
                  <WifiOff className="h-12 w-12 text-red-500" />
                ) : (
                  <Wifi className="h-12 w-12 text-yellow-500" />
                )}
              </div>
            ) : (
              <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            )}
          </div>
          
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isNetworkError ? 'Connection Problem' : 'Error Loading Blog Posts'}
          </h3>
          
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            {isNetworkError 
              ? 'Unable to connect to the server. Please check your internet connection and try again.'
              : `Error: ${error}`
            }
          </p>
          
          <div className="flex items-center justify-center gap-4">
            <Button 
              onClick={refetch}
              disabled={loading}
              variant="outline"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Try Again
            </Button>
            
            {!isOnline && (
              <div className="flex items-center text-sm text-orange-600">
                <WifiOff className="h-4 w-4 mr-1" />
                You're offline
              </div>
            )}
          </div>
        </div>
      </AdminPageWrapper>
    );
  }

  return (
    <AdminPageWrapper
      title="Blog Management"
      description="Create and manage your blog posts and newsletters"
    >
      <div className="p-6">
        <BlogManagementTabs autoOpenAdd={autoOpenAdd} />
      </div>
    </AdminPageWrapper>
  );
};

export default BlogManagement;
