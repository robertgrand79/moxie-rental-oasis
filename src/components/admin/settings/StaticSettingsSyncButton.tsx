
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useStaticSettingsSync } from '@/hooks/useStaticSettingsSync';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';
import { useQueryClient } from '@tanstack/react-query';

const StaticSettingsSyncButton = () => {
  const { syncToPublicSite, syncing, lastSyncTime } = useStaticSettingsSync();
  const queryClient = useQueryClient();

  // Only show on admin domain
  if (!shouldShowAdminFeatures()) {
    return null;
  }

  const handleSync = async () => {
    console.log('🔄 Starting aggressive sync process...');
    
    // Step 1: Clear ALL React Query caches
    console.log('🧹 Clearing ALL React Query caches...');
    queryClient.clear();
    
    // Step 2: Clear browser caches
    console.log('🧹 Clearing browser caches...');
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('✅ Browser caches cleared');
    }
    
    // Step 3: Force localStorage clear for any cached data
    console.log('🧹 Clearing localStorage cache...');
    Object.keys(localStorage).forEach(key => {
      if (key.includes('query') || key.includes('cache') || key.includes('settings')) {
        localStorage.removeItem(key);
      }
    });
    
    // Step 4: Sync to public site
    console.log('🔄 Syncing to public site...');
    const result = await syncToPublicSite();
    
    if (result.success) {
      console.log('✅ Sync completed successfully');
      
      // Step 5: Force aggressive reload after a brief delay
      console.log('🔄 Forcing page reload to ensure fresh data...');
      setTimeout(() => {
        // Clear all caches one more time before reload
        queryClient.clear();
        window.location.reload();
      }, 1500);
    } else {
      console.error('❌ Sync failed:', result.error);
    }
  };

  const formatSyncTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Globe className="h-5 w-5" />
          Force Sync & Cache Clear
        </CardTitle>
        <CardDescription className="text-blue-700">
          Aggressively sync all changes to the public site and clear ALL caches for immediate updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {lastSyncTime ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last synced: {formatSyncTime(lastSyncTime)}
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Never synced to public site
              </>
            )}
          </div>
        </div>

        <Button 
          onClick={handleSync}
          disabled={syncing}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="lg"
        >
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Force Syncing & Clearing ALL Caches...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Publish & Clear ALL Caches
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 bg-white/50 p-3 rounded-md">
          <strong>Aggressive Sync:</strong> This button now clears ALL browser caches, localStorage, React Query caches, updates the public website, and forces a complete page reload for immediate visibility of changes.
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticSettingsSyncButton;
