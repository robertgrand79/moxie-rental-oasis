import React from 'react';
import PlatformInboxManagement from '@/components/admin/superadmin/PlatformInboxManagement';

const PlatformInboxPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Inbox</h1>
        <p className="text-muted-foreground">Manage support tickets and user feedback</p>
      </div>
      <PlatformInboxManagement />
    </div>
  );
};

export default PlatformInboxPage;
