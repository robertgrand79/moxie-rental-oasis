
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Testimonial } from '@/hooks/useTestimonials';
import { useProperties } from '@/hooks/useProperties';
import GuestPhotoUpload from './GuestPhotoUpload';

interface TestimonialFormData {
  guest_name: string;
  guest_location: string;
  guest_avatar_url: string;
  rating: number;
  review_text: string;
  property_id: string;
  property_name: string;
  stay_date: string;
  is_featured: boolean;
  display_order: number;
  is_active: boolean;
  booking_platform: string;
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
  const { properties } = useProperties();
  
  const handlePlatformChange = (platform: string) => {
    if (formData.booking_platform === platform) {
      // If same platform clicked, clear it
      setFormData(prev => ({ 
        ...prev, 
        booking_platform: '',
        guest_avatar_url: ''
      }));
    } else {
      // Set new platform and corresponding logo
      let logoUrl = '';
      switch (platform) {
        case 'direct':
          logoUrl = '/moxie-logo.png';
          break;
        case 'airbnb':
          logoUrl = '/airbnb-logo.png';
          break;
        case 'vrbo':
          logoUrl = '/vrbo-logo.png';
          break;
      }
      
      setFormData(prev => ({ 
        ...prev, 
        booking_platform: platform,
        guest_avatar_url: logoUrl
      }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>
            {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
          </DialogTitle>
          <DialogDescription>
            Add authentic guest reviews to build trust with potential visitors
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-1 space-y-4">
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
            <Label>Booking Platform</Label>
            <div className="flex flex-wrap gap-4 mt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="direct"
                  checked={formData.booking_platform === 'direct'}
                  onCheckedChange={() => handlePlatformChange('direct')}
                />
                <Label htmlFor="direct" className="text-sm font-normal">Direct Booking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="airbnb"
                  checked={formData.booking_platform === 'airbnb'}
                  onCheckedChange={() => handlePlatformChange('airbnb')}
                />
                <Label htmlFor="airbnb" className="text-sm font-normal">Airbnb</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vrbo"
                  checked={formData.booking_platform === 'vrbo'}
                  onCheckedChange={() => handlePlatformChange('vrbo')}
                />
                <Label htmlFor="vrbo" className="text-sm font-normal">VRBO</Label>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Selecting a platform will automatically set the platform logo as the guest photo
            </p>
          </div>

          <GuestPhotoUpload
            currentPhotoUrl={formData.guest_avatar_url}
            onPhotoChange={(url) => setFormData(prev => ({ 
              ...prev, 
              guest_avatar_url: url,
              booking_platform: url ? '' : prev.booking_platform // Clear platform if manual photo set
            }))}
            disabled={!!formData.booking_platform}
          />

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
              <Label htmlFor="property_id">Property</Label>
              <Select 
                value={formData.property_id || ""} 
                onValueChange={(value) => {
                  console.log('Property selected:', value);
                  const selectedProperty = properties.find(p => p.id === value);
                  setFormData(prev => ({ 
                    ...prev, 
                    property_id: value || "",
                    property_name: selectedProperty?.title || ""
                  }))
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a property" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-popover">
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
        </div>

        <DialogFooter className="flex-shrink-0">
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
