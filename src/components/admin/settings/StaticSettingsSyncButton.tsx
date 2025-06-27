
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Loader2, CheckCircle, AlertCircle, RefreshCw, Zap } from 'lucide-react';
import { useStaticSettingsSync } from '@/hooks/useStaticSettingsSync';
import { useAutoSync } from '@/hooks/useAutoSync';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';
import { useQueryClient } from '@tanstack/react-query';

const StaticSettingsSyncButton = () => {
  const { syncToPublicSite, syncing, lastSyncTime } = useStaticSettingsSync();
  const { isSyncing: autoSyncing, lastSyncTime: autoSyncTime, enabled: autoSyncEnabled } = useAutoSync();
  const queryClient = useQueryClient();

  // Only show on admin domain
  if (!shouldShowAdminFeatures()) {
    return null;
  }

  const handleManualSync = async () => {
    console.log('🔄 Starting manual sync process...');
    
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
      console.log('✅ Manual sync completed successfully');
      
      // Step 5: Force aggressive reload after a brief delay
      console.log('🔄 Forcing page reload to ensure fresh data...');
      setTimeout(() => {
        queryClient.clear();
        window.location.reload();
      }, 1500);
    } else {
      console.error('❌ Manual sync failed:', result.error);
    }
  };

  const formatSyncTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  const getLastSyncTime = () => {
    if (autoSyncTime) return autoSyncTime;
    if (lastSyncTime) return lastSyncTime;
    return null;
  };

  const lastSync = getLastSyncTime();

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Globe className="h-5 w-5" />
          Site Sync Status
          {autoSyncEnabled && (
            <div className="flex items-center gap-1 ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
              <Zap className="h-3 w-3" />
              Auto-sync ON
            </div>
          )}
        </CardTitle>
        <CardDescription className="text-blue-700">
          {autoSyncEnabled 
            ? 'Changes automatically sync to public site. Manual sync available for troubleshooting.'
            : 'Manually sync changes to the public site and clear caches'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {autoSyncing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                Auto-syncing in progress...
              </>
            ) : lastSync ? (
              <>
                <CheckCircle className="h-4 w-4 text-green-500" />
                Last synced: {formatSyncTime(lastSync)}
                {autoSyncTime && <span className="text-xs text-green-600 ml-1">(auto)</span>}
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
          onClick={handleManualSync}
          disabled={syncing || autoSyncing}
          variant="outline"
          className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
          size="lg"
        >
          {syncing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Manual Sync in Progress...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Force Manual Sync & Clear Caches
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 bg-white/50 p-3 rounded-md">
          <strong>Auto-sync:</strong> Changes to settings, events, and other content automatically sync to the public site.
          <br />
          <strong>Manual sync:</strong> Use this for troubleshooting or when you need immediate cache clearing and page reload.
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticSettingsSyncButton;
