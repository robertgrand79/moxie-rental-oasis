
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, MapPin, Star, Phone, Globe, Clock } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePointsOfInterest, PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from '@/components/ui/optimized-image';

const categories = [
  'restaurant',
  'attraction',
  'shopping',
  'entertainment',
  'outdoor',
  'culture',
  'healthcare',
  'transportation',
  'services'
];

const priceLevel = [
  { value: 1, label: '$' },
  { value: 2, label: '$$' },
  { value: 3, label: '$$$' },
  { value: 4, label: '$$$$' }
];

const PointsOfInterestManager = () => {
  const { pointsOfInterest, isLoading, createPointOfInterest, updatePointOfInterest, deletePointOfInterest } = usePointsOfInterest();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PointOfInterest | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    latitude: 0,
    longitude: 0,
    category: '',
    phone: '',
    website_url: '',
    image_url: '',
    rating: 0,
    price_level: 1,
    distance_from_properties: 0,
    driving_time: 0,
    walking_time: 0,
    is_featured: false,
    is_active: true,
    display_order: 0
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      latitude: 0,
      longitude: 0,
      category: '',
      phone: '',
      website_url: '',
      image_url: '',
      rating: 0,
      price_level: 1,
      distance_from_properties: 0,
      driving_time: 0,
      walking_time: 0,
      is_featured: false,
      is_active: true,
      display_order: 0
    });
    setEditingItem(null);
  };

  const handleEdit = (item: PointOfInterest) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      description: item.description || '',
      address: item.address || '',
      latitude: item.latitude || 0,
      longitude: item.longitude || 0,
      category: item.category,
      phone: item.phone || '',
      website_url: item.website_url || '',
      image_url: item.image_url || '',
      rating: item.rating || 0,
      price_level: item.price_level || 1,
      distance_from_properties: item.distance_from_properties || 0,
      driving_time: item.driving_time || 0,
      walking_time: item.walking_time || 0,
      is_featured: item.is_featured,
      is_active: item.is_active,
      display_order: item.display_order || 0
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingItem) {
        await updatePointOfInterest.mutateAsync({
          id: editingItem.id,
          ...formData
        });
      } else {
        if (!user?.id) {
          console.error('User not authenticated');
          return;
        }
        await createPointOfInterest.mutateAsync({
          ...formData,
          created_by: user.id
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving point of interest:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this point of interest?')) {
      await deletePointOfInterest.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Points of Interest</CardTitle>
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
            <CardTitle>Points of Interest</CardTitle>
            <CardDescription>
              Manage restaurants, attractions, and activities near your properties
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {resetForm(); setIsDialogOpen(true)}}>
                <Plus className="h-4 w-4 mr-2" />
                Add Point of Interest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingItem ? 'Edit Point of Interest' : 'Add New Point of Interest'}
                </DialogTitle>
                <DialogDescription>
                  Add local attractions, restaurants, and services for guests
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Restaurant Name or Attraction"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe this location..."
                      rows={3}
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Main St, Eugene, OR"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="latitude">Latitude</Label>
                      <Input
                        id="latitude"
                        type="number"
                        step="0.000001"
                        value={formData.latitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))}
                        placeholder="44.0521"
                      />
                    </div>
                    <div>
                      <Label htmlFor="longitude">Longitude</Label>
                      <Input
                        id="longitude"
                        type="number"
                        step="0.000001"
                        value={formData.longitude}
                        onChange={(e) => setFormData(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))}
                        placeholder="-123.0868"
                      />
                    </div>
                  </div>

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
                </div>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="image_url">Image URL</Label>
                    <Input
                      id="image_url"
                      value={formData.image_url}
                      onChange={(e) => setFormData(prev => ({ ...prev, image_url: e.target.value }))}
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="(555) 123-4567"
                      />
                    </div>
                    <div>
                      <Label htmlFor="website_url">Website</Label>
                      <Input
                        id="website_url"
                        value={formData.website_url}
                        onChange={(e) => setFormData(prev => ({ ...prev, website_url: e.target.value }))}
                        placeholder="https://website.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="rating">Rating (1-5)</Label>
                      <Input
                        id="rating"
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData(prev => ({ ...prev, rating: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="price_level">Price Level</Label>
                      <Select 
                        value={formData.price_level.toString()} 
                        onValueChange={(value) => setFormData(prev => ({ ...prev, price_level: parseInt(value) }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {priceLevel.map((level) => (
                            <SelectItem key={level.value} value={level.value.toString()}>
                              {level.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="distance_from_properties">Distance (miles)</Label>
                      <Input
                        id="distance_from_properties"
                        type="number"
                        step="0.1"
                        value={formData.distance_from_properties}
                        onChange={(e) => setFormData(prev => ({ ...prev, distance_from_properties: parseFloat(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="driving_time">Drive Time (min)</Label>
                      <Input
                        id="driving_time"
                        type="number"
                        value={formData.driving_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, driving_time: parseInt(e.target.value) }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="walking_time">Walk Time (min)</Label>
                      <Input
                        id="walking_time"
                        type="number"
                        value={formData.walking_time}
                        onChange={(e) => setFormData(prev => ({ ...prev, walking_time: parseInt(e.target.value) }))}
                      />
                    </div>
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
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingItem ? 'Update' : 'Create'} Point of Interest
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pointsOfInterest.map((poi) => (
            <div key={poi.id} className="border rounded-lg overflow-hidden">
              {poi.image_url && (
                <div className="aspect-video relative">
                  <OptimizedImage
                    src={poi.image_url}
                    alt={poi.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 flex gap-1">
                    {poi.is_featured && (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        <Star className="h-3 w-3 mr-1" />
                        Featured
                      </Badge>
                    )}
                    {!poi.is_active && (
                      <Badge variant="outline">Inactive</Badge>
                    )}
                  </div>
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-lg line-clamp-1">{poi.name}</h3>
                  <div className="flex items-center space-x-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(poi)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(poi.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {poi.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{poi.description}</p>
                )}
                
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge variant="outline" className="text-xs">
                    {poi.category}
                  </Badge>
                  {poi.rating > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Star className="h-3 w-3 mr-1" />
                      {poi.rating}
                    </Badge>
                  )}
                  {poi.price_level && (
                    <Badge variant="outline" className="text-xs">
                      {'$'.repeat(poi.price_level)}
                    </Badge>
                  )}
                </div>
                
                <div className="space-y-1 text-xs text-gray-500">
                  {poi.address && (
                    <div className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {poi.address}
                    </div>
                  )}
                  {poi.phone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-1" />
                      {poi.phone}
                    </div>
                  )}
                  {poi.website_url && (
                    <div className="flex items-center">
                      <Globe className="h-3 w-3 mr-1" />
                      <a href={poi.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        Website
                      </a>
                    </div>
                  )}
                  {poi.driving_time > 0 && (
                    <div className="flex items-center">
                      <Clock className="h-3 w-3 mr-1" />
                      {poi.driving_time} min drive
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mt-3 pt-3 border-t">
                  <span>Order: {poi.display_order}</span>
                  <span>
                    {new Date(poi.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {pointsOfInterest.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg font-medium mb-2">No points of interest found</p>
              <p>Add your first point of interest to get started</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PointsOfInterestManager;
