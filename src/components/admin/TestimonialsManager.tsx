import React, { useState, useEffect } from 'react';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { useTestimonials, Testimonial } from '@/hooks/useTestimonials';
import { useProperties } from '@/hooks/useProperties';
import { useAuth } from '@/contexts/AuthContext';
import ModernReviewsHeader from './testimonials/ModernReviewsHeader';
import TestimonialForm from './testimonials/TestimonialForm';
import TestimonialsList from './testimonials/TestimonialsList';
import TestimonialsGrid from './testimonials/TestimonialsGrid';
import ReviewDetailPanel from './testimonials/ReviewDetailPanel';
import TestimonialsLoadingState from './testimonials/TestimonialsLoadingState';

const TestimonialsManager = () => {
  const { testimonials, isLoading, createTestimonial, updateTestimonial, deleteTestimonial } = useTestimonials();
  const { properties } = useProperties();
  const { user } = useAuth();
  
  // State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [viewingTestimonial, setViewingTestimonial] = useState<Testimonial | null>(null);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
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

  // Build property tabs
  const getPropertyTabs = () => {
    const tabs = [
      { value: 'all', label: 'All Properties' },
      { value: 'airbnb', label: 'Airbnb Reviews' }
    ];
    
    properties.forEach(property => {
      const hasTestimonials = testimonials.some(t => t.property_id === property.id);
      if (hasTestimonials) {
        tabs.push({
          value: property.id,
          label: property.title,
        });
      }
    });
    
    return tabs;
  };

  const propertyTabs = getPropertyTabs();

  // Filter testimonials
  const filteredTestimonials = testimonials.filter(testimonial => {
    // Search filter
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      const matchesSearch = 
        testimonial.guest_name.toLowerCase().includes(search) ||
        testimonial.guest_location?.toLowerCase().includes(search) ||
        testimonial.review_text?.toLowerCase().includes(search) ||
        testimonial.content?.toLowerCase().includes(search) ||
        testimonial.property_name?.toLowerCase().includes(search);
      if (!matchesSearch) return false;
    }
    
    // Property filter
    if (propertyFilter !== 'all') {
      if (propertyFilter === 'airbnb') {
        if (testimonial.booking_platform?.toLowerCase() !== 'airbnb') return false;
      } else if (testimonial.property_id !== propertyFilter) {
        return false;
      }
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'active' && testimonial.is_active === false) return false;
      if (statusFilter === 'inactive' && testimonial.is_active !== false) return false;
      if (statusFilter === 'featured' && !testimonial.is_featured) return false;
    }
    
    return true;
  });

  const handleEdit = (testimonial: Testimonial) => {
    setEditingTestimonial(testimonial);
    setViewingTestimonial(null);
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

  const handleView = (testimonial: Testimonial) => {
    setViewingTestimonial(testimonial);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleCloseDetailPanel = () => {
    setViewingTestimonial(null);
  };

  const handleSwitchToEdit = () => {
    if (viewingTestimonial) {
      handleEdit(viewingTestimonial);
    }
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

  const handleToggleActive = async (testimonial: Testimonial) => {
    await updateTestimonial.mutateAsync({
      id: testimonial.id,
      is_active: testimonial.is_active === false ? true : false
    });
  };

  const handleRefresh = () => {
    // The query will automatically refetch
  };

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      setIsDialogOpen(false);
      setViewingTestimonial(null);
      setSearchQuery('');
      setPropertyFilter('all');
      setStatusFilter('all');
      resetForm();
    };

    window.addEventListener('resetTestimonialsManager', handleReset);
    return () => window.removeEventListener('resetTestimonialsManager', handleReset);
  }, []);

  if (isLoading) {
    return <TestimonialsLoadingState />;
  }

  return (
    <div className="p-6 space-y-6">
      <ModernReviewsHeader
        testimonials={testimonials}
        propertyTabs={propertyTabs}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        propertyFilter={propertyFilter}
        onPropertyFilterChange={setPropertyFilter}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onAddReview={handleAddNew}
        onRefresh={handleRefresh}
      />

      {viewMode === 'grid' ? (
        <TestimonialsGrid 
          testimonials={filteredTestimonials} 
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onToggleActive={handleToggleActive}
        />
      ) : (
        <TestimonialsList
          testimonials={filteredTestimonials}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onView={handleView}
          onToggleActive={handleToggleActive}
        />
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <TestimonialForm
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          editingTestimonial={editingTestimonial}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
        />
      </Dialog>

      {viewingTestimonial && (
        <ReviewDetailPanel
          testimonial={viewingTestimonial}
          isOpen={!!viewingTestimonial}
          onClose={handleCloseDetailPanel}
          onEdit={handleSwitchToEdit}
        />
      )}
    </div>
  );
};

export default TestimonialsManager;
