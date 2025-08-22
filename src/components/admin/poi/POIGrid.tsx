
import React from 'react';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import POICard from './POICard';
import { MapPin } from 'lucide-react';

interface POIGridProps {
  pointsOfInterest: PointOfInterest[];
  onEdit: (item: PointOfInterest) => void;
  onDelete: (id: string) => void;
  onEnhance: (item: PointOfInterest) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (item: PointOfInterest) => any[];
  // Inline editing props
  editingInlineId: string | null;
  onToggleInlineEdit: (poi: PointOfInterest) => void;
  editFormData: any;
  setEditFormData: (data: any) => void;
  onSubmitInlineEdit: (data: any) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
  isSubmittingInline: boolean;
}

const POIGrid = ({
  pointsOfInterest,
  onEdit,
  onDelete,
  onEnhance,
  isEnhancing,
  enhancingId,
  getSuggestions,
  editingInlineId,
  onToggleInlineEdit,
  editFormData,
  setEditFormData,
  onSubmitInlineEdit,
  categories,
  isSubmittingInline
}: POIGridProps) => {
  if (pointsOfInterest.length === 0) {
    return (
      <div className="col-span-full text-center py-12 text-gray-500">
        <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p className="text-lg font-medium mb-2">No points of interest found</p>
        <p>Add your first point of interest to get started</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {pointsOfInterest.map((poi) => (
        <POICard
          key={poi.id}
          poi={poi}
          onEdit={onEdit}
          onDelete={onDelete}
          onEnhance={onEnhance}
          isEnhancing={isEnhancing}
          enhancingId={enhancingId}
          suggestions={getSuggestions(poi)}
          isEditing={editingInlineId === poi.id}
          onToggleEdit={onToggleInlineEdit}
          editFormData={editingInlineId === poi.id ? editFormData : null}
          setEditFormData={setEditFormData}
          onSubmitInlineEdit={onSubmitInlineEdit}
          categories={categories}
          isSubmitting={isSubmittingInline}
        />
      ))}
    </div>
  );
};

export default POIGrid;
