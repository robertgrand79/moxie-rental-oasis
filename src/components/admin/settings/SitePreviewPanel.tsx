import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Monitor, Smartphone, Tablet, ExternalLink, RefreshCw, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SitePreviewPanelProps {
  previewUrl?: string;
  className?: string;
}

type ViewMode = 'desktop' | 'tablet' | 'mobile';

const viewModeConfig: Record<ViewMode, { icon: React.ElementType; width: string; label: string }> = {
  desktop: { icon: Monitor, width: '100%', label: 'Desktop' },
  tablet: { icon: Tablet, width: '768px', label: 'Tablet' },
  mobile: { icon: Smartphone, width: '375px', label: 'Mobile' },
};

const SitePreviewPanel = ({ previewUrl = '/', className }: SitePreviewPanelProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('desktop');
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const handleRefresh = () => {
    setIsLoading(true);
    setRefreshKey(prev => prev + 1);
  };

  const handleOpenExternal = () => {
    window.open(previewUrl, '_blank');
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Eye className="h-5 w-5 text-primary" />
            Live Site Preview
          </CardTitle>
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border rounded-lg p-1 bg-muted">
              {Object.entries(viewModeConfig).map(([mode, config]) => {
                const Icon = config.icon;
                return (
                  <Button
                    key={mode}
                    variant={viewMode === mode ? 'default' : 'ghost'}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setViewMode(mode as ViewMode)}
                    title={config.label}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                );
              })}
            </div>
            
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              className="h-8 w-8 p-0"
              title="Refresh Preview"
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
            
            {/* Open External */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenExternal}
              className="h-8"
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Open
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Preview shows unpublished changes • {viewModeConfig[viewMode].label} view
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div 
          className="relative bg-muted flex justify-center items-start overflow-auto"
          style={{ height: '600px' }}
        >
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <div className="flex flex-col items-center gap-2">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm text-muted-foreground">Loading preview...</span>
              </div>
            </div>
          )}
          
          {/* Preview Frame */}
          <div 
            className={cn(
              'bg-background border shadow-lg transition-all duration-300 h-full overflow-hidden',
              viewMode !== 'desktop' && 'rounded-lg mx-4 my-4'
            )}
            style={{ 
              width: viewModeConfig[viewMode].width,
              maxWidth: '100%',
              height: viewMode === 'desktop' ? '100%' : 'calc(100% - 32px)'
            }}
          >
            <iframe
              key={refreshKey}
              src={previewUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title="Site Preview"
              sandbox="allow-same-origin allow-scripts allow-forms"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SitePreviewPanel;
