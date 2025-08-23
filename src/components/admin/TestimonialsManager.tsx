
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useTestimonials, Testimonial } from '@/hooks/useTestimonials';
import { useAuth } from '@/contexts/AuthContext';
import TestimonialForm from './testimonials/TestimonialForm';
import TestimonialsList from './testimonials/TestimonialsList';
import TestimonialsLoadingState from './testimonials/TestimonialsLoadingState';
import AirbnbSyncManager from './AirbnbSyncManager';

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
    is_active: true,
    booking_platform: ''
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
      is_active: true,
      booking_platform: ''
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
      is_active: testimonial.is_active,
      booking_platform: testimonial.booking_platform || ''
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
    await deleteTestimonial.mutateAsync(id);
  };

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      setIsDialogOpen(false);
      resetForm();
    };

    window.addEventListener('resetTestimonialsManager', handleReset);
    return () => window.removeEventListener('resetTestimonialsManager', handleReset);
  }, []);

  if (isLoading) {
    return <TestimonialsLoadingState />;
  }

  return (
    <div className="space-y-6">
      <AirbnbSyncManager />
      
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
              <TestimonialForm
                isOpen={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                editingTestimonial={editingTestimonial}
                formData={formData}
                setFormData={setFormData}
                onSubmit={handleSubmit}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <TestimonialsList
            testimonials={testimonials}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialsManager;
