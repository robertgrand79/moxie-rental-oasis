import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Star, Plus, Edit, Trash2, User } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useTestimonials, Testimonial } from '@/hooks/useTestimonials';
import { useAuth } from '@/contexts/AuthContext';
import OptimizedImage from '@/components/ui/optimized-image';

const TestimonialsManager = () => {
  const { testimonials, isLoading, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_location: '',
    guest_avatar_url: '',
    rating: 5,
    review_text: '',
    property_name: '',
    stay_date: '',
    is_featured: false,
    display_order: 0,
    is_active: true
  });

  const resetForm = () => {
    setFormData({
      guest_name: '',
      guest_location: '',
      guest_avatar_url: '',
      rating: 5,
      review_text: '',
      property_name: '',
      stay_date: '',
      is_featured: false,
      display_order: 0,
      is_active: true
    });
    setEditingTestimonial(null);
  };

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      guest_name: testimonial.guest_name,
      guest_location: testimonial.guest_location || '',
      guest_avatar_url: testimonial.guest_avatar_url || '',
      rating: testimonial.rating,
      review_text: testimonial.review_text,
      property_name: testimonial.property_name || '',
      stay_date: testimonial.stay_date || '',
      is_featured: testimonial.is_featured,
      display_order: testimonial.display_order,
      is_active: testimonial.is_active
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingTestimonial) {
        await updateTestimonial.mutateAsync({
          id: editingTestimonial.id,
          ...formData
        });
      } else {
        if (!user?.id) {
          console.error('User not authenticated');
          return;
        }
        await createTestimonial.mutateAsync({
          ...formData,
          created_by: user.id
        });
      }
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving testimonial:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this testimonial?')) {
      await deleteTestimonial.mutateAsync(id);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Customer Testimonials</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
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
            <CardTitle>Customer Testimonials</CardTitle>
            <CardDescription>
              Manage guest reviews and testimonials displayed on your homepage
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {resetForm(); setIsDialogOpen(true)}}>
                <Plus className="h-4 w-4 mr-2" />
                Add Testimonial
              </Button>
            </DialogTrigger>
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  {editingTestimonial ? 'Update' : 'Create'} Testimonial
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="flex items-start space-x-4 p-4 border rounded-lg">
              <div className="flex-shrink-0">
                {testimonial.guest_avatar_url ? (
                  <OptimizedImage
                    src={testimonial.guest_avatar_url}
                    alt={testimonial.guest_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{testimonial.guest_name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.guest_location}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-1">
                      {testimonial.is_featured && <Badge variant="secondary">Featured</Badge>}
                      {!testimonial.is_active && <Badge variant="outline">Inactive</Badge>}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 mb-2 line-clamp-2">{testimonial.review_text}</p>
                {testimonial.property_name && (
                  <p className="text-sm text-blue-600 mb-2">Property: {testimonial.property_name}</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Order: {testimonial.display_order}</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(testimonial)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(testimonial.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {testimonials.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No testimonials found. Add your first testimonial to get started.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default TestimonialsManager;
