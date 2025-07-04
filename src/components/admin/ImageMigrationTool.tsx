
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  Trash2, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2 
} from 'lucide-react';
import { useImageMigration } from '@/hooks/useImageMigration';

const ImageMigrationTool = () => {
  const { 
    migrating, 
    progress, 
    migrateExistingImages, 
    cleanupUnusedOptimizations 
  } = useImageMigration();

  const migrationProgress = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      // Reset to initial state if needed
      // The migration tool itself doesn't need to reset much since it's stateless
    };

    window.addEventListener('resetImageOptimization', handleReset);
    return () => window.removeEventListener('resetImageOptimization', handleReset);
  }, []);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Image Migration & Management
          </CardTitle>
          <CardDescription>
            Migrate existing images to the advanced optimization system and manage storage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Migration Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Migrate Existing Images</h4>
                <p className="text-sm text-muted-foreground">
                  Process all existing blog and property images through the optimization system.
                </p>
              </div>
              <Button 
                onClick={migrateExistingImages}
                disabled={migrating}
                variant="default"
              >
                {migrating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Start Migration
                  </>
                )}
              </Button>
            </div>

            {/* Migration Progress */}
            {migrating && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span>{progress.processed}/{progress.total} images</span>
                </div>
                <Progress value={migrationProgress} className="h-2" />
                
                {progress.current && (
                  <div className="text-xs text-muted-foreground truncate">
                    Processing: {progress.current}
                  </div>
                )}
                
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span>Processed: {progress.processed}</span>
                  </div>
                  {progress.failed > 0 && (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="h-3 w-3 text-red-600" />
                      <span>Failed: {progress.failed}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Migration Summary */}
            {!migrating && progress.total > 0 && (
              <div className="bg-muted/50 rounded-lg p-4">
                <h5 className="font-medium text-sm mb-2">Last Migration Summary</h5>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">{progress.total}</div>
                    <div className="text-muted-foreground">Total Images</div>
                  </div>
                  <div>
                    <div className="font-medium text-green-600">{progress.processed}</div>
                    <div className="text-muted-foreground">Processed</div>
                  </div>
                  <div>
                    <div className="font-medium text-red-600">{progress.failed}</div>
                    <div className="text-muted-foreground">Failed</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Cleanup Section */}
          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium">Cleanup Unused Optimizations</h4>
                <p className="text-sm text-muted-foreground">
                  Remove optimized versions of images that are no longer in use.
                </p>
              </div>
              <Button 
                onClick={cleanupUnusedOptimizations}
                variant="outline"
                disabled={migrating}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Cleanup Storage
              </Button>
            </div>
          </div>

          {/* Migration Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="space-y-2">
                <h5 className="font-medium text-blue-900">Migration Tips</h5>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Migration runs in the background and can be safely interrupted</li>
                  <li>• Existing images will continue to work during migration</li>
                  <li>• Optimized versions are generated on-demand after migration</li>
                  <li>• Run cleanup periodically to manage storage space</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageMigrationTool;
