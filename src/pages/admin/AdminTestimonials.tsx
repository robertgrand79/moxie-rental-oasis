
import React from 'react';
import TestimonialsManager from '@/components/admin/TestimonialsManager';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminTestimonials = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // TestimonialsManager will reset to default state
      window.dispatchEvent(new CustomEvent('resetTestimonialsManager'));
    }
  });

  return <TestimonialsManager />;
};

export default AdminTestimonials;
