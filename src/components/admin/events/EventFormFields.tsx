
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  end_date: string;
  time_start: string;
  time_end: string;
  location: string;
  category: string;
  image_url: string;
  website_url: string;
  ticket_url: string;
  price_range: string;
  is_featured: boolean;
  is_active: boolean;
  is_recurring: boolean;
  recurrence_pattern: string;
  created_by: string;
}

interface EventFormFieldsProps {
  formData: EventFormData;
  setFormData: (data: EventFormData) => void;
  categories: Array<{ value: string; label: string }>;
  onLocationChange: (location: string) => void;
  onCategoryChange: (category: string) => void;
}

const EventFormFields = ({ 
  formData, 
  setFormData, 
  categories, 
  onLocationChange, 
  onCategoryChange 
}: EventFormFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="md:col-span-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>

      <div>
        <Label htmlFor="event_date">Start Date *</Label>
        <Input
          id="event_date"
          type="date"
          value={formData.event_date}
          onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
          required
        />
      </div>

      <div>
        <Label htmlFor="end_date">End Date</Label>
        <Input
          id="end_date"
          type="date"
          value={formData.end_date}
          onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="time_start">Start Time</Label>
        <Input
          id="time_start"
          placeholder="e.g., 7:00 PM"
          value={formData.time_start}
          onChange={(e) => setFormData({ ...formData, time_start: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="time_end">End Time</Label>
        <Input
          id="time_end"
          placeholder="e.g., 10:00 PM"
          value={formData.time_end}
          onChange={(e) => setFormData({ ...formData, time_end: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="location">Location</Label>
        <Input
          id="location"
          placeholder="Venue name or address"
          value={formData.location}
          onChange={(e) => onLocationChange(e.target.value)}
        />
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

      <div>
        <Label htmlFor="price_range">Price Range</Label>
        <Input
          id="price_range"
          placeholder="e.g., Free, $20-50, $100+"
          value={formData.price_range}
          onChange={(e) => setFormData({ ...formData, price_range: e.target.value })}
        />
      </div>

      <div className="md:col-span-2">
        <Label htmlFor="image_url">Image URL</Label>
        <Input
          id="image_url"
          type="url"
          placeholder="https://..."
          value={formData.image_url}
          onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="website_url">Website URL</Label>
        <Input
          id="website_url"
          type="url"
          placeholder="https://..."
          value={formData.website_url}
          onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="ticket_url">Ticket URL</Label>
        <Input
          id="ticket_url"
          type="url"
          placeholder="https://..."
          value={formData.ticket_url}
          onChange={(e) => setFormData({ ...formData, ticket_url: e.target.value })}
        />
      </div>

      <div className="md:col-span-2 flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="is_featured"
            checked={formData.is_featured}
            onCheckedChange={(checked) => setFormData({ ...formData, is_featured: checked })}
          />
          <Label htmlFor="is_featured">Featured Event</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active">Active</Label>
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="is_recurring"
            checked={formData.is_recurring}
            onCheckedChange={(checked) => setFormData({ ...formData, is_recurring: checked })}
          />
          <Label htmlFor="is_recurring">Recurring Event</Label>
        </div>
      </div>

      {formData.is_recurring && (
        <div className="md:col-span-2">
          <Label htmlFor="recurrence_pattern">Recurrence Pattern</Label>
          <Input
            id="recurrence_pattern"
            placeholder="e.g., Every Saturday, Monthly, etc."
            value={formData.recurrence_pattern}
            onChange={(e) => setFormData({ ...formData, recurrence_pattern: e.target.value })}
          />
        </div>
      )}
    </div>
  );
};

export default EventFormFields;
