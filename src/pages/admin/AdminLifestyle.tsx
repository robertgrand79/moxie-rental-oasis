
import React from 'react';
import LifestyleManager from '@/components/admin/lifestyle/LifestyleManager';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminLifestyle = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // LifestyleManager will reset to default state
      window.dispatchEvent(new CustomEvent('resetLifestyleManager'));
    }
  });

  return <LifestyleManager />;
};

export default AdminLifestyle;
