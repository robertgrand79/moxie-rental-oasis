import React from 'react';
import PlatformAuditLog from '@/components/admin/superadmin/PlatformAuditLog';

const PlatformAuditPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">View system audit logs</p>
      </div>
      <PlatformAuditLog />
    </div>
  );
};

export default PlatformAuditPage;
