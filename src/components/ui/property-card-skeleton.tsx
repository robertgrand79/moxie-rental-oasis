
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

const PropertyCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      <div className="aspect-[4/3] relative">
        <Skeleton className="w-full h-full" />
      </div>
      <CardContent className="p-4 space-y-3">
        <Skeleton className="h-5 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
          <Skeleton className="h-4 w-8" />
        </div>

        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-full" />
        </div>
      </CardContent>
    </Card>
  );
};

export default PropertyCardSkeleton;
