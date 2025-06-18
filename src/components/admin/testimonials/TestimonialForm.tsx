
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Testimonial } from '@/hooks/useTestimonials';

interface TestimonialFormData {
  guest_name: string;
  guest_location: string;
  guest_avatar_url: string;
  rating: number;
  review_text: string;
  property_name: string;
  stay_date: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
}

interface TestimonialFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  editingTestimonial: Testimonial | null;
  formData: TestimonialFormData;
  setFormData: React.Dispatch<React.SetStateAction<TestimonialFormData>>;
  onSubmit: () => Promise<void>;
}

const TestimonialForm = ({ 
  isOpen, 
  onOpenChange, 
  editingTestimonial, 
  formData, 
  setFormData, 
  onSubmit 
}: TestimonialFormProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </DialogTitle>
          <DialogDescription>
            Add authentic guest reviews to build trust with potential visitors
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="guest_name">Guest Name</Label>
            <Input
              id="guest_name"
              value={formData.guest_name}
              onChange={(e) => setFormData(prev => ({ ...prev, guest_name: e.target.value }))}
              placeholder="Sarah Johnson"
            />
          </div>
          <div>
            <Label htmlFor="guest_location">Guest Location</Label>
            <Input
              id="guest_location"
              value={formData.guest_location}
              onChange={(e) => setFormData(prev => ({ ...prev, guest_location: e.target.value }))}
              placeholder="Portland, OR"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="guest_avatar_url">Guest Photo URL</Label>
          <Input
            id="guest_avatar_url"
            value={formData.guest_avatar_url}
            onChange={(e) => setFormData(prev => ({ ...prev, guest_avatar_url: e.target.value }))}
            placeholder="https://images.unsplash.com/photo-..."
          />
        </div>

        <div>
          <Label htmlFor="review_text">Review Text</Label>
          <Textarea
            id="review_text"
            value={formData.review_text}
            onChange={(e) => setFormData(prev => ({ ...prev, review_text: e.target.value }))}
            placeholder="Our stay was absolutely perfect..."
            rows={4}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="property_name">Property Name</Label>
            <Input
              id="property_name"
              value={formData.property_name}
              onChange={(e) => setFormData(prev => ({ ...prev, property_name: e.target.value }))}
              placeholder="Downtown Loft"
            />
          </div>
          <div>
            <Label htmlFor="stay_date">Stay Date</Label>
            <Input
              id="stay_date"
              type="date"
              value={formData.stay_date}
              onChange={(e) => setFormData(prev => ({ ...prev, stay_date: e.target.value }))}
            />
          </div>
          <div>
            <Label htmlFor="rating">Rating</Label>
            <Input
              id="rating"
              type="number"
              min="1"
              max="5"
              value={formData.rating}
              onChange={(e) => setFormData(prev => ({ ...prev, rating: parseInt(e.target.value) }))}
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

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {editingTestimonial ? 'Update' : 'Create'} Testimonial
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TestimonialForm;
