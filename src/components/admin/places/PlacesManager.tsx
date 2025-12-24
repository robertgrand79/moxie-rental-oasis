import React, { useState, useEffect } from 'react';
import { usePlaces, Place } from '@/hooks/usePlaces';
import { usePlaceCategories } from '@/hooks/usePlaceCategories';
import ModernPlacesHeader from './ModernPlacesHeader';
import PlacesGrid from './PlacesGrid';
import PlacesListView from './PlacesListView';
import PlaceForm from './PlaceForm';
import PlaceDetailPanel from './PlaceDetailPanel';
import CategoryManager from './CategoryManager';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as LucideIcons from 'lucide-react';
import { debug } from '@/utils/debug';

const PlacesManager = () => {
  const { places, isLoading, refetch } = usePlaces();
  const { categories: dbCategories, isLoading: categoriesLoading } = usePlaceCategories();
  
  // State
  const [editingPlace, setEditingPlace] = useState<Place | null>(null);
  const [viewingPlace, setViewingPlace] = useState<Place | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Batch geocoding
  const [isBatchGeocoding, setIsBatchGeocoding] = useState(false);

  // Listen for reset events
  useEffect(() => {
    const handleReset = () => {
      setEditingPlace(null);
      setViewingPlace(null);
      setIsFormOpen(false);
      setShowCategoryManager(false);
      setSearchQuery('');
      setCategoryFilter('all');
      setStatusFilter('all');
    };

    window.addEventListener('resetPlacesManager', handleReset);
    return () => window.removeEventListener('resetPlacesManager', handleReset);
  }, []);

  // Count places missing coordinates
  const placesWithoutCoords = places.filter(
    p => p.address && (!p.latitude || !p.longitude)
  ).length;

  // Build categories from database
  const categories = [
    { value: 'all', label: 'All Places', icon: 'MapPin' },
    ...dbCategories.map(cat => ({
      value: cat.slug,
      label: cat.name,
      icon: cat.icon,
    })),
  ];

  // Filter places
  const filteredPlaces = places.filter(place => {
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        place.name.toLowerCase().includes(search) ||
        place.description?.toLowerCase().includes(search) ||
        place.location_text?.toLowerCase().includes(search) ||
        place.address?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    
    // Category filter
    if (categoryFilter !== 'all' && place.category !== categoryFilter) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all' && place.status !== statusFilter) {
      return false;
    }
    
    return true;
  });

  const handleEdit = (place: Place) => {
    setEditingPlace(place);
    setViewingPlace(null);
    setIsFormOpen(true);
  };

  const handleView = (place: Place) => {
    setViewingPlace(place);
  };

  const handleAddNew = () => {
    setEditingPlace(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPlace(null);
    refetch();
  };

  const handleCloseDetailPanel = () => {
    setViewingPlace(null);
  };

  const handleSwitchToEdit = () => {
    if (viewingPlace) {
      setEditingPlace(viewingPlace);
      setViewingPlace(null);
      setIsFormOpen(true);
    }
  };

  const handleBatchGeocode = async () => {
    setIsBatchGeocoding(true);
    try {
      const { data, error } = await supabase.functions.invoke('geocode-address', {
        body: { batchGeocode: true },
      });

      if (error) throw error;

      if (data) {
        toast.success(
          `Geocoded ${data.success} places. ${data.failed > 0 ? `${data.failed} failed.` : ''}`,
          { duration: 5000 }
        );
        if (data.errors?.length > 0) {
          debug.log('Geocoding errors:', data.errors);
        }
        refetch();
      }
    } catch (error) {
      debug.error('Batch geocoding error:', error);
      toast.error('Failed to batch geocode places');
    } finally {
      setIsBatchGeocoding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="text-center py-8">Loading places...</div>
      </div>
    );
  }

  if (showCategoryManager) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => setShowCategoryManager(false)}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            ← Back to Places
          </button>
        </div>
        <CategoryManager />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <ModernPlacesHeader
        places={places}
        categories={categories}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categoryFilter={categoryFilter}
        onCategoryFilterChange={setCategoryFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddPlace={handleAddNew}
        onManageCategories={() => setShowCategoryManager(true)}
        onRefresh={refetch}
        placesWithoutCoords={placesWithoutCoords}
        onBatchGeocode={handleBatchGeocode}
        isBatchGeocoding={isBatchGeocoding}
      />

      {viewMode === 'grid' ? (
        <PlacesGrid 
          places={filteredPlaces} 
          onEdit={handleEdit} 
          onView={handleView}
        />
      ) : (
        <PlacesListView 
          places={filteredPlaces} 
          onEdit={handleEdit}
          onView={handleView}
        />
      )}

      {isFormOpen && (
        <PlaceForm
          place={editingPlace}
          onClose={handleCloseForm}
        />
      )}

      {viewingPlace && (
        <PlaceDetailPanel
          place={viewingPlace}
          isOpen={!!viewingPlace}
          onClose={handleCloseDetailPanel}
          onEdit={handleSwitchToEdit}
        />
      )}
    </div>
  );
};

export default PlacesManager;
