
import React from 'react';
import { EnhancedSkeleton } from './enhanced-skeleton';
import { Card, CardContent } from './card';

const AdminCardSkeleton = () => {
  return (
    <Card className="group bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
      <CardContent className="p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-4">
            <EnhancedSkeleton 
              variant="circular" 
              className="w-16 h-16"
              animation="wave"
            />
            <div className="space-y-3">
              <EnhancedSkeleton 
                variant="text" 
                className="h-6 w-48"
                animation="wave"
              />
              <EnhancedSkeleton 
                variant="text" 
                className="h-4 w-32"
                animation="wave"
              />
            </div>
          </div>
          <EnhancedSkeleton 
            variant="rectangular" 
            className="w-6 h-6 rounded"
            animation="wave"
          />
        </div>
        
        <div className="space-y-3 mb-6">
          <EnhancedSkeleton 
            variant="text" 
            className="h-4 w-full"
            animation="wave"
          />
          <EnhancedSkeleton 
            variant="text" 
            className="h-4 w-3/4"
            animation="wave"
          />
        </div>

        <div className="flex items-center justify-between">
          <EnhancedSkeleton 
            variant="text" 
            className="h-4 w-24"
            animation="wave"
          />
          <EnhancedSkeleton 
            variant="rectangular" 
            className="w-4 h-4 rounded"
            animation="wave"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminCardSkeleton;
