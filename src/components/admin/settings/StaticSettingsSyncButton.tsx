
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
    console.log('🔄 Starting sync process...');
    
    // Invalidate all cached queries to force fresh data
    await queryClient.invalidateQueries();
    console.log('🧹 Cleared all query caches');
    
    // Sync to public site
    const result = await syncToPublicSite();
    
    if (result.success) {
      console.log('✅ Sync completed successfully');
      // Force page reload to clear any remaining cache
      setTimeout(() => {
        window.location.reload();
      }, 1000);
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
          Public Site Sync & Cache Clear
        </CardTitle>
        <CardDescription className="text-blue-700">
          Sync your admin panel changes to the public site and clear all caches for immediate updates
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
              Syncing & Clearing Cache...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Publish Changes & Clear Cache
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 bg-white/50 p-3 rounded-md">
          <strong>Enhanced Sync:</strong> This button now updates the public website, clears all cached data, and forces fresh data loading for immediate visibility of your changes.
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticSettingsSyncButton;
