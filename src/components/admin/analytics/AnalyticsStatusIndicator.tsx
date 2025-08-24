import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, RefreshCw, Settings } from 'lucide-react';
import { analyticsService } from '@/services/analytics/analyticsService';
import { useStableSiteSettings } from '@/hooks/useStableSiteSettings';
import { useGoogleAnalytics } from '@/hooks/useGoogleAnalytics';

const AnalyticsStatusIndicator = () => {
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [gaStatus, setGaStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { settings } = useStableSiteSettings();
  
  // Load Google Analytics for this page
  useGoogleAnalytics(settings.googleAnalyticsId || '');

  const checkAnalyticsStatus = async () => {
    setIsLoading(true);
    try {
      const [demoMode, status] = await Promise.all([
        analyticsService.isDemoMode(),
        analyticsService.getGAStatus()
      ]);
      
      setIsDemoMode(demoMode);
      setGaStatus(status);
    } catch (error) {
      console.error('Failed to check analytics status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    await analyticsService.refreshGA();
    await checkAnalyticsStatus();
  };

  useEffect(() => {
    checkAnalyticsStatus();
    
    // Listen for GA script loaded events
    const handleGALoaded = () => {
      setTimeout(checkAnalyticsStatus, 1000);
    };
    
    window.addEventListener('ga-script-loaded', handleGALoaded);
    return () => window.removeEventListener('ga-script-loaded', handleGALoaded);
  }, []);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span className="text-sm text-muted-foreground">Checking analytics status...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isDemoMode ? (
              <AlertCircle className="h-4 w-4 text-yellow-500" />
            ) : (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
            <span className="text-sm font-medium">
              {isDemoMode ? 'Demo Data Mode' : 'Live Analytics Active'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-3 w-3 mr-1" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href="/admin/settings?tab=analytics">
                <Settings className="h-3 w-3 mr-1" />
                Settings
              </a>
            </Button>
          </div>
        </div>
        
        {isDemoMode && (
          <Alert className="mt-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Analytics are showing demo data. To see real analytics, ensure your Google Analytics ID is configured in settings.
              {!settings.googleAnalyticsId && (
                <span className="font-medium"> No GA ID found.</span>
              )}
              {gaStatus && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Status: {gaStatus.status} | GA ID: {settings.googleAnalyticsId || 'Not set'}
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default AnalyticsStatusIndicator;