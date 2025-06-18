
import React, { useState, useEffect } from 'react';
import { Check, Clock, AlertCircle } from 'lucide-react';

interface AutoSaveIndicatorProps {
  isAutoSaving?: boolean;
  lastSaved?: Date | null;
  hasUnsavedChanges?: boolean;
}

const AutoSaveIndicator = ({ 
  isAutoSaving = false, 
  lastSaved = null, 
  hasUnsavedChanges = false 
}: AutoSaveIndicatorProps) => {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) return;

    const updateTimeAgo = () => {
      const now = new Date();
      const diffInSeconds = Math.floor((now.getTime() - lastSaved.getTime()) / 1000);
      
      if (diffInSeconds < 60) {
        setTimeAgo('just now');
      } else if (diffInSeconds < 3600) {
        const minutes = Math.floor(diffInSeconds / 60);
        setTimeAgo(`${minutes}m ago`);
      } else {
        const hours = Math.floor(diffInSeconds / 3600);
        setTimeAgo(`${hours}h ago`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [lastSaved]);

  if (isAutoSaving) {
    return (
      <div className="flex items-center text-sm text-blue-600">
        <Clock className="h-4 w-4 mr-1 animate-spin" />
        Saving draft...
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className="flex items-center text-sm text-orange-600">
        <AlertCircle className="h-4 w-4 mr-1" />
        Unsaved changes
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className="flex items-center text-sm text-green-600">
        <Check className="h-4 w-4 mr-1" />
        Draft saved {timeAgo}
      </div>
    );
  }

  return null;
};

export default AutoSaveIndicator;
