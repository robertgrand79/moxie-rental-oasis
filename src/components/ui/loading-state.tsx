
import React from 'react';
import { cn } from '@/lib/utils';
import { EnhancedSkeleton } from './enhanced-skeleton';

interface LoadingStateProps {
  variant?: 'page' | 'card' | 'list' | 'table';
  className?: string;
  message?: string;
}

const LoadingState = ({ variant = 'page', className, message }: LoadingStateProps) => {
  const renderPageLoading = () => (
    <div className="min-h-screen bg-gradient-to-br from-gradient-from to-gradient-to flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-gradient-accent-from rounded-full animate-spin mx-auto animate-pulse"></div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Loading</h3>
          <p className="text-sm text-gray-600">{message || "Please wait while we load your content..."}</p>
        </div>
      </div>
    </div>
  );

  const renderCardLoading = () => (
    <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl p-8 border border-white/20 space-y-4">
      <div className="flex items-center space-x-4">
        <EnhancedSkeleton variant="circular" className="w-12 h-12" animation="wave" />
        <div className="space-y-2 flex-1">
          <EnhancedSkeleton variant="text" className="h-4 w-3/4" animation="wave" />
          <EnhancedSkeleton variant="text" className="h-3 w-1/2" animation="wave" />
        </div>
      </div>
      <div className="space-y-3">
        <EnhancedSkeleton variant="text" className="h-3 w-full" animation="wave" />
        <EnhancedSkeleton variant="text" className="h-3 w-5/6" animation="wave" />
        <EnhancedSkeleton variant="text" className="h-3 w-4/6" animation="wave" />
      </div>
    </div>
  );

  const renderListLoading = () => (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg border">
          <EnhancedSkeleton variant="circular" className="w-10 h-10" animation="wave" />
          <div className="flex-1 space-y-2">
            <EnhancedSkeleton variant="text" className="h-4 w-3/4" animation="wave" />
            <EnhancedSkeleton variant="text" className="h-3 w-1/2" animation="wave" />
          </div>
          <EnhancedSkeleton variant="rectangular" className="w-20 h-8 rounded" animation="wave" />
        </div>
      ))}
    </div>
  );

  const renderTableLoading = () => (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div className="border-b p-4">
        <div className="flex space-x-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <EnhancedSkeleton key={i} variant="text" className="h-4 w-24" animation="wave" />
          ))}
        </div>
      </div>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="border-b p-4">
          <div className="flex space-x-4">
            {Array.from({ length: 4 }).map((_, j) => (
              <EnhancedSkeleton key={j} variant="text" className="h-3 w-24" animation="wave" />
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const variants = {
    page: renderPageLoading,
    card: renderCardLoading,
    list: renderListLoading,
    table: renderTableLoading,
  };

  return (
    <div className={cn("animate-fade-in", className)}>
      {variants[variant]()}
    </div>
  );
};

export default LoadingState;
