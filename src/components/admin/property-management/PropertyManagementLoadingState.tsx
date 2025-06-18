
import React from 'react';
import { Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { 
  PropertyCardSkeleton, 
  TaskCardSkeleton, 
  ProjectRowSkeleton, 
  StatsCardSkeleton,
  TableRowSkeleton 
} from '@/components/ui/property-management-skeleton';

interface PropertyManagementLoadingStateProps {
  view?: 'dashboard' | 'tasks' | 'projects' | 'properties' | 'calendar' | 'workorders';
  message?: string;
  showSkeleton?: boolean;
}

const PropertyManagementLoadingState = ({ 
  view = 'dashboard', 
  message = 'Loading...', 
  showSkeleton = true 
}: PropertyManagementLoadingStateProps) => {
  if (!showSkeleton) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-gray-600 font-medium">{message}</p>
        </div>
      </div>
    );
  }

  const renderSkeletonContent = () => {
    switch (view) {
      case 'dashboard':
        return (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <StatsCardSkeleton key={i} />
              ))}
            </div>
            
            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Tasks Column */}
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                {Array.from({ length: 4 }).map((_, i) => (
                  <TaskCardSkeleton key={i} />
                ))}
              </div>
              
              {/* Projects Column */}
              <div className="space-y-4">
                <div className="h-6 w-32 bg-gray-200 rounded animate-pulse" />
                {Array.from({ length: 3 }).map((_, i) => (
                  <ProjectRowSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        );
        
      case 'properties':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <PropertyCardSkeleton key={i} />
            ))}
          </div>
        );
        
      case 'tasks':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 9 }).map((_, i) => (
                <TaskCardSkeleton key={i} />
              ))}
            </div>
          </div>
        );
        
      case 'projects':
        return (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
              <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectRowSkeleton key={i} />
            ))}
          </div>
        );
        
      case 'workorders':
        return (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <th key={i} className="px-4 py-3">
                        <div className="h-4 bg-gray-200 rounded animate-pulse" />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 8 }).map((_, i) => (
                    <TableRowSkeleton key={i} columns={8} />
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        );
        
      default:
        return (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-primary" />
        <span className="text-gray-600 font-medium">{message}</span>
      </div>
      {renderSkeletonContent()}
    </div>
  );
};

export default PropertyManagementLoadingState;
