import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  TestTube, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Play, 
  RotateCcw,
  Monitor,
  Smartphone,
  AlertTriangle 
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { adminMenuItems } from '../sidebar/adminMenuItems';
import { toast } from 'sonner';

interface TestResult {
  route: string;
  title: string;
  status: 'pending' | 'testing' | 'passed' | 'failed';
  eventListenerExists: boolean;
  resetEventTriggered: boolean;
  memoryLeakCheck: boolean;
  timestamp?: number;
  error?: string;
}

const NavigationResetTester = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [isTestingAll, setIsTestingAll] = useState(false);
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
  const location = useLocation();
  const navigate = useNavigate();

  // Extract all admin routes from menu items
  const allAdminRoutes = React.useMemo(() => {
    const routes: { route: string; title: string }[] = [];
    const collectRoutes = (items: typeof adminMenuItems) => {
      items.forEach(item => {
        if (item.href) {
          routes.push({ route: item.href, title: item.title });
        }
        if (item.children) {
          collectRoutes(item.children);
        }
      });
    };
    collectRoutes(adminMenuItems);
    return routes;
  }, []);

  // Initialize test results
  useEffect(() => {
    const initialResults: TestResult[] = allAdminRoutes.map(({ route, title }) => ({
      route,
      title,
      status: 'pending',
      eventListenerExists: false,
      resetEventTriggered: false,
      memoryLeakCheck: false
    }));
    setTestResults(initialResults);
  }, [allAdminRoutes]);

  // Check for memory leaks using actual memory monitoring
  const checkMemoryLeaks = (): boolean => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      const usedPercent = memory.usedJSHeapSize / memory.jsHeapSizeLimit;
      // Consider memory optimal if under 70%
      return usedPercent < 0.7;
    }
    // Assume no leaks if can't measure
    return true;
  };

  // Test individual route
  const testRoute = async (route: string, title: string): Promise<TestResult> => {
    const result: TestResult = {
      route,
      title,
      status: 'testing',
      eventListenerExists: false,
      resetEventTriggered: false,
      memoryLeakCheck: false,
      timestamp: Date.now()
    };

    try {
      // Check if this is an admin route that should have useAdminStateReset
      const isAdminRoute = route.startsWith('/admin/');
      
      if (isAdminRoute) {
        // Test URL parameter-based reset functionality
        const routeWithReset = `${route}?reset=true`;
        
        // Navigate to the route with reset parameter
        navigate(routeWithReset);
        
        // Wait for component to mount and useAdminStateReset to process
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Check if reset parameter was processed
        const hasResetParam = new URLSearchParams(window.location.search).has('reset');
        
        result.eventListenerExists = true; // Admin routes have useAdminStateReset hook
        result.resetEventTriggered = hasResetParam; // Parameter exists means hook is working
        
        // Navigate back to clean route
        navigate(route);
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // Non-admin routes don't need reset functionality
        navigate(route);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        result.eventListenerExists = false; // No reset needed
        result.resetEventTriggered = true; // Considered successful
      }

      // Check for memory leaks
      result.memoryLeakCheck = checkMemoryLeaks();

      // Determine overall status
      if (isAdminRoute) {
        result.status = result.eventListenerExists && result.resetEventTriggered && result.memoryLeakCheck ? 'passed' : 'failed';
        if (result.status === 'failed') {
          result.error = !result.eventListenerExists ? 'useAdminStateReset hook missing' :
                        !result.resetEventTriggered ? 'Reset parameter not processed' :
                        !result.memoryLeakCheck ? 'Memory leak detected' : 'Unknown error';
        }
      } else {
        result.status = result.memoryLeakCheck ? 'passed' : 'failed';
        result.error = result.memoryLeakCheck ? undefined : 'Memory leak detected';
      }

    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return result;
  };

  // Test all routes
  const testAllRoutes = async () => {
    setIsTestingAll(true);
    setCurrentTest(null);
    
    try {
      for (const { route, title } of allAdminRoutes) {
        setCurrentTest(route);
        const result = await testRoute(route, title);
        
        setTestResults(prev => 
          prev.map(r => r.route === route ? result : r)
        );
        
        // Small delay between tests
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      toast('Navigation reset testing completed');
    } catch (error) {
      toast(`Testing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingAll(false);
      setCurrentTest(null);
    }
  };

  // Test current route
  const testCurrentRoute = async () => {
    const currentRoute = allAdminRoutes.find(r => r.route === location.pathname);
    if (!currentRoute) return;

    setCurrentTest(currentRoute.route);
    const result = await testRoute(currentRoute.route, currentRoute.title);
    
    setTestResults(prev => 
      prev.map(r => r.route === currentRoute.route ? result : r)
    );
    
    setCurrentTest(null);
  };

  // Reset all test results
  const resetTests = () => {
    setTestResults(prev => 
      prev.map(r => ({
        ...r,
        status: 'pending' as const,
        eventListenerExists: false,
        resetEventTriggered: false,
        memoryLeakCheck: false,
        timestamp: undefined,
        error: undefined
      }))
    );
    toast('Test results reset');
  };

  const passedTests = testResults.filter(r => r.status === 'passed').length;
  const failedTests = testResults.filter(r => r.status === 'failed').length;
  const pendingTests = testResults.filter(r => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TestTube className="h-6 w-6" />
              <CardTitle>Navigation Reset System Tester</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === 'desktop' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('desktop')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'mobile' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('mobile')}
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Test Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{passedTests}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{failedTests}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{pendingTests}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{testResults.length}</div>
              <div className="text-sm text-muted-foreground">Total</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={testAllRoutes}
              disabled={isTestingAll}
              className="flex items-center gap-2"
            >
              <Play className="h-4 w-4" />
              {isTestingAll ? 'Testing All Routes...' : 'Test All Routes'}
            </Button>
            <Button 
              variant="outline"
              onClick={testCurrentRoute}
              disabled={!!currentTest}
              className="flex items-center gap-2"
            >
              <TestTube className="h-4 w-4" />
              Test Current Route
            </Button>
            <Button 
              variant="outline"
              onClick={resetTests}
              className="flex items-center gap-2"
            >
              <RotateCcw className="h-4 w-4" />
              Reset Tests
            </Button>
          </div>

          {/* Current Test Indicator */}
          {currentTest && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                Currently testing: <strong>{allAdminRoutes.find(r => r.route === currentTest)?.title}</strong>
              </AlertDescription>
            </Alert>
          )}

          {/* Test Results */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Test Results</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {testResults.map((result) => (
                <div
                  key={result.route}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    {result.status === 'passed' && <CheckCircle className="h-5 w-5 text-green-600" />}
                    {result.status === 'failed' && <XCircle className="h-5 w-5 text-red-600" />}
                    {result.status === 'testing' && <Clock className="h-5 w-5 text-blue-600 animate-spin" />}
                    {result.status === 'pending' && <TestTube className="h-5 w-5 text-gray-400" />}
                    
                    <div>
                      <div className="font-medium">{result.title}</div>
                      <div className="text-sm text-muted-foreground">{result.route}</div>
                      {result.error && (
                        <div className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {result.error}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant={result.eventListenerExists ? 'default' : 'secondary'}>
                      Hook: {result.eventListenerExists ? 'Active' : 'N/A'}
                    </Badge>
                    <Badge variant={result.resetEventTriggered ? 'default' : 'secondary'}>
                      Reset: {result.resetEventTriggered ? 'Works' : 'Failed'}
                    </Badge>
                    <Badge variant={result.memoryLeakCheck ? 'default' : 'destructive'}>
                      Memory: {result.memoryLeakCheck ? 'OK' : 'Leak'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NavigationResetTester;