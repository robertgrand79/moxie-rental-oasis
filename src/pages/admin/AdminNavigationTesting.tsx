import React from 'react';
import AdminPageWrapper from '@/components/admin/AdminPageWrapper';
import NavigationResetTester from '@/components/admin/testing/NavigationResetTester';
import { NavigationResetValidator, downloadTestReport } from '@/utils/navigationTestUtils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Download, Shield, Smartphone, Monitor } from 'lucide-react';
import { useAdminStateReset } from '@/hooks/useAdminStateReset';

const AdminNavigationTesting = () => {
  // Handle admin state reset when clicking same menu item
  useAdminStateReset({ 
    onReset: () => {
      // Reset testing state if needed
      window.dispatchEvent(new CustomEvent('resetNavigationTesting'));
    }
  });

  const handleDownloadReport = () => {
    const validator = NavigationResetValidator.getInstance();
    const report = validator.generateReport();
    downloadTestReport(report);
  };

  const handleMemoryLeakCheck = () => {
    const validator = NavigationResetValidator.getInstance();
    const leakCheck = validator.checkForMemoryLeaks();
    
    if (leakCheck.hasLeaks) {
      console.warn('Memory leaks detected:', leakCheck.details);
    } else {
      console.log('No memory leaks detected');
    }
  };

  return (
    <AdminPageWrapper
      title="Navigation Testing"
      description="Test and validate the navigation reset system across all admin pages"
    >
      <div className="p-6 space-y-6">
        {/* Testing Instructions */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            <strong>Testing Instructions:</strong> This tool validates the navigation reset system by testing event listeners, 
            memory usage, and mobile compatibility across all admin pages. Use "Test All Routes" for comprehensive validation.
          </AlertDescription>
        </Alert>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Quick Testing Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                onClick={handleMemoryLeakCheck}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Check Memory Leaks
              </Button>
              <Button 
                variant="outline" 
                onClick={handleDownloadReport}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download Test Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Main Testing Component */}
        <NavigationResetTester />

        {/* Testing Guidelines */}
        <Card>
          <CardHeader>
            <CardTitle>Testing Guidelines & Best Practices</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Monitor className="h-4 w-4" />
                  Desktop Testing
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• All admin pages should reset to default state</li>
                  <li>• Event listeners should be properly cleaned up</li>
                  <li>• No memory leaks should be detected</li>
                  <li>• Reset buttons should provide visual feedback</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  Mobile Testing
                </h4>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  <li>• Sidebar should collapse appropriately</li>
                  <li>• Reset functionality should work on touch devices</li>
                  <li>• Mobile navigation should not break</li>
                  <li>• Performance should remain optimal</li>
                </ul>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="font-semibold mb-2">Expected Test Results</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-green-800">✅ Passed</div>
                  <div className="text-green-600">Event listener exists, reset triggers, no memory leaks</div>
                </div>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <div className="font-medium text-yellow-800">⚠️ Warning</div>
                  <div className="text-yellow-600">Minor issues that don't break functionality</div>
                </div>
                <div className="p-3 bg-red-50 border border-red-200 rounded">
                  <div className="font-medium text-red-800">❌ Failed</div>
                  <div className="text-red-600">Critical issues requiring immediate attention</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminPageWrapper>
  );
};

export default AdminNavigationTesting;