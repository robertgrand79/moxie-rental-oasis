import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, AlertTriangle, Loader2 } from 'lucide-react';
import { useImageCleanup } from '@/hooks/useImageCleanup';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ImageCleanupButton = () => {
  const { cleaning, cleanupBrokenImageReferences, findOrphanedImages, deleteOrphanedImages } = useImageCleanup();
  const [orphanedFiles, setOrphanedFiles] = useState<string[]>([]);
  const [showOrphanedDialog, setShowOrphanedDialog] = useState(false);

  const handleCleanupBrokenImages = async () => {
    await cleanupBrokenImageReferences();
  };

  const handleFindOrphanedImages = async () => {
    const orphaned = await findOrphanedImages();
    setOrphanedFiles(orphaned);
    setShowOrphanedDialog(true);
  };

  const handleDeleteOrphanedImages = async () => {
    await deleteOrphanedImages(orphanedFiles);
    setShowOrphanedDialog(false);
    setOrphanedFiles([]);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleCleanupBrokenImages}
        disabled={cleaning}
        className="text-orange-600 hover:text-orange-700"
      >
        {cleaning ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <AlertTriangle className="h-4 w-4 mr-2" />
        )}
        Cleanup Broken Images
      </Button>

      <Button
        variant="outline"
        size="sm"
        onClick={handleFindOrphanedImages}
        disabled={cleaning}
        className="text-red-600 hover:text-red-700"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Find Orphaned Images
      </Button>

      <AlertDialog open={showOrphanedDialog} onOpenChange={setShowOrphanedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Orphaned Images Found</AlertDialogTitle>
            <AlertDialogDescription>
              Found {orphanedFiles.length} orphaned image(s) that are not referenced by any property.
              {orphanedFiles.length > 0 && (
                <div className="mt-4 max-h-48 overflow-y-auto">
                  <div className="text-sm space-y-1">
                    {orphanedFiles.slice(0, 10).map((file, index) => (
                      <div key={index} className="font-mono text-xs bg-gray-100 p-1 rounded">
                        {file}
                      </div>
                    ))}
                    {orphanedFiles.length > 10 && (
                      <div className="text-xs text-gray-500">
                        ...and {orphanedFiles.length - 10} more files
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-4 text-sm font-medium text-red-600">
                ⚠️ This action cannot be undone. Are you sure you want to delete these files?
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteOrphanedImages}
              className="bg-red-600 hover:bg-red-700"
              disabled={orphanedFiles.length === 0}
            >
              Delete {orphanedFiles.length} File(s)
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ImageCleanupButton;