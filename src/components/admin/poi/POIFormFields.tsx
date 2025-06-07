
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface POIFormData {
  name: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  category: string;
  phone: string;
  website_url: string;
  image_url: string;
  rating: number;
  price_level: number;
  distance_from_properties: number;
  driving_time: number;
  walking_time: number;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_by: string;
}

interface POIFormFieldsProps {
  formData: POIFormData;
  setFormData: (data: POIFormData) => void;
  categories: Array<{ value: string; label: string }>;
  onAddressChange: (address: string) => void;
  onCategoryChange: (category: string) => void;
}

const POIFormFields = ({ 
  formData, 
  setFormData, 
  categories, 
  onAddressChange, 
  onCategoryChange 
}: POIFormFieldsProps) => {
  return (
    <div className="space-y-4">
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
          onChange={(e) => onAddressChange(e.target.value)}
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
          onValueChange={onCategoryChange}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {categories.map((category) => (
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
          <Label htmlFor="driving_time">Driving Time (minutes)</Label>
          <Input
            id="driving_time"
            type="number"
            value={formData.driving_time}
            onChange={(e) => setFormData({ ...formData, driving_time: parseFloat(e.target.value) || 0 })}
          />
        </div>

        <div>
          <Label htmlFor="walking_time">Walking Time (minutes)</Label>
          <Input
            id="walking_time"
            type="number"
            value={formData.walking_time}
            onChange={(e) => setFormData({ ...formData, walking_time: parseFloat(e.target.value) || 0 })}
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
    </div>
  );
};

export default POIFormFields;
export type { POIFormData };
