
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Image } from 'lucide-react';
import { usePointsOfInterest, PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import POIForm from './POIForm';
import POICard from './POICard';
import { POIFormData } from './POIFormFields';

const categories = [
  'restaurants',
  'cafes',
  'bars',
  'museums',
  'parks',
  'shopping',
  'attractions',
  'other'
];

const POIManager = () => {
  const { pointsOfInterest, isLoading, createPointOfInterest, updatePointOfInterest, deletePointOfInterest } = usePointsOfInterest();
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<PointOfInterest | null>(null);

  const poiCategories = categories.map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  const handleEdit = (poi: PointOfInterest) => {
    setEditingPOI(poi);
    setIsDialogOpen(true);
  };

  const handleSubmit = async (formData: POIFormData) => {
    try {
      if (editingPOI) {
        await updatePointOfInterest.mutateAsync({ id: editingPOI.id, ...formData });
      } else {
        await createPointOfInterest.mutateAsync(formData);
      }
      setEditingPOI(null);
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error saving point of interest:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this point of interest?')) {
      try {
        await deletePointOfInterest.mutateAsync(id);
      } catch (error) {
        console.error('Error deleting point of interest:', error);
      }
    }
  };

  const resetForm = () => {
    setEditingPOI(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points of Interest</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading points of interest...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Points of Interest</CardTitle>
            <CardDescription>
              Manage local attractions and points of interest for guests
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => { resetForm(); setIsDialogOpen(true); }}>
              <Plus className="h-4 w-4 mr-2" />
              Add Point of Interest
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pointsOfInterest.map((poi) => (
            <POICard
              key={poi.id}
              poi={poi}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onEnhance={() => {}}
              isEnhancing={false}
              enhancingId={null}
              suggestions={[
                ...getLocationBasedSuggestions(poi.address || '', poi.id, 'poi'),
                ...getCategoryBasedSuggestions(poi.category || '', poi.id, 'poi')
              ].slice(0, 2)}
            />
          ))}
          {pointsOfInterest.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No points of interest found</p>
              <p>Add your first point of interest to get started</p>
            </div>
          )}
        </div>
      </CardContent>

      <POIForm
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingPOI={editingPOI}
        onSubmit={handleSubmit}
        categories={poiCategories}
      />
    </Card>
  );
};

export default POIManager;
