
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import ImageOptimizationDashboard from '@/components/admin/analytics/ImageOptimizationDashboard';
import ImageMigrationTool from '@/components/admin/ImageMigrationTool';
import { Image, BarChart3, Database } from 'lucide-react';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminImageOptimization = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // Image optimization tabs will reset to default state
      window.dispatchEvent(new CustomEvent('resetImageOptimization'));
    }
  });

  return (
    <AdminPageWrapper
      title="Image Optimization"
      description="Advanced image optimization dashboard, analytics, and management tools"
    >
      <div className="p-6">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics Dashboard
            </TabsTrigger>
            <TabsTrigger value="migration" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Migration & Cleanup
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Image className="h-4 w-4" />
              Advanced Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <ImageOptimizationDashboard />
          </TabsContent>

          <TabsContent value="migration">
            <ImageMigrationTool />
          </TabsContent>

          <TabsContent value="settings">
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Advanced Settings</h3>
              <p className="text-muted-foreground">
                Advanced optimization settings coming in the next update.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminImageOptimization;
