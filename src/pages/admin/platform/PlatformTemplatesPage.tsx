import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layout, Building2 } from 'lucide-react';
import TemplatesManager from '@/components/admin/superadmin/TemplatesManager';
import TemplateOrganizations from '@/components/admin/superadmin/TemplateOrganizations';
import { usePlatformAdmin } from '@/hooks/usePlatformAdmin';

const PlatformTemplatesPage = () => {
  const { organizations, loadingOrgs, refetchOrgs } = usePlatformAdmin();
  
  // Filter to only template organizations
  const templateOrganizations = organizations?.filter(org => org.is_template);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Templates</h1>
        <p className="text-muted-foreground">Manage site templates and template organizations</p>
      </div>
      
      <Tabs defaultValue="templates" className="w-full">
        <TabsList>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Templates Manager
          </TabsTrigger>
          <TabsTrigger value="organizations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Template Organizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="mt-6">
          <TemplatesManager />
        </TabsContent>

        <TabsContent value="organizations" className="mt-6">
          <TemplateOrganizations 
            organizations={templateOrganizations}
            loading={loadingOrgs}
            onRefresh={() => refetchOrgs?.()}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlatformTemplatesPage;
