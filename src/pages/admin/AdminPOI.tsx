
import React from 'react';
import POIManager from '@/components/admin/poi/POIManager';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminPOI = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // POIManager will reset to default state
      window.dispatchEvent(new CustomEvent('resetPOIManager'));
    }
  });

  return <POIManager />;
};

export default AdminPOI;
