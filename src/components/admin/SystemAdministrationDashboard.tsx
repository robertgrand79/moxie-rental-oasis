import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TestTube, Image, Wrench } from 'lucide-react';
import SiteMetricsTestingDashboard from './SiteMetricsTestingDashboard';
import NavigationResetTester from './testing/NavigationResetTester';
import ImageOptimizationDashboard from './ImageOptimizationDashboard';
import SystemDiagnosticsDashboard from './SystemDiagnosticsDashboard';

const SystemAdministrationDashboard = () => {
  const [activeTab, setActiveTab] = useState('testing');

  // Listen for reset event from navigation
  useEffect(() => {
    const handleReset = () => {
      // Reset to testing tab
      setActiveTab('testing');
    };

    window.addEventListener('resetSystemAdministration', handleReset);
    return () => window.removeEventListener('resetSystemAdministration', handleReset);
  }, []);

  return (
    <div className="space-y-6">

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <TestTube className="h-4 w-4" />
            <span className="hidden sm:inline">Testing & Validation</span>
            <span className="sm:hidden">Testing</span>
          </TabsTrigger>
          <TabsTrigger value="optimization" className="flex items-center gap-2">
            <Image className="h-4 w-4" />
            <span className="hidden sm:inline">Image Optimization</span>
            <span className="sm:hidden">Images</span>
          </TabsTrigger>
          <TabsTrigger value="diagnostics" className="flex items-center gap-2">
            <Wrench className="h-4 w-4" />
            <span className="hidden sm:inline">System Diagnostics</span>
            <span className="sm:hidden">System</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="testing" className="space-y-8">
          <SiteMetricsTestingDashboard />
          <NavigationResetTester />
        </TabsContent>

        <TabsContent value="optimization">
          <ImageOptimizationDashboard />
        </TabsContent>

        <TabsContent value="diagnostics">
          <SystemDiagnosticsDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAdministrationDashboard;