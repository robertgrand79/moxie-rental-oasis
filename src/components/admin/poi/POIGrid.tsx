
import React, { useState } from 'react';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import POICardView from './POICardView';
import POIListView from './POIListView';
import POIViewToggle, { ViewMode } from './POIViewToggle';
import { MapPin } from 'lucide-react';
import { usePointsOfInterest } from '@/hooks/usePointsOfInterest';

interface POIGridProps {
  pointsOfInterest: PointOfInterest[];
  onEdit: (item: PointOfInterest) => void;
  onDelete: (id: string) => void;
  onEnhance: (item: PointOfInterest) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (item: PointOfInterest) => any[];
}

const POIGrid = ({
  pointsOfInterest,
  onEdit,
  onDelete,
  onEnhance,
  isEnhancing,
  enhancingId,
  getSuggestions
}: POIGridProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const { updatePointOfInterest } = usePointsOfInterest();

  const handlePhotoUpdate = async (poiId: string, imageUrl: string) => {
    try {
      await updatePointOfInterest.mutateAsync({
        id: poiId,
        image_url: imageUrl
      });
    } catch (error) {
      console.error('Error updating POI photo:', error);
    }
  };
  if (pointsOfInterest.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
        <p className="text-lg font-medium mb-2">No points of interest found</p>
        <p>Add your first point of interest to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Toggle */}
      <div className="flex justify-end">
        <POIViewToggle 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />
      </div>

      {/* Content based on view mode */}
      {viewMode === 'card' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pointsOfInterest.map((poi) => (
            <POICardView
              key={poi.id}
              poi={poi}
              onEdit={onEdit}
              onDelete={onDelete}
              onEnhance={onEnhance}
              isEnhancing={isEnhancing}
              enhancingId={enhancingId}
              onPhotoUpdate={handlePhotoUpdate}
            />
          ))}
        </div>
      ) : (
        <POIListView
          pointsOfInterest={pointsOfInterest}
          onEdit={onEdit}
          onDelete={onDelete}
          onEnhance={onEnhance}
          isEnhancing={isEnhancing}
          enhancingId={enhancingId}
        />
      )}
    </div>
  );
};

export default POIGrid;
