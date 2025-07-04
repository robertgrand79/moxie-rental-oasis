import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock,
  Play,
  RotateCcw,
  Bug,
  Zap,
  Shield
} from 'lucide-react';
import { useSiteMetricsTestSuite, TestResult } from '@/hooks/useSiteMetricsTestSuite';
import { useSiteMetricsValidation } from '@/hooks/useSiteMetricsValidation';

const SiteMetricsTestingDashboard: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [selectedTest, setSelectedTest] = useState<string | null>(null);
  const [showValidation, setShowValidation] = useState(false);
  
  const { runAllTests, runSpecificTest, getTestStatus } = useSiteMetricsTestSuite();
  const { runValidation, getValidationSummary, validationResults } = useSiteMetricsValidation();

  const handleRunAllTests = async () => {
    setIsRunning(true);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (error) {
      console.error('Error running tests:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunValidation = async () => {
    setIsRunning(true);
    try {
      await runValidation();
      setShowValidation(true);
    } catch (error) {
      console.error('Error running validation:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunSpecificTest = async (testName: string) => {
    setIsRunning(true);
    setSelectedTest(testName);
    try {
      const result = await runSpecificTest(testName);
      // Update the specific test result
      setTestResults(prev => {
        const updated = prev.filter(r => r.test !== testName);
        return [...updated, result].sort((a, b) => a.test.localeCompare(b.test));
      });
    } catch (error) {
      console.error('Error running specific test:', error);
    } finally {
      setIsRunning(false);
      setSelectedTest(null);
    }
  };


  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'pass':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'fail':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'pending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const status = getTestStatus();
  const validationSummary = getValidationSummary();
  const progressPercentage = status.total > 0 ? ((status.passed + status.warnings) / status.total) * 100 : 0;

  // Run tests automatically on component mount
  useEffect(() => {
    handleRunAllTests();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Site Metrics Testing Dashboard</h2>
          <p className="text-gray-600">Comprehensive validation of Site Metrics functionality</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={handleRunAllTests} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            {isRunning ? (
              <RotateCcw className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {isRunning ? 'Running Tests...' : 'Run All Tests'}
          </Button>
          <Button 
            onClick={handleRunValidation} 
            disabled={isRunning}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Shield className="h-4 w-4" />
            Run Validation
          </Button>
        </div>
      </div>

      {/* Validation Results */}
      {showValidation && validationResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Validation Results
              <Badge className={validationSummary.overallValid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                {validationSummary.overallValid ? 'PASS' : 'FAIL'}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">{validationSummary.valid}</div>
                  <div className="text-muted-foreground">Valid</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-red-600">{validationSummary.invalid}</div>
                  <div className="text-muted-foreground">Invalid</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">{validationSummary.criticalPassed}</div>
                  <div className="text-muted-foreground">Critical Passed</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-orange-600">{validationSummary.criticalFailed}</div>
                  <div className="text-muted-foreground">Critical Failed</div>
                </div>
              </div>
              
              <div className="space-y-2">
                {validationResults.map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center gap-2">
                      {result.valid ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span className="font-medium">{result.rule}</span>
                      {result.critical && (
                        <Badge variant="outline" className="text-xs">CRITICAL</Badge>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{result.message}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Status */}
      {status.total > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bug className="h-5 w-5" />
              Test Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {status.passed + status.warnings}/{status.total} tests passing
              </span>
            </div>
            <Progress value={progressPercentage} className="w-full" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{status.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{status.warnings}</div>
                <div className="text-sm text-muted-foreground">Warnings</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{status.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{status.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Test Results */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {testResults.map((result, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(result.status)}
                  {result.test}
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(result.status)}>
                    {result.status.toUpperCase()}
                  </Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRunSpecificTest(result.test)}
                    disabled={isRunning && selectedTest === result.test}
                  >
                    {isRunning && selectedTest === result.test ? (
                      <RotateCcw className="h-3 w-3 animate-spin" />
                    ) : (
                      <Zap className="h-3 w-3" />
                    )}
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Alert>
                <AlertDescription>
                  {result.message}
                </AlertDescription>
              </Alert>
              
              {result.details && (
                <div className="text-xs bg-gray-50 p-3 rounded-md">
                  <div className="font-medium mb-1">Technical Details:</div>
                  <pre className="whitespace-pre-wrap overflow-x-auto">
                    {JSON.stringify(result.details, null, 2)}
                  </pre>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Tested: {new Date(result.timestamp).toLocaleTimeString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Instructions */}
      {status.total === 0 && !isRunning && (
        <Card>
          <CardHeader>
            <CardTitle>Testing Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p>This dashboard validates the Site Metrics system across several key areas:</p>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>GA Loading Logic:</strong> Verifies Google Analytics loads only on /admin/metrics</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>GA Initialization:</strong> Checks if Google Analytics is properly initialized</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Performance Optimizations:</strong> Validates lazy loading, memory usage, and throttling</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Error Handling:</strong> Tests graceful degradation and feature support</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Analytics Data Flow:</strong> Confirms data flows correctly (real or demo)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span><strong>Resource Cleanup:</strong> Validates proper resource management</span>
                </li>
              </ul>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  For best results, test on both the /admin/metrics page and other admin pages to verify selective GA loading.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SiteMetricsTestingDashboard;