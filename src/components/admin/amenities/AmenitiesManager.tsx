import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, GripVertical, Pencil, Trash2, Save, Loader2 } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { useHomeAmenities, HomeAmenity } from '@/hooks/useHomeAmenities';
import { useSimplifiedSiteSettings } from '@/hooks/useSimplifiedSiteSettings';
import AmenityForm from './AmenityForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const DEFAULT_AMENITIES = [
  { name: "High-Speed WiFi", icon_name: "Wifi", color: "text-blue-500" },
  { name: "Free Parking", icon_name: "Car", color: "text-gray-500" },
  { name: "Coffee & Tea", icon_name: "Coffee", color: "text-amber-500" },
  { name: "Full Kitchen", icon_name: "Utensils", color: "text-emerald-500" },
  { name: "Smart TV", icon_name: "Tv", color: "text-purple-500" },
  { name: "Hot Tub", icon_name: "Waves", color: "text-teal-500" },
  { name: "Garden Access", icon_name: "TreePine", color: "text-green-500" },
  { name: "Fitness Access", icon_name: "Dumbbell", color: "text-orange-500" },
];

const AmenitiesManager: React.FC = () => {
  const { amenities, isLoading, createAmenity, updateAmenity, deleteAmenity, reorderAmenities } = useHomeAmenities();
  const { settings, saveSetting } = useSimplifiedSiteSettings();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAmenity, setEditingAmenity] = useState<HomeAmenity | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [sectionTitle, setSectionTitle] = useState(settings.amenitiesSectionTitle || 'Premium Amenities');
  const [sectionDescription, setSectionDescription] = useState(
    settings.amenitiesSectionDescription || 
    'Our properties come thoughtfully equipped with everything you need for a comfortable stay'
  );
  const [sectionEnabled, setSectionEnabled] = useState(settings.amenitiesSectionEnabled !== false);
  const [isSaving, setIsSaving] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  React.useEffect(() => {
    setSectionTitle(settings.amenitiesSectionTitle || 'Premium Amenities');
    setSectionDescription(settings.amenitiesSectionDescription || 'Our properties come thoughtfully equipped with everything you need for a comfortable stay');
    setSectionEnabled(settings.amenitiesSectionEnabled !== false);
  }, [settings]);

  const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
    const icons = LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>;
    return icons[iconName] || LucideIcons.Star;
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await saveSetting('amenitiesSectionTitle', sectionTitle);
      await saveSetting('amenitiesSectionDescription', sectionDescription);
      await saveSetting('amenitiesSectionEnabled', sectionEnabled);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddAmenity = () => {
    setEditingAmenity(null);
    setIsFormOpen(true);
  };

  const handleEditAmenity = (amenity: HomeAmenity) => {
    setEditingAmenity(amenity);
    setIsFormOpen(true);
  };

  const handleSaveAmenity = async (data: { name: string; icon_name: string; color: string; is_active: boolean }) => {
    if (editingAmenity?.id) {
      await updateAmenity.mutateAsync({ id: editingAmenity.id, ...data });
    } else {
      await createAmenity.mutateAsync({ 
        ...data, 
        display_order: amenities.length 
      });
    }
    setIsFormOpen(false);
    setEditingAmenity(null);
  };

  const handleDeleteAmenity = async () => {
    if (deleteId) {
      await deleteAmenity.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleAddDefaults = async () => {
    for (let i = 0; i < DEFAULT_AMENITIES.length; i++) {
      await createAmenity.mutateAsync({
        ...DEFAULT_AMENITIES[i],
        display_order: amenities.length + i,
        is_active: true,
      });
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    
    const newAmenities = [...amenities];
    const draggedItem = newAmenities[draggedIndex];
    newAmenities.splice(draggedIndex, 1);
    newAmenities.splice(index, 0, draggedItem);
    
    reorderAmenities.mutate(newAmenities.map(a => a.id));
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Section Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Amenities Section Settings</CardTitle>
          <CardDescription>
            Configure the title, description, and visibility of the amenities section on your homepage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="section-enabled" className="text-base font-medium">Show Amenities Section</Label>
              <p className="text-sm text-muted-foreground">Display the amenities section on the homepage</p>
            </div>
            <Switch
              id="section-enabled"
              checked={sectionEnabled}
              onCheckedChange={setSectionEnabled}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title</Label>
            <Input
              id="section-title"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              placeholder="Premium Amenities"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-description">Section Description</Label>
            <Textarea
              id="section-description"
              value={sectionDescription}
              onChange={(e) => setSectionDescription(e.target.value)}
              placeholder="Description for the amenities section..."
              rows={2}
            />
          </div>

          <Button onClick={handleSaveSettings} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Amenities List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Amenity Items</CardTitle>
            <CardDescription>
              Add, edit, or reorder the amenities displayed on your homepage. Drag items to reorder.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {amenities.length === 0 && (
              <Button variant="outline" onClick={handleAddDefaults}>
                Add Default Amenities
              </Button>
            )}
            <Button onClick={handleAddAmenity}>
              <Plus className="h-4 w-4 mr-2" />
              Add Amenity
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {amenities.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No amenities added yet.</p>
              <p className="text-sm mt-1">Click "Add Default Amenities" to get started quickly, or add your own.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {amenities.map((amenity, index) => {
                const IconComponent = getIconComponent(amenity.icon_name);
                return (
                  <div
                    key={amenity.id}
                    draggable
                    onDragStart={() => handleDragStart(index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-3 p-3 rounded-lg border bg-card transition-all ${
                      draggedIndex === index ? 'opacity-50' : ''
                    } ${!amenity.is_active ? 'opacity-60' : ''}`}
                  >
                    <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
                    <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                      <IconComponent className={`h-5 w-5 ${amenity.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{amenity.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {amenity.icon_name} • {amenity.is_active ? 'Active' : 'Hidden'}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditAmenity(amenity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteId(amenity.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <AmenityForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingAmenity(null);
        }}
        amenity={editingAmenity}
        onSave={handleSaveAmenity}
        isLoading={createAmenity.isPending || updateAmenity.isPending}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Amenity</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this amenity? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteAmenity}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AmenitiesManager;
