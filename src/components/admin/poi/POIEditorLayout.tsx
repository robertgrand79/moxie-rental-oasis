import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Eye, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { PointOfInterest } from '@/hooks/usePointsOfInterest';
import { POIFormData } from './POIFormFields';
import POIEditorForm from './POIEditorForm';
import POIPreview from './POIPreview';
import POIAllFieldsGenerator from './POIAllFieldsGenerator';
import POIGrid from './POIGrid';
import POIStatusFilter from './POIStatusFilter';
import { useAuth } from '@/contexts/AuthContext';

interface POIEditorLayoutProps {
  pointsOfInterest: PointOfInterest[];
  categories: Array<{ value: string; label: string }>;
  isLoading: boolean;
  onSubmit: (data: POIFormData & { created_by: string }) => Promise<void>;
  onEdit: (item: PointOfInterest) => void;
  onDelete: (id: string) => void;
  onEnhance: (item: PointOfInterest) => void;
  isEnhancing: boolean;
  enhancingId: string | null;
  getSuggestions: (item: PointOfInterest) => any[];
}

const POIEditorLayout = ({
  pointsOfInterest,
  categories,
  isLoading,
  onSubmit,
  onEdit,
  onDelete,
  onEnhance,
  isEnhancing,
  enhancingId,
  getSuggestions
}: POIEditorLayoutProps) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('list');
  const [editingItem, setEditingItem] = useState<PointOfInterest | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [formData, setFormData] = useState<POIFormData>({
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
    created_by: '',
    status: 'draft',
    show_on_map: true
  });
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Reset function for navigation
  const resetToDefaultState = () => {
    setActiveTab('list');
    setEditingItem(null);
    setStatusFilter('all');
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
      created_by: '',
      status: 'draft',
      show_on_map: true
    });
    setHasUnsavedChanges(false);
    toast.success('POI editor reset to default view');
  };

  // Listen for reset events from navigation
  useEffect(() => {
    window.addEventListener('resetPOIManager', resetToDefaultState);
    return () => window.removeEventListener('resetPOIManager', resetToDefaultState);
  }, []);

  // Filter items based on status
  const filteredItems = useMemo(() => {
    if (statusFilter === 'all') return pointsOfInterest;
    return pointsOfInterest.filter(item => item.status === statusFilter);
  }, [pointsOfInterest, statusFilter]);

  // Calculate item counts for filter badges
  const itemCounts = useMemo(() => ({
    all: pointsOfInterest.length,
    draft: pointsOfInterest.filter(item => item.status === 'draft').length,
    published: pointsOfInterest.filter(item => item.status === 'published').length,
  }), [pointsOfInterest]);

  const handleEdit = (item: PointOfInterest) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      address: item.address || '',
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      category: item.category || 'other',
      phone: item.phone || '',
      website_url: item.website_url || '',
      image_url: item.image_url || '',
      rating: item.rating || 0,
      price_level: item.price_level || 0,
      distance_from_properties: item.distance_from_properties || 0,
      driving_time: item.driving_time || 0,
      walking_time: item.walking_time || 0,
      is_featured: item.is_featured || false,
      is_active: item.is_active !== false,
      display_order: item.display_order || 0,
      created_by: item.created_by,
      status: item.status || 'draft',
      show_on_map: item.show_on_map !== false
    });
    setActiveTab('editor');
  };

  const handleAddNew = () => {
    setEditingItem(null);
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
      created_by: '',
      status: 'draft',
      show_on_map: true
    });
    setActiveTab('editor');
  };

  const handleSubmit = async (data: POIFormData & { created_by: string }) => {
    await onSubmit(data);
    setActiveTab('list');
  };

  const handleAIGenerated = async (generatedItems: any[]) => {
    // Handle multiple generated items
    for (const item of generatedItems) {
      await onSubmit({
        ...item,
        created_by: user?.id || '',
        status: 'draft' // AI generated items start as drafts
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Points of Interest</CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant={activeTab === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('list')}
            >
              <Eye className="h-4 w-4 mr-2" />
              POI List
            </Button>
            <Button
              variant={activeTab === 'editor' ? 'default' : 'outline'}
              size="sm"
              onClick={handleAddNew}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editor
            </Button>
            <Button
              variant={activeTab === 'ai' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setActiveTab('ai')}
            >
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generator
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetToDefaultState}
              title="Reset to default view"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="list">
            <div className="mb-4">
              <POIStatusFilter
                selectedStatus={statusFilter}
                onStatusChange={setStatusFilter}
                itemCounts={itemCounts}
              />
            </div>
            <POIGrid
              pointsOfInterest={filteredItems}
              onEdit={handleEdit}
              onDelete={onDelete}
              onEnhance={onEnhance}
              isEnhancing={isEnhancing}
              enhancingId={enhancingId}
                    getSuggestions={getSuggestions}
            />
            <div className="mt-4">
              <Button onClick={handleAddNew}>
                <Plus className="h-4 w-4 mr-2" />
                Add New POI
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="editor">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <POIEditorForm
                  formData={formData}
                  setFormData={setFormData}
                  categories={categories}
                  editingItem={editingItem}
                  onSubmit={handleSubmit}
                  onCancel={() => setActiveTab('list')}
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Preview</h3>
                <POIPreview item={formData} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="ai">
            <POIAllFieldsGenerator
              onItemsGenerated={handleAIGenerated}
              existingItems={pointsOfInterest}
              categories={categories.map(c => c.value)}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default POIEditorLayout;
