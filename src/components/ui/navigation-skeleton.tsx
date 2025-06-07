
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const NavigationSkeleton = () => {
  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Skeleton className="h-12 w-32" />
          
          <div className="hidden lg:flex items-center space-x-8">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-16" />
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8 lg:hidden" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavigationSkeleton;
