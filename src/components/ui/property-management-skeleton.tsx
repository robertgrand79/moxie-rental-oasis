
import React from 'react';
import { EnhancedSkeleton } from './enhanced-skeleton';
import { Card, CardContent, CardHeader } from './card';

export const PropertyCardSkeleton = () => (
  <Card className="overflow-hidden">
    <EnhancedSkeleton variant="rectangular" className="aspect-video w-full" animation="wave" />
    <CardHeader>
      <EnhancedSkeleton variant="text" className="h-6 w-3/4" animation="wave" />
      <EnhancedSkeleton variant="text" className="h-4 w-1/2" animation="wave" />
    </CardHeader>
    <CardContent className="space-y-3">
      <EnhancedSkeleton variant="text" className="h-4 w-full" animation="wave" />
      <EnhancedSkeleton variant="text" className="h-4 w-2/3" animation="wave" />
      <div className="flex justify-between items-center pt-4">
        <EnhancedSkeleton variant="text" className="h-4 w-20" animation="wave" />
        <div className="flex gap-2">
          <EnhancedSkeleton variant="rectangular" className="h-8 w-16 rounded" animation="wave" />
          <EnhancedSkeleton variant="rectangular" className="h-8 w-16 rounded" animation="wave" />
        </div>
      </div>
    </CardContent>
  </Card>
);

export const TaskCardSkeleton = () => (
  <Card className="p-4 space-y-3">
    <div className="flex items-start justify-between">
      <EnhancedSkeleton variant="text" className="h-5 w-1/2" animation="wave" />
      <EnhancedSkeleton variant="rectangular" className="h-6 w-16 rounded-full" animation="wave" />
    </div>
    <EnhancedSkeleton variant="text" className="h-4 w-full" animation="wave" />
    <EnhancedSkeleton variant="text" className="h-4 w-3/4" animation="wave" />
    <div className="flex items-center justify-between pt-2">
      <EnhancedSkeleton variant="text" className="h-3 w-24" animation="wave" />
      <EnhancedSkeleton variant="rectangular" className="h-6 w-12 rounded-full" animation="wave" />
    </div>
  </Card>
);

export const ProjectRowSkeleton = () => (
  <div className="flex items-center space-x-4 p-4 border rounded-lg">
    <EnhancedSkeleton variant="rectangular" className="h-12 w-12 rounded" animation="wave" />
    <div className="flex-1 space-y-2">
      <EnhancedSkeleton variant="text" className="h-5 w-1/3" animation="wave" />
      <EnhancedSkeleton variant="text" className="h-4 w-1/2" animation="wave" />
    </div>
    <div className="space-y-2">
      <EnhancedSkeleton variant="rectangular" className="h-6 w-20 rounded-full" animation="wave" />
      <EnhancedSkeleton variant="text" className="h-3 w-16" animation="wave" />
    </div>
    <EnhancedSkeleton variant="rectangular" className="h-8 w-8 rounded" animation="wave" />
  </div>
);

export const TableRowSkeleton = ({ columns = 6 }: { columns?: number }) => (
  <tr>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <EnhancedSkeleton 
          variant="text" 
          className={`h-4 ${i === 0 ? 'w-3/4' : i === columns - 1 ? 'w-16' : 'w-full'}`}
          animation="wave"
        />
      </td>
    ))}
  </tr>
);

export const StatsCardSkeleton = () => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <EnhancedSkeleton variant="text" className="h-4 w-24" animation="wave" />
      <EnhancedSkeleton variant="rectangular" className="h-4 w-4 rounded" animation="wave" />
    </CardHeader>
    <CardContent>
      <EnhancedSkeleton variant="text" className="h-8 w-16 mb-2" animation="wave" />
      <EnhancedSkeleton variant="text" className="h-3 w-32" animation="wave" />
    </CardContent>
  </Card>
);
