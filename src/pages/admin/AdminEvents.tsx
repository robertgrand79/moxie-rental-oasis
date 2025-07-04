
import React from 'react';
import EventsManager from '@/components/admin/events/EventsManager';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminEvents = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // EventsManager will reset to default state
      window.dispatchEvent(new CustomEvent('resetEventsManager'));
    }
  });

  return <EventsManager />;
};

export default AdminEvents;
