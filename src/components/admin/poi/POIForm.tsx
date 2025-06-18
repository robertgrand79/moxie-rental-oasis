
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import ContentSuggestions from '@/components/admin/ContentSuggestions';
import POIFormFields, { POIFormData } from './POIFormFields';

interface POIFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingPOI: PointOfInterest | null;
  onSubmit: (formData: POIFormData) => Promise<void>;
  categories: Array<{ value: string; label: string }>;
}

const POIForm = ({ isOpen, onOpenChange, editingPOI, onSubmit, categories }: POIFormProps) => {
  const { user } = useAuth();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);

  const [formData, setFormData] = useState<POIFormData>({
    name: editingPOI?.name || '',
    description: editingPOI?.description || '',
    address: editingPOI?.address || '',
    latitude: editingPOI?.latitude || 0,
    longitude: editingPOI?.longitude || 0,
    category: editingPOI?.category || 'other',
    phone: editingPOI?.phone || '',
    website_url: editingPOI?.website_url || '',
    image_url: editingPOI?.image_url || '',
    rating: editingPOI?.rating || 0,
    price_level: editingPOI?.price_level || 0,
    distance_from_properties: editingPOI?.distance_from_properties || 0,
    driving_time: editingPOI?.driving_time || 0,
    walking_time: editingPOI?.walking_time || 0,
    is_featured: editingPOI?.is_featured || false,
    is_active: editingPOI?.is_active !== false,
    display_order: editingPOI?.display_order || 0,
    status: editingPOI?.status || 'draft',
    created_by: editingPOI?.created_by || user?.id || ''
  });

  React.useEffect(() => {
    if (editingPOI) {
      setFormData({
        name: editingPOI.name,
        description: editingPOI.description || '',
        address: editingPOI.address || '',
        latitude: editingPOI.latitude || 0,
        longitude: editingPOI.longitude || 0,
        category: editingPOI.category || 'other',
        phone: editingPOI.phone || '',
        website_url: editingPOI.website_url || '',
        image_url: editingPOI.image_url || '',
        rating: editingPOI.rating || 0,
        price_level: editingPOI.price_level || 0,
        distance_from_properties: editingPOI.distance_from_properties || 0,
        driving_time: editingPOI.driving_time || 0,
        walking_time: editingPOI.walking_time || 0,
        is_featured: editingPOI.is_featured || false,
        is_active: editingPOI.is_active !== false,
        display_order: editingPOI.display_order || 0,
        status: editingPOI.status || 'draft',
        created_by: editingPOI.created_by
      });
    } else {
      setFormData({
        name: '',
        description: '',
        address: '',
        latitude: 0,
        longitude: 0,
        category: 'other',
        phone: '',
        website_url: '',
        image_url: '',
        rating: 0,
        price_level: 0,
        distance_from_properties: 0,
        driving_time: 0,
        walking_time: 0,
        is_featured: false,
        is_active: true,
        display_order: 0,
        status: 'draft',
        created_by: user?.id || ''
      });
    }
  }, [editingPOI, user]);

  const handleAddressChange = (address: string) => {
    setFormData({ ...formData, address });
    if (address.length > 2) {
      const suggestions = getLocationBasedSuggestions(address, editingPOI?.id, 'poi');
      setLocationSuggestions(suggestions);
      setShowSuggestions(suggestions.length > 0);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleCategoryChange = (category: string) => {
    setFormData({ ...formData, category });
    const suggestions = getCategoryBasedSuggestions(category, editingPOI?.id, 'poi');
    setCategorySuggestions(suggestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPOI ? 'Edit Point of Interest' : 'Add New Point of Interest'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <POIFormFields
                formData={formData}
                setFormData={setFormData}
                categories={categories}
                onAddressChange={handleAddressChange}
                onCategoryChange={handleCategoryChange}
              />

              <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPOI ? 'Update Point of Interest' : 'Create Point of Interest'}
                </Button>
              </div>
            </form>
          </div>
          
          <div className="lg:col-span-1">
            {showSuggestions && (
              <ContentSuggestions
                suggestions={locationSuggestions}
                title="Similar Location Content"
              />
            )}
            
            {categorySuggestions.length > 0 && (
              <ContentSuggestions
                suggestions={categorySuggestions}
                title="Same Category Content"
              />
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default POIForm;
