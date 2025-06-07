
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Image, MapPin, Star } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useLifestyleGallery, LifestyleGalleryItem } from '@/hooks/useLifestyleGallery';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from '@/components/ui/optimized-image';

const categories = [
  'outdoor',
  'dining',
  'entertainment',
  'culture',
  'shopping',
  'recreation',
  'nature',
  'sports'
];

const activityTypes = [
  'hiking',
  'dining',
  'shopping',
  'sightseeing',
  'entertainment',
  'recreation',
  'cultural',
  'adventure',
  'relaxation'
];

const LifestyleGalleryManager = () => {
  const { galleryItems, isLoading, createGalleryItem, updateGalleryItem, deleteGalleryItem } = useLifestyleGallery();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LifestyleGalleryItem | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    image_url: '',
    category: '',
    location: '',
    activity_type: '',
    display_order: 0,
    is_featured: false,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image_url: '',
      category: '',
      location: '',
      activity_type: '',
      display_order: 0,
      is_featured: false,
      is_active: true
    });
    setEditingItem(null);
  };

  const handleEdit = (item: LifestyleGalleryItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      image_url: item.image_url,
      category: item.category,
      location: item.location || '',
      activity_type: item.activity_type || '',
      display_order: item.display_order || 0,
      is_featured: item.is_featured,
      is_active: item.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updateGalleryItem.mutateAsync({
          id: editingItem.id,
          ...formData
        });
      } else {
        if (!user?.id) {
          console.error('User not authenticated');
          return;
        }
        await createGalleryItem.mutateAsync({
          ...formData,
          created_by: user.id
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving gallery item:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      await deleteGalleryItem.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Lifestyle Gallery</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Lifestyle Gallery</CardTitle>
            <CardDescription>
              Manage photos and activities showcasing Eugene's lifestyle
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {resetForm(); setIsDialogOpen(true)}}>
                <Plus className="h-4 w-4 mr-2" />
                Add Gallery Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Gallery Item' : 'Add New Gallery Item'}
                </DialogTitle>
                <DialogDescription>
                  Add lifestyle photos and activities to showcase Eugene
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Weekend Farmers Market"
                  />
                </div>

                <div>
                  <Label htmlFor="image_url">Image URL</Label>
                  <Input
                    id="image_url"
                    value={formData.image_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                    placeholder="https://images.unsplash.com/photo-..."
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Describe this lifestyle activity or location..."
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="activity_type">Activity Type</Label>
                    <Select 
                      value={formData.activity_type} 
                      onValueChange={(value) => setFormData(prev => ({ ...prev, activity_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity" />
                      </SelectTrigger>
                      <SelectContent>
                        {activityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Downtown Eugene, Spencer Butte Trail, etc."
                  />
                </div>

                <div className="flex items-center space-x-6">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_featured"
                      checked={formData.is_featured}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_featured: checked }))}
                    />
                    <Label htmlFor="is_featured">Featured</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                    />
                    <Label htmlFor="is_active">Active</Label>
                  </div>
                  <div>
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData(prev => ({ ...prev, display_order: parseInt(e.target.value) }))}
                      className="w-20"
                    />
                  </div>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingItem ? 'Update' : 'Create'} Gallery Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden">
              <div className="aspect-video relative">
                <OptimizedImage
                  src={item.image_url}
                  alt={item.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {item.is_featured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {!item.is_active && (
                    <Badge variant="outline">Inactive</Badge>
                  )}
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{item.title}</h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {item.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {item.category}
                  </Badge>
                  {item.activity_type && (
                    <Badge variant="outline" className="text-xs">
                      {item.activity_type}
                    </Badge>
                  )}
                </div>
                
                {item.location && (
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <MapPin className="h-4 w-4 mr-1" />
                    {item.location}
                  </div>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Order: {item.display_order}</span>
                  <span>
                    {new Date(item.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {galleryItems.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <Image className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No gallery items found</p>
              <p>Add your first lifestyle gallery item to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default LifestyleGalleryManager;
