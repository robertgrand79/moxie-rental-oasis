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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
          <p className="text-muted-foreground">
            Monitor, test, and optimize your entire system infrastructure
          </p>
        </div>
      </div>

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

        <TabsContent value="testing" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Testing & Validation</h2>
            <p className="text-muted-foreground mb-6">
              Comprehensive testing suite for system functionality and performance validation
            </p>
            
            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Site Metrics Testing</h3>
                <SiteMetricsTestingDashboard />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4">Navigation Reset Testing</h3>
                <NavigationResetTester />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">Image Optimization</h2>
            <p className="text-muted-foreground mb-6">
              Advanced image optimization analytics, tools, and performance monitoring
            </p>
            <ImageOptimizationDashboard />
          </div>
        </TabsContent>

        <TabsContent value="diagnostics" className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">System Diagnostics</h2>
            <p className="text-muted-foreground mb-6">
              Comprehensive system health monitoring and performance diagnostics
            </p>
            <SystemDiagnosticsDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemAdministrationDashboard;