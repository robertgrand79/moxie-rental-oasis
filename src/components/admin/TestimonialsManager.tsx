
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Home, Building } from 'lucide-react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useTestimonials, Testimonial } from '@/hooks/useTestimonials';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/contexts/AuthContext';
import TestimonialForm from './testimonials/TestimonialForm';
import TestimonialsList from './testimonials/TestimonialsList';
import TestimonialsGrid from './testimonials/TestimonialsGrid';
import TestimonialsViewToggle from './testimonials/TestimonialsViewToggle';
import TestimonialsLoadingState from './testimonials/TestimonialsLoadingState';
import SyncAllPropertiesButton from './SyncAllPropertiesButton';


const TestimonialsManager = () => {
  const { testimonials, isLoading, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const { properties } = useProperties();
  const { user } = useAuth();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<string>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [formData, setFormData] = useState({
    guest_name: '',
    guest_location: '',
    guest_avatar_url: '',
    rating: 5,
    review_text: '',
    property_id: '',
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
      property_id: '',
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
      review_text: testimonial.review_text || testimonial.content || '',
      property_id: testimonial.property_id || '',
      property_name: testimonial.property_name || '',
      stay_date: testimonial.stay_date || '',
      is_featured: testimonial.is_featured || false,
      display_order: testimonial.display_order || 0,
      is_active: testimonial.is_active !== false,
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

  // Get unique properties for tabs using the actual properties data
  const getPropertyTabs = () => {
    const tabs = [
      { value: 'all', label: 'All Properties', icon: Home },
      { value: 'airbnb', label: 'Airbnb Reviews', icon: Building }
    ];
    
    // Add tabs for properties that have testimonials
    properties.forEach(property => {
      const hasTestimonials = testimonials.some(t => t.property_id === property.id);
      if (hasTestimonials) {
        tabs.push({
          value: property.id,
          label: property.title,
          icon: Building
        });
      }
    });
    
    return tabs;
  };

  const getTestimonialCount = (propertyId: string) => {
    if (propertyId === 'all') return testimonials.length;
    if (propertyId === 'airbnb') return testimonials.filter(t => t.booking_platform?.toLowerCase() === 'airbnb').length;
    return testimonials.filter(t => t.property_id === propertyId).length;
  };

  // Filter testimonials based on selected property
  const filteredTestimonials = selectedProperty === 'all' 
    ? testimonials 
    : selectedProperty === 'airbnb'
    ? testimonials.filter(testimonial => testimonial.booking_platform?.toLowerCase() === 'airbnb')
    : testimonials.filter(testimonial => testimonial.property_id === selectedProperty);

  const propertyTabs = getPropertyTabs();


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
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Customer Testimonials</CardTitle>
            <CardDescription>
              Manage guest reviews and testimonials displayed on your homepage
            </CardDescription>
          </div>
          <div className="flex items-center space-x-3">
            <SyncAllPropertiesButton />
            <TestimonialsViewToggle view={view} onViewChange={setView} />
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
          <Tabs value={selectedProperty} onValueChange={setSelectedProperty}>
            <TabsList className="grid w-full h-auto" style={{ gridTemplateColumns: `repeat(${Math.min(propertyTabs.length, 6)}, 1fr)` }}>
              {propertyTabs.map((property) => (
                <TabsTrigger 
                  key={property.value} 
                  value={property.value}
                  className="flex items-center justify-center gap-2 px-2 py-3 text-sm data-[state=active]:bg-background data-[state=active]:text-foreground"
                >
                  <property.icon className="h-4 w-4 flex-shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">
                    {property.label}
                    <span className="ml-1 text-xs opacity-70">
                      ({getTestimonialCount(property.value)})
                    </span>
                  </span>
                  <span className="lg:hidden text-xs opacity-70">
                    {getTestimonialCount(property.value)}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {propertyTabs.map((property) => (
              <TabsContent key={property.value} value={property.value} className="mt-6">
                {view === 'grid' ? (
                  <TestimonialsGrid 
                    testimonials={filteredTestimonials} 
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ) : (
                  <TestimonialsList
                    testimonials={filteredTestimonials}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default TestimonialsManager;
