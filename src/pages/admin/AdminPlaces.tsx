import React from 'react';
import PlacesManager from '@/components/admin/places/PlacesManager';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminPlaces = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // PlacesManager will reset to default state
      window.dispatchEvent(new CustomEvent('resetPlacesManager'));
    }
  });

  return <PlacesManager />;
};

export default AdminPlaces;