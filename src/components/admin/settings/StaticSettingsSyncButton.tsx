
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Loader2, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useStaticSettingsSync } from '@/hooks/useStaticSettingsSync';
import { shouldShowAdminFeatures } from '@/utils/domainUtils';

const StaticSettingsSyncButton = () => {
  const { syncToPublicSite, syncing, lastSyncTime } = useStaticSettingsSync();

  // Only show on admin domain
  if (!shouldShowAdminFeatures()) {
    return null;
  }

  const handleSync = async () => {
    await syncToPublicSite();
  };

  const formatSyncTime = (timeString: string) => {
    return new Date(timeString).toLocaleString();
  };

  return (
    <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-blue-900">
          <Globe className="h-5 w-5" />
          Public Site Sync
        </CardTitle>
        <CardDescription className="text-blue-700">
          Sync your admin panel changes to the public moxievacationrentals.com website
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
              Syncing to Public Site...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Publish Changes to Public Site
            </>
          )}
        </Button>

        <div className="text-xs text-gray-500 bg-white/50 p-3 rounded-md">
          <strong>How it works:</strong> This button updates the public website with your latest admin panel changes including hero images, contact information, and all site settings.
        </div>
      </CardContent>
    </Card>
  );
};

export default StaticSettingsSyncButton;
