import React from 'react';
import TemplateSystemTest from '@/pages/admin/superadmin/TemplateSystemTest';

const PlatformTemplateTestPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Template Test</h1>
        <p className="text-muted-foreground">Test template system functionality</p>
      </div>
      <TemplateSystemTest />
    </div>
  );
};

export default PlatformTemplateTestPage;
