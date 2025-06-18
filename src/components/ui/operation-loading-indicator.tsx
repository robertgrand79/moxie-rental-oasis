
import React from 'react';
import { Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from './alert';
import { Progress } from './progress';

interface OperationLoadingIndicatorProps {
  isLoading: boolean;
  operation: string;
  success?: boolean;
  error?: string;
  progress?: number;
  estimatedTime?: number;
  onCancel?: () => void;
  onRetry?: () => void;
}

const OperationLoadingIndicator = ({
  isLoading,
  operation,
  success,
  error,
  progress,
  estimatedTime,
  onCancel,
  onRetry
}: OperationLoadingIndicatorProps) => {
  if (!isLoading && !success && !error) {
    return null;
  }

  if (success) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          {operation} completed successfully!
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription className="flex items-center justify-between">
          <span>{operation} failed: {error}</span>
          {onRetry && (
            <button
              onClick={onRetry}
              className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
            >
              Retry
            </button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <Alert>
        <Loader2 className="h-4 w-4 animate-spin" />
        <AlertDescription>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span>{operation}...</span>
              {estimatedTime && (
                <div className="flex items-center text-sm text-gray-500">
                  <Clock className="h-3 w-3 mr-1" />
                  ~{estimatedTime}s
                </div>
              )}
            </div>
            
            {progress !== undefined && (
              <Progress value={progress} className="w-full" />
            )}
            
            <div className="flex justify-between items-center">
              {progress !== undefined && (
                <span className="text-sm text-gray-600">{progress}% complete</span>
              )}
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-sm text-gray-500 hover:text-gray-700 underline"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  return null;
};

export default OperationLoadingIndicator;
