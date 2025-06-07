import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Plus, Edit, Trash2, ExternalLink, Ticket, Wand2, Sparkles, Image } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { usePointsOfInterest, PointOfInterest } from '@/hooks/usePointsOfInterest';
import { useAuth } from '@/contexts/AuthContext';
import { useAIContentGeneration } from '@/hooks/useAIContentGeneration';
import { useCrossContentIntegration } from '@/hooks/useCrossContentIntegration';
import ContentSuggestions from '@/components/admin/ContentSuggestions';
import AIGenerationDialog from '@/components/admin/AIGenerationDialog';

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

const PointsOfInterestManager = () => {
  const { pointsOfInterest, isLoading, createPointOfInterest, updatePointOfInterest, deletePointOfInterest } = usePointsOfInterest();
  const { user } = useAuth();
  const { enhanceContent, isEnhancing } = useAIContentGeneration();
  const { getLocationBasedSuggestions, getCategoryBasedSuggestions } = useCrossContentIntegration();
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [categorySuggestions, setCategorySuggestions] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);
  const [editingPOI, setEditingPOI] = useState<PointOfInterest | null>(null);
  const [enhancingId, setEnhancingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
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
    created_by: user?.id || ''
  });

  const resetForm = () => {
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
      created_by: user?.id || ''
    });
    setEditingPOI(null);
  };

  const handleEdit = (poi: PointOfInterest) => {
    setEditingPOI(poi);
    setFormData({
      name: poi.name,
      description: poi.description || '',
      address: poi.address || '',
      latitude: poi.latitude || 0,
      longitude: poi.longitude || 0,
      category: poi.category || 'other',
      phone: poi.phone || '',
      website_url: poi.website_url || '',
      image_url: poi.image_url || '',
      rating: poi.rating || 0,
      price_level: poi.price_level || 0,
      distance_from_properties: poi.distance_from_properties || 0,
      driving_time: poi.driving_time || 0,
      walking_time: poi.walking_time || 0,
      is_featured: poi.is_featured || false,
      is_active: poi.is_active !== false,
      display_order: poi.display_order || 0,
      created_by: poi.created_by
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPOI) {
        await updatePointOfInterest.mutateAsync({ id: editingPOI.id, ...formData });
      } else {
        await createPointOfInterest.mutateAsync(formData);
      }

      resetForm();
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

  const poiCategories = categories.map(cat => ({
    value: cat,
    label: cat.charAt(0).toUpperCase() + cat.slice(1)
  }));

  const handleAIGeneration = async (content: any[]) => {
    for (const item of content) {
      try {
        const defaultImageUrl = 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80';
        
        await createPointOfInterest.mutateAsync({
          name: item.name,
          description: item.description,
          address: item.address || 'Eugene, OR',
          latitude: item.latitude || 44.0521,
          longitude: item.longitude || -123.0868,
          category: item.category || 'other',
          phone: item.phone || '',
          website_url: item.website_url || '',
          image_url: item.image_url || defaultImageUrl,
          rating: item.rating || 0,
          price_level: item.price_level || 0,
          distance_from_properties: item.distance_from_properties || 0,
          driving_time: item.driving_time || 0,
          walking_time: item.walking_time || 0,
          is_featured: false,
          is_active: true,
          display_order: 0,
          created_by: user?.id || ''
        });
      } catch (error) {
        console.error('Error saving AI-generated POI:', error);
      }
    }
  };

  const handleEnhanceItem = async (item: PointOfInterest) => {
    setEnhancingId(item.id);
    try {
      const enhanced = await enhanceContent('poi', item);
      if (enhanced) {
        await updatePointOfInterest.mutateAsync({
          id: item.id,
          ...enhanced
        });
      }
    } finally {
      setEnhancingId(null);
    }
  };

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
            <Button 
              variant="outline" 
              onClick={() => setIsAIDialogOpen(true)}
            >
              <Wand2 className="h-4 w-4 mr-2" />
              Generate with AI
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={resetForm}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Point of Interest
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingPOI ? 'Edit Point of Interest' : 'Add New Point of Interest'}
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <div className="space-y-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                          <Label htmlFor="name">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="description">Description</Label>
                          <Textarea
                            id="description"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            rows={3}
                          />
                        </div>
                
                        <div>
                          <Label htmlFor="address">Address</Label>
                          <Input
                            id="address"
                            value={formData.address}
                            onChange={(e) => handleAddressChange(e.target.value)}
                            placeholder="123 Main St, Eugene, OR"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="latitude">Latitude</Label>
                            <Input
                              id="latitude"
                              type="number"
                              value={formData.latitude}
                              onChange={(e) => setFormData({ ...formData, latitude: parseFloat(e.target.value) })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="longitude">Longitude</Label>
                            <Input
                              id="longitude"
                              type="number"
                              value={formData.longitude}
                              onChange={(e) => setFormData({ ...formData, longitude: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="category">Category</Label>
                          <Select
                            value={formData.category}
                            onValueChange={handleCategoryChange}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {poiCategories.map((category) => (
                                <SelectItem key={category.value} value={category.value}>
                                  {category.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="phone">Phone</Label>
                            <Input
                              id="phone"
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="website_url">Website URL</Label>
                            <Input
                              id="website_url"
                              type="url"
                              value={formData.website_url}
                              onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                            />
                          </div>
                        </div>

                        <div>
                          <Label htmlFor="image_url">Image URL</Label>
                          <Input
                            id="image_url"
                            type="url"
                            value={formData.image_url}
                            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="rating">Rating</Label>
                            <Input
                              id="rating"
                              type="number"
                              value={formData.rating}
                              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="price_level">Price Level</Label>
                            <Input
                              id="price_level"
                              type="number"
                              value={formData.price_level}
                              onChange={(e) => setFormData({ ...formData, price_level: parseFloat(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <Label htmlFor="distance_from_properties">Distance</Label>
                            <Input
                              id="distance_from_properties"
                              type="number"
                              value={formData.distance_from_properties}
                              onChange={(e) => setFormData({ ...formData, distance_from_properties: parseFloat(e.target.value) })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="driving_time">Driving Time</Label>
                            <Input
                              id="driving_time"
                              value={formData.driving_time}
                              onChange={(e) => setFormData({ ...formData, driving_time: e.target.value })}
                            />
                          </div>

                          <div>
                            <Label htmlFor="walking_time">Walking Time</Label>
                            <Input
                              id="walking_time"
                              value={formData.walking_time}
                              onChange={(e) => setFormData({ ...formData, walking_time: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_featured"
                              checked={formData.is_featured}
                              onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
                            />
                            <Label htmlFor="is_featured">Featured</Label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Switch
                              id="is_active"
                              checked={formData.is_active}
                              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                            />
                            <Label htmlFor="is_active">Active</Label>
                          </div>

                          <div>
                            <Label htmlFor="display_order">Display Order</Label>
                            <Input
                              id="display_order"
                              type="number"
                              value={formData.display_order}
                              onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                            />
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                          <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit">
                            {editingPOI ? 'Update Point of Interest' : 'Create Point of Interest'}
                          </Button>
                        </div>
                      </form>
                    </div>
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
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pointsOfInterest.map((poi) => (
            <div key={poi.id} className="border rounded-lg overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-semibold text-lg">{poi.name}</h4>
                      <div className="flex gap-1">
                        {poi.is_featured && (
                          <Badge className="bg-blue-600 text-white">Featured</Badge>
                        )}
                        {!poi.is_active && (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Badge variant="secondary" className="mr-3">
                        {poi.category}
                      </Badge>
                      <MapPin className="h-4 w-4 mr-1" />
                      <span>{poi.address}</span>
                    </div>

                    {poi.description && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{poi.description}</p>
                    )}

                    {(poi.website_url) && (
                      <div className="flex gap-2">
                        {poi.website_url && (
                          <Button size="sm" variant="outline" asChild>
                            <a href={poi.website_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Website
                            </a>
                          </Button>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEnhanceItem(poi)}
                      disabled={isEnhancing && enhancingId === poi.id}
                    >
                      {isEnhancing && enhancingId === poi.id ? (
                        <Sparkles className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(poi)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(poi.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Add suggestions for each POI */}
              {(poi.address || poi.category) && (
                <div className="p-4 pt-0">
                  <ContentSuggestions
                    suggestions={[
                      ...getLocationBasedSuggestions(poi.address || '', poi.id, 'poi'),
                      ...getCategoryBasedSuggestions(poi.category || '', poi.id, 'poi')
                    ].slice(0, 2)}
                    title="Related Content"
                  />
                </div>
              )}
            </div>
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

      <AIGenerationDialog
        isOpen={isAIDialogOpen}
        onOpenChange={setIsAIDialogOpen}
        type="poi"
        categories={poiCategories}
        onContentGenerated={handleAIGeneration}
      />
    </Card>
  );
};

export default PointsOfInterestManager;
