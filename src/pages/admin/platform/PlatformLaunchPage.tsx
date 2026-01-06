import React from 'react';
import LaunchReadinessChecklist from '@/components/admin/superadmin/LaunchReadinessChecklist';

const PlatformLaunchPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Launch Checklist</h1>
        <p className="text-muted-foreground">Pre-launch readiness verification</p>
      </div>
      <LaunchReadinessChecklist />
    </div>
  );
};

export default PlatformLaunchPage;
