import React from 'react';
import PlatformLookupTools from '@/components/admin/superadmin/PlatformLookupTools';

const PlatformLookupPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lookup Tools</h1>
        <p className="text-muted-foreground">Search and lookup utilities</p>
      </div>
      <PlatformLookupTools />
    </div>
  );
};

export default PlatformLookupPage;
