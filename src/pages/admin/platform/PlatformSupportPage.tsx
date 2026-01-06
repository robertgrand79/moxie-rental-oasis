import React from 'react';
import SupportTicketsManagement from '@/components/admin/superadmin/SupportTicketsManagement';

const PlatformSupportPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Support Tickets</h1>
        <p className="text-muted-foreground">View and respond to support requests</p>
      </div>
      <SupportTicketsManagement />
    </div>
  );
};

export default PlatformSupportPage;
