import React from 'react';
import PlatformUsersTab from '@/components/admin/superadmin/PlatformUsersTab';
import UserPermissionDiagnostics from '@/components/admin/UserPermissionDiagnostics';

const PlatformUsersPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Users</h1>
        <p className="text-muted-foreground">View and manage all platform users</p>
      </div>
      <PlatformUsersTab />
      <UserPermissionDiagnostics />
    </div>
  );
};

export default PlatformUsersPage;
